import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';
import { getGitHubUsername, getCachedUserProfile } from '../utils/storage';
import { fetchUserRepos, fetchRepoReadme, fetchRepoLanguages } from '../services/github';

interface GoalAnalysis {
  suggestions: string[];
  next_steps: string[];
  estimated_time: string;
  resources: string[];
}

export function GoalAnalysisModal({
  visible,
  onClose,
  goal,
  username,
}: {
  visible: boolean;
  onClose: () => void;
  goal: any;
  username: string;
}) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null);
  const cardBg = useThemeColor({ light: '#fff', dark: '#222' }, 'background');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);

    const fetchAndAnalyze = async () => {
      try {
        const repos = await fetchUserRepos(username);
        const repoReadmes: Record<string, string | null> = {};
        const repoLanguages: Record<string, Record<string, number>> = {};

        for (const repo of repos) {
          repoReadmes[repo.name] = await fetchRepoReadme(username, repo.name);
          repoLanguages[repo.name] = await fetchRepoLanguages(username, repo.name);
        }

        let profileReadme: string | null = null;
        const profileRepo = repos.find(r => r.name.toLowerCase() === username.toLowerCase());
        if (profileRepo) {
          profileReadme = await fetchRepoReadme(username, profileRepo.name);
        }

        const payload = {
          username,
          goal: {
            title: goal.title,
            description: goal.description,
            category: goal.category,
            completed: goal.completed,
            progress: goal.progressNotes || [],
          },
          github_data: {
            public_repos: repos.map(r => ({
              name: r.name,
              description: r.description,
              readme: repoReadmes[r.name],
              languages: repoLanguages[r.name],
            })),
            profile_readme: profileReadme,
          }
        };

        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const url = `${BACKEND_URL}/analyze-goal`;

        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(res => res.json())
          .then(setAnalysis)
          .catch(() => setAnalysis(null))
          .finally(() => setLoading(false));
      } catch (e) {
        setAnalysis(null);
        setLoading(false);
      }
    };

    fetchAndAnalyze();
  }, [visible, goal, username]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { backgroundColor: cardBg }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={{ marginBottom: 12 }}>
            Goal Insights: {goal?.title}
          </ThemedText>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : analysis ? (
            <View>
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
          ) : (
            <ThemedText>Failed to load analysis.</ThemedText>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'stretch',
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  closeButtonText: {
    fontSize: 22,
    opacity: 0.7,
  },
  analysisTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2,
    color: '#0369a1',
  },
  analysisItem: {
    marginLeft: 8,
    marginBottom: 2,
    color: '#0c4a6e',
  },
});