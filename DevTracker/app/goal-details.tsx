import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { AIUnavailableState } from '../components/AIUnavailableState';
import { ChatHistory } from '../components/ChatHistory';
import { useThemeColor } from '../hooks/useThemeColor';
import { getGitHubUsername, getGoalChatHistory, setGoalChatHistory, ChatTurn, clearGoalChatHistory, getCachedGitHubData } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../hooks/useColorScheme';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  progressNotes: string[];
}

interface GoalAnalysis {
  suggestions: string[];
  next_steps: string[];
  estimated_time: string;
  resources: string[];
}

const GOALS_STORAGE_KEY = 'DEVTRACKER_GOALS';

export default function GoalDetailsScreen() {
  const [showChatHistory, setShowChatHistory] = useState(false);
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progressNote, setProgressNote] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  const accentColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const borderColor = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'secondary');
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const surfaceColor = useThemeColor({}, 'surface');

  useEffect(() => {
    loadGoal();
    getGitHubUsername().then(username => {
      if (username) setUsername(username);
    });
    if (goalId) {
      getGoalChatHistory(goalId).then(setChatHistory);
    }
  }, [goalId]);

  const loadGoal = async () => {
    try {
      const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        const goals: Goal[] = JSON.parse(stored);
        const found = goals.find(g => g.id === goalId);
        if (found) setGoal(found);
      }
    } catch (e) {
      console.error('Failed to load goal:', e);
    }
  };

  const saveGoal = async (updatedGoal: Goal) => {
    setSaving(true);
    try {
      const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      let goals: Goal[] = [];
      if (stored) goals = JSON.parse(stored);
      const idx = goals.findIndex(g => g.id === updatedGoal.id);
      if (idx !== -1) {
        goals[idx] = updatedGoal;
        await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
        setGoal(updatedGoal);
      }
    } catch (e) {
      console.error('Failed to save goal:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProgress = async () => {
    if (!progressNote.trim() || !goal) return;
    setSaving(true);
    const updatedGoal = {
      ...goal,
      progressNotes: [...goal.progressNotes, progressNote],
    };
    await saveGoal(updatedGoal);
    const newHistory: ChatTurn[] = [...chatHistory, { role: 'user' as const, message: progressNote }].slice(-10);
    setChatHistory(newHistory);
    await setGoalChatHistory(goalId, newHistory);
    setProgressNote('');
    setSaving(false);
  };

  const handleGetInsights = async () => {
    setAnalysisLoading(true);
    setAnalysis(null);
    setError(null);
    try {
      const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const url = `${BACKEND_URL}/analyze-goal`;
      let githubData = null;
      if (username) {
        githubData = await getCachedGitHubData(username);
      }
      const payload: any = {
        goal_title: goal?.title || '',
        category: goal?.category || '',
        current_progress: goal?.progressNotes?.length ? goal.progressNotes.join('\n') : '',
        description: goal?.description || '',
        chat_history: chatHistory,
        github_profile: githubData?.userProfile || undefined,
        github_repos: githubData?.repos || undefined,
      };
      console.log('[GoalDetailsScreen] Payload to /analyze-goal:', JSON.stringify(payload));
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        setError(`Backend error: ${res.status} ${errText}`);
        return;
      }
      const data = await res.json();
      setAnalysis(data);
      if (data && data.suggestions) {
        const aiMessage = [
          ...(data.suggestions?.length ? ['Suggestions: ' + data.suggestions.join('; ')] : []),
          ...(data.next_steps?.length ? ['Next Steps: ' + data.next_steps.join('; ')] : []),
          ...(data.estimated_time ? ['Estimated Time: ' + data.estimated_time] : []),
          ...(data.resources?.length ? ['Resources: ' + data.resources.join('; ')] : []),
        ].join('\n');
        const newHistory: ChatTurn[] = [...chatHistory, { role: 'ai' as const, message: aiMessage }].slice(-10);
        setChatHistory(newHistory);
        await setGoalChatHistory(goalId, newHistory);
      }
    } catch (e) {
      setAnalysis(null);
      setError('Failed to get insights.');
    } finally {
      setAnalysisLoading(false);
    }
  };


return (
  <SafeAreaView style={[styles.container, { backgroundColor }]}>
    <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {goal ? (
        <View style={{ flex: 1 }}>
          {/* Header and progress notes for completed/in-progress goals */}
          {goal.completed ? (
            <View style={[styles.completedCard, { backgroundColor: cardColor }]}> 
              <View style={styles.completedHeader}>
                <View style={[styles.completedBadge, { backgroundColor: successColor }]} />
              </View>
              {goal.description && (
                <ThemedText type="body" style={styles.goalDescription}>
                  {goal.description}
                </ThemedText>
              )}
              <View style={[styles.congratsCard, { backgroundColor: surfaceColor }]}> 
                <ThemedText type="subtitle" style={[styles.congratsText, { color: successColor }]}>🎉 Congratulations!</ThemedText>
                <ThemedText type="body" style={styles.congratsSubtext}>You've successfully completed this goal</ThemedText>
              </View>
            </View>
          ) : (
            <>
              <View style={[styles.goalCard, { backgroundColor: cardColor }]}> 
                <View style={styles.goalHeader}>
                  <ThemedText type="title" style={styles.goalTitle}>{goal.title}</ThemedText>
                  {goal.category && (
                    <View style={[styles.categoryBadge, { backgroundColor: accentColor }]}> 
                      <ThemedText style={styles.categoryText}>{goal.category}</ThemedText>
                    </View>
                  )}
                </View>
                {goal.description && (
                  <ThemedText type="body" style={styles.goalDescription}>{goal.description}</ThemedText>
                )}
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}> 
                  <ThemedText style={[styles.statusText, { color: accentColor }]}>In Progress</ThemedText>
                </View>
              </View>
              <View style={[styles.progressSection, { backgroundColor: cardColor }]}> 
                <ThemedText type="subtitle" style={styles.sectionTitle}>Progress Notes</ThemedText>
                {goal.progressNotes && goal.progressNotes.length === 0 && (
                  <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}> 
                    <ThemedText type="body" style={styles.emptyText}>No progress notes yet. Add your first update below.</ThemedText>
                  </View>
                )}
                <View style={styles.progressList}>
                  {goal.progressNotes && goal.progressNotes.map((note, idx) => (
                    <View key={idx} style={[styles.progressNoteItem, { backgroundColor: surfaceColor }]}> 
                      <ThemedText type="body">{note}</ThemedText>
                    </View>
                  ))}
                </View>
                <View style={styles.addProgressSection}>
                  <ThemedText type="label" style={styles.inputLabel}>Add Progress Update</ThemedText>
                  <TextInput
                    style={[styles.progressInput, { borderColor }]}
                    placeholder="What did you accomplish today?"
                    placeholderTextColor={secondaryColor}
                    value={progressNote}
                    onChangeText={setProgressNote}
                    multiline
                    numberOfLines={3}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addProgressButton,
                      {
                        backgroundColor: progressNote.trim() ? accentColor : secondaryColor,
                        opacity: progressNote.trim() ? 1 : 0.6
                      }
                    ]}
                    onPress={handleAddProgress}
                    disabled={saving || !progressNote.trim()}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.addProgressButtonText}>
                      {saving ? 'Adding...' : 'Add Progress'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          {/* Get AI Analysis Button */}
          <TouchableOpacity
            style={[styles.showHistoryButton, { backgroundColor: accentColor }]}
            onPress={handleGetInsights}
            disabled={analysisLoading}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.showHistoryButtonText}>
              {analysisLoading ? 'Analyzing...' : 'Get AI Analysis'}
            </ThemedText>
          </TouchableOpacity>
          {/* AI Analysis Box (centered, green, between buttons) */}
          {analysis && (
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <View style={{
                backgroundColor: "#075E54",
                borderRadius: 16,
                padding: 16,
                width: '85%',
                shadowColor: cardColor,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
                alignSelf: 'center',
              }}>
                <ThemedText type="label" style={[styles.analysisTitle, { color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }]}>AI Analysis</ThemedText>
                <ThemedText type="body" style={[styles.analysisItem, { color: 'white' }]}> 
                  <ThemedText type="body" style={{ fontWeight: 'bold', color: 'white', fontSize: 15 }}>Suggestions:</ThemedText>
                  {analysis.suggestions?.length ? (
                    <>
                      {'\n'}
                      {analysis.suggestions.map((s, i) => (
                        <ThemedText key={i} type="body" style={{ color: 'white', marginLeft: 8 }}>{s}</ThemedText>
                      ))}
                    </>
                  ) : null}
                </ThemedText>
                <ThemedText type="body" style={[styles.analysisItem, { color: 'white' }]}> 
                  <ThemedText type="body" style={{ fontWeight: 'bold', color: 'white', fontSize: 15 }}>Next Steps:</ThemedText>
                  {analysis.next_steps?.length ? (
                    <>
                      {'\n'}
                      {analysis.next_steps.map((s, i) => (
                        <ThemedText key={i} type="body" style={{ color: 'white', marginLeft: 8 }}>{s}</ThemedText>
                      ))}
                    </>
                  ) : null}
                </ThemedText>
                <ThemedText type="body" style={[styles.analysisItem, { color: 'white' }]}> 
                  <ThemedText type="body" style={{ fontWeight: 'bold', color: 'white', fontSize: 15 }}>Estimated Time:</ThemedText>
                  {analysis.estimated_time ? (
                    <>
                      {'\n'}
                      <ThemedText type="body" style={{ color: 'white', marginLeft: 8 }}>{analysis.estimated_time}</ThemedText>
                    </>
                  ) : null}
                </ThemedText>
                <ThemedText type="body" style={[styles.analysisItem, { color: 'white' }]}> 
                  <ThemedText type="body" style={{ fontWeight: 'bold', color: 'white', fontSize: 15 }}>Resources:</ThemedText>
                  {analysis.resources?.length ? (
                    <>
                      {'\n'}
                      {analysis.resources.map((s, i) => (
                        <ThemedText key={i} type="body" style={{ color: 'white', marginLeft: 8 }}>{s}</ThemedText>
                      ))}
                    </>
                  ) : null}
                </ThemedText>
              </View>
            </View>
          )}
          {/* Single Chat History Toggle Button and Section */}
          <TouchableOpacity
            style={[styles.showHistoryButton, { backgroundColor: accentColor }]}
            onPress={() => setShowChatHistory(v => !v)}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.showHistoryButtonText}>
              {showChatHistory ? 'Hide AI Suggestions History' : 'Show AI Suggestions History'}
            </ThemedText>
          </TouchableOpacity>
          {showChatHistory && (
            <View style={{ width: '100%', marginTop: 16 }}>
              <ChatHistory chatHistory={chatHistory} username={username} />
            </View>
          )}
          {error && (
            <AIUnavailableState
              title="AI analysis unavailable"
              description={error || "AI analysis failed. Please check your network or try again later."}
              icon="🤖"
            />
          )}
          <View style={styles.bottomPadding} />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <ThemedText type="body" style={styles.loadingText}>Loading goal...</ThemedText>
        </View>
      )}
    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  showHistoryButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  showHistoryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  hideHistoryButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  hideHistoryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  completedCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  completedHeader: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalTitle: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  goalDescription: {
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  congratsCard: {
    borderRadius: 12,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  congratsText: {
    marginBottom: 12,
  },
  congratsSubtext: {
    opacity: 0.8,
    textAlign: 'center',
  },
  progressSection: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyState: {
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  progressList: {
    marginBottom: 20,
  },
  progressNoteItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.12)', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  addProgressSection: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  progressInput: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addProgressButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  addProgressButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  insightsSection: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  analyzeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  analysisBox: {
    borderRadius: 8,
    padding: 16,
  },
  analysisTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  analysisItem: {
    marginBottom: 4,
    opacity: 0.9,
    lineHeight: 20,
  },
  errorContainer: {
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    textAlign: 'center',
  },
  chatSection: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chatList: {
    gap: 8,
  },
  chatMessage: {
    borderRadius: 8,
    padding: 12,
  },
  userMessage: {
    marginLeft: 20,
  },
  aiMessage: {
    marginRight: 20,
  },
  chatRole: {
    marginBottom: 4,
    fontWeight: '600',
    opacity: 0.8,
  },
  chatText: {
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});