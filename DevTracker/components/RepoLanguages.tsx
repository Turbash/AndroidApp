import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';

export function RepoLanguages({
  languages,
  totalBytes,
  subtleTextColor,
}: {
  languages: Record<string, number>;
  totalBytes: number;
  subtleTextColor: string;
}) {
  const accentColor = useThemeColor({}, 'tint');
  
  return (
    <ThemedView variant="surface" style={styles.container}>
      {Object.entries(languages).map(([lang, bytes]) => (
        <View key={lang} style={styles.languageRow}>
          <View style={styles.languageInfo}>
            <ThemedText type="body" style={styles.languageName}>{lang}</ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.round((bytes / totalBytes) * 100)}%`,
                    backgroundColor: accentColor 
                  }
                ]} 
              />
            </View>
          </View>
          <ThemedText type="caption" style={[styles.percentage, { color: subtleTextColor }]}>
            {Math.round((bytes / totalBytes) * 100)}%
          </ThemedText>
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageInfo: {
    flex: 1,
    marginRight: 12,
  },
  languageName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  percentage: {
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});
