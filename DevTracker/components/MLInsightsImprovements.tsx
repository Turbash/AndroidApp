import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsImprovements({ improvementAreas }: { improvementAreas: string[] }) {
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🛠️ Areas to Improve
      </ThemedText>
      {Array.isArray(improvementAreas) && improvementAreas.length > 0
        ? improvementAreas.map((s: string, i: number) => (
            <ThemedText key={i} type="body" style={styles.listItem}>• {s}</ThemedText>
          ))
        : <AIUnavailableState title="Improvement areas unavailable" description="No improvement areas provided by AI." icon="🛠️" />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  listItem: {
    marginLeft: 8,
    marginBottom: 6,
    lineHeight: 20,
  },
});
