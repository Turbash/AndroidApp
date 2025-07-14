import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import { Collapsible } from '../components/Collapsible';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { deleteGoal, getGoals, Goal, markGoalCompleted } from '../utils/storage';

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);

  const loadGoal = async () => {
    if (id) {
      const goals = await getGoals();
      const found = goals.find(g => g.id === id);
      setGoal(found || null);
    }
  };

  useEffect(() => {
    loadGoal();
  }, [id]);

  const handleMarkCompleted = async () => {
    if (!id) return;
    await markGoalCompleted(id);
    Alert.alert('Marked as completed!');
    loadGoal();
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteGoal(id);
    Alert.alert('Goal deleted!');
    router.replace('/'); 
  };

  if (!goal) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Goal not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{goal.title}</ThemedText>
      <ThemedText style={styles.label}>Category: <ThemedText style={styles.value}>{goal.category}</ThemedText></ThemedText>
      <ThemedText style={styles.label}>Description:</ThemedText>
      <ThemedText style={styles.value}>{goal.description}</ThemedText>
      <ThemedText style={styles.label}>Status: <ThemedText style={styles.value}>{goal.completed ? '✅ Done' : '⏳ In Progress'}</ThemedText></ThemedText>
      <View style={{ height: 12 }} />

      {!goal.completed && (
        <Button title="Mark as Completed" onPress={handleMarkCompleted} />
      )}
      <View style={{ height: 12 }} />
      <Button
        title="Edit Goal"
        onPress={() => router.push({ pathname: '/edit-goal', params: { id: goal.id } })}
      />
      <View style={{ height: 12 }} />
      <Button title="Delete Goal" color="red" onPress={handleDelete} />
      <View style={{ height: 12 }} />
      <Button
        title="Add Progress Update"
        onPress={() => router.push({ pathname: '/add-progress', params: { goalId: goal.id } })}
      />
      <Collapsible title="Progress Updates">
        {goal.progress.map((p, index) => (
          <ThemedView key={index} style={{ marginBottom: 8 }}>
            <ThemedText>{new Date(p.date).toLocaleDateString()}</ThemedText>
            <ThemedText>{p.note}</ThemedText>
          </ThemedView>
        ))}
      </Collapsible>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  value: {
    fontWeight: 'normal',
  },
});







