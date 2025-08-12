import { EventEmitter } from 'eventemitter3';
import WebSocketAudioService from './WebSocketAudioService';

class AudioConversationManager extends EventEmitter {
  constructor() {
    super();
    this.audioService = new WebSocketAudioService();
    this.isActive = false;
    this.conversationState = 'idle'; // 'idle', 'connecting', 'listening', 'processing', 'speaking'
    this.backendUrl = 'wss://livekit-python-agent.up.railway.app'; // Use the Railway backend
    
    // Bind audio service events for conversational intelligence
    this.audioService.on('connected', () => {
      this.conversationState = 'waiting';
      this.emit('stateChanged', this.conversationState);
      this.emit('connected');
    });
    
    this.audioService.on('disconnected', () => {
      this.conversationState = 'idle';
      this.emit('stateChanged', this.conversationState);
      this.emit('disconnected');
    });
    
    // Speech Detection Events
    this.audioService.on('speechDetected', (data) => {
      this.conversationState = 'user_speaking';
      this.emit('stateChanged', this.conversationState);
      this.emit('userSpeechDetected', data);
    });
    
    this.audioService.on('speechEnded', (data) => {
      this.conversationState = 'transcribing';
      this.emit('stateChanged', this.conversationState);
      this.emit('userSpeechEnded', data);
    });
    
    // Transcription Events
    this.audioService.on('partialTranscription', (data) => {
      this.emit('partialTranscription', data);
    });
    
    this.audioService.on('completeTranscription', (data) => {
      this.emit('completeTranscription', data);
    });
    
    // LLM Processing Events
    this.audioService.on('processingStarted', (data) => {
      this.conversationState = 'ai_thinking';
      this.emit('stateChanged', this.conversationState);
      this.emit('aiProcessingStarted', data);
    });
    
    this.audioService.on('llmThinking', (data) => {
      this.emit('aiThinking', data);
    });
    
    // Legacy audio events (for backward compatibility)
    this.audioService.on('recordingStarted', () => {
      if (this.conversationState === 'waiting') {
        this.conversationState = 'listening';
        this.emit('stateChanged', this.conversationState);
        this.emit('listeningStarted');
      }
    });
    
    this.audioService.on('recordingStopped', () => {
      // Only change state if not already handled by speech detection
      if (this.conversationState === 'listening') {
        this.conversationState = 'processing';
        this.emit('stateChanged', this.conversationState);
        this.emit('processingStarted');
      }
    });
    
    this.audioService.on('audioReceived', () => {
      this.emit('responseReceived');
    });
    
    // Conversation Flow Events
    this.audioService.on('listeningReady', (data) => {
      this.conversationState = 'waiting';
      this.emit('stateChanged', this.conversationState);
      this.emit('readyForNextInput', data);
    });
    
    this.audioService.on('conversationStateUpdate', (data) => {
      this.emit('conversationStateUpdate', data);
    });
    
    this.audioService.on('turnTaking', (data) => {
      this.emit('turnTaking', data);
    });
    
    // Character Events
    this.audioService.on('characterSwitched', (data) => {
      this.emit('characterSwitched', data);
    });
    
    // Backend Error Events
    this.audioService.on('backendError', (data) => {
      this.conversationState = 'error';
      this.emit('stateChanged', this.conversationState);
      this.emit('error', new Error(data.message));
    });

    // Progressive streaming events
    this.audioService.on('streamingStarted', (streamingState) => {
      this.conversationState = 'ai_speaking';
      this.emit('stateChanged', this.conversationState);
      this.emit('streamingStarted', streamingState);
    });

    this.audioService.on('streamingProgress', (progress) => {
      this.emit('streamingProgress', progress);
    });

    this.audioService.on('streamingComplete', (data) => {
      this.emit('streamingComplete', data);
      
      // Auto-return to listening after complete response
      setTimeout(() => {
        if (this.isActive) {
          this.conversationState = 'listening';
          this.emit('stateChanged', this.conversationState);
        }
      }, 500);
    });

    this.audioService.on('chunkStarted', (chunkId) => {
      this.emit('chunkStarted', chunkId);
    });

    // NEW: Voice level events for real-time UI feedback
    this.audioService.on('voiceLevel', (level) => {
      this.emit('voiceLevel', level);
      
      // Enhanced voice activity detection based on actual audio levels
      if (level > 0.1) { // Threshold for voice activity
        this.emit('voiceActivityDetected', level);
      } else {
        this.emit('voiceActivityEnded');
      }
    });
    
    this.audioService.on('error', (error) => {
      this.emit('error', error);
    });
  }

  async initialize(backendUrl, userId) {
    this.backendUrl = 'wss://livekit-python-agent.up.railway.app'; // Use the Railway backend
    console.log('🎯 Initializing Audio Conversation Manager with voice agent backend:', this.backendUrl);
    console.log('👤 User ID for WebSocket connection:', userId);
    
    try {
      await this.audioService.initialize(this.backendUrl, userId);
      console.log('✅ Audio Conversation Manager initialized with voice agent');
    } catch (error) {
      console.error('🔥 Failed to initialize Audio Conversation Manager:', error);
      throw error;
    }
  }

  async startConversation(character = 'adina') {
    try {
      console.log('🚀 Starting voice conversation with character:', character);
      this.conversationState = 'connecting';
      this.emit('stateChanged', this.conversationState);
      
      // Store character for the connection
      this.selectedCharacter = character;
      
      // Connect to backend (character will be sent during initialization)
      await this.audioService.connect(character);
      
      console.log('📨 Character initialization sent, starting audio streaming...');
      
      // Start real-time audio streaming
      await this.audioService.startRealTimeStreaming();
      
      this.isActive = true;
      console.log('✅ Voice conversation started successfully');
      
      return true;
      
    } catch (error) {
      console.error('🔥 Failed to start voice conversation:', error);
      this.conversationState = 'idle';
      this.emit('stateChanged', this.conversationState);
      this.emit('error', error);
      throw error;
    }
  }

  async stopConversation() {
    try {
      console.log('🛑 Stopping PCM streaming conversation...');
      
      this.isActive = false;
      await this.audioService.stopRealTimeStreaming();
      await this.audioService.disconnect();
      
      this.conversationState = 'idle';
      this.emit('stateChanged', this.conversationState);
      
      console.log('✅ PCM streaming conversation stopped');
      
    } catch (error) {
      console.error('🔥 Error stopping PCM streaming conversation:', error);
      this.emit('error', error);
    }
  }

  async pauseListening() {
    try {
      await this.audioService.stopRealTimeStreaming();
      this.conversationState = 'idle';
      this.emit('stateChanged', this.conversationState);
    } catch (error) {
      console.error('🔥 Error pausing listening:', error);
    }
  }

  async resumeListening() {
    try {
      if (this.audioService.isConnectionActive()) {
        await this.audioService.startRealTimeStreaming();
        this.conversationState = 'listening';
        this.emit('stateChanged', this.conversationState);
      }
    } catch (error) {
      console.error('🔥 Error resuming listening:', error);
    }
  }

  async sendTextMessage(message) {
    try {
      await this.audioService.sendMessage({
        type: 'text_message',
        content: message
      });
    } catch (error) {
      console.error('🔥 Error sending text message:', error);
      this.emit('error', error);
    }
  }

  async switchCharacter(character) {
    try {
      console.log('🔄 Switching to character:', character);
      await this.audioService.sendMessage({
        type: 'character_switch',
        character: character
      });
    } catch (error) {
      console.error('🔥 Error switching character:', error);
      this.emit('error', error);
    }
  }

  // Getters for UI state management
  getState() {
    return this.conversationState;
  }

  isConversationActive() {
    return this.isActive && this.audioService.isConnectionActive();
  }

  isListening() {
    return this.conversationState === 'listening';
  }

  isProcessing() {
    return this.conversationState === 'processing';
  }

  isSpeaking() {
    return this.conversationState === 'ai_speaking';
  }

  isConnected() {
    return this.audioService.isConnectionActive();
  }

  getConnectionState() {
    return this.audioService.getConnectionState();
  }

  // Progressive streaming getters
  getStreamingState() {
    return this.audioService.getStreamingState();
  }

  isStreaming() {
    return this.audioService.isStreaming();
  }

  getStreamingProgress() {
    return this.audioService.getStreamingProgress();
  }

  isAudioPlaying() {
    return this.audioService.isAudioPlaying();
  }

  // Voice Activity Detection - now based on real audio levels
  simulateVoiceActivity() {
    // This method is no longer needed as we have real voice level detection
    // Keeping for backward compatibility
    if (this.conversationState === 'listening') {
      this.emit('voiceActivityDetected', 0.5);
      
      setTimeout(() => {
        if (this.conversationState === 'listening') {
          this.emit('voiceActivityEnded');
        }
      }, Math.random() * 2000 + 1000);
    }
  }

  // Cleanup method
  async cleanup() {
    try {
      await this.stopConversation();
      this.removeAllListeners();
      console.log('✅ PCM streaming Audio Conversation Manager cleaned up');
    } catch (error) {
      console.error('🔥 Error during cleanup:', error);
    }
  }
}

export default AudioConversationManager; 