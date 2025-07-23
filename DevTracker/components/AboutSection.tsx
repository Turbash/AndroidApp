import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

export function AboutSection() {
  const accentColor = useThemeColor({}, 'tint');
  
  const cardColor = useThemeColor({}, 'card');
  return (
    <View style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>About</ThemedText>
      <View style={[styles.aboutCard, { backgroundColor: cardColor, borderRadius: 16, width: '100%' }]}> 
        <View style={styles.appIconContainer}>
          <ThemedText style={styles.appIcon}>📱</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.appName}>
          DevTracker v1.0
        </ThemedText>
        <ThemedText type="body" style={styles.appDescription}>
          Smart Developer Progress Tracker
        </ThemedText>
        <ThemedText type="caption" style={[styles.subtitle, { color: accentColor }]}> 
          Built with ❤️ for the developer community
        </ThemedText>
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
  aboutCard: {
    padding: 24,
    alignItems: 'center',
  },
  appIconContainer: {
    marginBottom: 16,
  },
  appIcon: {
    fontSize: 48,
  },
  appName: {
    marginBottom: 8,
    textAlign: 'center',
  },
  appDescription: {
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
