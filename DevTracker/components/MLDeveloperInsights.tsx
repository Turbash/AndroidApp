import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
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
import { MLInsightsFooter } from './MLInsightsFooter';

interface MLDeveloperInsightsProps {
  insights: any; 
  username: string;
}

export function MLDeveloperInsights({ insights, username }: MLDeveloperInsightsProps) {
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const accentColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MLInsightsSummary summary={insights.summary} cardBg={cardBg} />
      <MLInsightsMotivation motivation={insights.motivation_message} cardBg={cardBg} accentColor={accentColor} />
      <MLInsightsSkillLevel skillLevel={insights.skill_level} topLanguages={insights.top_languages} cardBg={cardBg} />
      <MLInsightsStrengths strengths={insights.strengths} cardBg={cardBg} />
      <MLInsightsImprovements improvementAreas={insights.improvement_areas} cardBg={cardBg} />
      <MLInsightsGoals recommendedGoals={insights.recommended_goals} cardBg={cardBg} />
      <MLInsightsLearningPath learningPath={insights.learning_path} cardBg={cardBg} />
      <MLInsightsHours estimatedHours={insights.estimated_hours} cardBg={cardBg} />
      <MLInsightsProjectComplexity projectComplexity={insights.project_complexity} cardBg={cardBg} />
      <MLInsightsCodingPatterns codingPatterns={insights.coding_patterns} cardBg={cardBg} />
      <MLInsightsFooter aiSuccess={insights.ai_success} source={insights.source} cardBg={cardBg} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});