import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { clearGitHubCache, getGitHubUsername, logoutUser } from '../../utils/storage';

export default function SettingsScreen() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const router = useRouter();
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const dangerColor = useThemeColor({ light: '#dc3545', dark: '#ff6b6b' }, 'text');

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

  const SettingButton = ({ title, onPress, danger = false }: {
    title: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingButton, { backgroundColor: cardBg }]}
      onPress={onPress}
    >
      <ThemedText style={danger ? { color: dangerColor } : {}}>{title}</ThemedText>
      <ThemedText style={styles.chevron}>›</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Settings</ThemedText>
        
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Account</ThemedText>
          {githubUsername ? (
            <>
              <ThemedView style={[styles.infoCard, { backgroundColor: cardBg }]}>
                <ThemedText>Connected as: @{githubUsername}</ThemedText>
              </ThemedView>
              <SettingButton 
                title="Disconnect GitHub" 
                onPress={handleLogout}
                danger={true}
              />
            </>
          ) : (
            <>
              <ThemedView style={[styles.infoCard, { backgroundColor: cardBg }]}>
                <ThemedText>No GitHub account connected</ThemedText>
              </ThemedView>
              <SettingButton 
                title="Connect GitHub" 
                onPress={() => router.push('/github-connect')}
              />
            </>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Data</ThemedText>
          <SettingButton 
            title="Clear Cache" 
            onPress={handleClearCache}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>About</ThemedText>
          <ThemedView style={[styles.infoCard, { backgroundColor: cardBg }]}>
            <ThemedText type="defaultSemiBold">DevTracker v1.0</ThemedText>
            <ThemedText>Smart Developer Progress Tracker</ThemedText>
            <ThemedText style={styles.subtitle}>
              Built with ❤️ for the developer community
            </ThemedText>
          </ThemedView>
        </ThemedView>
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
