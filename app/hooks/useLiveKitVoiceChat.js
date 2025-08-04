import { useState, useEffect, useRef } from 'react';
import { Room } from 'livekit-client';
import { 
  AudioSession, 
  registerGlobals 
} from '@livekit/react-native';
import SpiritualAPI from '../../services/api';

// Initialize LiveKit for React Native
registerGlobals();

/**
 * LiveKit Voice Chat Hook - FULL ORIGINAL WORKING IMPLEMENTATION
 * Maintains the same API interface for seamless migration
 */
export function useLiveKitVoiceChat() {
  // For now, simulate auth - we'll add real auth context later
  const user = { id: `mobile-user-${Date.now()}` }; // Temporary user simulation
  
  // State management - maintain same API as WebSocket version
  const [conversationState, setConversationState] = useState('idle');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [conversationId, setConversationId] = useState(null);
  
  // LiveKit specific state
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const initialized = useRef(false);

  // Derived state for UI consistency
  const hasError = !!error;
  const statusText = isConnected ? 'Connected' : 
                    conversationState === 'connecting' ? 'Connecting...' : 
                    hasError ? 'Error' : 'Disconnected';
  const statusColor = isConnected ? '#4CAF50' : 
                     conversationState === 'connecting' ? '#FF9800' : 
                     hasError ? '#F44336' : '#9E9E9E';

  useEffect(() => {
    if (initialized.current) return;
    
    // Don't initialize if user is not authenticated
    if (!user?.id) {
      console.log('⏳ Waiting for user authentication before initializing LiveKit voice chat...');
      return;
    }
    
    initialized.current = true;
    setIsInitialized(true);
    console.log('🎯 LiveKit Voice Chat initialized and ready');
  }, [user]);

  const startVoiceChat = async (character = 'Adina') => {
    try {
      setConversationState('connecting');
      setError(null);
      setIsActive(true);
      
      console.log(`🚀 Starting LiveKit voice chat with ${character}...`);
      
      // Start audio session before connecting
      console.log('🎵 Starting audio session...');
      await AudioSession.startAudioSession();
      
      // Get token from backend
      console.log('🎫 Requesting token from backend...');
      const { token, roomName, character: charName, serverUrl } = await SpiritualAPI.getSpiritualToken(character);
      setConversationId(roomName);
      
      console.log(`🎯 Got token - Room: ${roomName}, Character: ${charName}`);
      
      // Dispatch agent (character joins the room)
      console.log(`🤖 Dispatching ${charName} agent...`);
      SpiritualAPI.dispatchAgent(roomName, charName).catch(err => {
        console.log(`❌ Agent dispatch failed: ${err.message}`);
      });
      
      // Create and configure room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Set up room event listeners
      newRoom.on('connected', () => {
        console.log('✅ Connected to LiveKit room');
        setConversationState('connected');
        setIsConnected(true);
        setIsListening(true);
      });

      newRoom.on('disconnected', () => {
        console.log('📞 Disconnected from room');
        setConversationState('idle');
        setIsConnected(false);
        setIsListening(false);
        setIsActive(false);
      });

      newRoom.on('participantConnected', (participant) => {
        console.log(`👋 ${participant.identity} joined (likely ${charName} agent)`);
        if (participant.identity.includes('agent') || participant.identity.includes(charName)) {
          setIsListening(true);
          setIsProcessing(false);
        }
      });

      newRoom.on('trackSubscribed', (track, publication, participant) => {
        console.log(`🎵 Audio track from ${participant.identity}`);
        if (track.kind === 'audio') {
          setIsPlaying(true);
          setIsListening(false);
          track.attach();
          console.log(`🔊 Audio playback enabled for ${participant.identity}`);
        }
      });

      newRoom.on('trackUnsubscribed', (track, publication, participant) => {
        if (track.kind === 'audio') {
          console.log(`🔇 Audio track ended from ${participant.identity}`);
          setIsPlaying(false);
          setIsListening(true);
        }
      });

      newRoom.on('error', (error) => {
        console.log(`❌ Room error: ${error.message}`);
        setError(`Connection error: ${error.message}`);
        setConversationState('error');
      });

      // Connect to room
      console.log('🔌 Connecting to LiveKit room...');
      await newRoom.connect(serverUrl, token);
      setRoom(newRoom);
      
      // Enable microphone
      try {
        console.log('🎤 Enabling microphone...');
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        setIsRecording(true);
        console.log('✅ Microphone enabled successfully');
      } catch (micError) {
        console.log(`❌ Microphone setup failed: ${micError.message}`);
        setError(`Microphone error: ${micError.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Failed to start voice chat: ${error.message}`);
      setError(`Failed to connect: ${error.message}`);
      setConversationState('error');
      setIsActive(false);
    }
  };

  const endVoiceChat = async () => {
    try {
      console.log('🔌 Ending voice chat...');
      
      if (room) {
        await room.disconnect();
        setRoom(null);
      }
      
      // Stop audio session
      console.log('🎵 Stopping audio session...');
      await AudioSession.stopAudioSession();
      
      // Reset all state
      setConversationState('idle');
      setIsConnected(false);
      setIsListening(false);
      setIsRecording(false);
      setIsPlaying(false);
      setIsProcessing(false);
      setIsActive(false);
      setConversationId(null);
      setError(null);
      
      console.log('👋 Voice chat ended successfully');
    } catch (error) {
      console.log(`❌ Error ending voice chat: ${error.message}`);
      setError(`Error ending chat: ${error.message}`);
    }
  };

  const toggleListening = async () => {
    if (!room) return;
    
    try {
      const currentlyEnabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!currentlyEnabled);
      setIsRecording(!currentlyEnabled);
      setIsListening(!currentlyEnabled);
      console.log(`🎤 Microphone ${!currentlyEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.log(`❌ Error toggling microphone: ${error.message}`);
      setError(`Microphone error: ${error.message}`);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // State
    conversationState,
    isListening,
    isRecording,
    isProcessing,
    isPlaying,
    error,
    isInitialized,
    voiceLevel,
    conversationId,
    isConnected,
    isActive,
    hasError,
    statusText,
    statusColor,
    
    // Actions
    startVoiceChat,
    endVoiceChat,
    toggleListening,
    clearError
  };
}

// Export as default for compatibility
export { useLiveKitVoiceChat as useWebSocketVoiceChat };