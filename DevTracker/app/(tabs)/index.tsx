import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Octicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View, StatusBar, ActivityIndicator } from 'react-native';
import { GitHubDashboard } from '../../components/GitHubDashboard';
import { ThemedText } from '../../components/ThemedText';
import { getGitHubUsername } from '../../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function DashboardScreen() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const accentColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadData = async () => {
        const username = await getGitHubUsername();
        if (isActive) {
          setGithubUsername(username);
          setLoading(false);
        }
      };
      loadData();
      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <ThemedText type="body" style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      {githubUsername ? (
        <GitHubDashboard username={githubUsername} />
      ) : (
        <View style={styles.connectContainer}>
    <View style={[styles.connectCard, { backgroundColor: cardColor }]}> 
            <View style={styles.connectIcon}>
              <Octicons name="mark-github" size={32} color={accentColor} />
            </View>
            <ThemedText type="title" style={styles.connectTitle}>
              Connect GitHub
            </ThemedText>
            <ThemedText type="body" style={styles.connectDescription}>
              Connect your GitHub account to automatically track repositories, commits, and coding activity.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.connectButton, { backgroundColor: accentColor }]}
              onPress={() => router.push('/github-connect')}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.connectButtonText}>Connect GitHub Account</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  connectCard: {
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
  connectIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  connectTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  connectDescription: {
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
    minWidth: 240,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
});