import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';

interface ThemedModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  error?: boolean;
}

export const ThemedModal: React.FC<ThemedModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  error = false,
}) => {
  const cardColor = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, error ? 'error' : 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: cardColor }]}> 
          {title && (
            <ThemedText type="title" style={[styles.title, { color: accentColor }]}>{title}</ThemedText>
          )}
          <ThemedText type="body" style={styles.message}>{message}</ThemedText>
          <View style={styles.buttonRow}>
            {cancelText && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: backgroundColor, borderColor: accentColor }]}
                onPress={onCancel}
              >
                <ThemedText style={[styles.buttonText, { color: accentColor }]}>{cancelText}</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: accentColor }]}
              onPress={onConfirm}
            >
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>{confirmText}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    minWidth: 280,
    maxWidth: '90%',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
