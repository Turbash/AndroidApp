import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsLearningPath({ learningPath, cardBg }: { learningPath: any[]; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        📚 Learning Path
      </ThemedText>
      {Array.isArray(learningPath) && learningPath.length > 0
        ? learningPath.map((item: any, i: number) => (
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
