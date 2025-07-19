import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemeColor } from '../hooks/useThemeColor';
import { GitHubStatsResponse, GitHubStatsService } from '../services/githubStats';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface GitHubStatsDisplayProps {
  username: string;
  languageCount?: number;
}

export function GitHubStatsDisplay({ username, languageCount = 10 }: GitHubStatsDisplayProps) {
  const [statsData, setStatsData] = useState<GitHubStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [useWebView, setUseWebView] = useState(false);
  const [validatedUsername, setValidatedUsername] = useState<string>(username);
  
  const cardBg = useThemeColor({ light: '#ffffff', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333333' }, 'tint');
  const accentColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'text');
  
  const screenWidth = Dimensions.get('window').width;
  
  useEffect(() => {
    loadGitHubStats();
  }, [username, languageCount]);
  
  const loadGitHubStats = async () => {
    console.log(`📊 Loading GitHub stats for ${username}`);
    setLoading(true);
    setUseWebView(false);
    
    try {
      // First validate and get the correct username
      const userValidation = await GitHubStatsService.validateAndGetCorrectUsername(username);
      if (!userValidation.exists) {
        console.error(`❌ GitHub user ${username} not found`);
        setStatsData({
          statsImageUrl: '',
          languagesImageUrl: '',
          isAvailable: false,
          error: `User ${username} not found on GitHub`
        });
        setLoading(false);
        return;
      }
      
      const correctUsername = userValidation.correctUsername;
      setValidatedUsername(correctUsername);
      console.log(`✅ Using validated username: ${correctUsername}`);
      
      const stats = await GitHubStatsService.fetchGitHubStats(correctUsername, languageCount);
      setStatsData(stats);
      
      if (stats.isAvailable) {
        console.log('✅ GitHub stats loaded successfully');
        // If it's SVG, we'll use WebView
        if (stats.isSvg) {
          console.log('📄 SVG format detected, using WebView approach');
          setUseWebView(true);
        }
      } else {
        console.warn('⚠️ GitHub stats loaded with issues:', stats.error);
      }
    } catch (error) {
      console.error('❌ Failed to load GitHub stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const openGitHubProfile = () => {
    Linking.openURL(`https://github.com/${validatedUsername}`);
  };

  const renderStatsContent = () => {
    if (!statsData || !statsData.isAvailable) {
      return renderAlternativeContent();
    }

    if (useWebView || statsData.isSvg) {
      return renderWebViewStats();
    }

    return renderImageStats();
  };

  const renderWebViewStats = () => {
    const webViewUrls = GitHubStatsService.getWebViewUrls(validatedUsername, languageCount);
    
    return (
      <>
        {/* GitHub Stats WebView */}
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.sectionTitle}>Profile Stats</ThemedText>
          <WebView
            source={{ uri: webViewUrls.statsWebView }}
            style={[styles.webViewStyle, { width: screenWidth - 64 }]}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onError={(error) => {
              console.error('❌ Stats WebView failed to load:', error.nativeEvent);
            }}
            onLoad={() => {
              console.log('✅ Stats WebView loaded successfully');
            }}
          />
        </ThemedView>
        
        {/* Top Languages WebView */}
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.sectionTitle}>Top Languages</ThemedText>
          <WebView
            source={{ uri: webViewUrls.languagesWebView }}
            style={[styles.webViewStyle, { width: screenWidth - 64, height: 150 }]}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onError={(error) => {
              console.error('❌ Languages WebView failed to load:', error.nativeEvent);
            }}
            onLoad={() => {
              console.log('✅ Languages WebView loaded successfully');
            }}
          />
        </ThemedView>
      </>
    );
  };

  const renderImageStats = () => {
    return (
      <>
        {/* GitHub Stats Image */}
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.sectionTitle}>Profile Stats</ThemedText>
          <Image 
            source={{ uri: statsData!.statsImageUrl }}
            style={styles.statsImage}
            resizeMode="contain"
            onError={(error) => {
              console.error('❌ Stats image failed to load:', error.nativeEvent.error);
              setUseWebView(true);
            }}
            onLoad={() => console.log('✅ Stats image loaded successfully')}
          />
        </ThemedView>
        
        {/* Top Languages Image */}
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.sectionTitle}>Top Languages</ThemedText>
          <Image 
            source={{ uri: statsData!.languagesImageUrl }}
            style={styles.languagesImage}
            resizeMode="contain"
            onError={(error) => {
              console.error('❌ Languages image failed to load:', error.nativeEvent.error);
              setUseWebView(true);
            }}
            onLoad={() => console.log('✅ Languages image loaded successfully')}
          />
        </ThemedView>
      </>
    );
  };

  const renderAlternativeContent = () => {
    const altUrls = GitHubStatsService.getAlternativeImageUrls(validatedUsername, languageCount);
    
    return (
      <ThemedView style={styles.alternativeContainer}>
        <ThemedText style={styles.alternativeTitle}>GitHub Profile Stats</ThemedText>
        
        {/* GitHub Streak */}
        <ThemedView style={styles.altStatsContainer}>
          <ThemedText style={styles.altStatsTitle}>Contribution Streak</ThemedText>
          <Image 
            source={{ uri: altUrls.streakStats }}
            style={styles.altStatsImage}
            resizeMode="contain"
            onError={() => console.warn('Streak stats failed to load')}
          />
        </ThemedView>
        
        {/* Profile Trophy */}
        <ThemedView style={styles.altStatsContainer}>
          <ThemedText style={styles.altStatsTitle}>GitHub Trophies</ThemedText>
          <Image 
            source={{ uri: altUrls.trophyStats }}
            style={styles.altStatsImage}
            resizeMode="contain"
            onError={() => console.warn('Trophy stats failed to load')}
          />
        </ThemedView>
        
        <ThemedText style={styles.fallbackNote}>
          📊 Alternative stats displayed due to image format compatibility
        </ThemedText>
      </ThemedView>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <ThemedText style={styles.loadingText}>Loading GitHub stats...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
      <TouchableOpacity onPress={openGitHubProfile} style={styles.headerContainer}>
        <ThemedText type="defaultSemiBold" style={[styles.title, { color: accentColor }]}>
          📊 GitHub Statistics
        </ThemedText>
        <ThemedText style={styles.username}>@{validatedUsername}</ThemedText>
      </TouchableOpacity>
      
      {renderStatsContent()}
      
      {/* Quick Actions */}
      <ThemedView style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: accentColor }]}
          onPress={openGitHubProfile}
        >
          <ThemedText style={[styles.actionText, { color: accentColor }]}>
            🔗 View Full Profile
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: accentColor }]}
          onPress={loadGitHubStats}
        >
          <ThemedText style={[styles.actionText, { color: accentColor }]}>
            🔄 Retry
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedText style={styles.note}>
        💡 Stats powered by github-readme-stats {useWebView ? '(WebView)' : '(Images)'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    opacity: 0.8,
    fontFamily: 'monospace',
  },
  statsContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  statsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  languagesImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  note: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  webViewStyle: {
    height: 200,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  alternativeContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  altStatsContainer: {
    marginVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  altStatsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  altStatsImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  fallbackNote: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
