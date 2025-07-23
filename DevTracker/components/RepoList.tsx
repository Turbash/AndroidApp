import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

interface RepoListProps {
  repos: any[];
  projectTypes: Record<string, string>;
  subtleTextColor: string;
  dateTextColor: string;
  loading: boolean;
  onRepoPress: (repoName: string) => void;
  renderExtraActions?: (repo: any) => React.ReactNode;
}

export function RepoList({
  repos,
  projectTypes,
  subtleTextColor,
  dateTextColor,
  loading,
  onRepoPress,
  renderExtraActions,
}: RepoListProps) {
  const accentColor = useThemeColor({}, 'tint');
  
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
        <ThemedText type="body" style={styles.loadingText}>Loading repositories...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ScrollView style={styles.reposList} showsVerticalScrollIndicator={false}>
      {repos.length > 0 ? (
        repos.slice(0, 15).map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => onRepoPress(item.name)}
            activeOpacity={0.8}
          >
            <ThemedView variant="card" style={styles.repoItem}>
              <View style={styles.repoHeader}>
                <ThemedText type="label" style={styles.repoName}>
                  {item.name}
                </ThemedText>
                {item.language && (
                  <View style={[styles.languageBadge, { backgroundColor: accentColor }]}>
                    <ThemedText style={styles.languageText}>{item.language}</ThemedText>
                  </View>
                )}
              </View>
              {projectTypes[item.name] && (
                <ThemedText type="caption" style={styles.projectType}>
                  📁 {projectTypes[item.name]}
                </ThemedText>
              )}
              <ThemedText type="body" style={styles.repoDescription} numberOfLines={2}>
                {item.description || 'No description'}
              </ThemedText>
              <ThemedText type="caption" style={[styles.repoDate, { color: dateTextColor }]}>
                Updated {new Date(item.updated_at).toLocaleDateString()}
              </ThemedText>
              {renderExtraActions && (
                <View style={styles.actionsContainer}>
                  {renderExtraActions(item)}
                </View>
              )}
            </ThemedView>
          </TouchableOpacity>
        ))
      ) : (
        <ThemedView variant="card" style={styles.emptyStateContainer}>
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            No Repositories Found
          </ThemedText>
          <ThemedText type="body" style={styles.emptyStateText}>
            Your repositories will appear here once connected
          </ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  reposList: {
    flex: 1,
  },
  repoItem: {
    marginBottom: 12,
    marginHorizontal: 8,
  },
  repoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  repoName: {
    flex: 1,
    marginRight: 12,
  },
  languageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  languageText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  repoDescription: {
    marginBottom: 8,
    lineHeight: 18,
    opacity: 0.8,
  },
  repoDate: {
    marginBottom: 8,
  },
  projectType: {
    marginBottom: 4,
    fontWeight: '500',
    opacity: 0.7,
  },
  actionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 8,
  },
  emptyStateTitle: {
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
