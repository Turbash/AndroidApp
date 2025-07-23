import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Octicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { GitHubDashboard } from '../../components/GitHubDashboard';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getGitHubUsername } from '../../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function DashboardScreen() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const accentColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadData = async () => {
        const username = await getGitHubUsername();
        if (isActive) {
          console.log('📦 Loaded GitHub username from storage:', username);
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
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ThemedText type="body" style={styles.loadingText}>Loading your dashboard...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
        <ThemedText type="body" style={styles.headerSubtitle}>
          Track your development progress
        </ThemedText>
      </View>
      {githubUsername ? (
        <GitHubDashboard username={githubUsername} />
      ) : (
        <View style={styles.connectContainer}>
          <ThemedView variant="elevated" style={styles.connectCard}>
            <View style={styles.connectIcon}>
              <Octicons name="mark-github" size={32} color={accentColor} />
            </View>
            <ThemedText type="title" style={styles.connectTitle}>
              Connect GitHub
            </ThemedText>
            <ThemedText type="body" style={styles.connectDescription}>
              Connect your GitHub account to automatically track repositories, commits, and coding activity.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.connectButton, { backgroundColor: accentColor }]}
              onPress={() => router.push('/github-connect')}
              activeOpacity={0.8}
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
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  headerSubtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    opacity: 0.7,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  connectCard: {
    alignItems: 'center',
    marginHorizontal: 0,
  },
  connectIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  connectTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  connectDescription: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  connectButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 240,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
});