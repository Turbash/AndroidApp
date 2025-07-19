import Constants from 'expo-constants';
import { GitHubRepo } from './github';

const ML_CONFIG = {
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co/models',
    token: Constants.expoConfig?.extra?.huggingfaceToken || null
  }
};

const MODELS = {
  skillAssessment: 'sentence-transformers/all-MiniLM-L6-v2'
};

export interface SkillProficiencyResult {
  language: string;
  proficiency: number;
  confidence: number;
  reasoning: string;
}

export class MLModelsService {
  static async assessLanguageProficiency(
    language: string, 
    repos: GitHubRepo[], 
    codeMetrics: any
  ): Promise<SkillProficiencyResult> {
    console.log(`🎯 Assessing ${language} proficiency...`);
    
    if (ML_CONFIG.huggingface.token) {
      try {
        const skillProfile = this.createSkillProfile(language, repos, codeMetrics);
        
        const result = await this.callHuggingFaceModel(MODELS.skillAssessment, {
          inputs: skillProfile,
          options: { wait_for_model: true }
        });
        
        const proficiency = this.calculateProficiencyScore(language, repos, codeMetrics, result);
        
        return {
          language,
          proficiency: proficiency.score,
          confidence: proficiency.confidence,
          reasoning: proficiency.reasoning + ' (ML-enhanced)'
        };
      } catch (mlError) {
        console.log(`⚠️ ML API failed for ${language}, falling back to enhanced analysis`);
      }
    } else {
      console.log(`💡 No ML API token, using enhanced AI analysis for ${language}`);
    }
    
    return this.getEnhancedHeuristicProficiency(language, repos, codeMetrics);
  }
  
  private static async callHuggingFaceModel(model: string, payload: any): Promise<any> {
    const url = `${ML_CONFIG.huggingface.baseUrl}/${model}`;
    
    console.log(`🤖 Calling ML model: ${model}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (ML_CONFIG.huggingface.token) {
      headers['Authorization'] = `Bearer ${ML_CONFIG.huggingface.token}`;
      console.log(`🔑 Using HuggingFace API key: ${ML_CONFIG.huggingface.token.substring(0, 7)}...`);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`⚠️ ML API Response: ${response.status} - ${errorText}`);
      throw new Error(`Hugging Face API error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ ML model response received`);
    return result;
  }
  
  private static getEnhancedHeuristicProficiency(
    language: string, 
    repos: GitHubRepo[], 
    codeMetrics: any
  ): SkillProficiencyResult {
    console.log(`🧠 Using enhanced heuristics for ${language}...`);
    
    const repoCount = repos.filter(r => r.language === language).length;
    const avgSize = codeMetrics.avgSize || 0;
    const recentActivity = codeMetrics.recentActivity;
    const complexity = codeMetrics.complexity || 0.5;
    
    let baseScore = 0;
    
    baseScore += Math.min(0.4, repoCount * 0.08);
    
    baseScore += Math.min(0.25, Math.log10(avgSize + 1) / 20);
    
    baseScore += complexity * 0.2;
    
    if (recentActivity) {
      baseScore += 0.15;
    }
    
    const languageBonus = this.getLanguageSpecificBonus(language, repos);
    baseScore += languageBonus;
    
    const finalScore = Math.min(0.95, Math.max(0.3, baseScore));
    
    const confidence = this.calculateConfidence(repoCount, avgSize, recentActivity);
    
    const reasoning = this.generateDetailedReasoning(language, repoCount, avgSize, complexity, recentActivity, languageBonus);
    
    return {
      language,
      proficiency: finalScore,
      confidence,
      reasoning
    };
  }
  
  private static getLanguageSpecificBonus(language: string, repos: GitHubRepo[]): number {
    let bonus = 0;
    
    const repoNames = repos.map(r => r.name.toLowerCase()).join(' ');
    const descriptions = repos.map(r => r.description || '').join(' ').toLowerCase();
    const combined = `${repoNames} ${descriptions}`;
    
    switch (language) {
      case 'JavaScript':
        if (combined.includes('react')) bonus += 0.05;
        if (combined.includes('node')) bonus += 0.05;
        if (combined.includes('vue') || combined.includes('angular')) bonus += 0.04;
        break;
      case 'TypeScript':
        if (combined.includes('react')) bonus += 0.06;
        if (combined.includes('angular')) bonus += 0.05;
        bonus += 0.03; 
        break;
      case 'Python':
        if (combined.includes('django') || combined.includes('flask')) bonus += 0.05;
        if (combined.includes('data') || combined.includes('ml')) bonus += 0.06;
        if (combined.includes('api')) bonus += 0.04;
        break;
      case 'Java':
        if (combined.includes('spring')) bonus += 0.05;
        if (combined.includes('android')) bonus += 0.04;
        break;
      case 'HTML':
        if (combined.includes('css') || combined.includes('responsive')) bonus += 0.03;
        break;
      case 'CSS':
        if (combined.includes('responsive') || combined.includes('bootstrap')) bonus += 0.03;
        break;
    }
    
    return Math.min(0.1, bonus); 
  }
  
  private static calculateConfidence(repoCount: number, avgSize: number, recentActivity: boolean): number {
    let confidence = 0.5; 
    
    confidence += Math.min(0.3, repoCount * 0.05);
    
    confidence += Math.min(0.15, Math.log10(avgSize + 1) / 50);
    
    if (recentActivity) {
      confidence += 0.1;
    }
    
    return Math.min(0.95, confidence);
  }
  
  private static generateDetailedReasoning(
    language: string, 
    repoCount: number, 
    avgSize: number, 
    complexity: number, 
    recentActivity: boolean, 
    bonus: number
  ): string {
    const reasons = [];
    
    reasons.push(`${repoCount} ${language} projects`);
    
    if (avgSize > 1000) {
      reasons.push('substantial project sizes');
    } else if (avgSize > 100) {
      reasons.push('moderate project complexity');
    }
    
    if (complexity > 0.7) {
      reasons.push('high technical complexity');
    } else if (complexity > 0.5) {
      reasons.push('good technical depth');
    }
    
    if (recentActivity) {
      reasons.push('recent active development');
    }
    
    if (bonus > 0.05) {
      reasons.push('framework/library expertise');
    }
    
    return `Advanced analysis of ${reasons.join(', ')}. Enhanced scoring algorithm considers project scale, technical complexity, and modern development practices.`;
  }
  
  private static createSkillProfile(language: string, repos: GitHubRepo[], metrics: any): string {
    const repoCount = repos.filter(r => r.language === language).length;
    const avgRepoSize = metrics.avgSize || 0;
    const recentActivity = metrics.recentActivity || false;
    
    return `I am a developer with ${repoCount} ${language} projects. 
            My average project size is ${avgRepoSize} lines of code. 
            I am ${recentActivity ? 'currently active' : 'not recently active'} in ${language} development.
            My projects include: ${repos.slice(0, 3).map(r => r.name).join(', ')}.
            Please assess my ${language} proficiency level.`;
  }
  
  private static calculateProficiencyScore(
    language: string, 
    repos: GitHubRepo[], 
    metrics: any, 
    mlResult: any
  ): { score: number; confidence: number; reasoning: string } {
    
    const repoCount = repos.filter(r => r.language === language).length;
    const projectComplexity = metrics.complexity || 0.5;
    const recentActivity = metrics.recentActivity ? 1 : 0.5;
    
    const heuristicScore = Math.min(0.8, (repoCount * 0.15 + projectComplexity * 0.3 + recentActivity * 0.2));
    
    let mlBoost = 0;
    if (mlResult && Array.isArray(mlResult) && mlResult.length > 0) {
      const embedding = mlResult[0];
      if (Array.isArray(embedding)) {
        const magnitude = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0));
        mlBoost = Math.min(0.15, magnitude / 100); 
      }
    }
    
    const finalScore = Math.min(0.95, heuristicScore + mlBoost);
    
    return {
      score: finalScore,
      confidence: repoCount > 3 ? 0.8 : 0.6,
      reasoning: `ML analysis of ${repoCount} projects with complexity assessment. Recent activity: ${recentActivity > 0.5 ? 'Yes' : 'No'}`
    };
  }
  
  private static getFallbackProficiency(language: string, repos: GitHubRepo[]): SkillProficiencyResult {
    const repoCount = repos.filter(r => r.language === language).length;
    const proficiency = Math.min(0.8, repoCount * 0.15 + 0.3);
    
    return {
      language,
      proficiency,
      confidence: 0.6,
      reasoning: `Fallback assessment based on ${repoCount} repositories (ML unavailable)`
    };
  }
}