import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { setGitHubToken } from '../services/github';
import { saveGitHubUsername } from '../utils/storage';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Octicons } from '@expo/vector-icons';

export default function GitHubConnectScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const accentColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');

  const handleConnect = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      const redirectUri = AuthSession.makeRedirectUri();
      console.log('Redirect URI:', redirectUri);
      const authUrl = `${backendUrl}/auth/github/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type === 'success' && result.url) {
        console.log('🌐 OAuth result.url:', result.url);
        const hashIndex = result.url.indexOf('#');
        const fragment = hashIndex !== -1 ? result.url.substring(hashIndex + 1) : '';
        console.log('🔎 Extracted fragment:', fragment);
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          console.log('🔑 Extracted accessToken:', accessToken);
          if (accessToken) {
            await SecureStore.setItemAsync('github_access_token', accessToken);
            setGitHubToken(accessToken);
            console.log('🔑 Access token saved to SecureStore and set for API:', accessToken.substring(0, 8) + '...');
            const resp = await fetch('https://api.github.com/user', {
              headers: { Authorization: `token ${accessToken}` }
            });
            if (resp.ok) {
              const user = await resp.json();
              console.log('👤 GitHub user object:', user);
              if (user && user.login) {
                try {
                  await saveGitHubUsername(user.login);
                  console.log('✅ Saved GitHub username to storage:', user.login);
                } catch (err) {
                  console.error('❌ Failed to save GitHub username:', err);
                }
                router.push('/');
                return;
              } else {
                console.error('❌ User object missing login:', user);
              }
            } else {
              const errorText = await resp.text();
              console.error('❌ Failed to fetch user info:', resp.status, errorText);
            }
            Alert.alert('Error', 'GitHub login failed: could not fetch user info.');
            return;
          }
        }
      }
      Alert.alert('Error', 'GitHub login failed.');
    } catch (error) {
      Alert.alert('Error', 'GitHub login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.content}>
        <View style={[styles.connectCard, { backgroundColor: cardColor }]}>
          <View style={styles.iconContainer}>
            <Octicons name="mark-github" size={48} color={accentColor} />
          </View>
          
          <ThemedText type="title" style={styles.title}>
            Connect GitHub
          </ThemedText>
          
          <ThemedText type="body" style={styles.description}>
            Connect your GitHub account to automatically track your repositories, commits, and coding activity
          </ThemedText>
          
          <TouchableOpacity 
            style={[
              styles.connectButton, 
              { 
                backgroundColor: loading ? useThemeColor({}, 'secondary') : accentColor,
                opacity: loading ? 0.7 : 1
              }
            ]}
            onPress={handleConnect}
            disabled={loading}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.connectButtonText}>
              {loading ? "Connecting..." : "Connect with GitHub"}
            </ThemedText>
          </TouchableOpacity>
          
          <ThemedText type="caption" style={styles.helpText}>
            We'll redirect you to GitHub to authorize the connection
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  connectCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  connectButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 240,
    marginBottom: 16,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  helpText: {
    opacity: 0.6,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
