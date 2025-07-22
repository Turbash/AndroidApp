import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';
import { RepoAnalysisResponse } from '../services/mlModels';
import { RepoAnalysisDisplay } from './RepoAnalysisDisplay';
import { fetchAllRepoCode } from '../services/github';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export function RepoAnalysisModal({
  repo,
  username,
  onClose,
  visible = true,
}: {
  repo: any;
  username: string;
  onClose: () => void;
  visible?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<RepoAnalysisResponse | null>(null);
  const cardBg = useThemeColor({ light: '#fff', dark: '#222' }, 'background');

  useEffect(() => {
    if (!repo || !username) return;
    setLoading(true);

    const fetchAndAnalyze = async () => {
      const codeAll = await fetchAllRepoCode(username, repo.name, repo.default_branch || 'main');

      let tree = null;
      try {
        const encodedUsername = encodeURIComponent(username.trim());
        const encodedRepoName = encodeURIComponent(repo.name.trim());
        const branch = repo.default_branch || 'main';
        const treeUrl = `https://api.github.com/repos/${encodedUsername}/${encodedRepoName}/git/trees/${branch}?recursive=1`;
        const resp = await fetch(treeUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
        if (resp.ok) {
          const treeData = await resp.json();
          tree = Array.isArray(treeData.tree)
            ? treeData.tree.map((item: any) => ({ path: item.path, type: item.type, size: item.size || 0 }))
            : null;
        }
      } catch (e) { tree = null; }

      const url = `${BACKEND_URL}/analyze-repo`;
      const payload = {
        username,
        repo_name: repo.name,
        readme_content: repo.readme,
        commit_messages: Array.isArray(repo.commits) ? repo.commits.map((c: any) => c.commit?.message || '') : [],
        repo_languages: repo.languages,
        code: codeAll || undefined,
        tree,
      };

      console.log(`[RepoAnalysisModal] Sending POST to ${url}`);
      console.log('[RepoAnalysisModal] Payload:', payload);

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async res => {
          console.log(`[RepoAnalysisModal] Response status: ${res.status}`);
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            console.log('[RepoAnalysisModal] Analysis response:', data);
            setAnalysis(data);
          } catch (err) {
            console.error('[RepoAnalysisModal] Failed to parse JSON:', text);
            setAnalysis(null);
          }
        })
        .catch(err => {
          console.error('[RepoAnalysisModal] Error:', err);
          setAnalysis(null);
        })
        .finally(() => setLoading(false));
    };

    fetchAndAnalyze();
  }, [repo, username]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { backgroundColor: cardBg }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={{ marginBottom: 12 }}>
            Repo Analysis: {repo?.name}
          </ThemedText>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : analysis ? (
            <RepoAnalysisDisplay analysis={analysis} />
          ) : (
            <ThemedText>Failed to load analysis.</ThemedText>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'stretch',
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  closeButtonText: {
    fontSize: 22,
    opacity: 0.7,
  },
});
