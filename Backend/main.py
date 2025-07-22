from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
from g4f import Client
from typing import List, Optional
from dotenv import load_dotenv
import os
import logging
from concurrent.futures import ThreadPoolExecutor
import asyncio
import httpx
import json

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "")
GITHUB_OAUTH_REDIRECT_URI = os.environ.get("GITHUB_OAUTH_REDIRECT_URI", "http://localhost:8000/auth/github/callback")

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

class RepoSummary(BaseModel):
    name: str
    readme: Optional[str] = None
    code: Optional[str] = None
    tree: Optional[list] = None  
    stars: int = 0
    forks: int = 0
    topics: List[str] = []
    languages: dict = {}

class DevAnalysisRequest(BaseModel):
    username: str
    profile: Optional[dict] = None
    profile_readme: Optional[str] = None
    repos: List[RepoSummary] = []

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
    project_complexity: Optional[dict] = None
    coding_patterns: Optional[dict] = None
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
    code: Optional[str] = None
    tree: Optional[list] = None  

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

class LearningAnalysisRequest(BaseModel):
    goal_title: str
    category: str
    current_progress: str
    description: Optional[str] = None
    chat_history: Optional[list] = None  # List of dicts: {"role": "user"|"ai", "message": str}

class LearningAnalysisResponse(BaseModel):
    suggestions: List[str]
    next_steps: List[str]
    estimated_time: str
    resources: List[str]

@app.get("/auth/github/login")
async def github_login(request: Request):
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth client ID not set.")
    next_uri = request.query_params.get("redirect_uri")
    github_callback = GITHUB_OAUTH_REDIRECT_URI
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={github_callback}"
        f"&scope=read:user public_repo"
        + (f"&state={next_uri}" if next_uri else "")
    )
    return RedirectResponse(github_auth_url)

@app.get("/auth/github/callback")
async def github_callback(request: Request, code: str = None, state: str = None):
    logger.info(f"/auth/github/callback called with code: {code}")
    if not code:
        logger.error("Missing code in callback.")
        raise HTTPException(status_code=400, detail="Missing code in callback.")
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        logger.error("GitHub OAuth credentials not set.")
        raise HTTPException(status_code=500, detail="GitHub OAuth credentials not set.")
    github_callback = GITHUB_OAUTH_REDIRECT_URI
    logger.info(f"Using backend callback for token exchange: {github_callback}")
    token_url = "https://github.com/login/oauth/access_token"
    headers = {"Accept": "application/json"}
    data = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": github_callback,
    }
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(token_url, headers=headers, data=data)
        token_json = token_resp.json()
        logger.info(f"GitHub token response: {token_json}")
        access_token = token_json.get("access_token")
        if not access_token:
            logger.error("Failed to obtain access token from GitHub.")
            raise HTTPException(status_code=400, detail="Failed to obtain access token from GitHub.")
    next_uri = state
    if not next_uri:
        logger.error("Missing 'state' (Expo app URI) in callback.")
        raise HTTPException(status_code=400, detail="Missing 'state' (Expo app URI) in callback.")
    redirect_url = f"{next_uri}#access_token={access_token}"
    logger.info(f"Redirecting to Expo app: {redirect_url}")
    return RedirectResponse(redirect_url)

def analyze_developer_profile(data: DevAnalysisRequest) -> dict:
    try:
        profile_str = json.dumps(data.profile, indent=2) if data.profile else "No profile info"
        profile_readme = data.profile_readme[:500] if data.profile_readme else "No profile README"
        repo_summaries = []
        for repo in data.repos[:5]:
            section = f"\n--- Repo: {repo.name} ---"
            section += f"\nStars: {repo.stars} | Forks: {repo.forks} | Topics: {', '.join(repo.topics)}"
            section += f"\nLanguages: {json.dumps(repo.languages)}"
            if repo.tree:
                section += f"\n\n[FILE TREE]\n{json.dumps(repo.tree, indent=2)}"
            if repo.readme:
                section += f"\n\n[README]\n{repo.readme[:300]}"
            if repo.code:
                section += f"\n\n[CODE SAMPLE]\n{repo.code[:1000]}"
            repo_summaries.append(section)
        repos_str = "\n".join(repo_summaries)
        prompt = f"""
You are an advanced AI coding mentor. Analyze this developer's full GitHub profile and provide a comprehensive, actionable, and motivating assessment.

Developer: {data.username}
Profile Info: {profile_str}
Profile README: {profile_readme}
---
Sample of 5 Repositories (each section is clearly separated):
{repos_str}

Reply ONLY in this JSON format:
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
    "motivation_message": "Encouraging message for the developer",
    "project_complexity": {{
        "overall": 0-100,
        "technicalDebt": 0-100,
        "architecture": 0-100,
        "scalability": 0-100,
        "reasoning": "Short reasoning about complexity"
    }},
    "coding_patterns": {{
        "consistency": 0-100,
        "velocity": 0-100,
        "quality": 0-100,
        "patterns": ["pattern1", "pattern2"],
        "confidence": 0-1
    }}
}}
Make your analysis personal, specific, and focused on real growth opportunities.
"""
        response = g4f_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1200,
            temperature=0.6
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
        "project_complexity": {
            "overall": 0,
            "technicalDebt": 0,
            "architecture": 0,
            "scalability": 0,
            "reasoning": ""
        },
        "coding_patterns": {
            "consistency": 0,
            "velocity": 0,
            "quality": 0,
            "patterns": [],
            "confidence": 0
        },
        "ai_success": False,
        "source": "fallback"
    }

def analyze_repo_profile(data: RepoAnalysisRequest) -> dict:
    try:
        code_snippet = (data.code[:1000] + '\n...\n[truncated]') if data.code and len(data.code) > 1200 else (data.code or None)
        prompt = f"You are a senior open-source reviewer. Analyze this GitHub repository and provide clear, actionable, and constructive feedback.\n\n"
        prompt += f"Repository: {data.repo_name}\nOwner: {data.username}\nStars: {data.stars}\nForks: {data.forks}\nTopics: {', '.join(data.topics)}\nSize: {data.size} KB\nLanguages: {', '.join([f'{lang} ({pct})' for lang, pct in data.repo_languages.items()])}\n"
        if data.tree:
            prompt += f"\n[FILE TREE]\n{json.dumps(data.tree, indent=2)}"
        if data.readme_content:
            prompt += f"\n[README]\n{data.readme_content[:300]}"
        if code_snippet:
            prompt += f"\n[CODE SAMPLE]\n{code_snippet}"
        prompt += f"\nRecent Commits: {'; '.join(data.commit_messages[-10:])}\n"
        prompt += "\nReply ONLY in this JSON format:\n{\n    \"summary\": \"Short summary of repo quality and focus\",\n    \"strengths\": [\"strength1\", \"strength2\"],\n    \"improvement_areas\": [\"area1\", \"area2\"],\n    \"code_quality_score\": 0-100,\n    \"popularity_score\": 0-100,\n    \"documentation_score\": 0-100,\n    \"recommendations\": [\"rec1\", \"rec2\"]\n}\nMake your review specific, constructive, and focused on real improvement."
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

def analyze_learning_progress(goal_title: str, category: str, progress: str, description: Optional[str] = None, chat_history: Optional[list] = None) -> dict:
    try:
        chat_str = ""
        if chat_history:
            for i, turn in enumerate(chat_history):
                role = turn.get("role", "user")
                label = "User" if role == "user" else "AI"
                chat_str += f"Turn {i+1} - {label}: {turn.get('message', '')}\n"
        else:
            chat_str = "No previous chat.\n"

        progress_str = progress if progress and progress.strip() else "User is starting now."

        prompt = (
            "You are a learning mentor for developers. You will help the user achieve their coding goal through an iterative, chat-based process.\n\n"
            "Below is the chat history between the user and the AI. Each turn is clearly labeled as 'User' or 'AI'.\n---\n"
            f"{chat_str}"
            "---\n"
            "The user has just entered NEW PROGRESS (since the last message):\n"
            f"{progress_str}\n"
            "This is their latest GitHub data (profile, repos, etc) as context (if provided by the frontend).\n\n"
            f"Goal: {goal_title}\n"
            f"Category: {category}\n"
            f"Description: {description if description else ''}\n\n"
            "Your task:\n"
            "- Focus your suggestions on the user's most recent progress and their current context.\n"
            "- Use the chat history to avoid repeating advice and to build on previous suggestions.\n"
            "- Reply ONLY in this JSON format:\n"
            '{\n'
            '    "suggestions": ["suggestion1", "suggestion2", "suggestion3"],\n'
            '    "next_steps": ["step1", "step2", "step3"],\n'
            '    "estimated_time": "X hours/days/weeks",\n'
            '    "resources": ["resource1", "resource2", "resource3"]\n'
            '}\n'
            "Keep suggestions practical, actionable, and tailored to the user's latest progress."
        )
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

@app.post("/analyze-dev-profile", response_model=DevAnalysisResponse)
async def analyze_developer_profile_endpoint(request: DevAnalysisRequest):
    try:
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(
            executor,
            analyze_developer_profile,
            request
        )
        if not analysis or not isinstance(analysis, dict) or "summary" not in analysis:
            logger.error("AI analysis not available for developer profile.")
            raise HTTPException(status_code=503, detail="AI analysis not available for developer profile.")
        logger.info(f"Final DevAnalysisResponse: {analysis}")
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
            project_complexity=None,
            coding_patterns=None,
            ai_success=False,
            source="fallback"
        )

@app.post("/analyze-repo", response_model=RepoAnalysisResponse)
async def analyze_repo_endpoint(request: RepoAnalysisRequest):
    try:
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(
            executor,
            analyze_repo_profile,
            request
        )
        if not analysis or not isinstance(analysis, dict) or "summary" not in analysis:
            logger.error("AI analysis not available for repository.")
            raise HTTPException(status_code=503, detail="AI analysis not available for repository.")
        logger.info(f"Final RepoAnalysisResponse: {analysis}")
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

@app.post("/analyze-goal", response_model=LearningAnalysisResponse)
async def analyze_goal_endpoint(request: LearningAnalysisRequest):
    try:
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(
            executor,
            analyze_learning_progress,
            request.goal_title,
            request.category,
            request.current_progress,
            request.description,
            request.chat_history
        )
        if not analysis or not isinstance(analysis, dict) or "suggestions" not in analysis:
            logger.error("AI analysis not available for goal.")
            raise HTTPException(status_code=503, detail="AI analysis not available for goal.")
        logger.info(f"Final LearningAnalysisResponse: {analysis}")
        return LearningAnalysisResponse(**analysis)
    except Exception as e:
        logger.error(f"Goal analysis error: {str(e)}")
        logger.warning("Exception in goal endpoint, using fallback.")
        return LearningAnalysisResponse(
            suggestions=["Keep practicing consistently", "Break complex topics into smaller parts"],
            next_steps=["Review fundamentals", "Build a small project"],
            estimated_time="Varies based on complexity",
            resources=["Documentation", "Online tutorials"]
        )