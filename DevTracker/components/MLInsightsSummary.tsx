import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function MLInsightsSummary({ summary, cardBg }: { summary: string; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        📝 AI Summary
      </ThemedText>
      <ThemedText style={{ marginBottom: 8 }}>{summary}</ThemedText>
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
