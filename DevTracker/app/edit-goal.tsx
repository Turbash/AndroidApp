import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '../hooks/useThemeColor';
import { getGoalById, Goal, updateGoal } from '../utils/storage';

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (id) {
      getGoalById(id as string).then(g => {
        if (g) {
          setGoal(g);
          setTitle(g.title);
          setDescription(g.description);
          setCategory(g.category);
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!goal) return;
    if (!title.trim()) {
      Alert.alert('Title is required');
      return;
    }
    const updatedGoal: Goal = {
      ...goal,
      title,
      description,
      category,
    };
    await updateGoal(updatedGoal);
    Alert.alert('Success', 'Goal updated!', [
      { text: 'OK', onPress: () => router.replace({ pathname: '/goal-details', params: { id: goal.id } }) },
    ]);
  };

  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#666' : '#ccc';
  const placeholderColor = colorScheme === 'dark' ? '#666' : '#999';

  if (!goal) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Goal not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Edit Goal</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        placeholder="Title"
        placeholderTextColor={placeholderColor}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        placeholder="Description"
        placeholderTextColor={placeholderColor}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        placeholder="Category"
        placeholderTextColor={placeholderColor}
        value={category}
        onChangeText={setCategory}
      />
      <Button title="Save Changes" onPress={handleSave} />
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
  },
});