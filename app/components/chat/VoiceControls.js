import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const VoiceControls = ({ 
  isListening, 
  setIsListening, 
  activeAI, 
  showQuickReplies, 
  setShowQuickReplies,
  // New enhanced props
  isConnected = false,
  isSessionActive = false,
  conversationState = 'disconnected',
  onEndConversation
}) => {
  // Helper to get button state and text
  const getMainButtonState = () => {
    if (!isConnected && !isSessionActive) {
      return {
        icon: 'mic',
        label: 'Start voice chat',
        hint: 'Starts a new voice conversation',
        disabled: false
      };
    }
    
    if (isSessionActive && isListening) {
      return {
        icon: 'mic',
        label: 'Stop listening',
        hint: 'Stops voice recognition',
        disabled: false
      };
    }
    
    if (isSessionActive && !isListening) {
      return {
        icon: 'mic-off',
        label: 'Start listening',
        hint: 'Starts voice recognition',
        disabled: false
      };
    }
    
    return {
      icon: 'mic',
      label: 'Voice chat',
      hint: 'Voice recognition control',
      disabled: conversationState === 'connecting'
    };
  };

  const buttonState = getMainButtonState();

  return (
    <View style={styles.container}>
      {/* Exit button - always visible for consistent 3-button layout */}
      <TouchableOpacity 
        onPress={onEndConversation || (() => {})}
        style={styles.sideButton}
        accessible={true}
        accessibilityLabel="Exit conversation"
        accessibilityRole="button"
        accessibilityHint="Exits the voice chat interface"
      >
        <Feather name="x" size={20} color="#6b7280" />
      </TouchableOpacity>
      
      {/* Main microphone button */}
      <TouchableOpacity 
        onPress={setIsListening}
        disabled={buttonState.disabled}
        style={[
          styles.mainButton,
          isListening && activeAI === 'adina' && styles.listeningAdina,
          isListening && activeAI === 'rafa' && styles.listeningRafa,
          conversationState === 'connecting' && styles.connecting,
          buttonState.disabled && styles.disabled
        ]}
        accessible={true}
        accessibilityLabel={buttonState.label}
        accessibilityRole="button"
        accessibilityState={{ 
          selected: isListening,
          disabled: buttonState.disabled,
          busy: conversationState === 'connecting'
        }}
        accessibilityHint={buttonState.hint}
      >
        <Feather 
          name={buttonState.icon} 
          size={24} 
          color={
            buttonState.disabled
              ? "#9ca3af"
              : isListening 
                ? activeAI === 'adina'
                  ? '#ec4899'
                  : '#3b82f6'
                : conversationState === 'connecting'
                  ? '#f59e0b'
                  : "#6b7280"
          } 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => setShowQuickReplies(!showQuickReplies)}
        style={styles.sideButton}
        accessible={true}
        accessibilityLabel={showQuickReplies ? "Hide quick replies" : "Show quick replies"}
        accessibilityRole="button"
        accessibilityState={{ expanded: showQuickReplies }}
      >
        <Feather name="message-circle" size={20} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideButton: {
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 25,
    backgroundColor: '#f9fafb',
  },
  mainButton: {
    padding: 20,
    marginHorizontal: 12,
    borderRadius: 30,
    backgroundColor: '#f9fafb',
  },
  listeningAdina: {
    backgroundColor: '#fce7f3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#fbcfe8',
  },
  listeningRafa: {
    backgroundColor: '#dbeafe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  connecting: {
    backgroundColor: '#fffbeb',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default VoiceControls;
