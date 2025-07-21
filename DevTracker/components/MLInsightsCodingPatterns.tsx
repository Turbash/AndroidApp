import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsCodingPatterns({ codingPatterns, cardBg }: { codingPatterns: any; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        📈 Coding Patterns
      </ThemedText>
      {codingPatterns
        ? (
          <>
            <ThemedText>Consistency: {codingPatterns.consistency}%</ThemedText>
            <ThemedText>Velocity: {codingPatterns.velocity}%</ThemedText>
            <ThemedText>Quality: {codingPatterns.quality}%</ThemedText>
            <ThemedText>Confidence: {Math.round(codingPatterns.confidence * 100)}%</ThemedText>
            {Array.isArray(codingPatterns.patterns) && codingPatterns.patterns.length > 0 ? (
              <ThemedView style={styles.patternsContainer}>
                <ThemedText style={styles.patternsTitle}>Detected Patterns:</ThemedText>
                {codingPatterns.patterns.map((pattern: string, index: number) => (
                  <ThemedText key={index} style={styles.patternItem}>
                    • {pattern}
                  </ThemedText>
                ))}
              </ThemedView>
            ) : (
              <AIUnavailableState title="Patterns unavailable" description="No patterns provided by AI." icon="📈" />
            )}
          </>
        )
        : <AIUnavailableState title="Coding patterns unavailable" description="No coding patterns provided by AI." icon="📈" />}
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
  patternsContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
  patternsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternItem: {
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 8,
    marginBottom: 2,
  },
});
