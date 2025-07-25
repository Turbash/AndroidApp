export async function fetchAllRepoCode(username: string, repoName: string, branch: string = 'main', maxTotalBytes: number = 40000): Promise<string> {
  try {
    const encodedUsername = encodeURIComponent(username.trim());
    const encodedRepoName = encodeURIComponent(repoName.trim());
    const treeUrl = `${GITHUB_API_BASE}/repos/${encodedUsername}/${encodedRepoName}/git/trees/${branch}?recursive=1`;
    const treeResp = await fetchWithAuth(treeUrl);
    if (!treeResp.ok) {
      console.log(`❌ Repo tree API failed with status: ${treeResp.status}`);
      return '';
    }
    const treeData = await treeResp.json();
    if (!treeData.tree) return '';
    const textExtensions = ['.js', '.ts', '.py', '.java', '.go', '.rb', '.cpp', '.c', '.h', '.cs', '.php', '.rs', '.swift', '.kt', '.m', '.json', '.yml', '.yaml', '.md', '.txt', '.sh', '.pl', '.rb', '.html', '.css', '.scss', '.tsx', '.jsx'];
    const files = treeData.tree.filter((item: any) => item.type === 'blob' && textExtensions.some(ext => item.path.endsWith(ext)));
    let totalBytes = 0;
    let codeConcat = '';
    for (const file of files) {
      if (totalBytes > maxTotalBytes) break;
      const fileUrl = `${GITHUB_API_BASE}/repos/${encodedUsername}/${encodedRepoName}/contents/${encodeURIComponent(file.path)}`;
      const fileResp = await fetchWithAuth(fileUrl);
      if (!fileResp.ok) continue;
      const fileData = await fileResp.json();
      let content = '';
      if (fileData.encoding === 'base64') {
        content = atob(fileData.content.replace(/\n/g, ''));
      } else {
        content = fileData.content || '';
      }
      // Add file header for clarity
      codeConcat += `\n// --- ${file.path} ---\n` + content;
      totalBytes += content.length;
    }
    return codeConcat;
  } catch (error) {
    console.error(`💥 Error fetching all code for ${repoName}:`, error);
    return '';
  }
}
export async function fetchRepoCodeSample(username: string, repoName: string, filePath: string = 'README.md'): Promise<string | null> {
  try {
    const encodedUsername = encodeURIComponent(username.trim());
    const encodedRepoName = encodeURIComponent(repoName.trim());
    const encodedFilePath = encodeURIComponent(filePath);
    const url = `${GITHUB_API_BASE}/repos/${encodedUsername}/${encodedRepoName}/contents/${encodedFilePath}`;
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      console.log(`❌ Code file API failed with status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.encoding === 'base64') {
      const content = atob(data.content.replace(/\n/g, ''));
      return content;
    }
    return data.content || null;
  } catch (error) {
    console.error(`💥 Error fetching code file for ${repoName}:`, error);
    return null;
  }
}
import Constants from 'expo-constants';
import { getCachedUserProfile, setCachedUserProfile, getCachedRepoData, setCachedRepoData } from '../utils/storage';

export { getCachedUserProfile };

const GITHUB_API_BASE = 'https://api.github.com';

let authToken: string | null = null;

(function initToken() {
  authToken = Constants.expoConfig?.extra?.githubToken || null;
  console.log('GitHub token initialized:', authToken ? 'Yes' : 'No');
  console.log('Token length:', authToken ? authToken.length : 0);
  console.log('Token starts with github_pat:', authToken ? authToken.startsWith('github_pat') : false);
  if (authToken) {
    console.log('Token preview:', authToken.substring(0, 15) + '...');
  }
})();

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  size: number;
  stargazers_count: number; 
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  has_issues: boolean;
  has_wiki: boolean;
  license: {
    name: string;
  } | null;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string;
}

export interface GitHubCommit {
  sha: string;
  node_id: string;
  html_url: string;
  commit: {
    author: {
      name: string;
      email: string; 
      date: string;
    };
    committer: {
      name: string;
      email: string; 
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
  };
  author: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  } | null;
}

export interface GitHubReadme {
  name: string;
  content: string;
  encoding: string;
}

export function setGitHubToken(token: string) {
  authToken = token;
  console.log('Token manually set:', token ? 'Yes' : 'No');
}

export function clearGitHubToken() {
  authToken = null;
  console.log('Token cleared');
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithAuth(url: string, retries = 3, baseDelay = 1000): Promise<Response> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DevTracker-App'
  };

  if (authToken) {
    headers['Authorization'] = `token ${authToken}`;
    console.log(`🔑 Using token: ${authToken.substring(0, 15)}... (length: ${authToken.length})`);
  } else {
    console.log(`🔓 No token available - making unauthenticated request`);
  }

  console.log(`📡 Request headers:`, Object.keys(headers));

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`📡 API Call ${i + 1}/${retries}: ${url}`);
      const response = await fetch(url, { headers });
      
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      
      console.log(`📊 Rate Limit: ${remaining}/${limit} remaining (resets at ${resetTime})`);
      
      if (authToken && limit === '60') {
        console.warn(`⚠️ WARNING: Using authenticated token but getting unauthenticated rate limit!`);
        console.warn(`Token being sent: ${authToken.substring(0, 20)}...`);
      }
      
      if (response.status === 403) {
        console.log(`🚫 403 Forbidden - Rate limit or access denied`);
        if (remaining === '0') {
          console.log('⏰ Rate limit exceeded, waiting...');
          await delay(baseDelay * Math.pow(2, i));
          continue;
        }
      }
      
      if (!response.ok) {
        console.log(`❌ API call failed with status: ${response.status} ${response.statusText}`);
      } else {
        console.log(`✅ API call successful: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error(`💥 Network error on attempt ${i + 1}:`, error);
      if (i === retries - 1) throw error;
      await delay(baseDelay * Math.pow(2, i));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function fetchUserProfile(username: string, forceRefresh: boolean = false): Promise<GitHubUser> {
  username = username.trim();
  if (!forceRefresh) {
    const cached = await getCachedUserProfile(username);
    if (cached) {
      console.log('⚡ Using permanently cached user profile');
      return cached;
    }
  }
  console.log(`👤 Fetching user profile for: ${username}`);
  console.log(`🔑 Token available for profile request: ${authToken ? 'Yes' : 'No'}`);
  
  const response = await fetchWithAuth(`${GITHUB_API_BASE}/users/${username}`);
  
  if (!response.ok) {
    console.error(`❌ Failed to fetch user profile: ${response.status}`);
    throw new Error('User not found');
  }
  
  const profile = await response.json();
  await setCachedUserProfile(username, profile); 
  console.log(`✅ User profile loaded: ${profile.name} (@${profile.login})`);
  
  return profile;
}

export async function fetchUserRepos(username: string, forceRefresh: boolean = false): Promise<GitHubRepo[]> {
  if (!forceRefresh) {
    const cached = await getCachedRepoData(username, 'all');
    if (cached && Array.isArray(cached)) {
      console.log('⚡ Using permanently cached repos');
      return cached;
    }
  }
  console.log(`📁 Fetching repositories for: ${username}`);
  console.log(`🔑 Token available for repos request: ${authToken ? 'Yes' : 'No'}`);
  
  try {
    const response = await fetchWithAuth(`${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100`);
    if (!response.ok) {
      console.error(`❌ Failed to fetch repos: ${response.status}`);
      throw new Error(`Failed to fetch repos: ${response.status}`);
    }
    
    const repos = await response.json();
    await setCachedRepoData(username, 'all', repos, {}, null);
    console.log(`✅ Found ${repos.length} repositories`);
    return repos;
  } catch (error) {
    console.error('💥 Error fetching repos:', error);
    throw error;
  }
}

export async function fetchRepoCommits(username: string, repoName: string): Promise<GitHubCommit[]> {
  console.log(`📝 Fetching commits for: ${username}/${repoName}`);
  
  try {
    const encodedUsername = encodeURIComponent(username.trim());
    const encodedRepoName = encodeURIComponent(repoName.trim());
    const url = `${GITHUB_API_BASE}/repos/${encodedUsername}/${encodedRepoName}/commits?per_page=10`;
    
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      console.log(`❌ Commits API failed with status: ${response.status}`);
      if (response.status === 404) {
        console.log(`⚠️ Repository ${repoName} not found or no commits`);
        return [];
      }
      if (response.status === 401) {
        console.log(`🔒 Unauthorized - Token may be invalid or repository is private`);
        return [];
      }
      throw new Error(`Failed to fetch commits: ${response.status}`);
    }
    
    const commits = await response.json();
    console.log(`✅ Found ${commits.length} commits for ${repoName}`);
    
    if (commits.length > 0) {
      const latestCommit = commits[0];
      console.log(`📅 Latest commit: "${latestCommit.commit.message.substring(0, 50)}..." by ${latestCommit.commit.author.name}`);
    }
    
    return commits;
  } catch (error) {
    console.error(`💥 Error fetching commits for ${repoName}:`, error);
    return [];
  }
}

export async function fetchRepoLanguages(username: string, repoName: string) {
  console.log(`🗣️ Fetching languages for: ${username}/${repoName}`);
  
  try {
    const encodedUsername = encodeURIComponent(username.trim());
    const encodedRepoName = encodeURIComponent(repoName.trim());
    const url = `${GITHUB_API_BASE}/repos/${encodedUsername}/${encodedRepoName}/languages`;
    
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      console.log(`❌ Languages API failed with status: ${response.status}`);
      if (response.status === 404) {
        console.log(`⚠️ Repository ${repoName} not found or no languages detected`);
        return {};
      }
      if (response.status === 401) {
        console.log(`🔒 Unauthorized - Token may be invalid or repository is private`);
        return {};
      }
      throw new Error(`Failed to fetch languages: ${response.status}`);
    }
    
    const languages = await response.json();
    const langNames = Object.keys(languages);
    console.log(`✅ Languages for ${repoName}: ${langNames.join(', ') || 'None'}`);
    
    return languages;
  } catch (error) {
    console.error(`💥 Error fetching languages for ${repoName}:`, error);
    return {};
  }
}

export async function fetchRepoReadme(username: string, repoName: string): Promise<string | null> {
  console.log(`📖 Fetching README for: ${username}/${repoName}`);
  
  try {
    const encodedUsername = encodeURIComponent(username.trim());
    const encodedRepoName = encodeURIComponent(repoName.trim());
    const url = `${GITHUB_API_BASE}/repos/${encodedUsername}/${encodedRepoName}/readme`;
    
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      console.log(`❌ README API failed with status: ${response.status}`);
      if (response.status === 404) {
        console.log(`⚠️ No README found for ${repoName}`);
      }
      if (response.status === 401) {
        console.log(`🔒 Unauthorized - Token may be invalid or repository is private`);
      }
      return null;
    }
    
    const data: GitHubReadme = await response.json();
    console.log(`✅ README found for ${repoName}: ${data.name} (${data.encoding})`);
    
    if (data.encoding === 'base64') {
      const content = atob(data.content.replace(/\n/g, ''));
      console.log(`📄 README content length: ${content.length} characters`);
      return content;
    }
    
    console.log(`📄 README content length: ${data.content.length} characters`);
    return data.content;
  } catch (error) {
    console.error(`💥 Error fetching README for ${repoName}:`, error);
    return null;
  }
}

export class GitHubService {
  static async getAllCommits(
    username: string, 
    repos: GitHubRepo[]
  ): Promise<Record<string, GitHubCommit[]>> {
    console.log(`📈 Fetching commits for ALL ${repos.length} repositories...`);
    
    const allCommits: Record<string, GitHubCommit[]> = {};
    
    const commitPromises = repos.map(async (repo) => {
      try {
        console.log(`📈 Fetching commits for ${repo.name}...`);
        
        const commits = await this.getCommits(username, repo.name, 100);
        
        if (commits.length > 0) {
          allCommits[repo.name] = commits;
          console.log(`✅ Got ${commits.length} commits for ${repo.name}`);
        } else {
          console.log(`⚠️ No commits found for ${repo.name}`);
        }
        
        return { repo: repo.name, count: commits.length };
      } catch (error: any) {
        console.log(`❌ Failed to fetch commits for ${repo.name}:`, error.message);
        return { repo: repo.name, count: 0 };
      }
    });
    
    const results = await Promise.all(commitPromises);
    
    const totalCommits = Object.values(allCommits).reduce((sum, commits) => sum + commits.length, 0);
    const reposWithCommits = Object.keys(allCommits).length;
    
    console.log(`📈 ✅ Commit fetch summary:`);
    console.log(`   - Repos processed: ${repos.length}`);
    console.log(`   - Repos with commits: ${reposWithCommits}`);
    console.log(`   - Total commits: ${totalCommits}`);
    
    results.forEach(result => {
      console.log(`   - ${result.repo}: ${result.count} commits`);
    });
    
    return allCommits;
  }

  private static async getCommits(
    username: string, 
    repoName: string, 
    perPage: number = 100
  ): Promise<GitHubCommit[]> {
    try {
      let allCommits: GitHubCommit[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && allCommits.length < 200) { 
        const url = `https://api.github.com/repos/${username}/${repoName}/commits?per_page=${perPage}&page=${page}`;
        
        const response = await fetch(url, {
          headers: this.getHeaders(),
        });
        
        if (!response.ok) {
          if (response.status === 409) {
            console.log(`⚠️ ${repoName} is empty (no commits)`);
            return [];
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const commits = await response.json();
        
        if (commits.length === 0) {
          hasMore = false;
        } else {
          allCommits = allCommits.concat(commits);
          page++;
          
          if (commits.length < perPage) {
            hasMore = false;
          }
        }
      }
      
      return allCommits;
    } catch (error: any) {
      console.log(`❌ Error fetching commits for ${repoName}:`, error.message);
      return [];
    }
  }

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DevTracker-App'
    };

    if (authToken) {
      headers['Authorization'] = `token ${authToken}`;
    }

    return headers;
  }
}