import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import { fetchUserProfile } from '../services/github';
import { saveGitHubUsername } from '../utils/storage';

export default function GitHubConnectScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#666' : '#ccc';
  const placeholderColor = colorScheme === 'dark' ? '#666' : '#999';

  const handleConnect = async () => {
    if (!username.trim()) {
      Alert.alert('Please enter your GitHub username');
      return;
    }

    setLoading(true);
    try {
      await fetchUserProfile(username);
      await saveGitHubUsername(username);
      Alert.alert('Success', 'GitHub account connected!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'GitHub user not found. Please check your username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Connect GitHub</ThemedText>
      <ThemedText style={styles.description}>
        Connect your GitHub account to automatically track your repositories, commits, and coding activity
      </ThemedText>
      
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        placeholder="Your GitHub username"
        placeholderTextColor={placeholderColor}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <Button 
        title={loading ? "Connecting..." : "Connect GitHub"} 
        onPress={handleConnect}
        disabled={loading}
      />
    </ThemedView>
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
