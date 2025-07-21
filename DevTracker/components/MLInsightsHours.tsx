import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsHours({ estimatedHours, cardBg }: { estimatedHours: number; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        ⏱️ Estimated Learning Hours
      </ThemedText>
      {typeof estimatedHours === 'number'
        ? <ThemedText>{estimatedHours} hours</ThemedText>
        : <AIUnavailableState title="Estimated hours unavailable" description="No estimated hours provided by AI." icon="⏱️" />}
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
