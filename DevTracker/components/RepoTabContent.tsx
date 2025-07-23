import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { RepoList } from './RepoList';
import { formatTimeAgo } from './formatTimeAgo';
import { Button, Modal,View, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchRepoCommits, fetchRepoLanguages, fetchRepoReadme } from '../services/github';
import { useThemeColor } from '../hooks/useThemeColor';

export function RepoTabContent({
  user,
  repos,
  lastFetched,
  projectTypes,
  loading,
  subtleTextColor,
  dateTextColor,
  refreshData,
}: {
  user: any;
  repos: any[];
  lastFetched: Date | null;
  projectTypes: Record<string, string>;
  loading: boolean;
  subtleTextColor: string;
  dateTextColor: string;
  refreshData: () => void;
}) {
  const router = useRouter();
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const accentColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');

  const handleAnalyseRepo = async (repo: any) => {
    setAnalysisLoading(true);
    console.log(`[AnalyseRepo] Preparing data for repo: ${repo.name}`);
    try {
      const [commits, languages, readme] = await Promise.all([
        fetchRepoCommits(user.login, repo.name),
        fetchRepoLanguages(user.login, repo.name),
        fetchRepoReadme(user.login, repo.name)
      ]);
      console.log(`[AnalyseRepo] Data fetched for ${repo.name}: commits=${commits.length}, languages=${Object.keys(languages).length}, readme=${!!readme}`);
      setSelectedRepo({
        ...repo,
        commits,
        languages,
        readme,
      });
      setShowAnalysis(true);
      console.log(`[AnalyseRepo] Modal should now open for ${repo.name}`);
    } catch (err) {
      console.error('[AnalyseRepo] Error preparing repo analysis:', err);
      setSelectedRepo(null);
      setShowAnalysis(false);
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Last updated time only, human readable */}
      {lastFetched && (
        <ThemedText style={{ color: subtleTextColor, marginBottom: 12, textAlign: 'center', paddingHorizontal: 16 }}>
          Last updated: {formatTimeAgo(lastFetched)}
        </ThemedText>
      )}
      <TouchableOpacity
        onPress={refreshData}
        style={{ backgroundColor: accentColor, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 16, marginBottom: 16 }}
      >
        <ThemedText style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>📡 Refresh Data</ThemedText>
      </TouchableOpacity>
      <RepoList
        repos={repos}
        projectTypes={projectTypes}
        subtleTextColor={subtleTextColor}
        dateTextColor={dateTextColor}
        loading={loading}
        onRepoPress={(repoName: string) => router.push({ pathname: '/repo-details', params: { repoName } })}
        renderExtraActions={(repo: any) => (
          <TouchableOpacity
            style={styles.analyseButton}
            onPress={() => router.push({ pathname: '/repo-details', params: { repoName: repo.name, autoAnalyze: '1' } })}
          >
            <ThemedText style={styles.analyseButtonText}>🔎 Analyse Repo</ThemedText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  analyseButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  analyseButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
});
