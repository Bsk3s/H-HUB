/**
 * Conversation State Machine
 * Manages the conversation flow with clear states and transitions
 * Implements the State Pattern for conversation management
 */

// Define all possible conversation states
export const ConversationStates = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting', 
  CONNECTED: 'connected',
  LISTENING: 'listening',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  PLAYING: 'playing',
  ERROR: 'error',
  DISCONNECTING: 'disconnecting'
};

// Define valid state transitions
const StateTransitions = {
  [ConversationStates.DISCONNECTED]: [
    ConversationStates.CONNECTING,
    ConversationStates.ERROR
  ],
  [ConversationStates.CONNECTING]: [
    ConversationStates.CONNECTED,
    ConversationStates.ERROR,
    ConversationStates.DISCONNECTED
  ],
  [ConversationStates.CONNECTED]: [
    ConversationStates.LISTENING,
    ConversationStates.DISCONNECTING,
    ConversationStates.ERROR
  ],
  [ConversationStates.LISTENING]: [
    ConversationStates.RECORDING,
    ConversationStates.PLAYING,
    ConversationStates.DISCONNECTING,
    ConversationStates.ERROR
  ],
  [ConversationStates.RECORDING]: [
    ConversationStates.PROCESSING,
    ConversationStates.LISTENING,
    ConversationStates.ERROR
  ],
  [ConversationStates.PROCESSING]: [
    ConversationStates.PLAYING,
    ConversationStates.LISTENING,
    ConversationStates.ERROR
  ],
  [ConversationStates.PLAYING]: [
    ConversationStates.LISTENING,
    ConversationStates.RECORDING, // For interruptions
    ConversationStates.ERROR
  ],
  [ConversationStates.ERROR]: [
    ConversationStates.DISCONNECTED,
    ConversationStates.CONNECTING,
    ConversationStates.CONNECTED
  ],
  [ConversationStates.DISCONNECTING]: [
    ConversationStates.DISCONNECTED
  ]
};

// Define events that trigger state changes
export const ConversationEvents = {
  CONNECT_REQUESTED: 'connect_requested',
  CONNECTION_ESTABLISHED: 'connection_established', 
  SESSION_STARTED: 'session_started',
  SPEECH_DETECTED: 'speech_detected',
  SPEECH_ENDED: 'speech_ended',
  AUDIO_SENT: 'audio_sent',
  RESPONSE_RECEIVED: 'response_received',
  AUDIO_PLAYING: 'audio_playing',
  AUDIO_FINISHED: 'audio_finished',
  USER_INTERRUPTED: 'user_interrupted',
  ERROR_OCCURRED: 'error_occurred',
  DISCONNECT_REQUESTED: 'disconnect_requested',
  DISCONNECTED: 'disconnected'
};

export class ConversationStateMachine {
  constructor() {
    this.currentState = ConversationStates.DISCONNECTED;
    this.previousState = null;
    this.stateHistory = [];
    
    // Event listeners for state changes
    this.eventListeners = {
      stateChanged: [],
      error: []
    };

    // State metadata
    this.stateMetadata = {
      enterTime: Date.now(),
      errorCount: 0,
      lastError: null
    };
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
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get current state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Check if transition is valid
   */
  canTransitionTo(newState) {
    const allowedTransitions = StateTransitions[this.currentState] || [];
    return allowedTransitions.includes(newState);
  }

  /**
   * Transition to new state
   */
  transitionTo(newState, event = null, metadata = {}) {
    if (!this.canTransitionTo(newState)) {
      const error = new Error(
        `Invalid state transition from ${this.currentState} to ${newState}`
      );
      console.error('❌ State transition error:', error.message);
      this.emit('error', error);
      return false;
    }

    // Record state change
    this.previousState = this.currentState;
    const transitionData = {
      from: this.currentState,
      to: newState,
      event: event,
      timestamp: Date.now(),
      metadata: metadata
    };

    // Update state
    this.currentState = newState;
    this.stateHistory.push(transitionData);
    this.stateMetadata = {
      enterTime: Date.now(),
      errorCount: newState === ConversationStates.ERROR ? this.stateMetadata.errorCount + 1 : 0,
      lastError: newState === ConversationStates.ERROR ? metadata.error : null
    };

    // Limit history size
    if (this.stateHistory.length > 50) {
      this.stateHistory = this.stateHistory.slice(-25);
    }

    console.log(`🔄 State: ${this.previousState} → ${newState}${event ? ` (${event})` : ''}`);
    
    // Emit state change event
    this.emit('stateChanged', {
      currentState: this.currentState,
      previousState: this.previousState,
      event: event,
      metadata: metadata,
      stateMetadata: this.stateMetadata
    });

    return true;
  }

  /**
   * Handle conversation events and trigger appropriate state transitions
   */
  handleEvent(event, data = {}) {
    console.log(`📨 Handling event: ${event} in state: ${this.currentState}`);

    switch (event) {
      case ConversationEvents.CONNECT_REQUESTED:
        if (this.currentState === ConversationStates.DISCONNECTED) {
          this.transitionTo(ConversationStates.CONNECTING, event, data);
        }
        break;

      case ConversationEvents.CONNECTION_ESTABLISHED:
        if (this.currentState === ConversationStates.CONNECTING) {
          this.transitionTo(ConversationStates.CONNECTED, event, data);
        }
        break;

      case ConversationEvents.SESSION_STARTED:
        if (this.currentState === ConversationStates.CONNECTED) {
          this.transitionTo(ConversationStates.LISTENING, event, data);
        }
        break;

      case ConversationEvents.SPEECH_DETECTED:
        if (this.currentState === ConversationStates.LISTENING) {
          this.transitionTo(ConversationStates.RECORDING, event, data);
        } else if (this.currentState === ConversationStates.PLAYING) {
          // User interruption during AI response
          this.transitionTo(ConversationStates.RECORDING, ConversationEvents.USER_INTERRUPTED, data);
        }
        break;

      case ConversationEvents.SPEECH_ENDED:
        if (this.currentState === ConversationStates.RECORDING) {
          this.transitionTo(ConversationStates.PROCESSING, event, data);
        }
        break;

      case ConversationEvents.AUDIO_SENT:
        // Audio sent, waiting for response (stay in processing)
        break;

      case ConversationEvents.RESPONSE_RECEIVED:
        if (this.currentState === ConversationStates.PROCESSING) {
          this.transitionTo(ConversationStates.PLAYING, event, data);
        }
        break;

      case ConversationEvents.AUDIO_PLAYING:
        // Audio is playing (already in PLAYING state typically)
        break;

      case ConversationEvents.AUDIO_FINISHED:
        if (this.currentState === ConversationStates.PLAYING) {
          this.transitionTo(ConversationStates.LISTENING, event, data);
        }
        break;

      case ConversationEvents.ERROR_OCCURRED:
        this.transitionTo(ConversationStates.ERROR, event, { error: data.error });
        break;

      case ConversationEvents.DISCONNECT_REQUESTED:
        if (this.currentState !== ConversationStates.DISCONNECTED) {
          this.transitionTo(ConversationStates.DISCONNECTING, event, data);
        }
        break;

      case ConversationEvents.DISCONNECTED:
        this.transitionTo(ConversationStates.DISCONNECTED, event, data);
        break;

      default:
        console.warn(`⚠️ Unhandled event: ${event} in state: ${this.currentState}`);
    }
  }

  /**
   * Get state information for UI
   */
  getStateInfo() {
    return {
      currentState: this.currentState,
      previousState: this.previousState,
      stateMetadata: this.stateMetadata,
      isIdle: this.currentState === ConversationStates.DISCONNECTED,
      isConnecting: this.currentState === ConversationStates.CONNECTING,
      isActive: [
        ConversationStates.CONNECTED,
        ConversationStates.LISTENING,
        ConversationStates.RECORDING,
        ConversationStates.PROCESSING,
        ConversationStates.PLAYING
      ].includes(this.currentState),
      isListening: this.currentState === ConversationStates.LISTENING,
      isRecording: this.currentState === ConversationStates.RECORDING,
      isProcessing: this.currentState === ConversationStates.PROCESSING,
      isPlaying: this.currentState === ConversationStates.PLAYING,
      hasError: this.currentState === ConversationStates.ERROR,
      errorCount: this.stateMetadata.errorCount
    };
  }

  /**
   * Reset state machine
   */
  reset() {
    console.log('🔄 Resetting conversation state machine');
    this.previousState = this.currentState;
    this.currentState = ConversationStates.DISCONNECTED;
    this.stateMetadata = {
      enterTime: Date.now(),
      errorCount: 0,
      lastError: null
    };
    
    this.emit('stateChanged', {
      currentState: this.currentState,
      previousState: this.previousState,
      event: 'RESET',
      metadata: { reason: 'State machine reset' },
      stateMetadata: this.stateMetadata
    });
  }

  /**
   * Get state history for debugging
   */
  getStateHistory() {
    return {
      current: this.currentState,
      previous: this.previousState,
      history: this.stateHistory.slice(-10), // Last 10 transitions
      metadata: this.stateMetadata
    };
  }

  /**
   * Force state (for error recovery)
   */
  forceState(newState, reason = 'Force transition') {
    console.warn(`⚠️ Force transitioning to state: ${newState} (${reason})`);
    this.previousState = this.currentState;
    this.currentState = newState;
    this.stateMetadata.enterTime = Date.now();
    
    this.emit('stateChanged', {
      currentState: this.currentState,
      previousState: this.previousState,
      event: 'FORCE_TRANSITION',
      metadata: { reason },
      stateMetadata: this.stateMetadata
    });
  }
} 