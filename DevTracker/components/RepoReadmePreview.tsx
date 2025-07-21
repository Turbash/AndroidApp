import React from 'react';
import { ThemedText } from './ThemedText';
import { InfoCard } from './InfoCard';

export function RepoReadmePreview({ readme }: { readme: string }) {
  return (
    <InfoCard>
      <ThemedText style={{ fontSize: 14, lineHeight: 20 }}>
        {readme.substring(0, 500)}...
      </ThemedText>
    </InfoCard>
  );
}
