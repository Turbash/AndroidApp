import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function MLInsightsFooter({ aiSuccess, source, cardBg }: { aiSuccess: boolean; source: string; cardBg: string }) {
  return (
    <ThemedView style={[styles.section, { backgroundColor: cardBg }]}>
      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
        AI Success: {aiSuccess ? "Yes" : "No"} | Source: {source}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
});
