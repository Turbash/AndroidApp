import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AddProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Progress</Text>
      {/* Add progress form will go here */}
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
