import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';
import { useThemeColor } from '../hooks/useThemeColor';

export function MLInsightsProjectComplexity({ projectComplexity }: { projectComplexity: any }) {
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
        🏗️ Project Complexity
      </ThemedText>
      {projectComplexity
        ? (
          <>
            <View style={styles.metricsContainer}>
              <View style={styles.metricRow}>
                <ThemedText type="body" style={styles.metricLabel}>Overall:</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(projectComplexity.overall) }]}>
                  <ThemedText style={styles.scoreText}>{projectComplexity.overall}%</ThemedText>
                </View>
              </View>
              
              <View style={styles.metricRow}>
                <ThemedText type="body" style={styles.metricLabel}>Technical Debt:</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(100 - projectComplexity.technicalDebt) }]}>
                  <ThemedText style={styles.scoreText}>{projectComplexity.technicalDebt}%</ThemedText>
                </View>
              </View>
              
              <View style={styles.metricRow}>
                <ThemedText type="body" style={styles.metricLabel}>Architecture:</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(projectComplexity.architecture) }]}>
                  <ThemedText style={styles.scoreText}>{projectComplexity.architecture}%</ThemedText>
                </View>
              </View>
              
              <View style={styles.metricRow}>
                <ThemedText type="body" style={styles.metricLabel}>Scalability:</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(projectComplexity.scalability) }]}>
                  <ThemedText style={styles.scoreText}>{projectComplexity.scalability}%</ThemedText>
                </View>
              </View>
            </View>
            
            {projectComplexity.reasoning && (
              <ThemedText type="body" style={styles.reasoning}>
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
  reasoning: {
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
