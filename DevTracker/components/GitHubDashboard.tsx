import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import { analyzeProjectType, fetchRepoReadme, fetchUserProfile, fetchUserRepos, GitHubRepo, GitHubUser } from '../services/github';
import { getCachedGitHubData, setCachedGitHubData } from '../utils/storage';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface GitHubDashboardProps {
  username: string;
}

export function GitHubDashboard({ username }: GitHubDashboardProps) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectTypes, setProjectTypes] = useState<Record<string, string>>({});
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadGitHubData();
  }, [username]);

  const loadGitHubData = async () => {
    try {
      const cached = await getCachedGitHubData(username);
      if (cached) {
        console.log('Loading GitHub data from cache');
        setUser(cached.userProfile);
        setRepos(cached.repos);
        setLastFetched(new Date(cached.timestamp));
        setLoading(false);
        return;
      }

      console.log('Fetching fresh GitHub data');
      const [userProfile, userRepos] = await Promise.all([
        fetchUserProfile(username),
        fetchUserRepos(username)
      ]);
      
      setUser(userProfile);
      setRepos(userRepos);
      setLastFetched(new Date());

      await setCachedGitHubData(username, userRepos, userProfile);

      const topRepos = userRepos.slice(0, 3);
      const typesMap: Record<string, string> = {};
      
      for (const repo of topRepos) {
        try {
          const readme = await fetchRepoReadme(username, repo.name);
          if (readme) {
            const type = await analyzeProjectType(readme);
            typesMap[repo.name] = type;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`Could not analyze ${repo.name}:`, error);
          typesMap[repo.name] = 'Unknown';
        }
      }
      
      setProjectTypes(typesMap);
    } catch (error) {
      console.error('Failed to load GitHub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await setCachedGitHubData(username, [], {});
    await loadGitHubData();
  };

  const colorScheme = useColorScheme();
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const repoItemBg = useThemeColor({ light: '#f9f9f9', dark: '#333' }, 'background');
  const subtleTextColor = colorScheme === 'dark' ? '#999' : '#666';
  const dateTextColor = colorScheme === 'dark' ? '#666' : '#888';

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading GitHub data...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Failed to load GitHub data</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.container}>
        {/* User Profile */}
        <ThemedView style={[styles.userContainer, { backgroundColor: cardBg }]}>
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          <ThemedView style={styles.userInfo}>
            <ThemedText type="subtitle">{user.name}</ThemedText>
            <ThemedText>@{user.login}</ThemedText>
            <ThemedText>{user.public_repos} public repos</ThemedText>
            {lastFetched && (
              <ThemedText style={[styles.cacheInfo, { color: subtleTextColor }]}>
                Updated: {lastFetched.toLocaleTimeString()}
              </ThemedText>
            )}
          </ThemedView>
          <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
            <ThemedText style={{ color: subtleTextColor }}>🔄</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Recent Repos */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Recent Repositories
        </ThemedText>
        
        {repos.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => router.push({ pathname: '/repo-details', params: { repoName: item.name } })}
          >
            <ThemedView style={[styles.repoItem, { backgroundColor: repoItemBg }]}>
              <ThemedText style={styles.repoName}>{item.name}</ThemedText>
              <ThemedText style={[styles.repoLanguage, { color: subtleTextColor }]}>
                {item.language || 'No language'}
              </ThemedText>
              {projectTypes[item.name] && (
                <ThemedText style={[styles.projectType, { color: subtleTextColor }]}>
                  📁 {projectTypes[item.name]}
                </ThemedText>
              )}
              <ThemedText style={styles.repoDescription} numberOfLines={2}>
                {item.description || 'No description'}
              </ThemedText>
              <ThemedText style={[styles.repoDate, { color: dateTextColor }]}>
                Updated: {new Date(item.updated_at).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    marginVertical: 16,
    paddingBottom: 20,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  repoItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  repoName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  repoLanguage: {
    fontSize: 12,
  },
  repoDescription: {
    marginTop: 4,
    fontSize: 14,
  },
  repoDate: {
    fontSize: 12,
    marginTop: 4,
  },
  projectType: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  cacheInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
  },
});