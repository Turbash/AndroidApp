import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setGitHubToken } from '../services/github';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
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
    const initTokenAndLoad = async () => {
      const token = await SecureStore.getItemAsync('github_access_token');
      if (token) setGitHubToken(token);
      await loadGitHubData();
    };
    initTokenAndLoad();
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
  const cardBg = useThemeColor({}, 'card');
  const subtleTextColor = useThemeColor({}, 'secondary');
  const dateTextColor = useThemeColor({}, 'secondary');
  const tabBg = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, 'tint');

  console.log('🎯 Render state:', {
    loading,
    hasUser: !!user,
    reposCount: repos.length,
    activeTab,
    hasMLInsights: !!mlInsights
  });

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
        <ThemedText type="body" style={styles.loadingText}>Loading GitHub data...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="subtitle" style={styles.errorTitle}>Failed to load GitHub data</ThemedText>
        <TouchableOpacity onPress={loadGitHubData} style={[styles.retryButton, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>

      <ThemedView variant="card" style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'repos' && { backgroundColor: accentColor }
          ]}
          onPress={() => setActiveTab('repos')}
          activeOpacity={0.8}
        >
          <ThemedText style={[
            styles.tabText, 
            activeTab === 'repos' && styles.activeTabText
          ]}>
            Repositories
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'insights' && { backgroundColor: accentColor }
          ]}
          onPress={() => setActiveTab('insights')}
          activeOpacity={0.8}
        >
          <ThemedText style={[
            styles.tabText, 
            activeTab === 'insights' && styles.activeTabText
          ]}>
            AI Insights
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {activeTab === 'repos' ? (
        <RepoTabContent
          user={user}
          repos={repos}
          lastFetched={lastFetched}
          projectTypes={projectTypes}
          loading={loading}
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
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});