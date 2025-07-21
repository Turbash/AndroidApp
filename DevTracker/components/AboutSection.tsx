import React from 'react';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { InfoCard } from './InfoCard';
import { StyleSheet } from 'react-native';

export function AboutSection() {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>About</ThemedText>
      <InfoCard>
        <ThemedText type="defaultSemiBold">DevTracker v1.0</ThemedText>
        <ThemedText>Smart Developer Progress Tracker</ThemedText>
        <ThemedText style={styles.subtitle}>
          Built with ❤️ for the developer community
        </ThemedText>
      </InfoCard>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
});
