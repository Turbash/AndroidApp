import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { UserProfileCard } from './UserProfileCard';
import { RepoList } from './RepoList';
import { Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { RepoAnalysisModal } from './RepoAnalysisModal';
import { fetchRepoCommits, fetchRepoLanguages, fetchRepoReadme } from '../services/github';

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
    <ThemedView style={{ flex: 1, paddingHorizontal: 16 }}>
      <UserProfileCard
        user={user}
        lastFetched={lastFetched}
        subtleTextColor={subtleTextColor}
        refreshData={refreshData}
      />
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Recent Repositories ({repos.length})
      </ThemedText>
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
            onPress={() => handleAnalyseRepo(repo)}
            disabled={analysisLoading}
          >
            <ThemedText style={styles.analyseButtonText}>
              {analysisLoading && selectedRepo?.name === repo.name && showAnalysis
                ? 'Analysing...'
                : '🔎 Analyse Repo'}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
      {showAnalysis && selectedRepo && (
        <Modal
          visible={showAnalysis}
          animationType="slide"
          onRequestClose={() => setShowAnalysis(false)}
          transparent={true}
        >
          <RepoAnalysisModal
            repo={selectedRepo}
            username={user?.login}
            onClose={() => setShowAnalysis(false)}
          />
        </Modal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
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
