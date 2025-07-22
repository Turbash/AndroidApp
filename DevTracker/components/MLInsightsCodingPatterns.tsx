import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';
import { useThemeColor } from '../hooks/useThemeColor';

export function MLInsightsCodingPatterns({ codingPatterns }: { codingPatterns: any }) {
  const accentColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return successColor;
    if (score >= 60) return accentColor;
    if (score >= 40) return warningColor;
    return errorColor;
  };
  
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        📈 Coding Patterns
      </ThemedText>
      {codingPatterns
        ? (
          <>
            <View style={styles.metricsContainer}>
              <View style={styles.metricRow}>
                <ThemedText type="body" style={styles.metricLabel}>Consistency:</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(codingPatterns.consistency) }]}>
                  <ThemedText style={styles.scoreText}>{codingPatterns.consistency}%</ThemedText>
                </View>
              </View>
              
              <View style={styles.metricRow}>
                <ThemedText type="body" style={styles.metricLabel}>Velocity:</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(codingPatterns.velocity) }]}>
                  <ThemedText style={styles.scoreText}>{codingPatterns.velocity}%</ThemedText>
                </View>
              </View>
              
              <View style={styles.metricRow}>
                <ThemedText type="body" style={styles.metricLabel}>Quality:</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(codingPatterns.quality) }]}>
                  <ThemedText style={styles.scoreText}>{codingPatterns.quality}%</ThemedText>
                </View>
              </View>
              
              <View style={styles.metricRow}>
                <ThemedText type="body" style={styles.metricLabel}>Confidence:</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(Math.round(codingPatterns.confidence * 100)) }]}>
                  <ThemedText style={styles.scoreText}>{Math.round(codingPatterns.confidence * 100)}%</ThemedText>
                </View>
              </View>
            </View>
            
            {Array.isArray(codingPatterns.patterns) && codingPatterns.patterns.length > 0 ? (
              <ThemedView variant="surface" style={styles.patternsContainer}>
                <ThemedText style={styles.patternsTitle}>Detected Patterns:</ThemedText>
                {codingPatterns.patterns.map((pattern: string, index: number) => (
                  <ThemedText key={index} type="body" style={styles.patternItem}>
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
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontWeight: '500',
    flex: 1,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  patternsContainer: {
    padding: 16,
  },
  patternsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  patternItem: {
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 18,
  },
});
