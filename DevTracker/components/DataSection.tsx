import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { SettingButton } from './SettingButton';

export function DataSection({ onClearCache }: { onClearCache: () => void }) {
  const cardColor = useThemeColor({}, 'card');
  return (
    <View style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Data</ThemedText>
      <View style={{ backgroundColor: cardColor, borderRadius: 16, width: '100%', marginBottom: 12 }}>
        <SettingButton
          title="Clear Cache"
          subtitle="Clear all cached GitHub data"
          onPress={onClearCache}
        />
      </View>
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
