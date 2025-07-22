import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {Octicons} from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GitHubDashboard } from '../../components/GitHubDashboard';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getGitHubUsername } from '../../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function DashboardScreen() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const accentColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadData = async () => {
        const username = await getGitHubUsername();
        if (isActive) {
          setGithubUsername(username);
          setLoading(false);
        }
      };
      loadData();
      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText type="body">Loading your dashboard...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
        <ThemedText type="caption">Track your development progress</ThemedText>
      </View>
      {githubUsername ? (
        <GitHubDashboard username={githubUsername} />
      ) : (
        <View style={styles.connectContainer}>
          <ThemedView variant="card" style={[styles.connectCard, { backgroundColor: cardBg }]}>
            <View style={styles.connectIcon}>
              <ThemedText style={styles.iconText}>
                <Octicons name="mark-github" size={24} color="white" />
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.connectTitle}>
              Connect GitHub
            </ThemedText>
            <ThemedText type="body" style={styles.connectDescription}>
              Track your real development progress with GitHub integration. Automatically sync your repositories, commits, and coding activity.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.connectButton, { backgroundColor: accentColor }]}
              onPress={() => router.push('/github-connect')}
            >
              <ThemedText style={styles.connectButtonText}>Connect GitHub Account</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  connectCard: {
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  connectIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 22,
  },
  connectTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  connectDescription: {
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 8,    
  },
  connectButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});