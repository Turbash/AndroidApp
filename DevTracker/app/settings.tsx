import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { clearGitHubCache, getGitHubUsername, logoutUser } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountSection } from '../components/AccountSection';
import { DataSection } from '../components/DataSection';
import { AboutSection } from '../components/AboutSection';

export default function SettingsScreen() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getGitHubUsername().then(setGithubUsername);
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Disconnect GitHub',
      'Are you sure you want to disconnect your GitHub account? All cached data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            setGithubUsername(null);
            Alert.alert('Disconnected', 'GitHub account has been disconnected.');
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached GitHub data. Fresh data will be fetched on next load.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            await clearGitHubCache();
            Alert.alert('Cache Cleared', 'GitHub data cache has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">⚙️ Settings</ThemedText>
        <ThemedText type="body" style={styles.headerSubtitle}>
          Manage your account and preferences
        </ThemedText>
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <AccountSection
          githubUsername={githubUsername}
          onLogout={handleLogout}
          onConnect={() => router.push('/github-connect')}
        />
        <DataSection onClearCache={handleClearCache} />
        <AboutSection />
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerSubtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  scrollContainer: {
    flex: 1,
  },
  bottomPadding: {
    height: 24,
  },
});