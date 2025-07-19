import { GitHubCommit, GitHubRepo } from './github';
import { GitHubStatsService } from './githubStats';

class G4fAIService {
  private static baseUrl = 'https://api.g4f.icu/v1';
  
  static async generateCompletion(prompt: string, model: string = 'gpt-4o'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert software development analyst. Provide accurate, professional analysis based on the data provided. Always respond with valid JSON when requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`G4f API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('G4f API call failed:', error);
      throw error;
    }
  }

  static async analyzeWithMultipleModels(prompt: string): Promise<string> {
    const models = ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet'];
    
    for (const model of models) {
      try {
        console.log(`🤖 Trying ${model}...`);
        const result = await this.generateCompletion(prompt, model);
        if (result && result.length > 10) {
          console.log(`✅ Success with ${model}`);
          return result;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ ${model} failed: ${errorMessage}, trying next...`);
        continue;
      }
    }
    
    throw new Error('All AI models failed');
  }
}

export interface AIAnalysisResult {
  skills: Array<{
    language: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
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

export class MLModelsService {
  
  static async performCompleteAIAnalysis(
    repos: GitHubRepo[],
    repoLanguages: Record<string, Record<string, number>>,
    allCommits: Record<string, GitHubCommit[]>,
    username: string
  ): Promise<AIAnalysisResult> {
    
    console.log('🤖 G4F AI ANALYSIS - GRANULAR ERROR HANDLING!');
    console.log(`📊 Data summary: ${repos.length} repos, ${Object.keys(allCommits).length} commit histories`);
    
    const context = await this.prepareRichAIContext(repos, repoLanguages, allCommits, username);
    
    const [
      skills,
      codingPatterns,
      projectComplexity,
      careerRecommendations,
      learningPath
    ] = await Promise.allSettled([
      this.analyzeSkillsWithG4f(context),
      this.analyzePatternsWithG4f(allCommits, context),
      this.analyzeComplexityWithG4f(repos, context),
      this.analyzeCareersWithG4f(repos, repoLanguages, context),
      this.analyzeLearningPathWithG4f(repos, repoLanguages, context)
    ]);

    console.log('✅ G4F AI analysis completed with individual error handling!');

    return {
      skills: skills.status === 'fulfilled' ? skills.value : [],
      codingPatterns: codingPatterns.status === 'fulfilled' ? codingPatterns.value : null,
      projectComplexity: projectComplexity.status === 'fulfilled' ? projectComplexity.value : null,
      careerRecommendations: careerRecommendations.status === 'fulfilled' ? careerRecommendations.value : [],
      learningPath: learningPath.status === 'fulfilled' ? learningPath.value : []
    };
  }

  private static async prepareRichAIContext(
    repos: GitHubRepo[],
    repoLanguages: Record<string, Record<string, number>>,
    allCommits: Record<string, GitHubCommit[]>,
    username: string
  ): Promise<string> {
    console.log('📊 Preparing comprehensive context for AI analysis...');
    
    try {
      const userValidation = await GitHubStatsService.validateAndGetCorrectUsername(username);
      const correctUsername = userValidation.correctUsername;
      
      console.log(`👤 Using correct username: ${correctUsername} (from input: ${username})`);
      
      const statsData = await GitHubStatsService.fetchGitHubStats(correctUsername, 15);
      
      if (statsData.isAvailable) {
        console.log('📊 GitHub stats APIs accessed successfully for AI context');
      } else {
        console.log('⚠️ GitHub stats APIs had issues, continuing with repository data');
      }
      
      const totalCommits = Object.values(allCommits).flat();
      const recentCommits = totalCommits.slice(0, 15).map(c => c.commit.message);
      
      const topRepos = repos
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 5);
      
      const allTopics = repos.flatMap(r => r.topics || []).slice(0, 20);
      
      // Get language summary from our data
      const languageSummary = Object.entries(
        Object.values(repoLanguages).reduce((acc, langs) => {
          Object.entries(langs).forEach(([lang, bytes]) => {
            acc[lang] = (acc[lang] || 0) + bytes;
          });
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 8);
      
      return `COMPREHENSIVE DEVELOPER PROFILE FOR AI ANALYSIS

GitHub Username: ${correctUsername}
Total Repositories: ${repos.length}
Total Commits Analyzed: ${totalCommits.length}
GitHub Stats API Status: ${statsData.isAvailable ? 'Available' : 'Limited'}

PROGRAMMING LANGUAGES (by usage):
${languageSummary.map(([lang, bytes]) => `- ${lang}: ${Math.round(bytes/1000)}KB of code`).join('\n')}

TOP REPOSITORIES:
${topRepos.map(repo => `- ${repo.name}: ${repo.description || 'No description'} 
  └── ${repo.stargazers_count || 0} stars, ${repo.forks_count || 0} forks, Language: ${repo.language || 'Unknown'}`).join('\n')}

PROJECT TOPICS & DOMAINS:
${allTopics.join(', ')}

RECENT COMMIT ACTIVITY:
${recentCommits.slice(0, 15).map(msg => `- ${msg}`).join('\n')}

REPOSITORY QUALITY METRICS:
- Average repository size: ${Math.round(repos.reduce((sum, r) => sum + (r.size || 0), 0) / repos.length)}KB
- Repositories with documentation: ${repos.filter(r => r.has_wiki).length}/${repos.length}
- Repositories with topics: ${repos.filter(r => r.topics && r.topics.length > 0).length}/${repos.length}
- Public repositories: ${repos.filter(r => !r.private).length}/${repos.length}
- Repositories with licenses: ${repos.filter(r => r.license).length}/${repos.length}

DEVELOPMENT PATTERNS:
- Most active language: ${languageSummary[0] ? languageSummary[0][0] : 'Unknown'}
- Repository diversity: ${Object.keys(repoLanguages).length} repositories with code

This comprehensive profile should be analyzed by AI for programming expertise, development patterns, and career recommendations.`;

    } catch (error) {
      console.log('❌ GitHub stats API error, using repository data:', error);
      
      const totalCommits = Object.values(allCommits).flat();
      return `DEVELOPER PROFILE FOR AI ANALYSIS

GitHub Username: ${username}
Total Repositories: ${repos.length}  
Total Commits: ${totalCommits.length}
Using repository data for AI analysis`;
    }
  }

  private static async analyzeSkillsWithG4f(context: string): Promise<Array<{
    language: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    confidence: number;
    reasoning: string;
  }>> {
    console.log('🎯 G4F AI Skills Analysis...');
    
    try {
      const prompt = `Analyze this developer's programming language skills based on their GitHub profile data:

${context}

Please assess their skill level for each programming language they use. Consider:
- Code volume and usage patterns
- Project complexity and diversity
- Repository quality indicators
- Development activity patterns

Respond with ONLY a valid JSON array in this exact format:
[
  {
    "language": "JavaScript",
    "level": "advanced",
    "confidence": 0.87,
    "reasoning": "Extensive usage across multiple complex projects with good repository structure"
  }
]

Valid levels: "beginner", "intermediate", "advanced", "expert"
Confidence should be between 0.0 and 1.0`;

      const aiResponse = await G4fAIService.analyzeWithMultipleModels(prompt);
      console.log('🎯 G4F Skills Response:', aiResponse);
      
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const skillsData = JSON.parse(jsonMatch[0]);
        const validSkills = skillsData.filter((skill: any) => 
          skill.language && 
          skill.level && 
          ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level) &&
          typeof skill.confidence === 'number' &&
          skill.reasoning
        );
        
        console.log(`✅ Skills Analysis: Successfully analyzed ${validSkills.length} skills`);
        return validSkills.slice(0, 8); // Limit to 8 skills
      }
      
      throw new Error('No valid JSON in AI response');
    } catch (error) {
      console.error('❌ G4F skills analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`SKILLS_ANALYSIS_FAILED: ${errorMessage}`);
    }
  }

  private static async analyzePatternsWithG4f(
    allCommits: Record<string, GitHubCommit[]>,
    context: string
  ): Promise<{
    consistency: number;
    velocity: number;
    quality: number;
    patterns: string[];
    confidence: number;
  } | null> {
    console.log('📈 G4F AI Pattern Analysis...');
    
    try {
      const allCommitsList = Object.values(allCommits).flat();
      
      if (allCommitsList.length === 0) {
        throw new Error('No commits available for AI analysis');
      }
      
      const recentCommits = allCommitsList.slice(0, 20).map(c => c.commit.message);
      
      const prompt = `Analyze this developer's coding patterns and development habits:

COMMIT HISTORY (${allCommitsList.length} total commits):
${recentCommits.map(msg => `- ${msg}`).join('\n')}

DEVELOPER CONTEXT:
${context}

Analyze their development patterns and provide scores for:
1. Consistency (0-100): How regular and structured is their development approach
2. Velocity (0-100): How productive and active they are
3. Quality (0-100): How good are their commit messages and development practices

Also identify specific patterns you observe.

Respond with ONLY valid JSON in this format:
{
  "consistency": 85,
  "velocity": 72,
  "quality": 90,
  "patterns": ["Regular commit schedule", "Descriptive commit messages", "Feature-driven development"],
  "confidence": 0.88
}`;

      const aiResponse = await G4fAIService.analyzeWithMultipleModels(prompt);
      console.log('📈 G4F Patterns Response:', aiResponse);
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const patternsData = JSON.parse(jsonMatch[0]);
        
        if (typeof patternsData.consistency === 'number' &&
            typeof patternsData.velocity === 'number' &&
            typeof patternsData.quality === 'number' &&
            Array.isArray(patternsData.patterns) &&
            typeof patternsData.confidence === 'number') {
          
          console.log(`✅ Patterns Analysis: Successfully analyzed development patterns`);
          return patternsData;
        }
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('❌ G4F patterns analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`PATTERNS_ANALYSIS_FAILED: ${errorMessage}`);
    }
  }

  private static async analyzeComplexityWithG4f(
    repos: GitHubRepo[],
    context: string
  ): Promise<{
    overall: number;
    technicalDebt: number;
    architecture: number;
    scalability: number;
    reasoning: string;
  } | null> {
    console.log('🏗️ G4F AI Complexity Analysis...');
    
    try {
      const prompt = `Analyze the complexity and quality of this developer's projects:

${context}

PROJECT DETAILS:
${repos.slice(0, 10).map(repo => `
- ${repo.name}: ${repo.description || 'No description'}
  Stars: ${repo.stargazers_count || 0}, Forks: ${repo.forks_count || 0}
  Language: ${repo.language || 'Unknown'}
  Topics: ${repo.topics?.join(', ') || 'None'}
  Size: ${repo.size || 0}KB
`).join('')}

Rate the following aspects (0-100):
1. Overall Complexity: How sophisticated and complex are their projects
2. Technical Debt: How much technical debt likely exists (lower is better)
3. Architecture: How well-architected and structured are the projects
4. Scalability: How scalable and maintainable are the projects

Respond with ONLY valid JSON:
{
  "overall": 78,
  "technicalDebt": 25,
  "architecture": 82,
  "scalability": 75,
  "reasoning": "Well-structured projects with modern frameworks and good documentation practices"
}`;

      const aiResponse = await G4fAIService.analyzeWithMultipleModels(prompt);
      console.log('🏗️ G4F Complexity Response:', aiResponse);
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const complexityData = JSON.parse(jsonMatch[0]);
        
        if (typeof complexityData.overall === 'number' &&
            typeof complexityData.technicalDebt === 'number' &&
            typeof complexityData.architecture === 'number' &&
            typeof complexityData.scalability === 'number' &&
            typeof complexityData.reasoning === 'string') {
          
          console.log(`✅ Complexity Analysis: Successfully analyzed project complexity`);
          return complexityData;
        }
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('❌ G4F complexity analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`COMPLEXITY_ANALYSIS_FAILED: ${errorMessage}`);
    }
  }

  private static async analyzeCareersWithG4f(
    repos: GitHubRepo[],
    repoLanguages: Record<string, Record<string, number>>,
    context: string
  ): Promise<Array<{
    role: string;
    match: number;
    transition: number;
    skills: string[];
    reasoning: string;
  }>> {
    console.log('💼 G4F AI Career Analysis...');
    
    try {
      const allLanguages = Object.values(repoLanguages).reduce((acc, langs) => {
        Object.entries(langs).forEach(([lang, bytes]) => {
          acc[lang] = (acc[lang] || 0) + bytes;
        });
        return acc;
      }, {} as Record<string, number>);
      
      const topLanguages = Object.entries(allLanguages)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([lang]) => lang);
      
      const prompt = `Based on this developer's profile, recommend the best career paths:

${context}

TECHNICAL STACK:
- Primary Languages: ${topLanguages.join(', ')}
- Total Projects: ${repos.length}
- Project Topics: ${repos.flatMap(r => r.topics || []).slice(0, 15).join(', ')}

Recommend 3 career paths that best match their skills and experience. Consider their technology stack, project types, and skill level.

Respond with ONLY valid JSON:
[
  {
    "role": "Full-Stack Developer",
    "match": 88,
    "transition": 3,
    "skills": ["React", "Node.js", "TypeScript", "API Design"],
    "reasoning": "Strong experience in both frontend and backend technologies"
  }
]

Match should be 0-100 (how well they fit), transition is months needed to transition.`;

      const aiResponse = await G4fAIService.analyzeWithMultipleModels(prompt);
      console.log('💼 G4F Career Response:', aiResponse);
      
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const careersData = JSON.parse(jsonMatch[0]);
        const validCareers = careersData.filter((career: any) => 
          career.role && 
          typeof career.match === 'number' &&
          typeof career.transition === 'number' &&
          Array.isArray(career.skills) &&
          career.reasoning
        );
        
        console.log(`✅ Career Analysis: Successfully analyzed ${validCareers.length} career recommendations`);
        return validCareers.slice(0, 3);
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('❌ G4F career analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`CAREER_ANALYSIS_FAILED: ${errorMessage}`);
    }
  }

  private static async analyzeLearningPathWithG4f(
    repos: GitHubRepo[],
    repoLanguages: Record<string, Record<string, number>>,
    context: string
  ): Promise<Array<{
    skill: string;
    priority: 'high' | 'medium' | 'low';
    hours: number;
    difficulty: number;
    reasoning: string;
  }>> {
    console.log('📚 G4F AI Learning Path Analysis...');
    
    try {
      const allLanguages = Object.values(repoLanguages).reduce((acc, langs) => {
        Object.entries(langs).forEach(([lang, bytes]) => {
          acc[lang] = (acc[lang] || 0) + bytes;
        });
        return acc;
      }, {} as Record<string, number>);
      
      const topLanguages = Object.entries(allLanguages)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([lang]) => lang);
      
      const prompt = `Create a personalized learning path for this developer:

${context}

CURRENT SKILLS:
- Languages: ${topLanguages.join(', ')}
- Projects: ${repos.length} repositories
- Experience Level: Based on project complexity and commit patterns

Recommend 4-5 skills they should learn next to advance their career. Consider:
- Current skill gaps
- Industry trends and demands
- Natural progression from their current stack
- Career advancement opportunities

Respond with ONLY valid JSON:
[
  {
    "skill": "TypeScript",
    "priority": "high",
    "hours": 40,
    "difficulty": 6,
    "reasoning": "Essential for scaling JavaScript applications and highly demanded in job market"
  }
]

Priority: "high", "medium", or "low"
Hours: estimated learning time
Difficulty: 1-10 scale`;

      const aiResponse = await G4fAIService.analyzeWithMultipleModels(prompt);
      console.log('📚 G4F Learning Response:', aiResponse);
      
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const learningData = JSON.parse(jsonMatch[0]);
        const validLearning = learningData.filter((item: any) => 
          item.skill && 
          ['high', 'medium', 'low'].includes(item.priority) &&
          typeof item.hours === 'number' &&
          typeof item.difficulty === 'number' &&
          item.reasoning
        );
        
        console.log(`✅ Learning Path Analysis: Successfully analyzed ${validLearning.length} learning recommendations`);
        return validLearning.slice(0, 5);
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('❌ G4F learning analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`LEARNING_ANALYSIS_FAILED: ${errorMessage}`);
    }
  }
}
