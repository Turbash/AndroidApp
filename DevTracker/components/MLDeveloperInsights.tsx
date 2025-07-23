import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MLInsightsSummary } from './MLInsightsSummary';
import { MLInsightsMotivation } from './MLInsightsMotivation';
import { MLInsightsSkillLevel } from './MLInsightsSkillLevel';
import { MLInsightsStrengths } from './MLInsightsStrengths';
import { MLInsightsImprovements } from './MLInsightsImprovements';
import { MLInsightsGoals } from './MLInsightsGoals';
import { MLInsightsLearningPath } from './MLInsightsLearningPath';
import { MLInsightsHours } from './MLInsightsHours';
import { MLInsightsProjectComplexity } from './MLInsightsProjectComplexity';
import { MLInsightsCodingPatterns } from './MLInsightsCodingPatterns';

interface MLDeveloperInsightsProps {
  insights: any; 
  username: string;
}

export function MLDeveloperInsights({ insights, username }: MLDeveloperInsightsProps) {
  const accentColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>🤖 AI Insights</ThemedText>
        <ThemedText type="body" style={styles.headerSubtitle}>
          Personalized analysis for @{username}
        </ThemedText>
      </ThemedView>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <MLInsightsSummary summary={insights.summary} />
        <MLInsightsMotivation motivation={insights.motivation_message} accentColor={accentColor} />
        <MLInsightsSkillLevel skillLevel={insights.skill_level} topLanguages={insights.top_languages} />
        <MLInsightsStrengths strengths={insights.strengths} />
        <MLInsightsImprovements improvementAreas={insights.improvement_areas} />
        <MLInsightsGoals recommendedGoals={insights.recommended_goals} />
        <MLInsightsLearningPath learningPath={insights.learning_path} />
        <MLInsightsHours estimatedHours={insights.estimated_hours} />
        <MLInsightsProjectComplexity projectComplexity={insights.project_complexity} />
        <MLInsightsCodingPatterns codingPatterns={insights.coding_patterns} />
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  scrollContainer: {
    flex: 1,
  },
  bottomPadding: {
    height: 24,
  },
});