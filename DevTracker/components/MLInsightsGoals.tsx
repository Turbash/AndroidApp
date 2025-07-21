import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsGoals({ recommendedGoals, cardBg }: { recommendedGoals: any[]; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🎯 Recommended Goals
      </ThemedText>
      {Array.isArray(recommendedGoals) && recommendedGoals.length > 0
        ? recommendedGoals.map((goal: any, i: number) => (
            <ThemedView key={i} style={{ marginBottom: 8 }}>
              <ThemedText style={{ fontWeight: 'bold' }}>{goal.title}</ThemedText>
              <ThemedText>Category: {goal.category}</ThemedText>
              <ThemedText>Description: {goal.description}</ThemedText>
              <ThemedText>Timeline: {goal.timeline}</ThemedText>
            </ThemedView>
          ))
        : <AIUnavailableState title="Recommended goals unavailable" description="No recommended goals provided by AI." icon="🎯" />}
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
