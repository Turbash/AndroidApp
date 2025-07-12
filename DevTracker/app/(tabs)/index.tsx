import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Learning Goals</Text>
      {/* Example navigation buttons */}
      <Button
        title="Go to Goal Details"
        onPress={() => router.push('/goal-details')}
      />
      <Button
        title="Add Progress"
        onPress={() => router.push('/add-progress')}
      />
      {/* Later: List of goals will go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    marginBottom: 10,
  }
});
