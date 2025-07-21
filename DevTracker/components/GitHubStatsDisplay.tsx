import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { GitHubStatsResponse, GitHubStatsService } from '../services/githubStats';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { StatsWebViewSection } from './StatsWebViewSection';

interface GitHubStatsDisplayProps {
  username: string;
  languageCount?: number;
}

export function GitHubStatsDisplay({ username, languageCount = 10 }: GitHubStatsDisplayProps) {
  const [statsData, setStatsData] = useState<GitHubStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [validatedUsername, setValidatedUsername] = useState<string>(username);

  const cardBg = useThemeColor({ light: '#ffffff', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333333' }, 'tint');
  const accentColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadGitHubStats();
  }, [username, languageCount]);

  const loadGitHubStats = async () => {
    setLoading(true);

    try {
      const userValidation = await GitHubStatsService.validateAndGetCorrectUsername(username);
      if (!userValidation.exists) {
        setStatsData({
          statsImageUrl: '',
          languagesImageUrl: '',
          isAvailable: false,
          error: `User ${username} not found on GitHub`
        });
        setLoading(false);
        return;
      }

      const correctUsername = userValidation.correctUsername;
      setValidatedUsername(correctUsername);

      const stats = await GitHubStatsService.fetchGitHubStats(correctUsername, languageCount);
      setStatsData(stats);
    } catch (error) {
      setStatsData(null);
    } finally {
      setLoading(false);
    }
  };

  const openGitHubProfile = () => {
    Linking.openURL(`https://github.com/${validatedUsername}`);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <ThemedText style={styles.loadingText}>Loading GitHub stats...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!statsData || !statsData.isAvailable) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: cardBg, borderColor, alignItems: 'center' }]}>
        <ThemedText style={{ color: accentColor, marginBottom: 8 }}>GitHub stats unavailable</ThemedText>
        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>{statsData?.error || 'No stats found.'}</ThemedText>
        <TouchableOpacity style={styles.actionButton} onPress={loadGitHubStats}>
          <ThemedText style={styles.actionText}>🔄 Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
      <TouchableOpacity onPress={openGitHubProfile} style={styles.headerContainer}>
        <ThemedText type="defaultSemiBold" style={[styles.title, { color: accentColor }]}>
          📊 GitHub Statistics
        </ThemedText>
        <ThemedText style={styles.username}>@{validatedUsername}</ThemedText>
      </TouchableOpacity>
      <View style={styles.webviewWrapper}>
        <StatsWebViewSection
          validatedUsername={validatedUsername}
          languageCount={languageCount}
        />
      </View>
      <ThemedText style={styles.note}>
        💡 Stats powered by github-readme-stats
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    opacity: 0.8,
    fontFamily: 'monospace',
  },
  webviewWrapper: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  note: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
});