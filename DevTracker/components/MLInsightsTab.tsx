import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MLDeveloperInsights } from './MLDeveloperInsights';
import { useThemeColor } from '../hooks/useThemeColor';

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
  const accentColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  
  // Automatically trigger insights generation if not loading and no insights
  const didAutoRequest = useRef(false);
  useEffect(() => {
    if (!mlInsights && !loading && !didAutoRequest.current) {
      didAutoRequest.current = true;
      refreshMLInsightsOnly();
    }
    if (mlInsights) {
      didAutoRequest.current = false; // reset for next time
    }
  }, [mlInsights, loading, refreshMLInsightsOnly]);

  return (
    <ThemedView style={styles.insightsContainer}>
      {mlInsights ? (
        <>
          <TouchableOpacity
            onPress={refreshMLInsightsOnly}
            style={{ backgroundColor: accentColor, width: '100%', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}
          >
            <ThemedText style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>🧠 Refresh Insights</ThemedText>
          </TouchableOpacity>
          <MLDeveloperInsights insights={mlInsights} username={username} />
        </>
      ) : (
        <ThemedView variant="card" style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} style={styles.loadingSpinner} />
          <ThemedText type="subtitle" style={styles.loadingTitle}>
            🤖 Generating ML insights...
          </ThemedText>
          <ThemedText type="body" style={styles.loadingSubtext}>
            Analyzing your GitHub data with AI
          </ThemedText>
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
  fastRefreshButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    margin: 16,
  },
  loadingSpinner: {
    marginBottom: 24,
  },
  loadingTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
