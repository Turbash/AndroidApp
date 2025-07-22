import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function RepoReadmePreview({ readme }: { readme: string }) {
  return (
    <ThemedView variant="surface" style={styles.container}>
      <ThemedText type="body" style={styles.readmeText}>
        {readme.substring(0, 500)}...
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    maxHeight: 200,
  },
  readmeText: {
    lineHeight: 22,
    opacity: 0.9,
  },
});
