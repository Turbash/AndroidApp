import { useLocalSearchParams } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import { fetchRepoCommits, fetchRepoLanguages, fetchRepoReadme } from '../services/github';
import { GitHubCommit } from '../services/github';
import { RepoAnalysisResponse } from '../services/mlModels';
import { getCachedRepoData, getGitHubUsername, setCachedRepoData } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoCard } from '../components/InfoCard';
import { RepoLanguages } from '../components/RepoLanguages';
import { RepoReadmePreview } from '../components/RepoReadmePreview';
import { RepoCommitsList } from '../components/RepoCommitsList';
import { RepoAnalysisDisplay } from '../components/RepoAnalysisDisplay';

export default function RepoDetailsScreen() {
  const { repoName } = useLocalSearchParams<{ repoName: string }>();
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
  const cardBg = useThemeColor({ light: '#f9f9f9', dark: '#333' }, 'background');
  const subtleTextColor = colorScheme === 'dark' ? '#999' : '#666';

  useEffect(() => {
    console.log('RepoDetailsScreen mounted with repoName:', repoName);
    loadRepoData();
  }, [repoName]);
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
      <SafeAreaView style={styles.container}>
        <ThemedText>Loading repository data...</ThemedText>
        <ThemedText style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
          Repository: {repoName}
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText type="title">Error</ThemedText>
        <ThemedText style={{ marginVertical: 16 }}>{error}</ThemedText>
        <Button title="Retry" onPress={loadRepoData} />
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <SafeAreaView style={styles.container}>
        <ThemedText type="title">{repoName}</ThemedText>
        
        <Button 
          title="View on GitHub" 
          onPress={() => openBrowserAsync(`https://github.com/${username}/${repoName}`)}
        />

        {/* Analyse Repo Button */}
        {!showAnalysis && (
          <Button
            title="🔎 Analyse This Repo"
            onPress={handleAnalyseRepo}
            disabled={analysisLoading}
          />
        )}

        {/* Repo Analysis Display */}
        {showAnalysis && (
          <ThemedView style={{ marginTop: 20 }}>
            {analysisLoading ? (
              <ThemedText>Analysing repo...</ThemedText>
            ) : analysis ? (
              <RepoAnalysisDisplay analysis={analysis} />
            ) : (
              <ThemedText>Failed to load analysis.</ThemedText>
            )}
            <Button title="Close Analysis" onPress={() => setShowAnalysis(false)} />
          </ThemedView>
        )}

        {/* Languages */}
        {!showAnalysis && Object.keys(languages).length > 0 && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Languages Used
            </ThemedText>
            <RepoLanguages languages={languages} totalBytes={totalBytes} subtleTextColor={subtleTextColor} />
          </>
        )}

        {/* README Preview */}
        {!showAnalysis && readme && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              README Preview
            </ThemedText>
            <RepoReadmePreview readme={readme} />
          </>
        )}

        {/* Recent Commits */}
        {!showAnalysis && commits.length > 0 && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Recent Commits ({commits.length})
            </ThemedText>
            <RepoCommitsList commits={commits} subtleTextColor={subtleTextColor} />
          </>
        )}
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
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  projectTypeContainer: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  languagesContainer: {
    padding: 12,
    borderRadius: 8,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  readmeContainer: {
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  readmeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commitItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  commitMessage: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commitAuthor: {
    fontSize: 12,
  },
  commitDate: {
    fontSize: 12,
  },
});