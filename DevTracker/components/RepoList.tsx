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
            activeOpacity={0.7}
          >
            <ThemedView variant="surface" style={styles.repoItem}>
              <View style={styles.repoHeader}>
                <ThemedText type="defaultSemiBold" style={styles.repoName}>
                  {item.name}
                </ThemedText>
                {item.language && (
                  <View style={[styles.languageBadge, { backgroundColor: accentColor }]}>
                    <ThemedText style={styles.languageText}>{item.language}</ThemedText>
                  </View>
                )}
              </View>
              {projectTypes[item.name] && (
                <ThemedText type="caption" style={[styles.projectType, { color: subtleTextColor }]}>
                  📁 {projectTypes[item.name]}
                </ThemedText>
              )}
              <ThemedText type="body" style={styles.repoDescription} numberOfLines={2}>
                {item.description || 'No description'}
              </ThemedText>
              <ThemedText type="caption" style={[styles.repoDate, { color: dateTextColor }]}>
                Updated: {new Date(item.updated_at).toLocaleDateString()}
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
        <ThemedText type="body" style={styles.emptyState}>
          {loading ? 'Loading repositories...' : 'No repositories found.'}
        </ThemedText>
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
    padding: 16,
    marginBottom: 12,
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
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  repoDescription: {
    marginBottom: 8,
    lineHeight: 20,
  },
  repoDate: {
    marginBottom: 4,
  },
  projectType: {
    marginBottom: 4,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emptyState: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 40,
    fontSize: 16,
  },
});
