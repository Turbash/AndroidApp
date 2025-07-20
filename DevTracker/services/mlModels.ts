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
    getCachedMLInsights?: (username: string) => Promise<AIAnalysisResult | null>,
    setCachedMLInsights?: (username: string, result: AIAnalysisResult) => Promise<void>
  ): Promise<AIAnalysisResult> {
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

      const mappedResult: AIAnalysisResult = {
        skills: (result.top_languages || []).map((lang: string, idx: number) => ({
          language: lang,
          level: result.skill_level || 'unknown',
          confidence: 0.7,
          reasoning: result.strengths?.[idx] || ''
        })),
        codingPatterns: null,
        projectComplexity: null,
        careerRecommendations: (result.recommended_goals || []).map((goal: any) => ({
          role: goal.title || '',
          match: 1,
          transition: 1,
          skills: [],
          reasoning: goal.description || ''
        })),
        learningPath: (result.learning_path || []).map((step: string) => ({
          skill: step,
          priority: 'medium',
          hours: 10,
          difficulty: 5,
          reasoning: ''
        }))
      };

      if (setCachedMLInsights) {
        await setCachedMLInsights(username, mappedResult);
      }

      return mappedResult;
    } catch (error) {
      console.error('❌ AI analysis failed:', error);
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
  skills: Array<{
    language: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';
    confidence: number;
    reasoning: string;
  }>;
  codingPatterns: {
    consistency: number;
    velocity: number;
    quality: number;
    patterns: string[];
    confidence: number;
  } | null;
  projectComplexity: {
    overall: number;
    technicalDebt: number;
    architecture: number;
    scalability: number;
    reasoning: string;
  } | null;
  careerRecommendations: Array<{
    role: string;
    match: number;
    transition: number;
    skills: string[];
    reasoning: string;
  }>;
  learningPath: Array<{
    skill: string;
    priority: 'high' | 'medium' | 'low';
    hours: number;
    difficulty: number;
    reasoning: string;
  }>;
}