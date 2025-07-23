import React from 'react';
import { View, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';

export interface ChatTurn {
  role: 'user' | 'ai';
  message: string;
}

interface ChatHistoryProps {
  chatHistory: ChatTurn[];
  username: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ chatHistory, username }) => {
  const accentColor = useThemeColor({}, 'tint');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  return (
    <View style={{ gap: 8 }}>
      {chatHistory.map((turn, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: turn.role === 'user' ? 'row-reverse' : 'row',
            justifyContent: turn.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end',
            marginBottom: 8,
          }}
        >
          {/* Avatar */}
          {turn.role === 'ai' && (
            <View style={{ marginRight: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center' }}>
                <ThemedText style={{ fontSize: 20 }}>🤖</ThemedText>
              </View>
            </View>
          )}
          {turn.role === 'user' && (
            <View style={{ marginLeft: 8 }}>
              {username ? (
                <View style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', backgroundColor: borderColor }}>
                  <Image
                    source={{ uri: `https://github.com/${username}.png` }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                  />
                </View>
              ) : (
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: borderColor, alignItems: 'center', justifyContent: 'center' }}>
                  <ThemedText style={{ fontSize: 20 }}>👤</ThemedText>
                </View>
              )}
            </View>
          )}
          {/* Message bubble */}
          <View
            style={{
              backgroundColor: turn.role === 'user' ? accentColor : secondaryColor,
              alignSelf: turn.role === 'user' ? 'flex-end' : 'flex-start',
              borderRadius: 16,
              maxWidth: '80%',
              padding: 12,
              shadowColor: cardColor,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            }}
          >
            <ThemedText
              type="caption"
              style={{ color: 'white', textAlign: 'left', fontWeight: 'bold', marginBottom: 4, opacity: 0.8 }}
            >
              {turn.role === 'user' ? username || 'You' : 'AI Assistant'}
            </ThemedText>
            <ThemedText
              type="body"
              style={{ color: 'white', textAlign: 'left', lineHeight: 20 }}
            >
              {turn.message}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
};
