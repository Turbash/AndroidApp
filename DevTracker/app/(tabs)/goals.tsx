import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  progressNotes: string[];
}

const GOALS_STORAGE_KEY = 'DEVTRACKER_GOALS';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const accentColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');
  const router = useRouter();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) setGoals(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load goals:', e);
    }
  };

  const saveGoals = async (newGoals: Goal[]) => {
    setGoals(newGoals);
    try {
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
    } catch (e) {
      console.error('Failed to save goals:', e);
    }
  };

  const handleAddGoal = () => {
    if (!title.trim()) return;
    const newGoals = [
      ...goals,
      {
        id: Date.now().toString(),
        title,
        description,
        category,
        completed: false,
        progressNotes: [],
      },
    ];
    saveGoals(newGoals);
    setTitle('');
    setDescription('');
    setCategory('');
    setAdding(false);
  };

  const toggleGoalCompleted = (id: string) => {
    const newGoals = goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    saveGoals(newGoals);
  };

  const deleteGoal = (id: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newGoals = goals.filter(goal => goal.id !== id);
            saveGoals(newGoals);
          },
        },
      ]
    );
  };

  const handleGoalPress = (goal: Goal) => {
    router.push({
      pathname: '/goal-details',
      params: { goalId: goal.id }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title" style={styles.header}>🎯 Your Goals</ThemedText>
      <TouchableOpacity style={styles.addButton} onPress={() => setAdding(!adding)}>
        <ThemedText style={styles.addButtonText}>{adding ? 'Cancel' : '➕ Add Goal'}</ThemedText>
      </TouchableOpacity>
      {adding && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Goal Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddGoal}>
            <ThemedText style={styles.saveButtonText}>Save Goal</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView style={styles.goalsList}>
        {goals.length === 0 && (
          <ThemedText style={styles.emptyState}>No goals yet. Add one to get started!</ThemedText>
        )}
        {goals.map(goal => (
          <TouchableOpacity key={goal.id} onPress={() => handleGoalPress(goal)}>
            <ThemedView style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <TouchableOpacity onPress={() => toggleGoalCompleted(goal.id)}>
                  <ThemedText style={styles.goalStatus}>
                    {goal.completed ? '✅' : '⬜️'}
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                  <ThemedText style={styles.deleteButton}>🗑️</ThemedText>
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.goalCategory}>{goal.category}</ThemedText>
              <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>
              <ThemedText style={styles.goalStatusText}>
                Status: {goal.completed ? '✅ Completed' : '⏳ In Progress'}
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  goalsList: {
    flex: 1,
  },
  emptyState: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 32,
  },
  goalCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitle: {
    color:'#000000',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  goalCategory: {
    color: '#000000',
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  goalDescription: {
    color: '#000000',
    fontSize: 14,
    marginBottom: 6,
  },
  goalStatus: {
    fontSize: 20,
    marginRight: 8,
  },
  goalStatusText: {
    fontSize: 13,
    marginTop: 4,
    color: '#007AFF',
  },
  deleteButton: {
    fontSize: 18,
    marginLeft: 8,
    color: '#ef4444',
  },
});