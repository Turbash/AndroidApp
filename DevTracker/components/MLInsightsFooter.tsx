import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

export function MLInsightsFooter({ aiSuccess, source }: { aiSuccess: boolean; source: string }) {
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  
  return (
    <ThemedView variant="surface" style={styles.section}>
      <ThemedText type="caption" style={styles.footerText}>
        AI Status: 
        <ThemedText style={[styles.statusText, { color: aiSuccess ? successColor : errorColor }]}>
          {aiSuccess ? " ✅ Success" : " ❌ Failed"}
        </ThemedText>
        {" | Source: " + source}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  statusText: {
    fontWeight: '600',
  },
});
