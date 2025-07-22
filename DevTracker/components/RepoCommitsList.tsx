import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { GitHubCommit } from '../services/github';

export function RepoCommitsList({
  commits,
  subtleTextColor,
}: {
  commits: GitHubCommit[];
  subtleTextColor: string;
}) {
  return (
    <>
      {commits.map((item) => (
        <TouchableOpacity 
          key={item.sha} 
          onPress={() => openBrowserAsync(item.html_url)}
          activeOpacity={0.7}
        >
          <ThemedView variant="surface" style={styles.commitItem}>
            <ThemedText type="body" style={styles.commitMessage} numberOfLines={2}>
              {item.commit.message}
            </ThemedText>
            <View style={styles.commitMeta}>
              <ThemedText type="caption" style={[styles.commitAuthor, { color: subtleTextColor }]}>
                👤 {item.commit.author.name}
              </ThemedText>
              <ThemedText type="caption" style={[styles.commitDate, { color: subtleTextColor }]}>
                📅 {new Date(item.commit.author.date).toLocaleDateString()}
              </ThemedText>
            </View>
          </ThemedView>
        </TouchableOpacity>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  commitItem: {
    padding: 16,
    marginBottom: 8,
  },
  commitMessage: {
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 20,
  },
  commitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commitAuthor: {
    fontWeight: '500',
  },
  commitDate: {
    fontWeight: '500',
  },
});
