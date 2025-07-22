import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { SettingButton } from './SettingButton';

export function DataSection({ onClearCache }: { onClearCache: () => void }) {
  return (
    <View style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Data</ThemedText>
      <SettingButton
        title="Clear Cache"
        subtitle="Clear all cached GitHub data"
        onPress={onClearCache}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
});
