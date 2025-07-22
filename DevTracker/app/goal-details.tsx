import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';
import { getGitHubUsername, getGoalChatHistory, setGoalChatHistory, ChatTurn, clearGoalChatHistory, getCachedGitHubData } from '../utils/storage';
import { GoalAnalysisModal } from '../components/GoalAnalysisModal';


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
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progressNote, setProgressNote] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Clear chat history when deleting a goal
  const handleDeleteGoal = async () => {
    if (!goal) return;
    try {
      const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      let goals: Goal[] = [];
      if (stored) goals = JSON.parse(stored);
      const filtered = goals.filter(g => g.id !== goal.id);
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(filtered));
      await clearGoalChatHistory(goal.id);
      setGoal(null);
      setChatHistory([]);
    } catch (e) {
      console.error('Failed to delete goal:', e);
    }
  };
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const accentColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');

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
    const updatedGoal = {
      ...goal,
      progressNotes: [...goal.progressNotes, progressNote],
    };
    await saveGoal(updatedGoal);
  const newHistory: ChatTurn[] = [...chatHistory, { role: 'user' as const, message: progressNote }].slice(-10);
  setChatHistory(newHistory);
  await setGoalChatHistory(goalId, newHistory);
    setProgressNote('');
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
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        {goal ? (
          goal.completed ? (
            <>
              <ThemedText type="title" style={styles.header}>{goal.title}</ThemedText>
              <ThemedText style={styles.goalCategory}>{goal.category}</ThemedText>
              <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>
              <ThemedText style={styles.goalStatusText}>
                Status: ✅ Completed
              </ThemedText>
              <ThemedText style={{ marginTop: 24, fontSize: 18, color: '#10b981', fontWeight: 'bold', textAlign: 'center' }}>
                🎉 Congratulations on completing your goal!
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText type="title" style={styles.header}>{goal.title}</ThemedText>
              <ThemedText style={styles.goalCategory}>{goal.category}</ThemedText>
              <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>
              <ThemedText style={styles.goalStatusText}>
                Status: {goal.completed ? '✅ Completed' : '⏳ In Progress'}
              </ThemedText>
              <ThemedText style={styles.sectionTitle}>Progress Notes</ThemedText>
              {goal.progressNotes.length === 0 && (
                <ThemedText style={styles.emptyState}>No progress notes yet.</ThemedText>
              )}
              {goal.progressNotes.map((note, idx) => (
                <ThemedText key={idx} style={styles.progressNoteItem}>• {note}</ThemedText>
              ))}
              <View style={styles.progressInputRow}>
                <TextInput
                  style={styles.progressInput}
                  placeholder="Add progress note"
                  value={progressNote}
                  onChangeText={setProgressNote}
                />
                <TouchableOpacity
                  style={[styles.addProgressButton, { backgroundColor: accentColor }]}
                  onPress={handleAddProgress}
                  disabled={saving}
                >
                  <ThemedText style={styles.addProgressButtonText}>Add</ThemedText>
                </TouchableOpacity>
              </View>
              {/* Get Insights Button */}
              {!analysisLoading && (
                <TouchableOpacity
                  style={[styles.analyzeButton, { backgroundColor: accentColor }]}
                  onPress={handleGetInsights}
                >
                  <ThemedText style={styles.analyzeButtonText}>💡 Get Insights</ThemedText>
                </TouchableOpacity>
              )}
              {analysisLoading && (
                <View style={{ marginTop: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="large" />
                  <ThemedText style={{ marginTop: 8 }}>Analyzing goal...</ThemedText>
                </View>
              )}
              {/* Inline AI Analysis Results */}
              {analysis && (
                <View style={styles.analysisBox}>
                  <ThemedText style={styles.analysisTitle}>AI Suggestions:</ThemedText>
                  {analysis.suggestions?.map((s, i) => (
                    <ThemedText key={i} style={styles.analysisItem}>• {s}</ThemedText>
                  ))}
                  <ThemedText style={styles.analysisTitle}>Next Steps:</ThemedText>
                  {analysis.next_steps?.map((s, i) => (
                    <ThemedText key={i} style={styles.analysisItem}>• {s}</ThemedText>
                  ))}
                  <ThemedText style={styles.analysisTitle}>Estimated Time:</ThemedText>
                  <ThemedText style={styles.analysisItem}>{analysis.estimated_time}</ThemedText>
                  <ThemedText style={styles.analysisTitle}>Resources:</ThemedText>
                  {analysis.resources?.map((s, i) => (
                    <ThemedText key={i} style={styles.analysisItem}>• {s}</ThemedText>
                  ))}
                </View>
              )}

              {/* Chat History Display (user progress and AI responses only) */}
              <ThemedText style={styles.sectionTitle}>Chat History</ThemedText>
              {chatHistory.length === 0 && (
                <ThemedText style={styles.emptyState}>No chat yet.</ThemedText>
              )}
              {chatHistory.map((turn, idx) => (
                turn.role === 'user' ? (
                  <ThemedText key={idx} style={{ color: '#0c4a6e', marginBottom: 2 }}>
                    <ThemedText style={{ fontWeight: 'bold' }}>You:</ThemedText> {turn.message}
                  </ThemedText>
                ) : (
                  <ThemedText key={idx} style={{ color: '#10b981', marginBottom: 2 }}>
                    <ThemedText style={{ fontWeight: 'bold' }}>AI:</ThemedText> {turn.message}
                  </ThemedText>
                )
              ))}
              {error && (
                <ThemedText style={{ color: 'red', marginTop: 8 }}>{error}</ThemedText>
              )}
            </>
          )
        ) : (
          <ThemedText>Loading goal...</ThemedText>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  goalCategory: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    marginBottom: 6,
  },
  goalStatusText: {
    fontSize: 13,
    marginTop: 4,
    color: '#007AFF',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    fontSize: 15,
  },
  emptyState: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  progressNoteItem: {
    marginLeft: 8,
    marginBottom: 2,
    color: '#0c4a6e',
  },
  progressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  progressInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  addProgressButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addProgressButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  analyzeButton: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  analysisBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analysisTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
  },
  analysisItem: {
    marginLeft: 8,
    marginBottom: 2,
    color: '#374151',
  },
});