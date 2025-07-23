import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { InfoCard } from './InfoCard';
import { SettingButton } from './SettingButton';
import { useThemeColor } from '../hooks/useThemeColor';

export function AccountSection({
  githubUsername,
  onLogout,
  onConnect,
}: {
  githubUsername: string | null;
  onLogout: () => void;
  onConnect: () => void;
}) {
  const accentColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  
  const cardColor = useThemeColor({}, 'card');
  return (
    <View style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Account</ThemedText>
      {githubUsername ? (
        <>
          <View style={[styles.connectedCard, { backgroundColor: cardColor, borderRadius: 16, width: '100%' }]}> 
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: successColor }]} />
              <ThemedText type="body" style={styles.statusText}>Connected</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.usernameText}>
              @{githubUsername}
            </ThemedText>
          </View>
          <SettingButton
            title="Disconnect GitHub"
            onPress={onLogout}
            danger={true}
          />
        </>
      ) : (
        <>
          <View style={[styles.disconnectedCard, { backgroundColor: cardColor, borderRadius: 16, width: '100%' }]}> 
            <View style={styles.statusRow}>
              <View style={styles.statusDotDisconnected} />
              <ThemedText type="body" style={styles.statusText}>Not Connected</ThemedText>
            </View>
            <ThemedText type="body" style={styles.disconnectedText}>
              Connect your GitHub account to track your development progress
            </ThemedText>
          </View>
          <SettingButton
            title="Connect GitHub"
            onPress={onConnect}
          />
        </>
      )}
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
  connectedCard: {
    padding: 20,
    marginBottom: 12,
  },
  disconnectedCard: {
    padding: 20,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotDisconnected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  usernameText: {
    fontSize: 18,
  },
  disconnectedText: {
    opacity: 0.7,
    lineHeight: 20,
  },
});
