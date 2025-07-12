import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GoalDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Details</Text>
      {/* Details content will go here */}
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
});
