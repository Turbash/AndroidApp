import { GitHubCommit, GitHubRepo } from './github';
import { MLModelsService } from './mlModels';
import { getCachedMLInsights, setCachedMLInsights } from '../utils/storage';

export interface MLDeveloperInsights {
  summary: string;
  skill_level: string;
  top_languages: string[];
  strengths: string[];
  improvement_areas: string[];
  recommended_goals: {
    title: string;
    category: string;
    description: string;
    timeline: string;
  }[];
  learning_path: string[];
  estimated_hours: number;
  motivation_message: string;
  project_complexity: {
    overall: number;
    technicalDebt: number;
    architecture: number;
    scalability: number;
    reasoning: string;
  };
  coding_patterns: {
    consistency: number;
    velocity: number;
    quality: number;
    patterns: string[];
    confidence: number;
  };
  ai_success: boolean;
  source: string;
}

export class MLAnalytics {
  static async generateMLInsights(
    repos: GitHubRepo[],
    repoLanguages: Record<string, Record<string, number>>,
    allCommits: Record<string, GitHubCommit[]>,
    username: string, 
    forceRefresh: boolean = false
  ): Promise<MLDeveloperInsights> {
    try {
      if (!forceRefresh) {
        const cachedInsights = await getCachedMLInsights(username);
        if (cachedInsights) {
          console.log('⚡ Using permanently cached AI insights');
          return cachedInsights;
        }
      }
      console.log('🚀 Requesting AI insights from backend...');
      const aiResults = await MLModelsService.performCompleteAIAnalysis(repos, repoLanguages, allCommits, username);

      await setCachedMLInsights(username, aiResults);

      return aiResults;
    } catch (error) {
      console.error('❌ MLAnalytics AI insights failed:', error);
      throw error;
    }
  }
}