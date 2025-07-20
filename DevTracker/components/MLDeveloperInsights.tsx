import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

interface MLDeveloperInsightsProps {
  insights: any; 
  username: string;
}

export function MLDeveloperInsights({ insights, username }: MLDeveloperInsightsProps) {
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const accentColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');

  console.log('🔍 MLDeveloperInsights - insights:', insights);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* AI Summary */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          📝 AI Summary
        </ThemedText>
        <ThemedText style={{ marginBottom: 8 }}>{insights.summary}</ThemedText>
      </ThemedView>
      {/* Motivation */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          💡 Motivation
        </ThemedText>
        <ThemedText style={{ fontStyle: 'italic', color: accentColor }}>
          {insights.motivation_message}
        </ThemedText>
      </ThemedView>
      {/* Skill Level & Top Languages */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🏅 Skill Level & Top Languages
        </ThemedText>
        <ThemedText style={{ marginBottom: 4 }}>
          <ThemedText style={{ fontWeight: 'bold' }}>Level:</ThemedText> {insights.skill_level}
        </ThemedText>
        <ThemedText>
          <ThemedText style={{ fontWeight: 'bold' }}>Top Languages:</ThemedText> {Array.isArray(insights.top_languages) ? insights.top_languages.join(', ') : ''}
        </ThemedText>
      </ThemedView>
      {/* Strengths */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🌟 Strengths
        </ThemedText>
        {Array.isArray(insights.strengths) && insights.strengths.length > 0
          ? insights.strengths.map((s: string, i: number) => (
              <ThemedText key={i} style={{ marginLeft: 8, marginBottom: 2 }}>• {s}</ThemedText>
            ))
          : <AIUnavailableState title="Strengths unavailable" description="No strengths provided by AI." icon="🌟" />}
      </ThemedView>
      {/* Areas to Improve */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🛠️ Areas to Improve
        </ThemedText>
        {Array.isArray(insights.improvement_areas) && insights.improvement_areas.length > 0
          ? insights.improvement_areas.map((s: string, i: number) => (
              <ThemedText key={i} style={{ marginLeft: 8, marginBottom: 2 }}>• {s}</ThemedText>
            ))
          : <AIUnavailableState title="Improvement areas unavailable" description="No improvement areas provided by AI." icon="🛠️" />}
      </ThemedView>
      {/* Recommended Goals */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🎯 Recommended Goals
        </ThemedText>
        {Array.isArray(insights.recommended_goals) && insights.recommended_goals.length > 0
          ? insights.recommended_goals.map((goal: any, i: number) => (
              <ThemedView key={i} style={{ marginBottom: 8 }}>
                <ThemedText style={{ fontWeight: 'bold' }}>{goal.title}</ThemedText>
                <ThemedText>Category: {goal.category}</ThemedText>
                <ThemedText>Description: {goal.description}</ThemedText>
                <ThemedText>Timeline: {goal.timeline}</ThemedText>
              </ThemedView>
            ))
          : <AIUnavailableState title="Recommended goals unavailable" description="No recommended goals provided by AI." icon="🎯" />}
      </ThemedView>
      {/* Learning Path */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          📚 Learning Path
        </ThemedText>
        {Array.isArray(insights.learning_path) && insights.learning_path.length > 0
          ? insights.learning_path.map((item: any, i: number) => (
              typeof item === 'string'
                ? <ThemedText key={i} style={{ marginLeft: 8, marginBottom: 2 }}>• {item}</ThemedText>
                : (
                  <ThemedView key={i} style={{ marginBottom: 8, marginLeft: 8 }}>
                    <ThemedText style={{ fontWeight: 'bold' }}>Skill: {item.skill}</ThemedText>
                    <ThemedText>Priority: {item.priority}</ThemedText>
                    <ThemedText>Estimated Hours: {item.hours}</ThemedText>
                    <ThemedText>Difficulty: {item.difficulty}</ThemedText>
                    {item.reasoning ? <ThemedText>Reasoning: {item.reasoning}</ThemedText> : null}
                  </ThemedView>
                )
            ))
          : <AIUnavailableState title="Learning path unavailable" description="No learning path provided by AI." icon="📚" />}
      </ThemedView>
      {/* Estimated Hours */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          ⏱️ Estimated Learning Hours
        </ThemedText>
        {typeof insights.estimated_hours === 'number'
          ? <ThemedText>{insights.estimated_hours} hours</ThemedText>
          : <AIUnavailableState title="Estimated hours unavailable" description="No estimated hours provided by AI." icon="⏱️" />}
      </ThemedView>
      {/* Project Complexity */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🏗️ Project Complexity
        </ThemedText>
        {insights.project_complexity
          ? (
            <>
              <ThemedText>Overall: {insights.project_complexity.overall}%</ThemedText>
              <ThemedText>Technical Debt: {insights.project_complexity.technicalDebt}%</ThemedText>
              <ThemedText>Architecture: {insights.project_complexity.architecture}%</ThemedText>
              <ThemedText>Scalability: {insights.project_complexity.scalability}%</ThemedText>
              {insights.project_complexity.reasoning && (
                <ThemedText style={{ marginTop: 8, fontStyle: 'italic', opacity: 0.8 }}>
                  {insights.project_complexity.reasoning}
                </ThemedText>
              )}
            </>
          )
          : <AIUnavailableState title="Project complexity unavailable" description="No project complexity provided by AI." icon="🏗️" />}
      </ThemedView>
      {/* Coding Patterns */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          📈 Coding Patterns
        </ThemedText>
        {insights.coding_patterns
          ? (
            <>
              <ThemedText>Consistency: {insights.coding_patterns.consistency}%</ThemedText>
              <ThemedText>Velocity: {insights.coding_patterns.velocity}%</ThemedText>
              <ThemedText>Quality: {insights.coding_patterns.quality}%</ThemedText>
              <ThemedText>Confidence: {Math.round(insights.coding_patterns.confidence * 100)}%</ThemedText>
              {Array.isArray(insights.coding_patterns.patterns) && insights.coding_patterns.patterns.length > 0 ? (
                <ThemedView style={styles.patternsContainer}>
                  <ThemedText style={styles.patternsTitle}>Detected Patterns:</ThemedText>
                  {insights.coding_patterns.patterns.map((pattern: string, index: number) => (
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
      {/* AI Success & Source */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
          AI Success: {insights.ai_success ? "Yes" : "No"} | Source: {insights.source}
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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