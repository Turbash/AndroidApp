import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Button, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { getCachedGitHubData, getGitHubUsername } from '../../utils/storage';

export default function ProfileScreen() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const username = await getGitHubUsername();
      if (username) {
        setGithubUsername(username);
        const cached = await getCachedGitHubData(username);
        if (cached) {
          setUserProfile(cached.userProfile);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  if (!githubUsername) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">No Profile Connected</ThemedText>
        <ThemedText style={styles.description}>
          Connect your GitHub account to see your developer profile and statistics.
        </ThemedText>
        <Button 
          title="Connect GitHub" 
          onPress={() => router.push('/github-connect')}
        />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Developer Profile</ThemedText>
        
        {userProfile && (
          <ThemedView style={[styles.profileCard, { backgroundColor: cardBg }]}>
            <Image source={{ uri: userProfile.avatar_url }} style={styles.avatar} />
            <ThemedText type="subtitle" style={styles.name}>
              {userProfile.name || userProfile.login}
            </ThemedText>
            <ThemedText style={styles.username}>@{userProfile.login}</ThemedText>
            
            {userProfile.bio && (
              <ThemedText style={styles.bio}>{userProfile.bio}</ThemedText>
            )}
            
            <ThemedView style={styles.statsContainer}>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{userProfile.public_repos}</ThemedText>
                <ThemedText>Repositories</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{userProfile.followers}</ThemedText>
                <ThemedText>Followers</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{userProfile.following}</ThemedText>
                <ThemedText>Following</ThemedText>
              </ThemedView>
            </ThemedView>
            
            <TouchableOpacity 
              style={styles.githubButton}
              onPress={() => openBrowserAsync(`https://github.com/${githubUsername}`)}
            >
              <ThemedText style={styles.githubButtonText}>View on GitHub</ThemedText>
            </TouchableOpacity>
          </ThemedView>
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
  description: {
    marginVertical: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  username: {
    opacity: 0.7,
    marginBottom: 12,
  },
  bio: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  githubButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0366d6',
  },
  githubButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
