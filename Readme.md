## DevTracker

DevTracker is a productivity app for developers. Track your learning goals, coding progress, and get real GitHub stats and AI-powered suggestions. The app has a Python backend (API, GitHub integration, AI) and a React Native mobile frontend (goal tracking, stats, UI).

### Features
- Track coding goals and progress
- Add progress notes and mark goals complete
- View GitHub stats and recent activity
- Get AI-powered suggestions for your learning
- Connect your GitHub account for personalized insights

### Requirements
- Node.js (v18+)
- Python 3.10+
- Expo CLI

### Environment Setup
1. Create a `.env` file in `DevTracker/` and set your backend URL:
	```
	EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
	```
	(Change the URL if your backend runs elsewhere)
2. Create a `.env` file in `Backend/` and set your GitHub OAuth credentials:
	```
	GITHUB_CLIENT_ID=your_github_client_id
	GITHUB_CLIENT_SECRET=your_github_client_secret
	GITHUB_OAUTH_REDIRECT_URI=http://localhost:8000/oauth/callback
	```
	(Replace with your actual GitHub OAuth app credentials and redirect URI)

### How to Run
1. Install backend dependencies: `cd Backend && pip install -r requirements.txt`
2. Install frontend dependencies: `cd DevTracker && npm install`
3. Start backend: `cd Backend && python3 main.py`
4. Start mobile app: `cd DevTracker && npx expo start`