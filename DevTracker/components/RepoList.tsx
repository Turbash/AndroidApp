import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

import { AIUnavailableState } from './AIUnavailableState';

interface RepoListProps {
  repos: any[];
  projectTypes: Record<string, string>;
  subtleTextColor: string;
  dateTextColor: string;
  loading: boolean;
  error?: string | null;
  onRepoPress: (repoName: string) => void;
  renderExtraActions?: (repo: any) => React.ReactNode;
}

export function RepoList({
  repos,
  projectTypes,
  subtleTextColor,
  dateTextColor,
  loading,
  error,
  onRepoPress,
  renderExtraActions,
}: RepoListProps) {
  const accentColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
        <ThemedText type="body" style={styles.loadingText}>Loading repositories...</ThemedText>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <AIUnavailableState
          title="Repositories unavailable"
          description={error}
          icon="📁"
        />
      </View>
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
            <View style={[styles.repoItem, { backgroundColor: cardColor }]}>
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
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={[styles.emptyStateContainer, { backgroundColor: cardColor }]}>
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            No Repositories Found
          </ThemedText>
          <ThemedText type="body" style={styles.emptyStateText}>
            Your repositories will appear here once connected
          </ThemedText>
        </View>
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
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyStateTitle: {
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
