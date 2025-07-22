import React from 'react';
import { Image, TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

export function UserProfileCard({
  user,
  lastFetched,
  subtleTextColor,
  refreshData,
}: {
  user: any;
  lastFetched: Date | null;
  subtleTextColor: string;
  refreshData: () => void;
}) {
  const accentColor = useThemeColor({}, 'tint');
  
  return (
    <ThemedView variant="card" style={styles.userContainer}>
      <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
      <ThemedView style={styles.userInfo}>
        <ThemedText type="defaultSemiBold" style={styles.userName}>
          {user.name || user.login}
        </ThemedText>
        <ThemedText type="body" style={[styles.userHandle, { color: subtleTextColor }]}>
          @{user.login}
        </ThemedText>
        <View style={styles.statsRow}>
          <ThemedText type="caption" style={styles.statText}>
            📁 {user.public_repos} repos
          </ThemedText>
        </View>
        {lastFetched && (
          <ThemedText type="caption" style={[styles.cacheInfo, { color: subtleTextColor }]}>
            Last updated: {lastFetched.toLocaleTimeString()}
          </ThemedText>
        )}
      </ThemedView>
      <TouchableOpacity 
        onPress={refreshData} 
        style={[styles.refreshButton, { backgroundColor: accentColor }]}
      >
        <ThemedText style={styles.refreshIcon}>🔄</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userHandle: {
    marginBottom: 8,
  },
  statsRow: {
    marginBottom: 4,
  },
  statText: {
    fontWeight: '500',
  },
  cacheInfo: {
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 16,
    color: 'white',
  },
});
