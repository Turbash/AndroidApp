import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { MLDeveloperInsights as InsightsType } from '../services/mlAnalytics';
import { AIUnavailableState } from './AIUnavailableState';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface MLDeveloperInsightsProps {
  insights: InsightsType;
  username: string;
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

export function MLDeveloperInsights({ insights, username }: MLDeveloperInsightsProps) {
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const accentColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* AI Skill Assessment */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🤖 AI Skill Assessment
        </ThemedText>
        {insights.skillLevel && insights.skillLevel.length > 0 ? (
          <>
            <ThemedText style={styles.successIndicator}>
              ✅ AI Analysis Successful
            </ThemedText>
            {insights.skillLevel.map((skill) => (
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
                      width: `${Math.round(skill.proficiencyScore * 100)}%`,
                      backgroundColor: accentColor 
                    }]} 
                  />
                </ThemedView>
                <ThemedText style={styles.modelInfo}>
                  {skill.modelVersion} - {new Date(skill.lastAssessed).toLocaleDateString()}
                </ThemedText>
              </ThemedView>
            ))}
          </>
        ) : (
          <AIUnavailableState 
            title="AI skill analysis unavailable"
            description="The AI models couldn't analyze programming skills. This could be due to API limits or network issues."
            icon="🎯"
          />
        )}
      </ThemedView>

      {/* Coding Patterns Analysis */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          📈 Coding Pattern Analysis
        </ThemedText>
        {insights.codingPatterns && insights.codingPatterns.confidence > 0 ? (
          <>
            <ThemedText style={styles.successIndicator}>
              ✅ AI Analysis Successful
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
            {insights.codingPatterns.patterns && insights.codingPatterns.patterns.length > 0 && (
              <ThemedView style={styles.patternsContainer}>
                <ThemedText style={styles.patternsTitle}>Detected Patterns:</ThemedText>
                {insights.codingPatterns.patterns.map((pattern, index) => (
                  <ThemedText key={index} style={styles.patternItem}>
                    • {pattern}
                  </ThemedText>
                ))}
              </ThemedView>
            )}
          </>
        ) : (
          <AIUnavailableState 
            title="Pattern analysis unavailable"
            description="The AI couldn't analyze coding patterns. This might be due to insufficient commit data or API limitations."
            icon="📈"
          />
        )}
      </ThemedView>

      {/* Project Complexity */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          🏗️ Project Complexity Analysis
        </ThemedText>
        {insights.projectComplexity && insights.projectComplexity.overallComplexity > 0 ? (
          <>
            <ThemedText style={styles.successIndicator}>
              ✅ AI Analysis Successful
            </ThemedText>
            <ThemedView style={styles.complexityContainer}>
              <ThemedView style={styles.complexityItem}>
                <ThemedText style={styles.complexityLabel}>Overall Complexity</ThemedText>
                <ThemedView style={styles.complexityBar}>
                  <ThemedView 
                    style={[styles.complexityFill, { 
                      width: `${insights.projectComplexity.overallComplexity}%`,
                      backgroundColor: getComplexityColor(insights.projectComplexity.overallComplexity / 100)
                    }]} 
                  />
                </ThemedView>
                <ThemedText style={styles.complexityValue}>
                  {Math.round(insights.projectComplexity.overallComplexity)}%
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.complexityItem}>
                <ThemedText style={styles.complexityLabel}>Technical Debt</ThemedText>
                <ThemedView style={styles.complexityBar}>
                  <ThemedView 
                    style={[styles.complexityFill, { 
                      width: `${insights.projectComplexity.technicalDebt}%`,
                      backgroundColor: getDebtColor(insights.projectComplexity.technicalDebt / 100)
                    }]} 
                  />
                </ThemedView>
                <ThemedText style={styles.complexityValue}>
                  {Math.round(insights.projectComplexity.technicalDebt)}%
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.complexityItem}>
                <ThemedText style={styles.complexityLabel}>Architecture</ThemedText>
                <ThemedView style={styles.complexityBar}>
                  <ThemedView 
                    style={[styles.complexityFill, { 
                      width: `${insights.projectComplexity.architecturalMaturity}%`,
                      backgroundColor: getComplexityColor(insights.projectComplexity.architecturalMaturity / 100)
                    }]} 
                  />
                </ThemedView>
                <ThemedText style={styles.complexityValue}>
                  {Math.round(insights.projectComplexity.architecturalMaturity)}%
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.complexityItem}>
                <ThemedText style={styles.complexityLabel}>Scalability</ThemedText>
                <ThemedView style={styles.complexityBar}>
                  <ThemedView 
                    style={[styles.complexityFill, { 
                      width: `${insights.projectComplexity.scalabilityScore}%`,
                      backgroundColor: getComplexityColor(insights.projectComplexity.scalabilityScore / 100)
                    }]} 
                  />
                </ThemedView>
                <ThemedText style={styles.complexityValue}>
                  {Math.round(insights.projectComplexity.scalabilityScore)}%
                </ThemedText>
              </ThemedView>
            </ThemedView>
            {insights.projectComplexity.reasoning && (
              <ThemedView style={styles.reasoningContainer}>
                <ThemedText style={styles.reasoningTitle}>AI Reasoning:</ThemedText>
                <ThemedText style={styles.reasoningText}>
                  {insights.projectComplexity.reasoning}
                </ThemedText>
              </ThemedView>
            )}
          </>
        ) : (
          <AIUnavailableState 
            title="Complexity analysis unavailable"
            description="The AI couldn't analyze project complexity. This could be due to insufficient repository data or API issues."
            icon="🏗️"
          />
        )}
      </ThemedView>

      {/* Career Recommendations */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          💼 AI Career Recommendations
        </ThemedText>
        {insights.careerRecommendations && insights.careerRecommendations.length > 0 ? (
          <>
            <ThemedText style={styles.successIndicator}>
              ✅ AI Analysis Successful
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
          </>
        ) : (
          <AIUnavailableState 
            title="Career analysis unavailable"
            description="The AI couldn't generate career recommendations. This might be due to insufficient profile data or API limitations."
            icon="💼"
          />
        )}
      </ThemedView>

      {/* Learning Path */}
      <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          📚 Personalized Learning Path
        </ThemedText>
        {insights.learningPath && insights.learningPath.length > 0 ? (
          <>
            <ThemedText style={styles.successIndicator}>
              ✅ AI Analysis Successful
            </ThemedText>
            {insights.learningPath.map((item, index) => (
              <ThemedView key={index} style={styles.learningItem}>
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
              </ThemedView>
            ))}
          </>
        ) : (
          <AIUnavailableState 
            title="Learning path unavailable"
            description="The AI couldn't create a personalized learning path. This could be due to API limits or insufficient data."
            icon="📚"
          />
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
  successIndicator: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  patternsContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
  patternsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternItem: {
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 8,
    marginBottom: 2,
  },
  reasoningContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reasoningText: {
    fontSize: 12,
    opacity: 0.8,
    fontStyle: 'italic',
  },
});