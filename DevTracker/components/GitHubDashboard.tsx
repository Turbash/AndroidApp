import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import {
    analyzeProjectType,
    fetchRepoCommits,
    fetchRepoLanguages,
    fetchRepoReadme,
    fetchUserProfile,
    fetchUserRepos,
    GitHubRepo,
    GitHubUser
} from '../services/github';
import { MLAnalytics, MLDeveloperInsights as MLInsightsType } from '../services/mlAnalytics';
import { getCachedGitHubData, setCachedGitHubData } from '../utils/storage';
import { MLDeveloperInsights } from './MLDeveloperInsights';
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
  const [activeTab, setActiveTab] = useState<'repos' | 'insights'>('repos');
  const [repoLanguages, setRepoLanguages] = useState<Record<string, Record<string, number>>>({});
  const [allCommits, setAllCommits] = useState<Record<string, any[]>>({});
  const [mlInsights, setMLInsights] = useState<MLInsightsType | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadGitHubData();
  }, [username]);

  const loadGitHubData = async () => {
    try {
      console.log('🔄 Starting to load GitHub data for:', username);
      
      const cached = await getCachedGitHubData(username);
      if (cached) {
        console.log('📦 Found cached data:', { 
          userProfile: !!cached.userProfile, 
          reposCount: cached.repos?.length || 0,
          timestamp: new Date(cached.timestamp).toLocaleString()
        });
        
        
        if (cached.userProfile && cached.repos && Array.isArray(cached.repos) && cached.repos.length > 0) {
          console.log('✅ Cache data is valid, using cached data');
          setUser(cached.userProfile);
          setRepos(cached.repos);
          setLastFetched(new Date(cached.timestamp));
          setLoading(false);
          return;
        } else {
          console.log('⚠️ Cache data is invalid or empty:', {
            hasUserProfile: !!cached.userProfile,
            hasRepos: !!cached.repos,
            isReposArray: Array.isArray(cached.repos),
            reposLength: cached.repos?.length || 0
          });
        }
      } else {
        console.log('📭 No cached data found');
      }

      console.log('🌐 Fetching fresh GitHub data');
      const [userProfile, userRepos] = await Promise.all([
        fetchUserProfile(username),
        fetchUserRepos(username)
      ]);
      
      console.log('✅ GitHub data fetched:', {
        user: userProfile.login,
        userName: userProfile.name,
        avatarUrl: userProfile.avatar_url,
        reposCount: userRepos.length,
        firstRepoName: userRepos[0]?.name || 'No repos',
        reposStructure: userRepos.slice(0, 2).map(r => ({ id: r.id, name: r.name, language: r.language }))
      });
      
      setUser(userProfile);
      setRepos(userRepos);
      setLastFetched(new Date());

      console.log('💾 Saving fresh data to cache...');
      await setCachedGitHubData(username, userRepos, userProfile);
      console.log('✅ Data saved to cache successfully');

      if (userRepos.length > 0) {
        console.log('🤖 Starting ML analytics for', userRepos.length, 'repositories');
        
        const languagesData: Record<string, Record<string, number>> = {};
        const commitsData: Record<string, any[]> = {};

        const topRepos = userRepos.slice(0, 8);
        
        for (let i = 0; i < topRepos.length; i++) {
          const repo = topRepos[i];
          try {
            console.log(`🔬 Analyzing ${repo.name} for ML (${i + 1}/${topRepos.length})`);
            
            const [languages, commits] = await Promise.all([
              fetchRepoLanguages(username, repo.name),
              fetchRepoCommits(username, repo.name)
            ]);
            
            languagesData[repo.name] = languages;
            commitsData[repo.name] = commits;
            
            if (i < topRepos.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (error) {
            console.error(`Failed to get ML data for ${repo.name}:`, error);
            languagesData[repo.name] = {};
            commitsData[repo.name] = [];
          }
        }

        setRepoLanguages(languagesData);
        setAllCommits(commitsData);

        console.log('🧠 Generating ML-powered developer insights...');
        const mlDeveloperInsights = await MLAnalytics.generateMLInsights(
          userRepos, 
          languagesData, 
          commitsData
        );
        setMLInsights(mlDeveloperInsights);
        console.log('✅ ML insights generated successfully');

        const typesMap: Record<string, string> = {};
        for (const repo of topRepos.slice(0, 3)) {
          try {
            const readme = await fetchRepoReadme(username, repo.name);
            if (readme) {
              const type = await analyzeProjectType(readme);
              typesMap[repo.name] = type;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.log(`Could not analyze ${repo.name}:`, error);
            typesMap[repo.name] = 'Unknown';
          }
        }
        setProjectTypes(typesMap);
      }
      
    } catch (error) {
      console.error('❌ Failed to load GitHub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('🔄 Refreshing data...');
    setLoading(true);
    setRepoLanguages({});
    setAllCommits({});
    setProjectTypes({});
    setMLInsights(null);
    
    await setCachedGitHubData(username, [], {});
    await loadGitHubData();
  };

  const refreshAnalysisOnly = async () => {
    console.log('🔄 Refreshing analysis only (using cached GitHub data)...');
    
    if (repos.length === 0) {
      console.log('⚠️ No repos available, loading GitHub data first...');
      await loadGitHubData();
      return;
    }

    try {
      console.log('🤖 Re-running ML analytics on cached data...');
      
      const languagesData: Record<string, Record<string, number>> = {};
      const commitsData: Record<string, any[]> = {};

      const topRepos = repos.slice(0, 8);
      
      for (let i = 0; i < topRepos.length; i++) {
        const repo = topRepos[i];
        try {
          console.log(`🔬 Re-analyzing ${repo.name} (${i + 1}/${topRepos.length})`);
          
          const [languages, commits] = await Promise.all([
            fetchRepoLanguages(username, repo.name),
            fetchRepoCommits(username, repo.name)
          ]);
          
          languagesData[repo.name] = languages;
          commitsData[repo.name] = commits;
          
          if (i < topRepos.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          console.error(`Failed to get data for ${repo.name}:`, error);
          languagesData[repo.name] = {};
          commitsData[repo.name] = [];
        }
      }

      setRepoLanguages(languagesData);
      setAllCommits(commitsData);

      console.log('🧠 Generating fresh ML insights...');
      const mlDeveloperInsights = await MLAnalytics.generateMLInsights(
        repos, 
        languagesData, 
        commitsData
      );
      setMLInsights(mlDeveloperInsights);
      console.log('✅ Analysis refresh completed');

    } catch (error) {
      console.error('❌ Failed to refresh analysis:', error);
    }
  };

  const colorScheme = useColorScheme();
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const repoItemBg = useThemeColor({ light: '#f9f9f9', dark: '#333' }, 'background');
  const subtleTextColor = colorScheme === 'dark' ? '#999' : '#666';
  const dateTextColor = colorScheme === 'dark' ? '#666' : '#888';
  const tabBg = useThemeColor({ light: '#f0f0f0', dark: '#333' }, 'background');

  console.log('🎯 Render state:', {
    loading,
    hasUser: !!user,
    reposCount: repos.length,
    activeTab,
    hasMLInsights: !!mlInsights
  });

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
        <TouchableOpacity onPress={loadGitHubData} style={styles.retryButton}>
          <ThemedText>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Debug Info */}
      <ThemedText style={styles.debugText}>
        User: {user?.login || 'None'} | Repos: {repos.length} | Tab: {activeTab} | ML: {mlInsights ? 'Ready' : 'Loading'}
      </ThemedText>

      {/* Tab Navigation */}
      <ThemedView style={[styles.tabContainer, { backgroundColor: tabBg }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'repos' && styles.activeTab]}
          onPress={() => {
            console.log('📁 Switching to repos tab');
            setActiveTab('repos');
          }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'repos' && styles.activeTabText]}>
            📁 Repositories ({repos.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => {
            console.log('🧠 Switching to insights tab');
            setActiveTab('insights');
          }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
            🤖 ML Insights
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Content based on active tab */}
      {activeTab === 'repos' ? (
        <ThemedView style={styles.reposContainer}>
          {/* User Profile */}
          {user && (
            <ThemedView style={[styles.userContainer, { backgroundColor: cardBg }]}>
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              <ThemedView style={styles.userInfo}>
                <ThemedText type="subtitle">{user.name || user.login}</ThemedText>
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
          )}

          {/* Recent Repos */}
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Recent Repositories ({repos.length})
          </ThemedText>
          
          <ScrollView style={styles.reposList} showsVerticalScrollIndicator={false}>
            {repos.length > 0 ? (
              repos.slice(0, 15).map((item) => (
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
              ))
            ) : (
              <ThemedText style={styles.emptyState}>
                {loading ? 'Loading repositories...' : 'No repositories found.'}
              </ThemedText>
            )}
          </ScrollView>
        </ThemedView>
      ) : (
        <ThemedView style={styles.insightsContainer}>
          {mlInsights ? (
            <MLDeveloperInsights insights={mlInsights} />
          ) : (
            <ThemedView style={styles.loadingContainer}>
              <ThemedText>🤖 Analyzing your coding patterns...</ThemedText>
              <ThemedText style={styles.loadingSubtext}>
                Using advanced AI to assess skills and generate insights
              </ThemedText>
              {!loading && (
                <TouchableOpacity onPress={refreshAnalysisOnly} style={styles.retryButton}>
                  <ThemedText style={{ color: 'white' }}>Refresh Analysis</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 16,
  },
  debugText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  reposContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  insightsContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
  reposList: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyState: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    padding: 20,
  },
});