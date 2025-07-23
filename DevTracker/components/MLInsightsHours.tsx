import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { AIUnavailableState } from './AIUnavailableState';
import { useThemeColor } from '../hooks/useThemeColor';

export function MLInsightsHours({ estimatedHours }: { estimatedHours: number }) {
  const accentColor = useThemeColor({}, 'tint');
  // No hardcoding: estimatedHours is always passed from insights, not hardcoded
  
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        ⏱️ Estimated Learning Hours
      </ThemedText>
      {typeof estimatedHours === 'number' && estimatedHours > 0
        ? (
          <View style={styles.hoursContainer}>
            <View style={[styles.hoursBadge, { backgroundColor: accentColor }]}> 
              <ThemedText style={styles.hoursText}>{estimatedHours} hours</ThemedText>
            </View>
            <ThemedText type="caption" style={styles.hoursNote}>
              Based on your current skill level and goals
            </ThemedText>
          </View>
        )
        : <AIUnavailableState title="Estimated hours unavailable" description="No estimated hours provided by AI." icon="⏱️" />}
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
  hoursContainer: {
    alignItems: 'flex-start',
  },
  hoursBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  hoursText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  hoursNote: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
});
