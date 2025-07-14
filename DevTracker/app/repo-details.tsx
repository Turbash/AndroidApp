import { useLocalSearchParams } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import { analyzeProjectType, fetchRepoCommits, fetchRepoLanguages, fetchRepoReadme, GitHubCommit } from '../services/github';
import { getCachedRepoData, getGitHubUsername, setCachedRepoData } from '../utils/storage';

export default function RepoDetailsScreen() {
  const { repoName } = useLocalSearchParams<{ repoName: string }>();
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [readme, setReadme] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<string>('Unknown');
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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
      
      // Check cache first
      const cached = await getCachedRepoData(githubUsername, repoName as string);
      if (cached) {
        console.log(`📦 Loading repo data from cache for ${githubUsername}/${repoName}`);
        setCommits(cached.commits);
        setLanguages(cached.languages);
        setReadme(cached.readme);
        setProjectType(cached.projectType);
        setLoading(false);
        return;
      }
      
      console.log(`🔄 Fetching fresh repo data for ${githubUsername}/${repoName}`);
      
      // Load data with delays to avoid overwhelming the API
      const repoCommits = await fetchRepoCommits(githubUsername, repoName as string);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const repoLanguages = await fetchRepoLanguages(githubUsername, repoName as string);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const readmeContent = await fetchRepoReadme(githubUsername, repoName as string);
      
      let projectTypeResult = 'Unknown';
      if (readmeContent) {
        projectTypeResult = await analyzeProjectType(readmeContent);
      }
      
      setCommits(repoCommits);
      setLanguages(repoLanguages);
      setReadme(readmeContent);
      setProjectType(projectTypeResult);
      
      // Cache the results
      await setCachedRepoData(githubUsername, repoName as string, repoCommits, repoLanguages, readmeContent, projectTypeResult);
      
      console.log('✅ Repo data loading complete');
    } catch (error) {
      console.error('Failed to load repo data:', error);
      setError('Failed to load repository data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading repository data...</ThemedText>
        <ThemedText style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
          Repository: {repoName}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Error</ThemedText>
        <ThemedText style={{ marginVertical: 16 }}>{error}</ThemedText>
        <Button title="Retry" onPress={loadRepoData} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">{repoName}</ThemedText>
        
        {projectType !== 'Unknown' && (
          <ThemedView style={[styles.projectTypeContainer, { backgroundColor: cardBg }]}>
            <ThemedText type="defaultSemiBold">Project Type: {projectType}</ThemedText>
          </ThemedView>
        )}
        
        <Button 
          title="View on GitHub" 
          onPress={() => openBrowserAsync(`https://github.com/${username}/${repoName}`)}
        />

        {/* Languages */}
        {Object.keys(languages).length > 0 && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Languages Used
            </ThemedText>
            <ThemedView style={[styles.languagesContainer, { backgroundColor: cardBg }]}>
              {Object.entries(languages).map(([lang, bytes]) => (
                <ThemedView key={lang} style={styles.languageItem}>
                  <ThemedText>{lang}</ThemedText>
                  <ThemedText style={{ color: subtleTextColor }}>
                    {Math.round((bytes / totalBytes) * 100)}%
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </>
        )}

        {/* README Preview */}
        {readme && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              README Preview
            </ThemedText>
            <ThemedView style={[styles.readmeContainer, { backgroundColor: cardBg }]}>
              <ThemedText style={styles.readmeText}>
                {readme.substring(0, 500)}...
              </ThemedText>
            </ThemedView>
          </>
        )}

        {/* Recent Commits */}
        {commits.length > 0 && (
          <>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Recent Commits ({commits.length})
            </ThemedText>
            {commits.map((item) => (
              <TouchableOpacity key={item.sha} onPress={() => openBrowserAsync(item.html_url)}>
                <ThemedView style={[styles.commitItem, { backgroundColor: cardBg }]}>
                  <ThemedText style={styles.commitMessage} numberOfLines={2}>
                    {item.commit.message}
                  </ThemedText>
                  <ThemedText style={[styles.commitAuthor, { color: subtleTextColor }]}>
                    {item.commit.author.name}
                  </ThemedText>
                  <ThemedText style={[styles.commitDate, { color: subtleTextColor }]}>
                    {new Date(item.commit.author.date).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </>
        )}
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
