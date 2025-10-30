import { useState, useEffect, useRef } from 'react';
import SpiritualAPI from '../../services/api';
import { Room } from 'livekit-client';
import { AudioSession, registerGlobals } from '@livekit/react-native';

// Register globals for LiveKit
registerGlobals();

export function useLiveKitVoiceChat() {
  const [conversationState, setConversationState] = useState('idle');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [conversationId, setConversationId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const roomRef = useRef(null);
  const initialized = useRef(false);

  // For now, simulate auth - we'll add real auth context later
  const user = { id: `mobile-user-${Date.now()}` };

  const hasError = !!error;
  const statusText = conversationState === 'connecting' ? 'Connecting...' :
    conversationState === 'connected' ? 'Connected' :
      conversationState === 'error' ? 'Error' :
        hasError ? 'Error' : 'Disconnected';
  const statusColor = conversationState === 'connecting' ? '#FF9800' :
    conversationState === 'connected' ? '#4CAF50' :
      conversationState === 'error' ? '#F44336' :
        hasError ? '#F44336' : '#9E9E9E';

  useEffect(() => {
    if (initialized.current) return;

    // Don't initialize if user is not authenticated
    if (!user?.id) {
      console.log('⏳ Waiting for user authentication before initializing LiveKit voice chat...');
      return;
    }

    initialized.current = true;
    // Use setTimeout to avoid state update during render
    setTimeout(() => {
      setIsInitialized(true);
      console.log('🎯 LiveKit Voice Chat initialized and ready');
    }, 0);
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
        console.log('❌ Disconnected from LiveKit room');
        setConversationState('idle');
        setIsConnected(false);
        setIsListening(false);
        setIsRecording(false);
        setIsPlaying(false);
        setIsActive(false);
      });

      newRoom.on('trackSubscribed', (track, publication, participant) => {
        console.log(`🎵 Track subscribed: ${track.kind} from ${participant.identity}`);
        if (track.kind === 'audio') {
          setIsPlaying(true);
          // Audio will automatically play through the device speakers
        }
      });

      newRoom.on('trackUnsubscribed', (track, publication, participant) => {
        console.log(`🔇 Track unsubscribed: ${track.kind} from ${participant.identity}`);
        if (track.kind === 'audio') {
          setIsPlaying(false);
        }
      });

      newRoom.on('participantConnected', (participant) => {
        console.log(`👤 Participant connected: ${participant.identity}`);
      });

      newRoom.on('participantDisconnected', (participant) => {
        console.log(`👋 Participant disconnected: ${participant.identity}`);
      });

      // Connect to the room
      console.log(`🔗 Connecting to room: ${serverUrl}`);
      await newRoom.connect(serverUrl, token);

      roomRef.current = newRoom;

      // Enable microphone
      console.log('🎤 Enabling microphone...');
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setIsRecording(true);

    } catch (err) {
      console.error('❌ Failed to start voice chat:', err);
      setError(err.message);
      setConversationState('error');
      setIsActive(false);
    }
  };

  const endVoiceChat = async () => {
    try {
      console.log('🛑 Ending voice chat...');

      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }

      await AudioSession.stopAudioSession();

      setConversationState('idle');
      setIsConnected(false);
      setIsListening(false);
      setIsRecording(false);
      setIsPlaying(false);
      setIsProcessing(false);
      setIsActive(false);
      setConversationId(null);
      setError(null);

      console.log('✅ Voice chat ended successfully');
    } catch (err) {
      console.error('❌ Error ending voice chat:', err);
      setError(err.message);
    }
  };

  const toggleListening = async () => {
    if (!roomRef.current) {
      console.log('❌ No active room connection');
      return;
    }

    try {
      const newRecordingState = !isRecording;
      await roomRef.current.localParticipant.setMicrophoneEnabled(newRecordingState);
      setIsRecording(newRecordingState);
      setIsListening(newRecordingState);

      console.log(`🎤 Microphone ${newRecordingState ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('❌ Error toggling microphone:', err);
      setError(err.message);
    }
  };

  const sendTextMessage = async (message) => {
    if (!roomRef.current || !conversationId) {
      console.log('❌ No active conversation');
      setError('No active conversation');
      return;
    }

    try {
      console.log(`💬 Sending text message: ${message}`);

      // Send message through our API
      await SpiritualAPI.sendTextMessage(conversationId, message);

      console.log('✅ Text message sent successfully');
    } catch (err) {
      console.error('❌ Error sending text message:', err);
      setError(err.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

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
    isConnected,
    isActive,
    hasError,
    statusText,
    statusColor,
    startVoiceChat,
    endVoiceChat,
    toggleListening,
    sendTextMessage,
    clearError
  };
}

export { useLiveKitVoiceChat as useWebSocketVoiceChat };