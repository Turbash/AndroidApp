import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { GitHubStatsDisplay } from '../../components/GitHubStatsDisplay';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { AIUnavailableState } from '../../components/AIUnavailableState';
import { getCachedGitHubData, getGitHubUsername } from '../../utils/storage';
import { getCachedUserProfile, fetchUserProfile } from '../../services/github';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function ProfileScreen() {
  const [githubUsername, setGithubUsername] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const accentColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const settingsButtonColor = useThemeColor({}, 'secondary');
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const username = await getGitHubUsername();
      console.log('👤 Loading profile for username:', username);
      if (username) {
        setGithubUsername(username);
        const cachedProfile = await getCachedUserProfile(username);
        if (cachedProfile) {
          console.log('⚡ Loaded user profile from permanent cache:', {
            name: cachedProfile.name,
            login: cachedProfile.login,
            avatar: cachedProfile.avatar_url
          });
          setUserProfile(cachedProfile);
        } else {
          const userProfile = await fetchUserProfile(username, false);
          console.log('✅ Profile loaded from API and cached:', {
            name: userProfile.name,
            login: userProfile.login,
            avatar: userProfile.avatar_url
          });
          setUserProfile(userProfile);
        }
      } else {
        setGithubUsername('');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load GitHub profile. Please check your network or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    setStatsRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          {error ? (
            <AIUnavailableState
              title="GitHub profile unavailable"
              description={error}
              icon="🐙"
            />
          ) : (
            <ThemedText type="body" style={styles.loadingText}>Loading profile...</ThemedText>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!githubUsername) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.emptyContainer}>
          <ThemedView variant="elevated" style={styles.emptyCard}>
            <ThemedText type="title" style={styles.emptyTitle}>No Profile Connected</ThemedText>
            <ThemedText type="body" style={styles.emptyDescription}>
              Connect your GitHub account to see your developer profile and statistics.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.connectButton, { backgroundColor: accentColor }]}
              onPress={() => router.push('/github-connect')}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.connectButtonText}>Connect GitHub</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText type="body" style={styles.headerSubtitle}>
          Your developer profile and statistics
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {userProfile ? (
          <>
            <ThemedView variant="elevated" style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Image source={{ uri: userProfile.avatar_url }} style={styles.avatar} />
                <View style={styles.profileInfo}>
                  <ThemedText type="subtitle" style={styles.name}>
                    {userProfile.name || userProfile.login}
                  </ThemedText>
                  <ThemedText type="body" style={styles.username}>@{userProfile.login}</ThemedText>
                  {userProfile.bio && (
                    <ThemedText type="body" style={styles.bio}>{userProfile.bio}</ThemedText>
                  )}
                </View>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <ThemedText type="title" style={styles.statNumber}>
                    {userProfile.public_repos || 0}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.statLabel}>Repositories</ThemedText>
                </View>
                <View style={[styles.statItem, styles.statDivider]}>
                  <ThemedText type="title" style={styles.statNumber}>
                    {userProfile.followers || 0}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.statLabel}>Followers</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type="title" style={styles.statNumber}>
                    {userProfile.following || 0}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.statLabel}>Following</ThemedText>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.githubButton, { backgroundColor: accentColor }]}
                onPress={() => openBrowserAsync(`https://github.com/${githubUsername}`)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.githubButtonText}>View on GitHub</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            
            <View style={styles.statsActionsRow}>
              <TouchableOpacity 
                style={[styles.refreshButton, { backgroundColor: successColor }]} 
                onPress={refreshStats}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.refreshButtonText}>Refresh Stats</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.refreshButton, { backgroundColor: accentColor }]} 
                onPress={loadProfileData}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.refreshButtonText}>Refresh Profile</ThemedText>
              </TouchableOpacity>
            </View>
            
            <GitHubStatsDisplay key={statsRefreshKey} username={githubUsername} languageCount={6} />
          </>
        ) : (
          <ThemedView variant="card" style={styles.loadingCard}>
            <ThemedText type="body">Loading profile data...</ThemedText>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: accentColor }]}
              onPress={loadProfileData}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: settingsButtonColor }]}
          onPress={() => router.push('/settings')}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.settingsButtonText}>Settings</ThemedText>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  headerSubtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  connectButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  profileCard: {
    marginBottom: 20,
    marginHorizontal: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    marginBottom: 4,
  },
  username: {
    opacity: 0.7,
    marginBottom: 8,
  },
  bio: {
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statNumber: {
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  githubButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  githubButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  settingsButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 8,
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  refreshButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  bottomPadding: {
    height: 20,
  },
});