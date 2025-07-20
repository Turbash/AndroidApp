import { GitHubCommit, GitHubRepo } from './github';
import { MLModelsService } from './mlModels';
import { getCachedMLInsights, setCachedMLInsights } from '../utils/storage';

export interface MLDeveloperInsights {
  skillLevel: MLSkillAssessment[];
  codingPatterns: CodingPatternAnalysis;
  projectComplexity: MLComplexityScore;
  careerRecommendations: MLCareerSuggestion[];
  learningPath: MLLearningRecommendation[];
}

export interface MLSkillAssessment {
  language: string;
  proficiencyScore: number; 
  confidence: number;
  modelVersion: string;
  lastAssessed: string;
}

export interface CodingPatternAnalysis {
  commitPatterns: CommitPatternScore;
  codeQuality: CodeQualityMetrics;
  productivityTrends: ProductivityAnalysis;
  confidence: number;
  patterns?: string[]; 
}

export interface MLComplexityScore {
  overallComplexity: number; 
  technicalDebt: number;
  architecturalMaturity: number;
  scalabilityScore: number;
  reasoning?: string; 
}

export interface MLCareerSuggestion {
  role: string;
  matchScore: number; 
  requiredSkills: string[];
  timeToTransition: number; 
  confidence: number;
}

export interface MLLearningRecommendation {
  skill: string;
  priority: number; 
  reasoning: string;
  estimatedTime: number; 
  difficulty: number; 
}

interface CommitPatternScore {
  consistency: number;
  velocity: number;
  codeChurn: number;
}

interface CodeQualityMetrics {
  structure: number;
  documentation: number;
  testCoverage: number;
}

interface ProductivityAnalysis {
  outputRate: number;
  focusTime: number;
  collaborationScore: number;
}

export class MLAnalytics {
  static async generateMLInsights(
    repos: GitHubRepo[],
    repoLanguages: Record<string, Record<string, number>>,
    allCommits: Record<string, GitHubCommit[]>,
    username: string, 
    useCache: boolean = true
  ): Promise<MLDeveloperInsights> {
    try {
      if (useCache) {
        const cachedInsights = await getCachedMLInsights(username);
        if (cachedInsights) {
          console.log('⚡ Using cached AI insights');
          return cachedInsights;
        }
      }
      console.log('🚀 Requesting AI insights from backend...');
      // Remove cache logic for now, always use backend
      const aiResults = await MLModelsService.performCompleteAIAnalysis(repos, repoLanguages, allCommits, username);

      // Map backend response to MLDeveloperInsights
      const insights: MLDeveloperInsights = {
        skillLevel: aiResults.skills.map(skill => ({
          language: skill.language,
          proficiencyScore: skill.level === 'expert' ? 0.9 : 
                            skill.level === 'advanced' ? 0.75 : 
                            skill.level === 'intermediate' ? 0.6 : 0.4,
          confidence: skill.confidence,
          modelVersion: 'Backend-AI',
          lastAssessed: new Date().toISOString()
        })),
        codingPatterns: aiResults.codingPatterns ? {
          commitPatterns: {
            consistency: aiResults.codingPatterns.consistency / 100,
            velocity: aiResults.codingPatterns.velocity / 100,
            codeChurn: aiResults.codingPatterns.quality / 100
          },
          codeQuality: {
            structure: aiResults.codingPatterns.quality / 100,
            documentation: aiResults.codingPatterns.quality / 100,
            testCoverage: aiResults.codingPatterns.consistency / 100
          },
          productivityTrends: {
            outputRate: aiResults.codingPatterns.velocity / 100,
            focusTime: aiResults.codingPatterns.consistency / 100,
            collaborationScore: aiResults.codingPatterns.confidence
          },
          confidence: aiResults.codingPatterns.confidence,
          patterns: aiResults.codingPatterns.patterns 
        } : {
          commitPatterns: { consistency: 0, velocity: 0, codeChurn: 0 },
          codeQuality: { structure: 0, documentation: 0, testCoverage: 0 },
          productivityTrends: { outputRate: 0, focusTime: 0, collaborationScore: 0 },
          confidence: 0,
          patterns: [] 
        },
        projectComplexity: aiResults.projectComplexity ? {
          overallComplexity: aiResults.projectComplexity.overall,
          technicalDebt: aiResults.projectComplexity.technicalDebt,
          architecturalMaturity: aiResults.projectComplexity.architecture,
          scalabilityScore: aiResults.projectComplexity.scalability,
          reasoning: aiResults.projectComplexity.reasoning 
        } : {
          overallComplexity: 0,
          technicalDebt: 0,
          architecturalMaturity: 0,
          scalabilityScore: 0,
          reasoning: 'AI analysis failed'
        },
        careerRecommendations: aiResults.careerRecommendations.map(career => ({
          role: career.role,
          matchScore: career.match / 100,
          requiredSkills: career.skills,
          timeToTransition: career.transition,
          confidence: 0.95 
        })),
        learningPath: aiResults.learningPath.map(item => ({
          skill: item.skill,
          priority: item.priority === 'high' ? 0.9 : item.priority === 'medium' ? 0.7 : 0.5,
          reasoning: item.reasoning,
          estimatedTime: item.hours,
          difficulty: item.difficulty / 10
        }))
      };

      await setCachedMLInsights(username, insights);
      return insights;
    } catch (error) {
      console.error('❌ MLAnalytics AI insights failed:', error);
      throw error;
    }
  }
}