import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';
import uuid from 'react-native-uuid';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useThemeColor } from '../../hooks/useThemeColor';
import { addGoal, Goal } from '../../utils/storage';

export default function AddGoalScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#666' : '#ccc';
  const placeholderColor = colorScheme === 'dark' ? '#666' : '#999';

  const handleSubmit = async () => {
    console.log('Save button pressed');
    try {
      if (!title.trim()) {
        Alert.alert('Title is required');
        return;
      }
      const newGoal: Goal = {
        id: uuid.v4() as string, 
        title,
        description,
        category,
        completed: false,
        progress: [],
      };
      await addGoal(newGoal);
      setTitle('');
      setDescription('');
      setCategory('');
      console.log('Goal saved!');
      Alert.alert(
        'Success',
        'Goal saved!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ],
        { cancelable: false }
      );
    } catch (e) {
      console.error('Error saving goal:', e);
      Alert.alert('Error', 'Something went wrong while saving the goal.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Add a New Goal</ThemedText>
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
        placeholder="Category (e.g. React, DSA)"
        placeholderTextColor={placeholderColor}
        value={category}
        onChangeText={setCategory}
      />
      <Button title="Save Goal" onPress={handleSubmit} />
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