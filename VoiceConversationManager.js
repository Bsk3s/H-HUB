import { VoiceActivityDetector } from './VoiceActivityDetector';
import { ConversationStateMachine, ConversationStates, ConversationEvents } from './ConversationStateMachine';
import { SmartAudioCaptureManager } from './SmartAudioCaptureManager';
import VoiceAgentService from './VoiceAgentService';

/**
 * Voice Conversation Manager - Main Orchestrator
 * Implements the optimal layered architecture for voice chat
 * Coordinates Voice Activity Detection, State Management, Audio Capture, and Backend Communication
 */
export class VoiceConversationManager {
  constructor() {
    // Core components
    this.voiceDetector = new VoiceActivityDetector();
    this.stateMachine = new ConversationStateMachine();
    this.audioCaptureManager = new SmartAudioCaptureManager();
    this.voiceAgentService = VoiceAgentService;

    // State tracking
    this.isInitialized = false;
    this.conversationId = null;
    this.currentRecording = null;

    // Event listeners
    this.eventListeners = {
      stateChanged: [],
      speechDetected: [],
      speechEnded: [],
      audioResponse: [],
      conversationStarted: [],
      conversationEnded: [],
      error: []
    };

    // Bind event handlers
    this.setupEventHandlers();
  }

  /**
   * Event management
   */
  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    console.log(`📡 VoiceConversationManager emitting: ${event}`);
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Setup event handlers between components
   */
  setupEventHandlers() {
    // Voice Activity Detection Events
    this.voiceDetector.on('speechDetected', (data) => {
      console.log('🗣️ Speech detected by VAD');
      this.stateMachine.handleEvent(ConversationEvents.SPEECH_DETECTED, data);
      this.handleSpeechDetected(data);
    });

    this.voiceDetector.on('speechEnded', (data) => {
      console.log('🤐 Speech ended by VAD');
      this.stateMachine.handleEvent(ConversationEvents.SPEECH_ENDED, data);
      this.handleSpeechEnded(data);
    });

    this.voiceDetector.on('error', (error) => {
      console.error('❌ VAD Error:', error);
      this.stateMachine.handleEvent(ConversationEvents.ERROR_OCCURRED, { error });
    });

    // State Machine Events
    this.stateMachine.on('stateChanged', (data) => {
      console.log(`🔄 State changed: ${data.previousState} → ${data.currentState}`);
      this.emit('stateChanged', data);
      this.handleStateChange(data);
    });

    this.stateMachine.on('error', (error) => {
      console.error('❌ State Machine Error:', error);
      this.emit('error', error);
    });

    // Audio Capture Manager Events
    this.audioCaptureManager.on('recordingStarted', (data) => {
      console.log('🎤 Recording started');
    });

    this.audioCaptureManager.on('recordingCompleted', (data) => {
      console.log('✅ Recording completed');
      this.handleRecordingCompleted(data);
    });

    this.audioCaptureManager.on('error', (error) => {
      console.error('❌ Audio Capture Error:', error);
      this.stateMachine.handleEvent(ConversationEvents.ERROR_OCCURRED, { error });
    });

    // Voice Agent Service Events (LiveKit-based)
    this.voiceAgentService.on('connected', () => {
      console.log('🔗 Connected to LiveKit room');
      this.stateMachine.handleEvent(ConversationEvents.CONNECTION_ESTABLISHED);
    });

    this.voiceAgentService.on('session_started', () => {
      console.log('🎬 LiveKit voice session started');
      this.stateMachine.handleEvent(ConversationEvents.SESSION_STARTED);
    });

    this.voiceAgentService.on('agent_connected', (participant) => {
      console.log('🤖 AI agent joined the room:', participant.identity);
    });

    this.voiceAgentService.on('agent_audio_track', (track) => {
      console.log('🔊 Received agent audio track');
      this.stateMachine.handleEvent(ConversationEvents.RESPONSE_RECEIVED, { track });
      this.handleAgentAudio(track);
    });

    this.voiceAgentService.on('user_speaking', () => {
      console.log('🗣️ User is speaking (detected by LiveKit)');
    });

    this.voiceAgentService.on('user_stopped', () => {
      console.log('🤐 User stopped speaking (detected by LiveKit)');
    });

    this.voiceAgentService.on('agent_speaking', () => {
      console.log('🤖 Agent is speaking');
    });

    this.voiceAgentService.on('agent_stopped', () => {
      console.log('🤖 Agent stopped speaking');
    });

    this.voiceAgentService.on('session_ended', () => {
      console.log('🔚 LiveKit voice session ended');
      this.stateMachine.handleEvent(ConversationEvents.DISCONNECTED);
    });

    this.voiceAgentService.on('disconnected', () => {
      console.log('🔌 Disconnected from LiveKit room');
      this.stateMachine.handleEvent(ConversationEvents.DISCONNECTED);
    });

    this.voiceAgentService.on('error', (error) => {
      console.error('❌ LiveKit Voice Agent Error:', error);
      this.stateMachine.handleEvent(ConversationEvents.ERROR_OCCURRED, { error });
    });
  }

  /**
   * Initialize the voice conversation system
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Voice Conversation Manager...');

      // Check audio permissions
      const audioAvailable = await this.audioCaptureManager.checkAvailability();
      if (!audioAvailable) {
        throw new Error('Audio recording permission required');
      }

      // Initialize voice activity detection
      const vadStarted = await this.voiceDetector.startMonitoring();
      if (!vadStarted) {
        throw new Error('Failed to start voice activity detection');
      }

      this.isInitialized = true;
      console.log('✅ Voice Conversation Manager initialized');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Voice Conversation Manager:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Start a voice conversation
   */
  async startConversation() {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
    }

    try {
      console.log('🎙️ Starting voice conversation...');
      
      // Generate conversation ID
      this.conversationId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Trigger connection to voice agent
      this.stateMachine.handleEvent(ConversationEvents.CONNECT_REQUESTED, {
        conversationId: this.conversationId
      });

      // Connect to voice agent service using LiveKit
      // Use conversationId as userId for LiveKit connection
      const sessionStarted = await this.voiceAgentService.startSession(
        this.conversationId, // userId
        'adina', // character (adina or raffa)
        'User' // userName
      );
      if (!sessionStarted) {
        throw new Error('Failed to start voice session');
      }

      this.emit('conversationStarted', {
        conversationId: this.conversationId,
        timestamp: Date.now()
      });

      console.log('✅ Voice conversation started');
      return true;

    } catch (error) {
      console.error('❌ Failed to start voice conversation:', error);
      this.stateMachine.handleEvent(ConversationEvents.ERROR_OCCURRED, { error });
      this.emit('error', error);
      return false;
    }
  }

  /**
   * End the voice conversation
   */
  async endConversation() {
    try {
      console.log('🛑 Ending voice conversation...');

      this.stateMachine.handleEvent(ConversationEvents.DISCONNECT_REQUESTED);

      // Stop voice activity detection
      await this.voiceDetector.stopMonitoring();

      // Cancel any ongoing recording
      await this.audioCaptureManager.cancelRecording();

      // End session with voice agent
      if (this.conversationId) {
        await this.voiceAgentService.endSession();
      }

      // Disconnect from voice agent
      this.voiceAgentService.disconnect();

      // Reset state
      this.conversationId = null;
      this.currentRecording = null;

      this.emit('conversationEnded', {
        timestamp: Date.now()
      });

      console.log('✅ Voice conversation ended');
      return true;

    } catch (error) {
      console.error('❌ Error ending voice conversation:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Handle speech detection from VAD
   */
  async handleSpeechDetected(data) {
    const state = this.stateMachine.getCurrentState();
    
    if (state === ConversationStates.LISTENING) {
      // Start recording when speech is detected in listening state
      console.log('🎤 Starting recording due to speech detection');
      const started = await this.audioCaptureManager.startRecording();
      
      if (started) {
        this.emit('speechDetected', {
          timestamp: data.timestamp,
          audioLevel: data.audioLevel
        });
      }
    } else if (state === ConversationStates.PLAYING) {
      // User interruption during AI response
      console.log('⚠️ User interruption detected during AI response');
      this.handleUserInterruption();
    }
  }

  /**
   * Handle speech end from VAD
   */
  async handleSpeechEnded(data) {
    const state = this.stateMachine.getCurrentState();
    
    if (state === ConversationStates.RECORDING) {
      // Stop recording when speech ends
      console.log('🛑 Stopping recording due to speech end');
      this.currentRecording = await this.audioCaptureManager.stopRecording();
      
      this.emit('speechEnded', {
        timestamp: data.timestamp,
        duration: data.duration
      });
    }
  }

  /**
   * Handle completed recording
   * Note: In LiveKit mode, audio is streamed automatically via microphone
   * This method is mainly for compatibility with the state machine
   */
  async handleRecordingCompleted(recordingData) {
    try {
      console.log('📤 Audio recording completed (LiveKit handles streaming automatically)...');
      
      // In LiveKit, audio is streamed automatically when microphone is enabled
      // We just need to notify the state machine that audio was sent
      this.stateMachine.handleEvent(ConversationEvents.AUDIO_SENT);
      
      console.log(`✅ Audio recording completed (${recordingData?.duration || 'unknown'}ms)`);

    } catch (error) {
      console.error('❌ Failed to handle recording completion:', error);
      this.stateMachine.handleEvent(ConversationEvents.ERROR_OCCURRED, { error });
    }
  }

  /**
   * Handle agent audio track from LiveKit
   */
  async handleAgentAudio(audioTrack) {
    try {
      console.log('🔊 Received agent audio track from LiveKit...');
      
      this.stateMachine.handleEvent(ConversationEvents.AUDIO_PLAYING);
      
      // Emit audio track for UI to handle playback
      // In LiveKit, audio tracks play automatically, but we can provide additional handling
      this.emit('audioResponse', {
        audioTrack: audioTrack,
        timestamp: Date.now(),
        source: 'livekit'
      });

      // Note: In LiveKit, we don't need to manually handle audio playback completion
      // as it's handled by the WebRTC audio system automatically
      // The speaking events from LiveKit will indicate when audio starts/stops

    } catch (error) {
      console.error('❌ Failed to handle agent audio track:', error);
      this.stateMachine.handleEvent(ConversationEvents.ERROR_OCCURRED, { error });
    }
  }

  /**
   * Handle user interruption during AI response
   */
  async handleUserInterruption() {
    console.log('⚠️ Handling user interruption...');
    
    // Stop current AI audio playback (implementation depends on audio player)
    // For now, just transition to recording state
    const started = await this.audioCaptureManager.startRecording();
    if (started) {
      console.log('🎤 Started recording user interruption');
    }
  }

  /**
   * Handle state changes
   */
  handleStateChange(stateData) {
    const { currentState, previousState } = stateData;
    
    // Log state changes for debugging
    console.log(`📊 State transition: ${previousState} → ${currentState}`);
    
    // Handle specific state entry actions
    switch (currentState) {
      case ConversationStates.ERROR:
        this.handleErrorState(stateData);
        break;
        
      case ConversationStates.DISCONNECTED:
        this.handleDisconnectedState();
        break;
    }
  }

  /**
   * Handle error state
   */
  handleErrorState(stateData) {
    console.error('⚠️ Entered error state:', stateData.metadata?.error);
    
    // Implement error recovery logic
    const errorCount = stateData.stateMetadata?.errorCount || 0;
    
    if (errorCount < 3) {
      // Attempt recovery
      setTimeout(() => {
        console.log('🔄 Attempting error recovery...');
        this.stateMachine.handleEvent(ConversationEvents.CONNECT_REQUESTED);
      }, 2000);
    } else {
      // Too many errors, require manual restart
      console.error('❌ Too many errors, conversation ended');
      this.endConversation();
    }
  }

  /**
   * Handle disconnected state
   */
  handleDisconnectedState() {
    // Clean up any remaining resources
    this.conversationId = null;
    this.currentRecording = null;
  }

  /**
   * Get current conversation state
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      conversationId: this.conversationId,
      conversationState: this.stateMachine.getStateInfo(),
      voiceDetectorState: this.voiceDetector.getState(),
      audioCaptureState: this.audioCaptureManager.getState(),
      hasActiveRecording: this.currentRecording !== null
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    if (config.voiceDetection) {
      this.voiceDetector.updateConfig(config.voiceDetection);
    }
    
    if (config.audioCapture) {
      this.audioCaptureManager.updateConfig(config.audioCapture);
    }
    
    console.log('🔧 Voice Conversation Manager config updated');
  }

  /**
   * Cleanup and destroy
   */
  async destroy() {
    console.log('🗑️ Destroying Voice Conversation Manager...');
    
    try {
      await this.endConversation();
      await this.voiceDetector.stopMonitoring();
      
      // Remove all event listeners
      this.eventListeners = {
        stateChanged: [],
        speechDetected: [],
        speechEnded: [],
        audioResponse: [],
        conversationStarted: [],
        conversationEnded: [],
        error: []
      };
      
      this.isInitialized = false;
      console.log('✅ Voice Conversation Manager destroyed');
      
    } catch (error) {
      console.error('❌ Error destroying Voice Conversation Manager:', error);
    }
  }
}

// Export singleton instance
export default new VoiceConversationManager(); 