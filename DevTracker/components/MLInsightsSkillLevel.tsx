import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function MLInsightsSkillLevel({ skillLevel, topLanguages, cardBg }: { skillLevel: string; topLanguages: string[]; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🏅 Skill Level & Top Languages
      </ThemedText>
      <ThemedText style={{ marginBottom: 4 }}>
        <ThemedText style={{ fontWeight: 'bold' }}>Level:</ThemedText> {skillLevel}
      </ThemedText>
      <ThemedText>
        <ThemedText style={{ fontWeight: 'bold' }}>Top Languages:</ThemedText> {Array.isArray(topLanguages) ? topLanguages.join(', ') : ''}
      </ThemedText>
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
