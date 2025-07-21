import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  progressNotes: string[];
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddGoal = () => {
    if (!title.trim()) return;
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        title,
        description,
        category,
        completed: false,
        progressNotes: [],
      },
    ]);
    setTitle('');
    setDescription('');
    setCategory('');
    setAdding(false);
  };

  return (
    <ThemedView style={styles.container}>
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
          <ThemedView key={goal.id} style={styles.goalCard}>
            <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
            <ThemedText style={styles.goalCategory}>{goal.category}</ThemedText>
            <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>
            <ThemedText style={styles.goalStatus}>
              Status: {goal.completed ? '✅ Completed' : '⏳ In Progress'}
            </ThemedText>
            {/* Advice and progress UI can be added here */}
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
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
  goalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    marginBottom: 6,
  },
  goalStatus: {
    fontSize: 13,
    marginTop: 4,
    color: '#007AFF',
  },
});
