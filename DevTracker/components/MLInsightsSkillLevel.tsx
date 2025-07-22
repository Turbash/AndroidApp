import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

export function MLInsightsSkillLevel({ skillLevel, topLanguages }: { skillLevel: string; topLanguages: string[] }) {
  const accentColor = useThemeColor({}, 'tint');
  
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        🏅 Skill Level & Top Languages
      </ThemedText>
      
      <View style={styles.skillLevelContainer}>
        <ThemedText type="body" style={styles.label}>Level:</ThemedText>
        <View style={[styles.skillBadge, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.skillBadgeText}>{skillLevel}</ThemedText>
        </View>
      </View>
      
      <View style={styles.languagesContainer}>
        <ThemedText type="body" style={styles.label}>Top Languages:</ThemedText>
        <View style={styles.languagesList}>
          {Array.isArray(topLanguages) && topLanguages.map((lang, index) => (
            <View key={index} style={styles.languageTag}>
              <ThemedText style={styles.languageTagText}>{lang}</ThemedText>
            </View>
          ))}
        </View>
      </View>
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
  skillLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginRight: 12,
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  languagesContainer: {
    marginTop: 8,
  },
  languagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  languageTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  languageTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
  },
});
