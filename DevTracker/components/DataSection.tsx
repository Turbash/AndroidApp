import React from 'react';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { SettingButton } from './SettingButton';
import { StyleSheet } from 'react-native';

export function DataSection({ onClearCache }: { onClearCache: () => void }) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Data</ThemedText>
      <SettingButton
        title="Clear Cache"
        onPress={onClearCache}
      />
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
});
