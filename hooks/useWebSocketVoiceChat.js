import { useState, useRef } from 'react';

// Hook for WebSocket voice chat (placeholder - will integrate with existing LiveKit)
export const useWebSocketVoiceChat = () => {
  const [conversationState, setConversationState] = useState('idle');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(true);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [conversationId, setConversationId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const startVoiceChat = async (character) => {
    console.log('🚀 Starting voice chat with', character);
    setIsActive(true);
    setIsConnected(true);
    setConversationId(`conv_${Date.now()}`);
    setConversationState('active');
  };

  const endVoiceChat = async () => {
    console.log('🛑 Ending voice chat');
    setIsActive(false);
    setIsConnected(false);
    setIsListening(false);
    setConversationState('idle');
    setConversationId(null);
  };

  const toggleListening = async () => {
    setIsListening(prev => !prev);
    setIsRecording(prev => !prev);
  };

  const clearError = () => {
    setError(null);
  };

  const hasError = !!error;
  const statusText = isListening ? 'Listening' : isActive ? 'Connected' : 'Ready';
  const statusColor = hasError ? '#ff4444' : isActive ? '#00aa00' : '#666666';

  return {
    conversationState,
    isListening,
    isRecording,
    isProcessing,
    isPlaying,
    error,
    isInitialized,
    voiceLevel,
    conversationId,
    startVoiceChat,
    endVoiceChat,
    toggleListening,
    clearError,
    isConnected,
    isActive,
    hasError,
    statusText,
    statusColor
  };
};