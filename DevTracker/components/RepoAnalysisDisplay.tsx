import React from 'react';
import { StyleSheet,View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function RepoAnalysisDisplay({ analysis }: { analysis: any }) {
  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        📝 Summary
      </ThemedText>
      <ThemedText style={styles.summary}>{analysis.summary}</ThemedText>

      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🌟 Strengths
      </ThemedText>
      {Array.isArray(analysis.strengths) && analysis.strengths.length > 0
        ? analysis.strengths.map((s: string, i: number) => (
            <ThemedText key={i} style={styles.listItem}>• {s}</ThemedText>
          ))
        : <AIUnavailableState title="Strengths unavailable" description="No strengths provided by AI." icon="🌟" />}

      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🛠️ Improvement Areas
      </ThemedText>
      {Array.isArray(analysis.improvement_areas) && analysis.improvement_areas.length > 0
        ? analysis.improvement_areas.map((s: string, i: number) => (
            <ThemedText key={i} style={styles.listItem}>• {s}</ThemedText>
          ))
        : <AIUnavailableState title="Improvement areas unavailable" description="No improvement areas provided by AI." icon="🛠️" />}

      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        📊 Scores
      </ThemedText>
      <ThemedText>Code Quality: {analysis.code_quality_score}/100</ThemedText>
      <ThemedText>Popularity: {analysis.popularity_score}/100</ThemedText>
      <ThemedText>Documentation: {analysis.documentation_score}/100</ThemedText>

      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        💡 Recommendations
      </ThemedText>
      {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0
        ? analysis.recommendations.map((s: string, i: number) => (
            <ThemedText key={i} style={styles.listItem}>• {s}</ThemedText>
          ))
        : <AIUnavailableState title="Recommendations unavailable" description="No recommendations provided by AI." icon="💡" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 16,
  },
  summary: {
    marginBottom: 8,
  },
  listItem: {
    marginLeft: 8,
    marginBottom: 2,
  },
});
