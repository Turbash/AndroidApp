# DevTracker – Smart Developer Progress Tracker 🚀

DevTracker is an intelligent mobile app that automatically tracks your coding progress by integrating with GitHub and other developer tools. Built with React Native and Expo, it provides real insights into your development journey without manual data entry.

**No more manual progress logs – let your GitHub activity tell the story!**

## ✨ Why DevTracker?

**The Problem:** Developers struggle to track their learning progress, forget what they've built, and can't see their growth over time. Most progress trackers are just glorified todo lists.

**The Solution:** DevTracker automatically analyzes your GitHub activity and provides intelligent insights about your coding journey, while allowing you to set meaningful learning goals.

**The Impact:** See your real development progress, track which technologies you're mastering, and get AI-powered recommendations for your next learning steps.

---

## 🎯 Core Features

### 🔗 Smart GitHub Integration
- **Automatic Repository Tracking:** All your repos with languages, descriptions, and update status
- **Commit Analysis:** Recent commits with messages, authors, and timestamps
- **Language Analytics:** Real-time breakdown of programming languages you're using
- **Repository Deep Dive:** Detailed views with commit history and language percentages

### 📊 Intelligent Dashboard
- **Real Developer Profile:** GitHub avatar, username, and repository statistics
- **Activity Timeline:** Recent coding activity across all your projects
- **Language Trends:** See which technologies you're actively working with
- **Progress Visualization:** Visual representation of your coding journey

### 🎯 Goal Management System
- **Learning Objectives:** Set goals tied to real technologies and projects
- **Progress Tracking:** Add detailed notes about what you learned or built
- **Smart Categories:** Organize goals by technology stack (React, Python, Machine Learning, etc.)
- **Completion Analytics:** Track goal completion rates and learning velocity

### 📱 Developer-Focused Experience
- **Theme Support:** Beautiful light/dark mode that adapts to your preference
- **Offline Functionality:** Goals and progress work without internet
- **Cross-Platform:** Works seamlessly on Android and iOS
- **Real-Time Sync:** Live updates from your GitHub activity

---

## 🛠️ Technical Stack

- **Frontend:** React Native with Expo Router
- **Language:** TypeScript for type safety and better developer experience
- **Storage:** AsyncStorage for local data persistence
- **APIs:** GitHub REST API for repository and commit data
- **Navigation:** Expo Router with tab and stack navigation
- **UI:** Custom themed components with automatic dark/light mode
- **External Links:** Expo Web Browser for in-app GitHub viewing

---

## 📱 App Architecture

### Screens Structure
```
├── 📱 Tabs Navigation
│   ├── 🏠 Dashboard (GitHub integration + Goals overview)
│   ├── ➕ Add Goal (Create learning objectives)
│   └── 📊 Stats (Progress analytics)
├── 🔍 Repository Details (Commits, languages, GitHub link)
├── 📝 Goal Details (Progress updates, edit/delete options)
├── ✏️ Edit Goal (Modify existing goals)
├── 📈 Add Progress (Log learning updates)
├── 🔗 GitHub Connect (Link your GitHub account)
└── 🚫 Not Found (404 handling)
```

### Data Flow
```
GitHub API → Repository Data → Smart Dashboard
    ↓
Local Storage ← User Goals ← Manual Input
    ↓
Analytics Engine → Progress Insights → User Interface
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Android Studio (for Android testing) or Xcode (for iOS testing)
- A GitHub account for integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/DevTracker.git
   cd DevTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required Expo packages**
   ```bash
   npx expo install @react-native-async-storage/async-storage
   npx expo install react-native-uuid @types/uuid
   npx expo install expo-web-browser
   npx expo install @expo/vector-icons
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan QR code with Expo Go app
   - Or use Android/iOS simulator

### First-Time Setup
1. Open DevTracker
2. Tap "Connect GitHub" on the dashboard
3. Enter your GitHub username
4. Start exploring your real development data!

---

## 💡 How It Works

### Automatic Tracking
1. **Connect GitHub:** Simply enter your GitHub username
2. **Data Fetching:** DevTracker automatically pulls your repositories, commits, and languages
3. **Real-Time Updates:** Your dashboard updates with fresh data every time you open the app
4. **Smart Analysis:** See which languages you're using most and track your recent activity

### Goal Management
1. **Set Learning Goals:** Create objectives like "Learn React Hooks" or "Build a REST API"
2. **Track Progress:** Add notes about what you learned, built, or debugged
3. **Visual Progress:** See completion rates and track your learning velocity
4. **GitHub Connection:** Goals can reference specific repositories or technologies

### Repository Insights
1. **Repository Overview:** See all your repos with languages and descriptions
2. **Commit Analysis:** Recent commits with messages and timestamps
3. **Language Breakdown:** Percentage breakdown of languages in each repository
4. **Activity Tracking:** Monitor which projects you're actively working on

---

## 🎯 Target Users

- **Bootcamp Students:** Track learning progress through coursework and projects
- **Self-Taught Developers:** Monitor skill development and project completion
- **Professional Developers:** Analyze coding patterns and technology usage
- **Open Source Contributors:** Track contributions across multiple projects
- **Tech Students:** Connect academic learning with real-world coding

---

## 🔮 Roadmap & Future Features

### Phase 2: Enhanced Intelligence
- **Hackatime Integration:** Real coding time tracking
- **AI Recommendations:** Smart suggestions for next technologies to learn
- **Skill Progression:** Automated skill level assessment based on code activity
- **Project Analysis:** Deep insights into your coding patterns

### Phase 3: Social & Collaboration
- **Developer Community:** Connect with other learners
- **Progress Sharing:** Share achievements and milestones
- **Mentorship Features:** Connect with experienced developers
- **Team Tracking:** Track progress in group projects

### Phase 4: Advanced Analytics
- **Coding Streak Tracking:** Monitor consistency in development activity
- **Technology Trends:** See how your skills align with industry trends
- **Career Insights:** Track progress toward specific developer roles
- **Resource Recommendations:** Curated learning resources based on your activity

---

## 🏆 Why DevTracker Stands Out

### vs. Traditional Todo Apps
- ❌ **Todo Apps:** Manual entry, fake progress, no real insights
- ✅ **DevTracker:** Automatic tracking, real GitHub data, intelligent analytics

### vs. Generic Progress Trackers
- ❌ **Generic Apps:** One-size-fits-all, no developer focus
- ✅ **DevTracker:** Built specifically for developers, understands code and projects

### vs. GitHub Alone
- ❌ **GitHub:** Raw data, no learning context, no goal tracking
- ✅ **DevTracker:** GitHub data + learning goals + progress insights

---

## 🛠️ Development

### Built for Hack Club Ship 2024
This project represents 30+ hours of dedicated development and showcases:

- **Real-world API Integration** with GitHub REST API
- **Modern React Native Architecture** using Expo Router
- **TypeScript Implementation** for type safety and scalability
- **Cross-platform Mobile Development** for Android and iOS
- **User Experience Design** with automatic theme support
- **Data Management** combining local storage with external APIs

### Code Quality
- Comprehensive TypeScript typing
- Modular component architecture
- Consistent theming system
- Error handling and loading states
- Responsive design patterns

---

## 🤝 Contributing

DevTracker is open-source and welcomes contributions! Areas where you can help:

- **Feature Development:** Add new GitHub integrations or analytics
- **UI/UX Improvements:** Enhance the user interface and experience
- **API Integrations:** Add support for GitLab, Bitbucket, or other platforms
- **Analytics Engine:** Improve the intelligence of progress tracking
- **Documentation:** Help improve setup guides and feature documentation

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Hack Club** for providing the platform and inspiration
- **GitHub API** for enabling real developer data integration
- **Expo Team** for the excellent React Native framework
- **React Native Community** for continuous innovation

---

**DevTracker: Where your GitHub activity meets your learning goals. Track your coding journey with real data, not just todo lists.** 

*Built with ❤️ for the developer community*