import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';
import { clearGitHubCache, getGitHubUsername, logoutUser } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingButton } from '../components/SettingButton'
import { InfoCard } from '../components/InfoCard';
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
    <ScrollView style={styles.scrollContainer}>
      <SafeAreaView style={styles.container}>
        <ThemedText type="title">Settings</ThemedText>
        <AccountSection
          githubUsername={githubUsername}
          onLogout={handleLogout}
          onConnect={() => router.push('/github-connect')}
        />
        <DataSection onClearCache={handleClearCache} />
        <AboutSection />
      </SafeAreaView>
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
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  chevron: {
    fontSize: 18,
    opacity: 0.5,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
});