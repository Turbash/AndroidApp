import AsyncStorage from '@react-native-async-storage/async-storage';

export type Goal = {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  progress: { date: string; note: string }[];
};

const GOALS_KEY = 'DEVTRACKER_GOALS';

export async function getGoals(): Promise<Goal[]> {
  const data = await AsyncStorage.getItem(GOALS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export async function addGoal(goal: Goal): Promise<void> {
  const goals = await getGoals();
  goals.push(goal);
  await saveGoals(goals);
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const goals = await getGoals();
  return goals.find(g => g.id === id) || null;
}

export async function updateGoal(updatedGoal: Goal): Promise<void> {
  const goals = await getGoals();
  const idx = goals.findIndex(g => g.id === updatedGoal.id);
  if (idx !== -1) {
    goals[idx] = updatedGoal;
    await saveGoals(goals);
  }
}

export async function markGoalCompleted(id: string): Promise<void> {
  const goals = await getGoals();
  const idx = goals.findIndex(g => g.id === id);
  if (idx !== -1) {
    goals[idx].completed = true;
    await saveGoals(goals);
  }
}

export async function deleteGoal(id: string): Promise<void> {
  const goals = await getGoals();
  const filtered = goals.filter(g => g.id !== id);
  await saveGoals(filtered);
}
