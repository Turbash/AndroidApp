import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import {
  fetchRepoCommits,
  fetchRepoLanguages,
  fetchUserProfile,
  fetchUserRepos,
  GitHubRepo,
  GitHubUser
} from '../services/github';
import { MLAnalytics, MLDeveloperInsights as MLInsightsType } from '../services/mlAnalytics';
import { clearMLInsightsCache, getCachedGitHubData, getCachedMLInsights, getCachedUserProfile, setCachedGitHubData, setCachedUserProfile } from '../utils/storage';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MLInsightsTab } from './MLInsightsTab';
import { RepoTabContent } from './RepoTabContent';

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
      
      const cachedProfile = await getCachedUserProfile(username);
      if (cachedProfile) {
        console.log('👤 Using cached user profile');
        setUser(cachedProfile);
      }

      const cached = await getCachedGitHubData(username);
      if (cached?.repos && cached.repos.length > 0) {
        console.log('📦 Using cached repositories');
        setRepos(cached.repos);
        setLastFetched(new Date(cached.timestamp));
        
        const cachedMLInsights = await getCachedMLInsights(username);
        if (cachedMLInsights) {
          console.log('🧠 Using cached ML insights');
          setMLInsights(cachedMLInsights);
        }
        
        setLoading(false);
        return;
      }

      console.log('🌐 Fetching fresh GitHub data');
      const [userProfile, userRepos] = await Promise.all([
        cachedProfile || fetchUserProfile(username),
        fetchUserRepos(username)
      ]);
      
      setUser(userProfile);
      setRepos(userRepos);
      setLastFetched(new Date());

      await Promise.all([
        setCachedUserProfile(username, userProfile),
        setCachedGitHubData(username, userRepos, userProfile)
      ]);

      if (userRepos.length > 0) {
        generateMLAnalytics(userRepos);
      }
      
    } catch (error) {
      console.error('❌ Failed to load GitHub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMLAnalytics = async (reposList: GitHubRepo[], useCache = true) => {
    try {
      console.log('🤖 Starting ML analytics generation...');
      
      const languagesData: Record<string, Record<string, number>> = {};
      const commitsData: Record<string, any[]> = {};

      const topRepos = reposList.slice(0, 8);
      
      const repoDataPromises = topRepos.map(async (repo) => {
        try {
          const [languages, commits] = await Promise.all([
            fetchRepoLanguages(username, repo.name),
            fetchRepoCommits(username, repo.name)
          ]);
          return { repoName: repo.name, languages, commits };
        } catch (error) {
          console.error(`Failed to get data for ${repo.name}:`, error);
          return { repoName: repo.name, languages: {}, commits: [] };
        }
      });

      const repoResults = await Promise.all(repoDataPromises);
      
      repoResults.forEach(({ repoName, languages, commits }) => {
        languagesData[repoName] = languages;
        commitsData[repoName] = commits;
      });

      setRepoLanguages(languagesData);
      setAllCommits(commitsData);

      const mlInsights = await MLAnalytics.generateMLInsights(
        reposList, 
        languagesData, 
        commitsData,
        username,
        useCache
      );
      
      setMLInsights(mlInsights);
      console.log('✅ ML analytics completed');

    } catch (error) {
      console.error('❌ Failed to generate ML analytics:', error);
    }
  };

  const refreshMLInsightsOnly = async () => {
    console.log('🧠 Refreshing ML insights only...');
    
    if (repos.length === 0) {
      console.log('⚠️ No repos available');
      return;
    }

    await clearMLInsightsCache(username);
    setMLInsights(null);
    
    await generateMLAnalytics(repos, false); 
  };

  const refreshGitHubDataOnly = async () => {
    console.log('📡 Refreshing GitHub data only...');
    setLoading(true);
    
    try {
      const [userProfile, userRepos] = await Promise.all([
        fetchUserProfile(username),
        fetchUserRepos(username)
      ]);
      
      setUser(userProfile);
      setRepos(userRepos);
      setLastFetched(new Date());

      await Promise.all([
        setCachedUserProfile(username, userProfile),
        setCachedGitHubData(username, userRepos, userProfile)
      ]);
      
    } catch (error) {
      console.error('❌ Failed to refresh GitHub data:', error);
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
        commitsData,
        username, 
        false 
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
      <ThemedText style={styles.debugText}>
        User: {user?.login || 'None'} | Repos: {repos.length} | Tab: {activeTab} | ML: {mlInsights ? 'Ready' : 'Loading'}
      </ThemedText>

      {/* Tab Navigation */}
      <ThemedView style={[styles.tabContainer, { backgroundColor: tabBg }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'repos' && styles.activeTab]}
          onPress={() => setActiveTab('repos')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'repos' && styles.activeTabText]}>
            📁 Repositories ({repos.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
            🤖 ML Insights
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Content based on active tab */}
      {activeTab === 'repos' ? (
        <RepoTabContent
          user={user}
          repos={repos}
          lastFetched={lastFetched}
          projectTypes={projectTypes}
          loading={loading}
          cardBg={cardBg}
          repoItemBg={repoItemBg}
          subtleTextColor={subtleTextColor}
          dateTextColor={dateTextColor}
          refreshData={refreshData}
        />
      ) : (
        <MLInsightsTab
          mlInsights={mlInsights}
          username={username}
          loading={loading}
          refreshMLInsightsOnly={refreshMLInsightsOnly}
          refreshGitHubDataOnly={refreshGitHubDataOnly}
        />
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
  refreshButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  fastRefreshButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});