import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

// Voice control buttons (start/stop, settings, etc.)
const VoiceControls = ({ 
  isListening, 
  isRecording, 
  isProcessing, 
  voiceLevel, 
  setIsListening, 
  activeAI,
  showQuickReplies,
  setShowQuickReplies,
  isConnected,
  isActive,
  conversationState,
  conversationId,
  onEndConversation,
  onClearError
}) => {
  return (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <TouchableOpacity
        onPress={setIsListening}
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isListening ? '#ff4444' : '#007AFF',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16
        }}
      >
        <Text style={{ fontSize: 32, color: 'white' }}>
          {isListening ? '⏸️' : '🎤'}
        </Text>
      </TouchableOpacity>
      
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => setShowQuickReplies?.(!showQuickReplies)}
          style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8 }}
        >
          <Text style={{ fontSize: 12, color: '#333' }}>Quick Replies</Text>
        </TouchableOpacity>
        
        {isActive && (
          <TouchableOpacity
            onPress={onEndConversation}
            style={{ padding: 8, backgroundColor: '#ff4444', borderRadius: 8 }}
          >
            <Text style={{ fontSize: 12, color: 'white' }}>End Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default VoiceControls;