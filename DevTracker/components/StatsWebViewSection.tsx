import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { GitHubStatsService } from '../services/githubStats';

export function StatsWebViewSection({
  validatedUsername,
  languageCount,
}: {
  validatedUsername: string;
  languageCount: number;
}) {
  const screenWidth = Dimensions.get('window').width;
  const maxWidth = Math.min(screenWidth * 0.95, 420);

  const webViewUrls = GitHubStatsService.getWebViewUrls(validatedUsername, languageCount);

  return (
    <View style={styles.webviewSectionWrapper}>
      <ThemedView style={styles.statsContainer}>
        <ThemedText style={styles.sectionTitle}>Profile Stats</ThemedText>
        <View style={styles.webViewOuter}>
          <WebView
            source={{ uri: webViewUrls.statsWebView }}
            style={[
              styles.webViewStyle,
              {
                width: maxWidth,
                minHeight: 160,
                maxHeight: 240,
                flex: 1,
                marginBottom: 12,
              },
            ]}
            containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={true}
            automaticallyAdjustContentInsets={false}
            scalesPageToFit={true}
          />
        </View>
      </ThemedView>
      <ThemedView style={styles.statsContainer}>
        <ThemedText style={styles.sectionTitleLanguages}>Top Languages</ThemedText>
        <View style={styles.webViewOuter}>
          <WebView
            source={{ uri: webViewUrls.languagesWebView }}
            style={[
              styles.webViewStyle,
              {
                width: maxWidth,
                minHeight: 180,
                maxHeight: 240,
                flex: 1,
                marginBottom: 24,
              },
            ]}
            containerStyle={{ borderRadius: 8, overflow: 'hidden' }}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={true}
            automaticallyAdjustContentInsets={false}
            scalesPageToFit={true}
          />
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  webviewSectionWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 8,
    color: '#60a5fa',
  },
  sectionTitleLanguages: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 8,
    color: '#f59e42',
  },
  webViewOuter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  webViewStyle: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    alignSelf: 'center',
  },
});