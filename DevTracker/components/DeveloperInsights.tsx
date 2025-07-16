import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { DeveloperInsights as InsightsType } from '../services/analytics';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface DeveloperInsightsProps {
  insights: InsightsType;
}

export function DeveloperInsights({ insights }: DeveloperInsightsProps) {
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Skill Assessment */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🎯 Your Skills
        </ThemedText>
        {insights.skillLevel.length > 0 ? (
          insights.skillLevel.map((skill) => (
            <ThemedView key={skill.technology} style={styles.skillItem}>
              <ThemedView style={styles.skillHeader}>
                <ThemedText style={styles.skillName}>{skill.technology}</ThemedText>
                <ThemedText style={styles.skillLevel}>Level {skill.level}/10</ThemedText>
              </ThemedView>
              <ThemedView style={styles.progressBar}>
                <ThemedView 
                  style={[styles.progressFill, { width: `${skill.level * 10}%` }]} 
                />
              </ThemedView>
              <ThemedText style={styles.skillProjects}>
                {skill.projectCount} projects • Last used {new Date(skill.lastUsed).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          ))
        ) : (
          <ThemedText style={styles.emptyState}>
            Start coding in different languages to see your skill assessment!
          </ThemedText>
        )}
      </ThemedView>

      {/* Activity Patterns */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          📈 Coding Activity
        </ThemedText>
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{insights.commitFrequency.currentStreak}</ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{insights.commitFrequency.weekly}</ThemedText>
            <ThemedText style={styles.statLabel}>This Week</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{insights.commitFrequency.monthly}</ThemedText>
            <ThemedText style={styles.statLabel}>This Month</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{insights.codingConsistency}%</ThemedText>
            <ThemedText style={styles.statLabel}>Consistency</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Language Stats */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          💻 Language Usage
        </ThemedText>
        {insights.languageStats.length > 0 ? (
          insights.languageStats.slice(0, 5).map((lang) => (
            <ThemedView key={lang.language} style={styles.languageItem}>
              <ThemedView style={styles.languageHeader}>
                <ThemedText style={styles.languageName}>{lang.language}</ThemedText>
                <ThemedText style={styles.languagePercent}>{lang.percentage}%</ThemedText>
              </ThemedView>
              <ThemedView style={styles.progressBar}>
                <ThemedView 
                  style={[styles.progressFill, { width: `${Math.max(5, lang.percentage)}%` }]} 
                />
              </ThemedView>
            </ThemedView>
          ))
        ) : (
          <ThemedText style={styles.emptyState}>
            No language data available yet.
          </ThemedText>
        )}
      </ThemedView>

      {/* Recommendations */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🚀 Recommended Next Steps
        </ThemedText>
        
        {insights.nextSkills.length > 0 && (
          <>
            <ThemedText style={styles.recommendationTitle}>Skills to Learn:</ThemedText>
            {insights.nextSkills.map((skill, index) => (
              <ThemedText key={index} style={styles.recommendationItem}>• {skill}</ThemedText>
            ))}
          </>
        )}
        
        {insights.projectSuggestions.length > 0 && (
          <>
            <ThemedText style={[styles.recommendationTitle, { marginTop: 16 }]}>Project Ideas:</ThemedText>
            {insights.projectSuggestions.map((project, index) => (
              <ThemedText key={index} style={styles.recommendationItem}>• {project}</ThemedText>
            ))}
          </>
        )}

        {insights.nextSkills.length === 0 && insights.projectSuggestions.length === 0 && (
          <ThemedText style={styles.emptyState}>
            Keep coding to get personalized recommendations!
          </ThemedText>
        )}
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
  skillItem: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skillName: {
    fontWeight: 'bold',
  },
  skillLevel: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  skillProjects: {
    fontSize: 12,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  languageItem: {
    marginBottom: 12,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  languageName: {
    fontWeight: '500',
  },
  languagePercent: {
    fontSize: 12,
    opacity: 0.7,
  },
  recommendationTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationItem: {
    marginBottom: 4,
    paddingLeft: 8,
  },
  emptyState: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    padding: 20,
  },
});
