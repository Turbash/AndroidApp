import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsImprovements({ improvementAreas, cardBg }: { improvementAreas: string[]; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🛠️ Areas to Improve
      </ThemedText>
      {Array.isArray(improvementAreas) && improvementAreas.length > 0
        ? improvementAreas.map((s: string, i: number) => (
            <ThemedText key={i} style={{ marginLeft: 8, marginBottom: 2 }}>• {s}</ThemedText>
          ))
        : <AIUnavailableState title="Improvement areas unavailable" description="No improvement areas provided by AI." icon="🛠️" />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
});
