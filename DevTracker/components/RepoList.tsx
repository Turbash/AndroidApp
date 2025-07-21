import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface RepoListProps {
  repos: any[];
  projectTypes: Record<string, string>;
  repoItemBg: string;
  subtleTextColor: string;
  dateTextColor: string;
  loading: boolean;
  onRepoPress: (repoName: string) => void;
  renderExtraActions?: (repo: any) => React.ReactNode;
}

export function RepoList({
  repos,
  projectTypes,
  repoItemBg,
  subtleTextColor,
  dateTextColor,
  loading,
  onRepoPress,
  renderExtraActions,
}: RepoListProps) {
  return (
    <ScrollView style={styles.reposList} showsVerticalScrollIndicator={false}>
      {repos.length > 0 ? (
        repos.slice(0, 15).map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => onRepoPress(item.name)}
          >
            <ThemedView style={[styles.repoItem, { backgroundColor: repoItemBg }]}>
              <ThemedText style={styles.repoName}>{item.name}</ThemedText>
              <ThemedText style={[styles.repoLanguage, { color: subtleTextColor }]}>
                {item.language || 'No language'}
              </ThemedText>
              {projectTypes[item.name] && (
                <ThemedText style={[styles.projectType, { color: subtleTextColor }]}>
                  📁 {projectTypes[item.name]}
                </ThemedText>
              )}
              <ThemedText style={styles.repoDescription} numberOfLines={2}>
                {item.description || 'No description'}
              </ThemedText>
              <ThemedText style={[styles.repoDate, { color: dateTextColor }]}>
                Updated: {new Date(item.updated_at).toLocaleDateString()}
              </ThemedText>
              {renderExtraActions && (
                <View style={{ marginTop: 4 }}>
                  {renderExtraActions(item)}
                </View>
              )}
            </ThemedView>
          </TouchableOpacity>
        ))
      ) : (
        <ThemedText style={styles.emptyState}>
          {loading ? 'Loading repositories...' : 'No repositories found.'}
        </ThemedText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  reposList: {
    flex: 1,
  },
  repoItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  repoName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  repoLanguage: {
    fontSize: 12,
  },
  repoDescription: {
    marginTop: 4,
    fontSize: 14,
  },
  repoDate: {
    fontSize: 12,
    marginTop: 4,
  },
  projectType: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    padding: 20,
  },
});
