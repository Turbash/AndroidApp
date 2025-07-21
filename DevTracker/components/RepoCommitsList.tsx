import React from 'react';
import { TouchableOpacity } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { ThemedText } from './ThemedText';
import { InfoCard } from './InfoCard';
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
        <TouchableOpacity key={item.sha} onPress={() => openBrowserAsync(item.html_url)}>
          <InfoCard>
            <ThemedText style={{ fontWeight: 'bold', marginBottom: 4 }} numberOfLines={2}>
              {item.commit.message}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: subtleTextColor }}>
              {item.commit.author.name}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: subtleTextColor }}>
              {new Date(item.commit.author.date).toLocaleDateString()}
            </ThemedText>
          </InfoCard>
        </TouchableOpacity>
      ))}
    </>
  );
}
