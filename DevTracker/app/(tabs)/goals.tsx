import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useColorScheme } from '../../hooks/useColorScheme';

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
  const accentColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: accentColor }]} 
        onPress={() => setAdding(!adding)}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.addButtonText}>
          {adding ? '✕ Cancel' : '+ Add New Goal'}
        </ThemedText>
      </TouchableOpacity>

      {adding && (
        <View style={[styles.form, { backgroundColor: cardColor }]}>
          <TextInput
            style={[styles.input, { borderColor }]}
            placeholder="Goal Title"
            placeholderTextColor={useThemeColor({}, 'secondary')}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, { borderColor }]}
            placeholder="Description"
            placeholderTextColor={useThemeColor({}, 'secondary')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <TextInput
            style={[styles.input, { borderColor }]}
            placeholder="Category"
            placeholderTextColor={useThemeColor({}, 'secondary')}
            value={category}
            onChangeText={setCategory}
          />
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: successColor }]} 
            onPress={handleAddGoal}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.saveButtonText}>Save Goal</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.goalsList}>
        {goals.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: cardColor }]}>
            <ThemedText type="subtitle" style={styles.emptyTitle}>No Goals Yet</ThemedText>
            <ThemedText type="body" style={styles.emptyDescription}>
              Create your first learning goal to get started
            </ThemedText>
          </View>
        )}
        {goals.map(goal => (
          <TouchableOpacity 
            key={goal.id} 
            onPress={() => handleGoalPress(goal)}
            activeOpacity={0.7}
          >
            <View style={[styles.goalCard, { backgroundColor: cardColor }]}>
              <View style={styles.goalHeader}>
                <TouchableOpacity 
                  onPress={() => toggleGoalCompleted(goal.id)}
                  style={[
                    styles.checkbox,
                    { 
                      backgroundColor: goal.completed ? successColor : 'transparent',
                      borderColor: goal.completed ? successColor : borderColor
                    }
                  ]}
                  activeOpacity={0.7}
                >
                  {goal.completed && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </TouchableOpacity>
                
                <View style={styles.goalContent}>
                  <ThemedText type="label" style={styles.goalTitle}>
                    {goal.title}
                  </ThemedText>
                  {goal.category && (
                    <View style={[styles.categoryBadge, { backgroundColor: accentColor }]}>
                      <ThemedText style={styles.categoryText}>{goal.category}</ThemedText>
                    </View>
                  )}
                </View>

                <TouchableOpacity 
                  onPress={() => deleteGoal(goal.id)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[styles.deleteButtonText, { color: errorColor }]}>
                    ✕
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              {goal.description && (
                <ThemedText type="body" style={styles.goalDescription}>
                  {goal.description}
                </ThemedText>
              )}
              
              <View style={styles.goalFooter}>
                <ThemedText 
                  type="caption" 
                  style={[
                    styles.goalStatus,
                    { color: goal.completed ? successColor : accentColor }
                  ]}
                >
                  {goal.completed ? 'Completed' : 'In Progress'}
                </ThemedText>
                {goal.progressNotes && goal.progressNotes.length > 0 && (
                  <ThemedText type="caption" style={styles.progressCount}>
                    {goal.progressNotes.length} updates
                  </ThemedText>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  form: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 48,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  goalsList: {
    flex: 1,
  },
  emptyState: {
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
    marginTop: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyDescription: {
    opacity: 0.7,
    textAlign: 'center',
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  goalContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTitle: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  goalDescription: {
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalStatus: {
    fontWeight: '600',
  },
  progressCount: {
    opacity: 0.6,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});