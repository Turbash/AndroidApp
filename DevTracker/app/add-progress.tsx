import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import { getGoalById, Goal, updateGoal } from '../utils/storage';

export default function AddProgressScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const router = useRouter();
  const [note, setNote] = useState('');

  const handleAddProgress = async () => {
    if (!goalId) return;
    if (!note.trim()) {
      Alert.alert('Please enter your progress note.');
      return;
    }
    const goal = await getGoalById(goalId as string);
    if (!goal) {
      Alert.alert('Goal not found.');
      return;
    }
    const newProgress = {
      date: new Date().toISOString(),
      note,
    };
    const updatedGoal: Goal = {
      ...goal,
      progress: [...goal.progress, newProgress],
    };
    await updateGoal(updatedGoal);
    setNote('');
    Alert.alert('Progress added!', '', [
      { text: 'OK', onPress: () => router.replace({ pathname: '/goal-details', params: { id: goalId } }) },
    ]);
  };

  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#666' : '#ccc';
  const placeholderColor = colorScheme === 'dark' ? '#666' : '#999';

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Add Progress Update</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        placeholder="What did you do today?"
        placeholderTextColor={placeholderColor}
        value={note}
        onChangeText={setNote}
        multiline
      />
      <Button title="Add Progress" onPress={handleAddProgress} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    minHeight: 60,
  },
});