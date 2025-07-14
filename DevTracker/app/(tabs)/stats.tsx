import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getGoals, Goal } from '../../utils/storage';

export default function StatsScreen() {
  const [stats, setStats] = useState({ total: 0, completed: 0, percent: 0 });

  useEffect(() => {
    getGoals().then((goals: Goal[]) => {
      const total = goals.length;
      const completed = goals.filter(g => g.completed).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      setStats({ total, completed, percent });
    });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Stats</ThemedText>
      <ThemedText style={styles.stat}>Total Goals: {stats.total}</ThemedText>
      <ThemedText style={styles.stat}>Completed Goals: {stats.completed}</ThemedText>
      <ThemedText style={styles.stat}>Completion: {stats.percent}%</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  stat: {
    fontSize: 18,
    marginBottom: 12,
  },
});