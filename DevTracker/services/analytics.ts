import { GitHubCommit, GitHubRepo } from './github';

export interface DeveloperInsights {
  languageStats: LanguageStats[];
  languageGrowth: LanguageGrowth[];
  
  commitFrequency: CommitFrequency;
  codingConsistency: number; 
  productivityTrends: ProductivityTrend[];
  
  skillLevel: SkillAssessment[];
  complexityProgression: ComplexityProgression;
  
  nextSkills: string[];
  projectSuggestions: string[];
  learningPath: string[];
}

export interface LanguageStats {
  language: string;
  totalBytes: number;
  percentage: number;
  repoCount: number;
  trend: 'growing' | 'stable' | 'declining';
}

export interface LanguageGrowth {
  language: string;
  monthlyData: { month: string; bytes: number }[];
  growthRate: number; 
}

export interface CommitFrequency {
  daily: number;
  weekly: number;
  monthly: number;
  bestStreak: number;
  currentStreak: number;
}

export interface ProductivityTrend {
  period: string;
  commits: number;
  linesChanged: number;
  reposActive: number;
}

export interface SkillAssessment {
  technology: string;
  level: number; 
  confidence: number; 
  projectCount: number;
  lastUsed: string;
}

export interface ComplexityProgression {
  beginner: number; 
  intermediate: number;
  advanced: number;
  trend: 'improving' | 'stable';
}

export class DevAnalytics {
  
  static analyzeLanguageUsage(repos: GitHubRepo[], repoLanguages: Record<string, Record<string, number>>): LanguageStats[] {
    const languageMap = new Map<string, { bytes: number; repoCount: number }>();
    
    repos.forEach(repo => {
      const languages = repoLanguages[repo.name] || {};
      Object.entries(languages).forEach(([lang, bytes]) => {
        const current = languageMap.get(lang) || { bytes: 0, repoCount: 0 };
        languageMap.set(lang, {
          bytes: current.bytes + bytes,
          repoCount: current.repoCount + 1
        });
      });
    });
    
    const totalBytes = Array.from(languageMap.values()).reduce((sum, { bytes }) => sum + bytes, 0);
    
    return Array.from(languageMap.entries())
      .map(([language, { bytes, repoCount }]) => ({
        language,
        totalBytes: bytes,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
        repoCount,
        trend: 'stable' as const 
      }))
      .sort((a, b) => b.totalBytes - a.totalBytes);
  }
  
  static analyzeCommitPatterns(repos: GitHubRepo[], allCommits: Record<string, GitHubCommit[]>): CommitFrequency {
    const commits = Object.values(allCommits).flat();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentCommits = commits.filter(c => new Date(c.commit.author.date) > thirtyDaysAgo);
    const weeklyCommits = commits.filter(c => new Date(c.commit.author.date) > sevenDaysAgo);
    const dailyCommits = commits.filter(c => new Date(c.commit.author.date) > oneDayAgo);
    
    return {
      daily: dailyCommits.length,
      weekly: weeklyCommits.length,
      monthly: recentCommits.length,
      bestStreak: this.calculateBestStreak(commits),
      currentStreak: this.calculateCurrentStreak(commits)
    };
  }
  
  static assessSkillLevels(languageStats: LanguageStats[], repos: GitHubRepo[]): SkillAssessment[] {
    return languageStats.slice(0, 5).map(lang => {
      const reposWithLang = repos.filter(r => r.language === lang.language);
      const level = this.calculateSkillLevel(lang.repoCount, lang.totalBytes);
      
      return {
        technology: lang.language,
        level,
        confidence: Math.min(95, level * 10 + lang.repoCount * 5),
        projectCount: lang.repoCount,
        lastUsed: reposWithLang[0]?.updated_at || new Date().toISOString()
      };
    });
  }
  
  static generateRecommendations(skillAssessments: SkillAssessment[], languageStats: LanguageStats[]): {
    nextSkills: string[];
    projectSuggestions: string[];
    learningPath: string[];
  } {
    const topSkills = skillAssessments.slice(0, 3);
    const recommendations: {
      nextSkills: string[];
      projectSuggestions: string[];
      learningPath: string[];
    } = {
      nextSkills: [],
      projectSuggestions: [],
      learningPath: []
    };
    
    topSkills.forEach(skill => {
      const suggestions = this.getSkillSuggestions(skill.technology);
      recommendations.nextSkills.push(...suggestions.nextSkills);
      recommendations.projectSuggestions.push(...suggestions.projects);
      recommendations.learningPath.push(...suggestions.learningPath);
    });
    
    return {
      nextSkills: [...new Set(recommendations.nextSkills)].slice(0, 3),
      projectSuggestions: [...new Set(recommendations.projectSuggestions)].slice(0, 3),
      learningPath: [...new Set(recommendations.learningPath)].slice(0, 5)
    };
  }
  
  static generateCompleteInsights(repos: GitHubRepo[], repoLanguages: Record<string, Record<string, number>>, allCommits: Record<string, GitHubCommit[]>): DeveloperInsights {
    const languageStats = this.analyzeLanguageUsage(repos, repoLanguages);
    const commitFrequency = this.analyzeCommitPatterns(repos, allCommits);
    const skillLevel = this.assessSkillLevels(languageStats, repos);
    const recommendations = this.generateRecommendations(skillLevel, languageStats);
    
    return {
      languageStats,
      languageGrowth: [], 
      commitFrequency,
      codingConsistency: 85, 
      productivityTrends: [], 
      skillLevel,
      complexityProgression: {
        beginner: Math.floor(repos.length * 0.4),
        intermediate: Math.floor(repos.length * 0.4),
        advanced: Math.floor(repos.length * 0.2),
        trend: 'improving'
      },
      nextSkills: recommendations.nextSkills,
      projectSuggestions: recommendations.projectSuggestions,
      learningPath: recommendations.learningPath
    };
  }
  
  private static calculateBestStreak(commits: GitHubCommit[]): number {
    return Math.max(5, Math.floor(commits.length / 10));
  }
  
  private static calculateCurrentStreak(commits: GitHubCommit[]): number {
    return Math.max(1, Math.floor(commits.length / 20));
  }
  
  private static calculateSkillLevel(repoCount: number, totalBytes: number): number {
    const repoScore = Math.min(repoCount * 1.5, 6);
    const volumeScore = totalBytes > 0 ? Math.min(Math.log10(totalBytes / 1000), 4) : 0;
    return Math.min(10, Math.max(1, Math.round(repoScore + volumeScore)));
  }
  
  private static getSkillSuggestions(technology: string): {
    nextSkills: string[];
    projects: string[];
    learningPath: string[];
  } {
    const suggestions: Record<string, {
      nextSkills: string[];
      projects: string[];
      learningPath: string[];
    }> = {
      'JavaScript': {
        nextSkills: ['TypeScript', 'React', 'Node.js'],
        projects: ['Build a REST API', 'Create a React app', 'Make a CLI tool'],
        learningPath: ['ES6 features', 'Async/await', 'Module systems', 'Testing']
      },
      'Python': {
        nextSkills: ['Django', 'Flask', 'Data Science', 'Machine Learning'],
        projects: ['Web scraper', 'Data analysis project', 'API with FastAPI'],
        learningPath: ['OOP concepts', 'Libraries ecosystem', 'Virtual environments']
      },
      'TypeScript': {
        nextSkills: ['React', 'Next.js', 'Express'],
        projects: ['Full-stack app', 'Type-safe API', 'Component library'],
        learningPath: ['Advanced types', 'Decorators', 'Generic constraints']
      }
    };
    
    return suggestions[technology] || {
      nextSkills: ['Git', 'Testing', 'CI/CD'],
      projects: ['Portfolio website', 'Open source contribution'],
      learningPath: ['Best practices', 'Code review', 'Documentation']
    };
  }
}
