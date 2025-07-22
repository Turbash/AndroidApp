import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';

export function MLInsightsLearningPath({ learningPath }: { learningPath: any[] }) {
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        📚 Learning Path
      </ThemedText>
      {Array.isArray(learningPath) && learningPath.length > 0
        ? learningPath.map((item: any, i: number) => (
            typeof item === 'string'
              ? <ThemedText key={i} type="body" style={styles.listItem}>• {item}</ThemedText>
              : (
                <ThemedView key={i} variant="surface" style={styles.pathItem}>
                  <ThemedText type="defaultSemiBold" style={styles.skillTitle}>
                    {item.skill}
                  </ThemedText>
                  <ThemedText type="body" style={styles.pathDetail}>
                    Priority: {item.priority}
                  </ThemedText>
                  <ThemedText type="body" style={styles.pathDetail}>
                    Estimated Hours: {item.hours}
                  </ThemedText>
                  <ThemedText type="body" style={styles.pathDetail}>
                    Difficulty: {item.difficulty}
                  </ThemedText>
                  {item.reasoning && (
                    <ThemedText type="caption" style={styles.reasoning}>
                      {item.reasoning}
                    </ThemedText>
                  )}
                </ThemedView>
              )
          ))
        : <AIUnavailableState title="Learning path unavailable" description="No learning path provided by AI." icon="📚" />}
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
  listItem: {
    marginLeft: 8,
    marginBottom: 6,
    lineHeight: 20,
  },
  pathItem: {
    padding: 16,
    marginBottom: 12,
    marginLeft: 8,
  },
  skillTitle: {
    marginBottom: 8,
  },
  pathDetail: {
    marginBottom: 4,
  },
  reasoning: {
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
