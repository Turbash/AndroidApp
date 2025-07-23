import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { ThemedModal } from '../components/ThemedModal';
import { clearGitHubCache, getGitHubUsername, logoutUser } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountSection } from '../components/AccountSection';
import { DataSection } from '../components/DataSection';
import { AboutSection } from '../components/AboutSection';

export default function SettingsScreen() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'logout'|'logoutSuccess'|'clearCache'|'clearCacheSuccess'|null>(null);
  const router = useRouter();

  useEffect(() => {
    getGitHubUsername().then(setGithubUsername);
  }, []);

  const handleLogout = () => {
    setModalType('logout');
    setModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    await logoutUser();
    setGithubUsername(null);
    setModalType('logoutSuccess');
    setModalVisible(true);
  };

  const handleLogoutSuccess = () => {
    setModalVisible(false);
    setModalType(null);
    router.replace('/');
  };

  const handleClearCache = () => {
    setModalType('clearCache');
    setModalVisible(true);
  };

  const handleConfirmClearCache = async () => {
    await clearGitHubCache();
    setModalType('clearCacheSuccess');
    setModalVisible(true);
  };

  const handleCacheCleared = () => {
    setModalVisible(false);
    setModalType(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">⚙️ Settings</ThemedText>
        <ThemedText type="body" style={styles.headerSubtitle}>
          Manage your account and preferences
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <AccountSection
          githubUsername={githubUsername}
          onLogout={handleLogout}
          onConnect={() => router.push('/github-connect')}
        />
        <DataSection onClearCache={handleClearCache} />
        <AboutSection />
        <View style={styles.bottomPadding} />
      </ScrollView>

      <ThemedModal
        visible={modalVisible}
        title={
          modalType === 'logout' ? 'Disconnect GitHub'
          : modalType === 'logoutSuccess' ? 'Disconnected'
          : modalType === 'clearCache' ? 'Clear Cache'
          : modalType === 'clearCacheSuccess' ? 'Cache Cleared'
          : ''
        }
        message={
          modalType === 'logout' ? 'Are you sure you want to disconnect your GitHub account? All cached data will be cleared.'
          : modalType === 'logoutSuccess' ? 'GitHub account has been disconnected.'
          : modalType === 'clearCache' ? 'This will clear all cached GitHub data. Fresh data will be fetched on next load.'
          : modalType === 'clearCacheSuccess' ? 'GitHub data cache has been cleared.'
          : ''
        }
        confirmText={
          modalType === 'logout' ? 'Disconnect'
          : modalType === 'clearCache' ? 'Clear'
          : modalType === 'logoutSuccess' || modalType === 'clearCacheSuccess' ? 'OK'
          : ''
        }
        cancelText={modalType === 'logout' || modalType === 'clearCache' ? 'Cancel' : undefined}
        error={modalType === 'logout' || modalType === 'logoutSuccess'}
        onConfirm={
          modalType === 'logout' ? handleConfirmLogout
          : modalType === 'logoutSuccess' ? handleLogoutSuccess
          : modalType === 'clearCache' ? handleConfirmClearCache
          : modalType === 'clearCacheSuccess' ? handleCacheCleared
          : undefined
        }
        onCancel={() => { setModalVisible(false); setModalType(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerSubtitle: {
    marginTop: 4,
    opacity: 0.7,
    fontSize: 13,
  },
  scrollContainer: {
    flex: 1,
  },
  bottomPadding: {
    height: 24,
  },
});