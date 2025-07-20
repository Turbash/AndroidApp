import { GitHubCommit, GitHubRepo } from './github';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL

function logBackendEndpoint(endpoint: string) {
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  console.log(`🔗 Full endpoint: ${BACKEND_URL}${endpoint}`);
}

export class MLModelsService {
  static async performCompleteAIAnalysis(
    repos: GitHubRepo[],
    repoLanguages: Record<string, Record<string, number>>,
    allCommits: Record<string, GitHubCommit[]>,
    username: string,
    useCache: boolean = true,
    getCachedMLInsights?: (username: string) => Promise<any>,
    setCachedMLInsights?: (username: string, result: any) => Promise<void>
  ): Promise<any> {
    try {
      if (useCache && getCachedMLInsights) {
        const cached = await getCachedMLInsights(username);
        if (cached) {
          console.log('⚡ Using cached AI analysis result');
          return cached;
        }
      }

      logBackendEndpoint('/analyze-dev-profile');

      const repoNames = repos.map(r => r.name);
      const totalCommits = Object.values(allCommits).flat();
      const commitMessages = totalCommits.map(c => c.commit.message);
      const readmeContent = await MLModelsService.getFirstReadme(repos, username);

      const payload = {
        username,
        readme_content: readmeContent,
        commit_messages: commitMessages,
        repo_languages: Object.fromEntries(
          Object.entries(repoLanguages).map(([repo, langs]) => [repo, langs])
        ),
        repo_names: repoNames,
        total_repos: repos.length,
        total_commits: totalCommits.length
      };

      console.log('📦 Payload for backend:', payload);

      const response = await fetch(`${BACKEND_URL}/analyze-dev-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Backend API error: ${response.status} - ${errorText}`);
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Backend AI analysis result:', result);

      if (setCachedMLInsights) {
        await setCachedMLInsights(username, result);
      }

      return result;
    } catch (error) {
      console.error('❌ AI analysis failed:', error);
      if (error instanceof TypeError && error.message.includes('Already read')) {
        console.error('❌ You tried to read the response body twice. Only call response.json() or response.text() once per fetch response.');
      }
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('❌ Network error: Check your BACKEND_URL, device/emulator network, and backend server status.');
        console.error('❌ Make sure your backend is running and accessible at:', `${BACKEND_URL}/analyze-dev-profile`);
      }
      throw error;
    }
  }

  private static async getFirstReadme(repos: GitHubRepo[], username: string): Promise<string | null> {
    for (const repo of repos) {
      try {
        const readme = await import('./github').then(mod => mod.fetchRepoReadme(username, repo.name));
        if (readme) return readme;
      } catch (err) {
        console.warn(`⚠️ Failed to fetch README for ${repo.name}:`, err);
      }
    }
    return null;
  }
}

export interface AIAnalysisResult {
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
  project_complexity?: {
    overall: number;
    technicalDebt: number;
    architecture: number;
    scalability: number;
    reasoning: string;
  };
  coding_patterns?: {
    consistency: number;
    velocity: number;
    quality: number;
    patterns: string[];
    confidence: number;
  };
  ai_success: boolean;
  source: string;
}