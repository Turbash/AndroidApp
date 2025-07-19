import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface CommitHealthProps {
  totalCommits: number;
  avgMessageLength: number;
  commitFrequency: number; // commits per week
  conventionalCommitRatio: number; // 0-1
}

export function CommitHealthSuggestions({ 
  totalCommits, 
  avgMessageLength, 
  commitFrequency,
  conventionalCommitRatio 
}: CommitHealthProps) {
  const cardBg = useThemeColor({ light: '#f0f9ff', dark: '#1e3a8a' }, 'background');
  const accentColor = useThemeColor({ light: '#3b82f6', dark: '#60a5fa' }, 'text');
  const warningColor = useThemeColor({ light: '#f59e0b', dark: '#fbbf24' }, 'text');
  
  const suggestions = [];
  
  // Analyze commit health and generate suggestions
  if (totalCommits < 50) {
    suggestions.push({
      icon: '🚀',
      title: 'Commit More Frequently',
      description: `You have ${totalCommits} commits. Aim for at least 100+ commits to get better insights.`,
      priority: 'high',
      action: 'Make smaller, focused commits daily'
    });
  }
  
  if (avgMessageLength < 20) {
    suggestions.push({
      icon: '📝',
      title: 'Write Better Commit Messages',
      description: `Average message length: ${Math.round(avgMessageLength)} chars. Aim for 30-50 characters with clear descriptions.`,
      priority: 'high',
      action: 'Describe what and why, not just what'
    });
  }
  
  if (commitFrequency < 3) {
    suggestions.push({
      icon: '⏰',
      title: 'Increase Commit Frequency',
      description: `Currently ${Math.round(commitFrequency)} commits/week. Aim for 5-10 commits per week.`,
      priority: 'medium',
      action: 'Break work into smaller, daily commits'
    });
  }
  
  if (conventionalCommitRatio < 0.3) {
    suggestions.push({
      icon: '🎯',
      title: 'Use Conventional Commits',
      description: `Only ${Math.round(conventionalCommitRatio * 100)}% follow conventions. Use feat:, fix:, docs:, etc.`,
      priority: 'medium',
      action: 'Format: type(scope): description'
    });
  }
  
  // Add positive reinforcement if doing well
  if (suggestions.length === 0) {
    suggestions.push({
      icon: '🎉',
      title: 'Excellent Commit Hygiene!',
      description: 'Your commit practices are helping the AI provide better insights.',
      priority: 'success',
      action: 'Keep up the great work!'
    });
  }
  
  if (suggestions.length === 0) return null;
  
  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBg }]}>
      <ThemedText style={[styles.title, { color: accentColor }]}>
        💡 Improve Your Development Insights
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        Better commit practices = Better AI analysis
      </ThemedText>
      
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity 
          key={index} 
          style={[
            styles.suggestionCard,
            {
              borderLeftColor: suggestion.priority === 'high' ? '#ef4444' : 
                               suggestion.priority === 'success' ? '#10b981' : warningColor
            }
          ]}
        >
          <ThemedView style={styles.suggestionHeader}>
            <ThemedText style={styles.suggestionIcon}>{suggestion.icon}</ThemedText>
            <ThemedText style={styles.suggestionTitle}>{suggestion.title}</ThemedText>
          </ThemedView>
          
          <ThemedText style={styles.suggestionDescription}>
            {suggestion.description}
          </ThemedText>
          
          <ThemedView style={styles.actionContainer}>
            <ThemedText style={[styles.actionText, { color: accentColor }]}>
              💡 {suggestion.action}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      ))}
      
      <ThemedView style={styles.tipsContainer}>
        <ThemedText style={styles.tipsTitle}>Quick Tips:</ThemedText>
        <ThemedText style={styles.tipText}>• Use "feat: add user authentication"</ThemedText>
        <ThemedText style={styles.tipText}>• Use "fix: resolve login redirect issue"</ThemedText>
        <ThemedText style={styles.tipText}>• Use "docs: update API documentation"</ThemedText>
        <ThemedText style={styles.tipText}>• Commit daily with clear, descriptive messages</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  suggestionCard: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  suggestionDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  actionContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 8,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tipsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
});
