import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsProjectComplexity({ projectComplexity, cardBg }: { projectComplexity: any; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🏗️ Project Complexity
      </ThemedText>
      {projectComplexity
        ? (
          <>
            <ThemedText>Overall: {projectComplexity.overall}%</ThemedText>
            <ThemedText>Technical Debt: {projectComplexity.technicalDebt}%</ThemedText>
            <ThemedText>Architecture: {projectComplexity.architecture}%</ThemedText>
            <ThemedText>Scalability: {projectComplexity.scalability}%</ThemedText>
            {projectComplexity.reasoning && (
              <ThemedText style={{ marginTop: 8, fontStyle: 'italic', opacity: 0.8 }}>
                {projectComplexity.reasoning}
              </ThemedText>
            )}
          </>
        )
        : <AIUnavailableState title="Project complexity unavailable" description="No project complexity provided by AI." icon="🏗️" />}
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
