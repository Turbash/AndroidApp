import React from 'react';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { InfoCard } from './InfoCard';
import { SettingButton } from './SettingButton';
import { StyleSheet } from 'react-native';

export function AccountSection({
  githubUsername,
  onLogout,
  onConnect,
}: {
  githubUsername: string | null;
  onLogout: () => void;
  onConnect: () => void;
}) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Account</ThemedText>
      {githubUsername ? (
        <>
          <InfoCard>
            <ThemedText>Connected as: @{githubUsername}</ThemedText>
          </InfoCard>
          <SettingButton
            title="Disconnect GitHub"
            onPress={onLogout}
            danger={true}
          />
        </>
      ) : (
        <>
          <InfoCard>
            <ThemedText>No GitHub account connected</ThemedText>
          </InfoCard>
          <SettingButton
            title="Connect GitHub"
            onPress={onConnect}
          />
        </>
      )}
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
