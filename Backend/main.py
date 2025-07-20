from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from g4f import Client
from typing import List, Optional
import json
import os
import time
import logging
from concurrent.futures import ThreadPoolExecutor
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DevTracker API", description="Learning Progress Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

g4f_client = Client()
executor = ThreadPoolExecutor(max_workers=5)

goals_db = []
progress_cache = {}

class Goal(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    category: str
    completed: bool = False
    progress_notes: List[str] = []

class ProgressUpdate(BaseModel):
    goal_id: str
    note: str

class LearningAnalysisRequest(BaseModel):
    goal_title: str
    category: str
    current_progress: str
    difficulty_level: int = 5  

class LearningAnalysisResponse(BaseModel):
    suggestions: List[str]
    next_steps: List[str]
    estimated_time: str
    resources: List[str]

class GitHubAnalysisRequest(BaseModel):
    username: str
    readme_content: Optional[str] = None
    commit_messages: List[str] = []
    repo_languages: dict = {} 
    repo_names: List[str] = []

class GitHubInsightsResponse(BaseModel):
    skill_analysis: dict
    learning_suggestions: List[str]
    project_insights: List[str]
    recommended_goals: List[dict]
    coding_patterns: dict

class DevAnalysisRequest(BaseModel):
    username: str
    readme_content: Optional[str] = None
    commit_messages: List[str] = []
    repo_languages: dict = {}  
    repo_names: List[str] = []
    total_repos: int = 0
    total_commits: int = 0

class DevAnalysisResponse(BaseModel):
    summary: str
    skill_level: str  
    top_languages: List[str]
    strengths: List[str]
    improvement_areas: List[str]
    recommended_goals: List[dict]
    learning_path: List[str]
    estimated_hours: int
    motivation_message: str
    ai_success: bool = True
    source: str = "ai"  

class RepoAnalysisRequest(BaseModel):
    username: str
    repo_name: str
    readme_content: Optional[str] = None
    commit_messages: List[str] = []
    repo_languages: dict = {}
    stars: int = 0
    forks: int = 0
    topics: List[str] = []
    size: int = 0

class RepoAnalysisResponse(BaseModel):
    summary: str
    strengths: List[str]
    improvement_areas: List[str]
    code_quality_score: int
    popularity_score: int
    documentation_score: int
    recommendations: List[str]
    ai_success: bool = True
    source: str = "ai"

def analyze_learning_progress(goal_title: str, category: str, progress: str, difficulty: int) -> dict:
    """Analyze learning progress and provide AI suggestions"""
    try:
        prompt = f"""
        You are a learning mentor for developers. Analyze this learning goal:
        
        Goal: {goal_title}
        Category: {category}  
        Current Progress: {progress}
        Difficulty Level: {difficulty}/10
        
        Provide helpful suggestions in this JSON format:
        {{
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
            "next_steps": ["step1", "step2", "step3"],
            "estimated_time": "X hours/days/weeks",
            "resources": ["resource1", "resource2", "resource3"]
        }}
        
        Keep suggestions practical and actionable for a developer.
        """
        
        response = g4f_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        
        if response and response.choices:
            content = response.choices[0].message.content
            try:
                if '{' in content and '}' in content:
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    json_str = content[json_start:json_end]
                    return json.loads(json_str)
            except:
                pass
        
        return {
            "suggestions": [
                f"Break down {goal_title} into smaller daily tasks",
                f"Practice {category} concepts for 30 minutes daily",
                "Join online communities for peer support"
            ],
            "next_steps": [
                "Review current progress and identify gaps",
                "Set specific weekly milestones",
                "Find practice projects"
            ],
            "estimated_time": "2-4 weeks with consistent practice",
            "resources": [
                "Official documentation",
                "YouTube tutorials",
                "Practice coding platforms"
            ]
        }
        
    except Exception as e:
        logger.error(f"AI analysis error: {str(e)}")
        return {
            "suggestions": ["Keep practicing consistently", "Break complex topics into smaller parts"],
            "next_steps": ["Review fundamentals", "Build a small project"],
            "estimated_time": "Varies based on complexity",
            "resources": ["Documentation", "Online tutorials"]
        }

def analyze_github_data(github_data: GitHubAnalysisRequest) -> dict:
    """Analyze GitHub data to provide learning insights"""
    try:
        languages = ", ".join([f"{lang} ({pct}%)" for lang, pct in github_data.repo_languages.items()])
        recent_commits = "\n".join(github_data.commit_messages[-10:])  # Last 10 commits
        repos = ", ".join(github_data.repo_names)
        
        prompt = f"""
        Analyze this developer's GitHub profile and provide learning insights:
        
        Username: {github_data.username}
        
        Repository Languages: {languages}
        
        Repository Names: {repos}
        
        Recent Commit Messages:
        {recent_commits}
        
        README Content Sample:
        {github_data.readme_content[:500] if github_data.readme_content else "No README provided"}
        
        Based on this data, provide analysis in this JSON format:
        {{
            "skill_analysis": {{
                "primary_languages": ["lang1", "lang2"],
                "experience_level": "beginner/intermediate/advanced",
                "strengths": ["strength1", "strength2"],
                "areas_to_improve": ["area1", "area2"]
            }},
            "learning_suggestions": ["suggestion1", "suggestion2", "suggestion3"],
            "project_insights": ["insight1", "insight2", "insight3"],
            "recommended_goals": [
                {{"title": "Goal 1", "category": "Category", "description": "Description", "priority": "high/medium/low"}},
                {{"title": "Goal 2", "category": "Category", "description": "Description", "priority": "high/medium/low"}}
            ],
            "coding_patterns": {{
                "commit_frequency": "high/medium/low",
                "project_variety": "diverse/focused/limited",
                "code_quality_indicators": ["indicator1", "indicator2"]
            }}
        }}
        
        Keep insights practical and actionable for a developer's learning journey.
        """
        
        response = g4f_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.7
        )
        
        if response and response.choices:
            content = response.choices[0].message.content
            try:
                if '{' in content and '}' in content:
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    json_str = content[json_start:json_end]
                    return json.loads(json_str)
            except Exception as parse_error:
                logger.warning(f"JSON parsing failed: {parse_error}")
        
        primary_langs = list(github_data.repo_languages.keys())[:2] if github_data.repo_languages else ["JavaScript"]
        
        return {
            "skill_analysis": {
                "primary_languages": primary_langs,
                "experience_level": "intermediate" if len(github_data.commit_messages) > 50 else "beginner",
                "strengths": [f"{lang} development" for lang in primary_langs[:2]],
                "areas_to_improve": ["Code documentation", "Testing practices"]
            },
            "learning_suggestions": [
                f"Deepen your {primary_langs[0]} skills" if primary_langs else "Focus on a primary language",
                "Improve commit message quality",
                "Add more comprehensive READMEs to projects"
            ],
            "project_insights": [
                f"You work with {len(github_data.repo_languages)} different technologies",
                f"You have {len(github_data.repo_names)} repositories",
                "Consider focusing on fewer technologies for deeper expertise"
            ],
            "recommended_goals": [
                {
                    "title": f"Master {primary_langs[0] if primary_langs else 'JavaScript'}",
                    "category": primary_langs[0] if primary_langs else "JavaScript", 
                    "description": f"Build advanced projects using {primary_langs[0] if primary_langs else 'JavaScript'}",
                    "priority": "high"
                },
                {
                    "title": "Improve Documentation Skills",
                    "category": "Documentation",
                    "description": "Write better READMEs and code comments",
                    "priority": "medium"
                }
            ],
            "coding_patterns": {
                "commit_frequency": "high" if len(github_data.commit_messages) > 100 else "medium",
                "project_variety": "diverse" if len(github_data.repo_languages) > 3 else "focused",
                "code_quality_indicators": ["Regular commits", "Multiple repositories"]
            }
        }
        
    except Exception as e:
        logger.error(f"GitHub analysis error: {str(e)}")
        return {
            "skill_analysis": {"primary_languages": ["JavaScript"], "experience_level": "beginner", "strengths": [], "areas_to_improve": []},
            "learning_suggestions": ["Start with fundamental programming concepts"],
            "project_insights": ["Build more projects to showcase skills"],
            "recommended_goals": [{"title": "Learn programming basics", "category": "Fundamentals", "description": "Master core concepts", "priority": "high"}],
            "coding_patterns": {"commit_frequency": "low", "project_variety": "limited", "code_quality_indicators": []}
        }

def analyze_developer_profile(data: DevAnalysisRequest) -> dict:
    """Single comprehensive analysis of developer's GitHub profile"""
    try:
        def format_langs(repo_languages):
            items = []
            for lang, pct in repo_languages.items():
                try:
                    items.append(f"{lang} ({pct:.1f}%)")
                except Exception:
                    items.append(f"{lang} ({pct})")
            return ", ".join(items)

        languages = format_langs(data.repo_languages)
        recent_commits = "\n".join(data.commit_messages[-15:])  # Last 15 commits
        
        prompt = f"""
        Analyze this developer's complete profile and provide personalized learning insights:
        
        Developer: {data.username}
        Total Repositories: {data.total_repos}
        Total Commits: {data.total_commits}
        
        Programming Languages Used: {languages}
        
        Repository Names: {', '.join(data.repo_names[:10])}
        
        Recent Commit Messages:
        {recent_commits}
        
        README Sample:
        {data.readme_content[:300] if data.readme_content else "No README available"}
        
        Provide a comprehensive analysis in this exact JSON format:
        {{
            "summary": "2-3 sentence overview of their current development level",
            "skill_level": "beginner/intermediate/advanced",
            "top_languages": ["lang1", "lang2", "lang3"],
            "strengths": ["strength1", "strength2", "strength3"],
            "improvement_areas": ["area1", "area2", "area3"],
            "recommended_goals": [
                {{"title": "Goal 1", "category": "Category", "description": "Description", "timeline": "2-4 weeks"}},
                {{"title": "Goal 2", "category": "Category", "description": "Description", "timeline": "1-2 months"}}
            ],
            "learning_path": ["step1", "step2", "step3", "step4"],
            "estimated_hours": 40,
            "motivation_message": "Encouraging message for the developer"
        }}
        
        Make it personal, actionable, and motivating based on their actual coding activity.
        """
        
        response = g4f_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.6
        )
        
        if response and response.choices:
            content = response.choices[0].message.content
            try:
                if '{' in content and '}' in content:
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    json_str = content[json_start:json_end]
                    result = json.loads(json_str)
                    result["ai_success"] = True
                    result["source"] = "ai"
                    return result
            except Exception as parse_error:
                logger.warning(f"JSON parsing failed: {parse_error}")
        logger.warning("AI response missing or invalid, using fallback.")
    except Exception as e:
        logger.error(f"Developer profile analysis error: {str(e)}")
        logger.warning("AI analysis failed, using fallback.")

    return {
        "summary": "No AI analysis available. This is a fallback response.",
        "skill_level": "unknown",
        "top_languages": [],
        "strengths": [],
        "improvement_areas": [],
        "recommended_goals": [],
        "learning_path": [],
        "estimated_hours": 0,
        "motivation_message": "Keep coding and learning! (Fallback response)",
        "ai_success": False,
        "source": "fallback"
    }

def analyze_repo_profile(data: RepoAnalysisRequest) -> dict:
    """Analyze a single repo and provide insights"""
    try:
        prompt = f"""
        Analyze this GitHub repository and provide actionable insights:

        Repository: {data.repo_name}
        Owner: {data.username}
        Stars: {data.stars}
        Forks: {data.forks}
        Topics: {', '.join(data.topics)}
        Size: {data.size} KB
        Languages: {', '.join([f"{lang} ({pct})" for lang, pct in data.repo_languages.items()])}
        README Sample: {data.readme_content[:300] if data.readme_content else "No README available"}
        Recent Commits: {'; '.join(data.commit_messages[-10:])}

        Respond in this JSON format:
        {{
            "summary": "Short summary of repo quality and focus",
            "strengths": ["strength1", "strength2"],
            "improvement_areas": ["area1", "area2"],
            "code_quality_score": 0-100,
            "popularity_score": 0-100,
            "documentation_score": 0-100,
            "recommendations": ["rec1", "rec2"]
        }}
        """
        response = g4f_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
            temperature=0.7
        )
        if response and response.choices:
            content = response.choices[0].message.content
            try:
                if '{' in content and '}' in content:
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    result = json.loads(content[json_start:json_end])
                    result["ai_success"] = True
                    result["source"] = "ai"
                    return result
            except Exception as parse_error:
                logger.warning(f"Repo JSON parsing failed: {parse_error}")
        logger.warning("Repo AI response missing or invalid, using fallback.")
    except Exception as e:
        logger.error(f"Repo analysis error: {str(e)}")
        logger.warning("Repo AI analysis failed, using fallback.")

    return {
        "summary": "No AI analysis available. This is a fallback response.",
        "strengths": [],
        "improvement_areas": [],
        "code_quality_score": 0,
        "popularity_score": 0,
        "documentation_score": 0,
        "recommendations": ["Improve documentation", "Increase commit frequency"],
        "ai_success": False,
        "source": "fallback"
    }

@app.post("/analyze-dev-profile", response_model=DevAnalysisResponse)
async def analyze_developer_profile_endpoint(request: DevAnalysisRequest):
    """Single comprehensive analysis of developer's GitHub profile"""
    try:
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(
            executor,
            analyze_developer_profile,
            request
        )
        if not analysis or not isinstance(analysis, dict) or "summary" not in analysis:
            logger.warning("Analysis dict missing or invalid, using fallback.")
            analysis = {
                "summary": "No AI analysis available. This is a fallback response.",
                "skill_level": "unknown",
                "top_languages": [],
                "strengths": [],
                "improvement_areas": [],
                "recommended_goals": [],
                "learning_path": [],
                "estimated_hours": 0,
                "motivation_message": "Keep coding and learning! (Fallback response)",
                "ai_success": False,
                "source": "fallback"
            }
        return DevAnalysisResponse(**analysis)
    except Exception as e:
        logger.error(f"Developer profile analysis error: {str(e)}")
        logger.warning("Exception in endpoint, using fallback.")
        return DevAnalysisResponse(
            summary="No AI analysis available due to error. This is a fallback response.",
            skill_level="unknown",
            top_languages=[],
            strengths=[],
            improvement_areas=[],
            recommended_goals=[],
            learning_path=[],
            estimated_hours=0,
            motivation_message="Keep coding and learning! (Fallback response)",
            ai_success=False,
            source="fallback"
        )

@app.post("/analyze-repo", response_model=RepoAnalysisResponse)
async def analyze_repo_endpoint(request: RepoAnalysisRequest):
    """Repo-based insights endpoint"""
    try:
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(
            executor,
            analyze_repo_profile,
            request
        )
        if not analysis or not isinstance(analysis, dict) or "summary" not in analysis:
            logger.warning("Repo analysis dict missing or invalid, using fallback.")
            analysis = {
                "summary": "No AI analysis available. This is a fallback response.",
                "strengths": [],
                "improvement_areas": [],
                "code_quality_score": 0,
                "popularity_score": 0,
                "documentation_score": 0,
                "recommendations": ["Improve documentation", "Increase commit frequency"],
                "ai_success": False,
                "source": "fallback"
            }
        return RepoAnalysisResponse(**analysis)
    except Exception as e:
        logger.error(f"Repo profile analysis error: {str(e)}")
        logger.warning("Exception in repo endpoint, using fallback.")
        return RepoAnalysisResponse(
            summary="No AI analysis available due to error. This is a fallback response.",
            strengths=[],
            improvement_areas=[],
            code_quality_score=0,
            popularity_score=0,
            documentation_score=0,
            recommendations=["Improve documentation", "Increase commit frequency"],
            ai_success=False,
            source="fallback"
        )

@app.post("/analyze-goal")
async def analyze_goal_endpoint():
    """Goal-based insights endpoint (to be implemented)"""
    return {"message": "Goal-based insights endpoint coming soon."}