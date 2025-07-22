import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';
import { useThemeColor } from '../hooks/useThemeColor';

export function MLInsightsGoals({ recommendedGoals }: { recommendedGoals: any[] }) {
  const accentColor = useThemeColor({}, 'tint');
  const warningColor = useThemeColor({}, 'warning');
  
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🎯 Recommended Goals
      </ThemedText>
      {Array.isArray(recommendedGoals) && recommendedGoals.length > 0
        ? recommendedGoals.map((goal: any, i: number) => (
            <ThemedView key={i} variant="surface" style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <ThemedText type="defaultSemiBold" style={styles.goalTitle}>
                  {goal.title}
                </ThemedText>
                <View style={[styles.categoryBadge, { backgroundColor: accentColor }]}>
                  <ThemedText style={styles.categoryText}>{goal.category}</ThemedText>
                </View>
              </View>
              <ThemedText type="body" style={styles.goalDescription}>
                {goal.description}
              </ThemedText>
              <View style={styles.timelineContainer}>
                <ThemedText type="caption" style={[styles.timelineText, { color: warningColor }]}>
                  ⏱️ {goal.timeline}
                </ThemedText>
              </View>
            </ThemedView>
          ))
        : <AIUnavailableState title="Recommended goals unavailable" description="No recommended goals provided by AI." icon="🎯" />}
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
  goalCard: {
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitle: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  goalDescription: {
    marginBottom: 8,
    lineHeight: 20,
  },
  timelineContainer: {
    alignSelf: 'flex-start',
  },
  timelineText: {
    fontWeight: '600',
  },
});
