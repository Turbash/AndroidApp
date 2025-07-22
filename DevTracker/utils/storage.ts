// --- Goal Chat History ---
const GOAL_CHAT_HISTORY_KEY = (goalId: string) => `DEVTRACKER_GOAL_CHAT_${goalId}`;
export type ChatTurn = { role: "user" | "ai"; message: string };

export async function setGoalChatHistory(goalId: string, chatHistory: ChatTurn[]): Promise<void> {
  const trimmed = chatHistory.slice(-10); // keep only last 10 turns
  await AsyncStorage.setItem(GOAL_CHAT_HISTORY_KEY(goalId), JSON.stringify(trimmed));
}

export async function getGoalChatHistory(goalId: string): Promise<ChatTurn[]> {
  const raw = await AsyncStorage.getItem(GOAL_CHAT_HISTORY_KEY(goalId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ChatTurn[];
  } catch {
    return [];
  }
}

export async function clearGoalChatHistory(goalId: string): Promise<void> {
  await AsyncStorage.removeItem(GOAL_CHAT_HISTORY_KEY(goalId));
}
// --- GitHub Stats Image Cache ---
const GITHUB_STATS_IMAGE_KEY = 'DEVTRACKER_GITHUB_STATS_IMAGE';
export interface GitHubStatsImageCache {
  username: string;
  statsImageUrl: string;
  languagesImageUrl: string;
  timestamp: number;
}

export async function getCachedGitHubStatsImage(username: string): Promise<GitHubStatsImageCache | null> {
  try {
    const cached = await AsyncStorage.getItem(GITHUB_STATS_IMAGE_KEY);
    if (!cached) return null;
    const data: GitHubStatsImageCache = JSON.parse(cached);
    if (data.username !== username) return null;
    return data;
  } catch (error) {
    console.error('Error reading GitHub stats image cache:', error);
    return null;
  }
}

export async function setCachedGitHubStatsImage(username: string, statsImageUrl: string, languagesImageUrl: string): Promise<void> {
  try {
    const cacheData: GitHubStatsImageCache = {
      username,
      statsImageUrl,
      languagesImageUrl,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(GITHUB_STATS_IMAGE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving GitHub stats image cache:', error);
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GitHubUser } from '../services/github';
import { MLDeveloperInsights } from '../services/mlAnalytics';

const GITHUB_USERNAME_KEY = 'DEVTRACKER_GITHUB_USERNAME';
const GITHUB_CACHE_KEY = 'DEVTRACKER_GITHUB_CACHE';
const REPO_CACHE_KEY = 'DEVTRACKER_REPO_CACHE';
const CACHE_DURATION = 1000 * 60 * 30; 
const REPO_CACHE_DURATION = 1000 * 60 * 30; 
interface GitHubCache {
  username: string;
  repos: any[];
  userProfile: any;
  timestamp: number;
}

interface RepoCache {
  repoName: string;
  username: string;
  commits: any[];
  languages: Record<string, number>;
  readme: string | null;
  timestamp: number;
}

export async function saveGitHubUsername(username: string): Promise<void> {
  await AsyncStorage.setItem(GITHUB_USERNAME_KEY, username);
}

export async function getGitHubUsername(): Promise<string | null> {
  return await AsyncStorage.getItem(GITHUB_USERNAME_KEY);
}

export async function getCachedGitHubData(username: string): Promise<GitHubCache | null> {
  try {
    const cached = await AsyncStorage.getItem(GITHUB_CACHE_KEY);
    if (!cached) return null;
    const data: GitHubCache = JSON.parse(cached);
    if (data.username !== username) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error reading GitHub cache:', error);
    return null;
  }
}

export async function setCachedGitHubData(username: string, repos: any[], userProfile: any): Promise<void> {
  try {
    const cacheData: GitHubCache = {
      username,
      repos,
      userProfile,
      timestamp: Date.now() // timestamp kept for legacy, not used for expiration
    };
    await AsyncStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving GitHub cache:', error);
  }
}

export async function getCachedRepoData(username: string, repoName: string): Promise<RepoCache | null> {
  try {
    const cacheKey = `${REPO_CACHE_KEY}_${username}_${repoName}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const data: RepoCache = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > REPO_CACHE_DURATION;
    
    if (isExpired) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading repo cache:', error);
    return null;
  }
}

export async function setCachedRepoData(
  username: string, 
  repoName: string, 
  commits: any[], 
  languages: Record<string, number>, 
  readme: string | null
): Promise<void> {
  try {
    const cacheKey = `${REPO_CACHE_KEY}_${username}_${repoName}`;
    const cacheData: RepoCache = {
      repoName,
      username,
      commits,
      languages,
      readme,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`📦 Cached repo data for ${username}/${repoName}`);
  } catch (error) {
    console.error('Error saving repo cache:', error);
  }
}

export async function setCachedUserProfile(username: string, profile: GitHubUser): Promise<void> {
  try {
    const cacheKey = `user_profile_${username}`;
    const cacheData = {
      profile
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('👤 User profile cached successfully');
  } catch (error) {
    console.error('Failed to cache user profile:', error);
  }
}

export async function getCachedUserProfile(username: string): Promise<GitHubUser | null> {
  try {
    const cacheKey = `user_profile_${username}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { profile } = JSON.parse(cached);
      console.log('👤 Using cached user profile');
      return profile;
    }
    return null;
  } catch (error) {
    console.error('Failed to get cached user profile:', error);
    return null;
  }
}

export async function setCachedMLInsights(username: string, insights: MLDeveloperInsights): Promise<void> {
  try {
    const cacheKey = `ml_insights_${username}`;
    const cacheData = {
      insights,
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('🧠 ML insights cached successfully');
  } catch (error) {
    console.error('Failed to cache ML insights:', error);
  }
}

export async function getCachedMLInsights(username: string): Promise<MLDeveloperInsights | null> {
  try {
    const cacheKey = `ml_insights_${username}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (cached) {
      const { insights, timestamp } = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(timestamp).getTime();
      
      if (cacheAge < 30 * 60 * 1000) {
        console.log('🧠 Using cached ML insights');
        return insights;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get cached ML insights:', error);
    return null;
  }
}

export async function clearMLInsightsCache(username: string): Promise<void> {
  try {
    const cacheKey = `ml_insights_${username}`;
    await AsyncStorage.removeItem(cacheKey);
    console.log('🗑️ ML insights cache cleared');
  } catch (error) {
    console.error('Failed to clear ML insights cache:', error);
  }
}

export async function clearGitHubCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GITHUB_CACHE_KEY);
  } catch (error) {
    console.error('Error clearing GitHub cache:', error);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(GITHUB_USERNAME_KEY),
      AsyncStorage.removeItem(GITHUB_CACHE_KEY),
    ]);
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
}