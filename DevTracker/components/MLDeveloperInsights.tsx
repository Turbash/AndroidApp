import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { MLDeveloperInsights as InsightsType } from '../services/mlAnalytics';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface MLDeveloperInsightsProps {
  insights: InsightsType;
}

const getComplexityColor = (complexity: number): string => {
  if (complexity < 0.3) return '#4CAF50'; 
  if (complexity < 0.7) return '#FF9800'; 
  return '#F44336';
};

const getDebtColor = (debt: number): string => {
  if (debt < 0.3) return '#4CAF50'; 
  
  if (debt < 0.6) return '#FF9800'; 
  return '#F44336';
};


const getPriorityColor = (priority: number): string => {
  if (priority > 0.8) return '#F44336'; 
  if (priority > 0.6) return '#FF9800'; 
  return '#4CAF50';
};

export function MLDeveloperInsights({ insights }: MLDeveloperInsightsProps) {
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const accentColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ML Skill Assessment */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🤖 AI Skill Assessment
        </ThemedText>
        {insights.skillLevel.length > 0 ? (
          insights.skillLevel.map((skill) => (
            <ThemedView key={skill.language} style={styles.skillItem}>
              <ThemedView style={styles.skillHeader}>
                <ThemedText style={styles.skillName}>{skill.language}</ThemedText>
                <ThemedView style={styles.skillScores}>
                  <ThemedText style={styles.proficiencyScore}>
                    {Math.round(skill.proficiencyScore * 100)}%
                  </ThemedText>
                  <ThemedText style={styles.confidence}>
                    {Math.round(skill.confidence * 100)}% confidence
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedView style={styles.progressBar}>
                <ThemedView 
                  style={[styles.progressFill, { 
                    width: `${skill.proficiencyScore * 100}%`,
                    backgroundColor: accentColor 
                  }]} 
                />
              </ThemedView>
              <ThemedText style={styles.modelInfo}>
                Model: {skill.modelVersion} • Assessed: {new Date(skill.lastAssessed).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          ))
        ) : (
          <ThemedText style={styles.emptyState}>
            Building your skill profile...
          </ThemedText>
        )}
      </ThemedView>

      {/* Coding Patterns Analysis */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          📈 Coding Pattern Analysis
        </ThemedText>
        <ThemedView style={styles.metricsGrid}>
          <ThemedView style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>
              {Math.round(insights.codingPatterns.commitPatterns.consistency * 100)}%
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Consistency</ThemedText>
          </ThemedView>
          <ThemedView style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>
              {Math.round(insights.codingPatterns.commitPatterns.velocity * 100)}%
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Velocity</ThemedText>
          </ThemedView>
          <ThemedView style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>
              {Math.round(insights.codingPatterns.codeQuality.structure * 100)}%
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Code Quality</ThemedText>
          </ThemedView>
          <ThemedView style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>
              {Math.round(insights.codingPatterns.productivityTrends.outputRate * 100)}%
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Productivity</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Project Complexity */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🏗️ Project Complexity Analysis
        </ThemedText>
        <ThemedView style={styles.complexityContainer}>
          <ThemedView style={styles.complexityItem}>
            <ThemedText style={styles.complexityLabel}>Overall Complexity</ThemedText>
            <ThemedView style={styles.complexityBar}>
              <ThemedView 
                style={[styles.complexityFill, { 
                  width: `${insights.projectComplexity.overallComplexity * 100}%`,
                  backgroundColor: getComplexityColor(insights.projectComplexity.overallComplexity)
                }]} 
              />
            </ThemedView>
            <ThemedText style={styles.complexityValue}>
              {Math.round(insights.projectComplexity.overallComplexity * 100)}%
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.complexityItem}>
            <ThemedText style={styles.complexityLabel}>Technical Debt</ThemedText>
            <ThemedView style={styles.complexityBar}>
              <ThemedView 
                style={[styles.complexityFill, { 
                  width: `${insights.projectComplexity.technicalDebt * 100}%`,
                  backgroundColor: getDebtColor(insights.projectComplexity.technicalDebt)
                }]} 
              />
            </ThemedView>
            <ThemedText style={styles.complexityValue}>
              {Math.round(insights.projectComplexity.technicalDebt * 100)}%
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Career Recommendations */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          💼 AI Career Recommendations
        </ThemedText>
        {insights.careerRecommendations.map((career, index) => (
          <ThemedView key={index} style={styles.careerItem}>
            <ThemedView style={styles.careerHeader}>
              <ThemedText style={styles.careerRole}>{career.role}</ThemedText>
              <ThemedText style={[styles.matchScore, { color: accentColor }]}>
                {Math.round(career.matchScore * 100)}% match
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.timeToTransition}>
              Time to transition: {career.timeToTransition} months
            </ThemedText>
            <ThemedText style={styles.requiredSkills}>
              Skills needed: {career.requiredSkills.join(', ')}
            </ThemedText>
            <ThemedView style={styles.confidenceContainer}>
              <ThemedText style={styles.confidenceText}>
                AI Confidence: {Math.round(career.confidence * 100)}%
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Learning Path */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          📚 Personalized Learning Path
        </ThemedText>
        {insights.learningPath.map((item, index) => (
          <TouchableOpacity key={index} style={styles.learningItem}>
            <ThemedView style={styles.learningHeader}>
              <ThemedText style={styles.learningSkill}>{item.skill}</ThemedText>
              <ThemedText style={[styles.priority, { 
                color: getPriorityColor(item.priority) 
              }]}>
                Priority: {Math.round(item.priority * 100)}%
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.learningReasoning}>{item.reasoning}</ThemedText>
            <ThemedView style={styles.learningMeta}>
              <ThemedText style={styles.estimatedTime}>
                ⏱️ {item.estimatedTime} hours
              </ThemedText>
              <ThemedText style={styles.difficulty}>
                📊 Difficulty: {Math.round(item.difficulty * 10)}/10
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
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
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  skillScores: {
    alignItems: 'flex-end',
  },
  proficiencyScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidence: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modelInfo: {
    fontSize: 11,
    opacity: 0.6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  complexityContainer: {
    gap: 16,
  },
  complexityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  complexityLabel: {
    flex: 1,
    fontWeight: '500',
  },
  complexityBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  complexityFill: {
    height: '100%',
    borderRadius: 4,
  },
  complexityValue: {
    minWidth: 40,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
  },
  careerItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  careerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  careerRole: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  matchScore: {
    fontWeight: 'bold',
  },
  timeToTransition: {
    fontSize: 14,
    marginBottom: 4,
  },
  requiredSkills: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceText: {
    fontSize: 11,
    opacity: 0.6,
  },
  learningItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  learningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  learningSkill: {
    fontWeight: 'bold',
  },
  priority: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  learningReasoning: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  learningMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estimatedTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  difficulty: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    padding: 20,
  },
});
