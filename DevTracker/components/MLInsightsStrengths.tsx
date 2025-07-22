import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsStrengths({ strengths }: { strengths: string[] }) {
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🌟 Strengths
      </ThemedText>
      {Array.isArray(strengths) && strengths.length > 0
        ? strengths.map((s: string, i: number) => (
            <ThemedText key={i} type="body" style={styles.listItem}>• {s}</ThemedText>
          ))
        : <AIUnavailableState title="Strengths unavailable" description="No strengths provided by AI." icon="🌟" />}
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
