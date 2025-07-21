import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { GitHubDashboard } from '../../components/GitHubDashboard';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getGitHubUsername } from '../../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Developer Dashboard</ThemedText>
      {githubUsername ? (
        <GitHubDashboard username={githubUsername} />
      ) : (
        <ThemedView style={styles.connectContainer}>
          <ThemedText style={styles.subtitle}>
            Track your real development progress with GitHub integration
          </ThemedText>
          <ThemedText style={styles.description}>
            Connect your GitHub account to automatically track your repositories, commits, and coding activity.
          </ThemedText>
          <Button 
            title="Connect GitHub Account" 
            onPress={() => router.push('/github-connect')}
          />
          
        </ThemedView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 16,
    textAlign: 'center',
  },
  description: {
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  connectContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
});