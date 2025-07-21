import React from 'react';
import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function UserProfileCard({
  user,
  lastFetched,
  cardBg,
  subtleTextColor,
  refreshData,
}: {
  user: any;
  lastFetched: Date | null;
  cardBg: string;
  subtleTextColor: string;
  refreshData: () => void;
}) {
  return (
    <ThemedView style={[styles.userContainer, { backgroundColor: cardBg }]}>
      <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
      <ThemedView style={styles.userInfo}>
        <ThemedText type="subtitle">{user.name || user.login}</ThemedText>
        <ThemedText>@{user.login}</ThemedText>
        <ThemedText>{user.public_repos} public repos</ThemedText>
        {lastFetched && (
          <ThemedText style={[styles.cacheInfo, { color: subtleTextColor }]}>
            Updated: {lastFetched.toLocaleTimeString()}
          </ThemedText>
        )}
      </ThemedView>
      <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
        <ThemedText style={{ color: subtleTextColor }}>🔄</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  cacheInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
  },
});
