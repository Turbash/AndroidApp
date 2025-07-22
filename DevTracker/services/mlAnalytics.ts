import { fetchUserProfile, fetchUserRepos, fetchRepoReadme, fetchAllRepoCode } from './github';
// Gather user profile, profile README, and top 5 repos (with name, readme, code, stars, forks, topics, languages) for ML analysis
export async function gatherUserMLAnalysisData(username: string): Promise<any> {
  // 1. Fetch user profile
  const profile = await fetchUserProfile(username, false);

  // 2. Try to fetch profile README (if exists, usually in a repo named <username>/<username>)
  let profileReadme: string | null = null;
  try {
    profileReadme = await fetchRepoReadme(username, username);
  } catch (e) {
    profileReadme = null;
  }

  // 3. Fetch all repos, sort by last updated, pick last 5 updated
  let repos = await fetchUserRepos(username, false);
  repos = Array.isArray(repos) ? repos : [];
  const lastUpdatedRepos = [...repos]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // 4. For each repo, fetch README and file tree (no code for dev analysis)
  const repoSummaries = [];
  for (const repo of lastUpdatedRepos) {
    let readme = null;
    let tree = null;
    try {
      readme = await fetchRepoReadme(username, repo.name);
    } catch (e) { readme = null; }
    try {
      // Fetch the file tree using the GitHub API
      const encodedUsername = encodeURIComponent(username.trim());
      const encodedRepoName = encodeURIComponent(repo.name.trim());
      const branch = repo.default_branch || 'main';
      const treeUrl = `https://api.github.com/repos/${encodedUsername}/${encodedRepoName}/git/trees/${branch}?recursive=1`;
      const resp = await fetch(treeUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
      if (resp.ok) {
        const treeData = await resp.json();
        tree = Array.isArray(treeData.tree)
          ? treeData.tree.map((item: any) => ({ path: item.path, type: item.type, size: item.size || 0 }))
          : null;
      }
    } catch (e) { tree = null; }
    repoSummaries.push({
      name: repo.name,
      readme,
      tree,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      topics: repo.topics || [],
      languages: repo.language ? { [repo.language]: 1 } : {}, // fallback if no languages API
    });
  }

  // 5. Build payload
  const payload = {
    username,
    profile,
    profile_readme: profileReadme,
    repos: repoSummaries
  };
  return payload;
}
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