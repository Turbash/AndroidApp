# DevTracker – Your Personal Learning Progress Tracker

DevTracker is a simple, offline-first mobile app for tech students to track their learning goals and progress. Built with React Native and Expo, it helps you organize what you're learning, log progress, and stay motivated.

## Features

- **Add Learning Goals:** Example: “Finish React course”
- **Update Progress:** Add notes like “Completed Lesson 5”
- **Mark as Done:** Mark goals as completed and reflect back later
- **Stats:** See total goals, % complete, and more

## Screens

- **Home:** List all your goals
- **Add Goal:** Create a new goal (title, description, category)
- **Goal Details:** View goal info and progress updates
- **Add Progress:** Log what you did today
- **Stats:** See your learning stats

## Data Storage

- All data is stored locally on your device using [AsyncStorage](https://react-native-async-storage.github.io/async-storage/).
- No backend or authentication required.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

3. **Open on your device**
   - Use Expo Go app, Android emulator, or iOS simulator.

## Project Structure

- `app/` – All screens and navigation
- `components/` – Reusable UI components
- `utils/storage.ts` – AsyncStorage helpers for saving/loading data

## Why DevTracker?

Tech students often lose track of their learning progress. DevTracker keeps everything organized, focused, and easy to review—without the complexity of most productivity apps.

## License

MIT

---
> This folder is part of a larger repository. For root-level instructions, see the main `README.md`.
