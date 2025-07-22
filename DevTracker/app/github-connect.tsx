import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet } from 'react-native';
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

export default function GitHubConnectScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#666' : '#ccc';
  const placeholderColor = colorScheme === 'dark' ? '#666' : '#999';

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
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Connect GitHub</ThemedText>
      <ThemedText style={styles.description}>
        Connect your GitHub account to automatically track your repositories, commits, and coding activity
      </ThemedText>
      
      <Button 
        title={loading ? "Connecting..." : "Connect with GitHub"} 
        onPress={handleConnect}
        disabled={loading}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  description: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
});
