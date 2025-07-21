import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MLDeveloperInsights } from './MLDeveloperInsights';

export function MLInsightsTab({
  mlInsights,
  username,
  loading,
  refreshMLInsightsOnly,
  refreshGitHubDataOnly,
}: {
  mlInsights: any;
  username: string;
  loading: boolean;
  refreshMLInsightsOnly: () => void;
  refreshGitHubDataOnly: () => void;
}) {
  return (
    <ThemedView style={styles.insightsContainer}>
      {mlInsights ? (
        <>
          <ThemedView style={styles.refreshButtonsContainer}>
            <TouchableOpacity onPress={refreshMLInsightsOnly} style={styles.fastRefreshButton}>
              <ThemedText style={styles.refreshButtonText}>🧠 Refresh Insights</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={refreshGitHubDataOnly} style={styles.fastRefreshButton}>
              <ThemedText style={styles.refreshButtonText}>📡 Refresh Data</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          <MLDeveloperInsights insights={mlInsights} username={username} />
        </>
      ) : (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>🤖 Generating ML insights...</ThemedText>
          <ThemedText style={styles.loadingSubtext}>
            Using parallel processing for faster analysis
          </ThemedText>
          {!loading && (
            <TouchableOpacity onPress={refreshMLInsightsOnly} style={styles.retryButton}>
              <ThemedText style={{ color: 'white' }}>Generate Insights</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  insightsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  refreshButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  fastRefreshButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
});
