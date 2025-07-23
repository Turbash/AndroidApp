import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { AIUnavailableState } from '../../components/AIUnavailableState';
import { getCachedGitHubData, getGitHubUsername } from '../../utils/storage';
import { getCachedUserProfile, fetchUserProfile } from '../../services/github';
import { GitHubStatsService } from '../../services/githubStats';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../hooks/useColorScheme';
import { WebView } from 'react-native-webview';
import { StatsWebViewSection } from '../../components/StatsWebViewSection';

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
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');

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
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        
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
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyCard, { backgroundColor: cardColor }]}>
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
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}> 
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsButtonContainer}>
          <TouchableOpacity
            style={[styles.settingsButtonRounded, { backgroundColor: cardColor }]}
            onPress={() => router.push('/settings')}
            activeOpacity={0.85}
          >
            <View style={styles.settingsButtonContent}>
              <ThemedText style={styles.settingsIconBright}>⚙️</ThemedText>
              <ThemedText style={styles.settingsButtonRoundedText}>Settings</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
        {userProfile ? (
          <>
            <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
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
            </View>
            
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
            <View style={{ height: 10 }}></View>
            <StatsWebViewSection validatedUsername={githubUsername} languageCount={6} />
          </>
        ) : (
          <View style={[styles.loadingCard, { backgroundColor: cardColor }]}>
            <ThemedText type="body">Loading profile data...</ThemedText>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: accentColor }]}
              onPress={loadProfileData}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingsButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  settingsButtonRounded: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#FFD600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
    elevation: 4,
  },
  // ...existing code...
  settingsButtonRoundedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  settingsButtonFullWidth: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
    elevation: 4,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  settingsIconBright: {
    color: '#fff',
    fontSize: 22,
    marginRight: 8,
    fontWeight: 'bold',
    textShadowColor: '#222',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  settingsButtonFullWidthText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  settingsButtonWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  settingsButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
    elevation: 4,
  },
  settingsButtonModernText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
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
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    fontSize: 16,
  },
  username: {
    opacity: 0.7,
    fontSize: 13,
  },
  bio: {
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: 18,
    fontSize: 13,
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
    fontSize: 15,
  },
  statLabel: {
    opacity: 0.7,
    fontSize: 12,
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
    fontSize: 13,
  },
  loadingCard: {
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    marginHorizontal: 16,
    marginTop: 16,
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
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