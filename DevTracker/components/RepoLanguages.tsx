import React from 'react';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

export function RepoLanguages({
  languages,
  totalBytes,
  subtleTextColor,
}: {
  languages: Record<string, number>;
  totalBytes: number;
  subtleTextColor: string;
}) {
  return (
    <ThemedView style={{ padding: 12, borderRadius: 8 }}>
      {Object.entries(languages).map(([lang, bytes]) => (
        <ThemedView key={lang} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <ThemedText>{lang}</ThemedText>
          <ThemedText style={{ color: subtleTextColor }}>
            {Math.round((bytes / totalBytes) * 100)}%
          </ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}
