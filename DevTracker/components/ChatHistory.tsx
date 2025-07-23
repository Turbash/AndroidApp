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
    <View style={{ gap: 8, paddingHorizontal: 0, width: '100%' }}>
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
              backgroundColor: turn.role === 'user' ? accentColor : "#075E54",
              alignSelf: turn.role === 'user' ? 'flex-end' : 'flex-start',
              borderRadius: 16,
              maxWidth: '80%',
              padding: 12,
              shadowColor: cardColor,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              marginLeft: turn.role === 'user' ? 'auto' : 0,
              marginRight: turn.role === 'ai' ? 'auto' : 0,
            }}
          >
            <ThemedText
              type="caption"
              style={{ color: 'white', textAlign: turn.role === 'user' ? 'right' : 'left', fontWeight: 'bold', marginBottom: 4, opacity: 0.8 }}
            >
              {turn.role === 'user' ? username || 'You' : 'AI Assistant'}
            </ThemedText>
              {turn.role === 'ai' ? (
                <AIMessageFormatted message={turn.message} />
              ) : (
                <ThemedText
                  type="body"
                  style={{ color: 'white', textAlign: 'right', lineHeight: 20 }}
                >
                  {turn.message}
                </ThemedText>
              )}
          </View>
        </View>
      ))}
    </View>
  );
};

  const AIMessageFormatted: React.FC<{ message: string }> = ({ message }) => {
    // Split by lines
    const lines = message.split(/\n|\r\n/);
    // Headings to bold
    const headings = ["Suggestions:", "Next Steps:", "Estimated Time:", "Resources:"];
    return (
      <>
        {lines.map((line, idx) => {
          const heading = headings.find(h => line.trim().startsWith(h));
          if (heading) {
            // Bold heading, rest normal
            const rest = line.slice(heading.length).trim();
            return (
              <ThemedText key={idx} type="body" style={{ color: 'white', fontWeight: 'bold', marginTop: idx > 0 ? 8 : 0 }}>
                {heading} <ThemedText type="body" style={{ color: 'white', fontWeight: 'normal' }}>{rest}</ThemedText>
              </ThemedText>
            );
          }
          return (
            <ThemedText key={idx} type="body" style={{ color: 'white', marginTop: idx > 0 ? 2 : 0 }}>{line}</ThemedText>
          );
        })}
      </>
    );
  };
