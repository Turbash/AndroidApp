import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { getGoals, Goal } from '../../utils/storage';

export default function HomeScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const goalItemBg = useThemeColor({ light: '#f3f3f3', dark: '#333' }, 'background');

  // Fetch goals when screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadGoals = async () => {
        setRefreshing(true);
        const data = await getGoals();
        if (isActive) setGoals(data);
        setRefreshing(false);
      };
      loadGoals();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderGoal = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      style={[styles.goalItem, { backgroundColor: goalItemBg }]}
      onPress={() => router.push({ pathname: '/goal-details', params: { id: item.id } })}
    >
      <ThemedText style={styles.goalTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.goalCategory}>{item.category}</ThemedText>
      <ThemedText style={styles.goalStatus}>{item.completed ? '✅ Done' : '⏳ In Progress'}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Your Learning Goals</ThemedText>
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={renderGoal}
        ListEmptyComponent={<ThemedText>No goals yet. Add one!</ThemedText>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            getGoals().then(data => {
              setGoals(data);
              setRefreshing(false);
            });
          }} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  goalItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalCategory: {
    fontSize: 14,
    color: '#666',
  },
  goalStatus: {
    marginTop: 4,
    fontSize: 14,
  },
});