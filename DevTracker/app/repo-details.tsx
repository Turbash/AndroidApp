import { useLocalSearchParams } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import { fetchRepoCommits, fetchRepoLanguages, fetchRepoReadme } from '../services/github';
import { GitHubCommit } from '../services/github';
import { RepoAnalysisResponse } from '../services/mlModels';
import { getCachedRepoData, getGitHubUsername, setCachedRepoData } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RepoLanguages } from '../components/RepoLanguages';
import { RepoReadmePreview } from '../components/RepoReadmePreview';
import { RepoCommitsList } from '../components/RepoCommitsList';
import { RepoAnalysisDisplay } from '../components/RepoAnalysisDisplay';

export default function RepoDetailsScreen() {
  const { repoName, autoAnalyze } = useLocalSearchParams<{ repoName: string, autoAnalyze?: string }>();
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RepoAnalysisResponse | null>(null);

  const colorScheme = useColorScheme();
  const subtleTextColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');

  useEffect(() => {
    console.log('RepoDetailsScreen mounted with repoName:', repoName);
    loadRepoData();
  }, [repoName]);

  // Auto-trigger analysis if autoAnalyze param is present
  useEffect(() => {
    if (autoAnalyze && !analysisLoading && !showAnalysis && !loading && !error) {
      handleAnalyseRepo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyze, analysisLoading, showAnalysis, loading, error, repoName, username]);
  
  const loadRepoData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const githubUsername = await getGitHubUsername();
      if (!githubUsername || !repoName) {
        setError('Missing username or repository name');
        return;
      }
      
      setUsername(githubUsername);
      
      const cached = await getCachedRepoData(githubUsername, repoName as string);
      if (cached) {
        console.log(`📦 Loading repo data from cache for ${githubUsername}/${repoName}`);
        setCommits(cached.commits);
        setLanguages(cached.languages);
        setReadme(cached.readme);
        setLoading(false);
        return;
      }
      
      console.log(`🔄 Fetching fresh repo data for ${githubUsername}/${repoName}`);
      
      const repoCommits = await fetchRepoCommits(githubUsername, repoName as string);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const repoLanguages = await fetchRepoLanguages(githubUsername, repoName as string);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const readmeContent = await fetchRepoReadme(githubUsername, repoName as string);
      
      setCommits(repoCommits);
      setLanguages(repoLanguages);
      setReadme(readmeContent);
      
      await setCachedRepoData(githubUsername, repoName as string, repoCommits, repoLanguages, readmeContent /* removed projectType */);
      
      console.log('✅ Repo data loading complete');
    } catch (error) {
      console.error('Failed to load repo data:', error);
      setError('Failed to load repository data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyseRepo = async () => {
    setAnalysisLoading(true);
    setShowAnalysis(true);
    setAnalysis(null);

    try {
      const [commitsData, languagesData, readmeData] = await Promise.all([
        fetchRepoCommits(username, repoName as string),
        fetchRepoLanguages(username, repoName as string),
        fetchRepoReadme(username, repoName as string)
      ]);
      const payload = {
        username,
        repo_name: repoName,
        readme_content: readmeData,
        commit_messages: Array.isArray(commitsData) ? commitsData.map((c: any) => c.commit?.message || '') : [],
        repo_languages: languagesData,
      };
      const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const url = `${BACKEND_URL}/analyze-repo`;
      console.log('[RepoDetails] Sending repo analysis request:', payload);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setAnalysis(data);
        console.log('[RepoDetails] Analysis response:', data);
      } catch (err) {
        setAnalysis(null);
        console.error('[RepoDetails] Failed to parse analysis JSON:', text);
      }
    } catch (err) {
      setAnalysis(null);
      console.error('[RepoDetails] Error during repo analysis:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
        <ThemedText type="subtitle" style={styles.loadingTitle}>
          Loading Repository
        </ThemedText>
        <ThemedText type="body" style={styles.loadingSubtitle}>
          {repoName}
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
        <ThemedText type="subtitle" style={styles.errorTitle}>Error</ThemedText>
        <ThemedText type="body" style={styles.errorMessage}>{error}</ThemedText>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: accentColor }]}
          onPress={loadRepoData}
        >
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <ThemedView variant="card" style={styles.header}>
          <ThemedText type="title" style={styles.repoTitle}>{repoName}</ThemedText>
          <ThemedText type="body" style={[styles.repoOwner, { color: subtleTextColor }]}>
            @{username}
          </ThemedText>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: accentColor }]}
              onPress={() => openBrowserAsync(`https://github.com/${username}/${repoName}`)}
            >
              <ThemedText style={styles.actionButtonText}>🔗 View on GitHub</ThemedText>
            </TouchableOpacity>
            
            {!showAnalysis && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: successColor }]}
                onPress={handleAnalyseRepo}
                disabled={analysisLoading}
              >
                <ThemedText style={styles.actionButtonText}>
                  {analysisLoading ? '⏳ Analyzing...' : '🔎 Analyze Repo'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </ThemedView>
        


        {/* Repo Analysis Display */}
        {showAnalysis && (
          <ThemedView variant="card" style={styles.analysisContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              🤖 AI Analysis
            </ThemedText>
            {analysisLoading ? (
              <View style={styles.analysisLoading}>
                <ActivityIndicator size="large" color={accentColor} />
                <ThemedText type="body" style={styles.analysisLoadingText}>
                  Analyzing repository...
                </ThemedText>
              </View>
            ) : analysis ? (
              <RepoAnalysisDisplay analysis={analysis} />
            ) : (
              <ThemedText type="body" style={styles.analysisError}>
                Failed to load analysis.
              </ThemedText>
            )}
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: subtleTextColor }]}
              onPress={() => {
                setShowAnalysis(false);
                // Do not trigger analysis again
              }}
            >
              <ThemedText style={styles.closeButtonText}>Close Analysis</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Languages */}
        {!showAnalysis && Object.keys(languages).length > 0 && (
          <ThemedView variant="card" style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              🗣️ Languages Used
            </ThemedText>
            <RepoLanguages languages={languages} totalBytes={totalBytes} subtleTextColor={subtleTextColor} />
          </ThemedView>
        )}

        {/* README Preview */}
        {!showAnalysis && readme && (
          <ThemedView variant="card" style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              📖 README Preview
            </ThemedText>
            <RepoReadmePreview readme={readme} />
          </ThemedView>
        )}

        {/* Recent Commits */}
        {!showAnalysis && commits.length > 0 && (
          <ThemedView variant="card" style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              📝 Recent Commits ({commits.length})
            </ThemedText>
            <RepoCommitsList commits={commits} subtleTextColor={subtleTextColor} />
          </ThemedView>
        )}
        
        <View style={styles.bottomPadding} />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  repoTitle: {
    marginBottom: 4,
    textAlign: 'center',
  },
  repoOwner: {
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  analysisContainer: {
    padding: 20,
    marginBottom: 16,
  },
  analysisLoading: {
    alignItems: 'center',
    padding: 40,
  },
  analysisLoadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  analysisError: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 20,
  },
  closeButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});