import { Audio } from 'expo-av';
import { EventEmitter } from 'eventemitter3';
import AudioQueue from './AudioQueue';
import { VOICE_CHAT_AUDIO_CONFIG } from '../features/audio/constants/audio';
import AudioOutputManager from './AudioOutputManager';

class WebSocketAudioService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.recording = null;
    this.sound = null;
    this.isConnected = false;
    this.isRecording = false;
    this.backendUrl = null;
    this.userId = null;
    
    // Progressive streaming
    this.audioQueue = new AudioQueue();
    this.streamingState = {
      isStreaming: false,
      currentChunk: 0,
      totalChunks: 0,
      fullText: ''
    };
    
    // Audio configuration for real-time PCM streaming (Deepgram format)
    this.audioConfig = {
      android: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 16000, // Deepgram prefers 16kHz
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 16000, // Deepgram prefers 16kHz
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    };
    
    // Streaming configuration
    this.streamingConfig = {
      chunkDuration: 250, // 250ms chunks for smooth streaming
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16
    };
    
    // Audio streaming state
    this.audioChunks = [];
    this.lastStreamTime = 0;
  }

  async initialize(backendUrl, userId) {
    this.backendUrl = backendUrl;
    this.userId = userId; // Store user ID for WebSocket connection
    console.log('🎵 WebSocket Audio Service initialized for PCM streaming');
    console.log('👤 User ID:', userId);
    
    // Request audio permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Audio permission not granted');
    }

    // Configure audio mode for real-time streaming
    console.log('🔧 Configuring audio for voice chat...');
    await Audio.setAudioModeAsync(VOICE_CHAT_AUDIO_CONFIG);
    
    console.log('✅ Audio system configured for voice chat');
  }

  async connect(character = 'adina') {
    return new Promise((resolve, reject) => {
      try {
        // Connect to the new voice agent endpoint
        const wsUrl = 'wss://livekit-python-agent.up.railway.app/ws/audio';
        console.log('🔌 Connecting to voice agent WebSocket endpoint:', wsUrl);
        console.log('👤 User ID:', this.userId);
        console.log('🎭 Character:', character);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnected = true;
          
          // Send initialization message with character choice as specified in the protocol
          this.sendInitializationMessage(character);
          
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleWebSocketMessage(event.data);
        };

        this.ws.onclose = () => {
          console.log('❌ WebSocket disconnected');
          this.isConnected = false;
          this.emit('disconnected');
        };

        this.ws.onerror = (error) => {
          console.error('🔥 WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        console.error('🔥 Connection error:', error);
        reject(error);
      }
    });
  }

  async startRealTimeStreaming() {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    try {
      console.log('🎤 Starting real-time PCM streaming...');
      
      // Create recording instance with optimized settings for streaming
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        ...this.audioConfig,
        // Enable metering for real-time data
        isMeteringEnabled: true
      });
      
      // Start recording
      await this.recording.startAsync();
      this.isRecording = true;
      
      // Set up real-time status monitoring for audio streaming
      this.recording.setOnRecordingStatusUpdate((status) => {
        this.handleRecordingStatusUpdate(status);
      });

      // Set up periodic audio chunk extraction (every 250ms)
      this.streamingInterval = setInterval(async () => {
        if (this.isRecording && this.recording) {
          await this.extractAndStreamAudioChunk();
        }
      }, this.streamingConfig.chunkDuration);

      this.emit('recordingStarted');
      console.log('🎵 Real-time PCM streaming started');

    } catch (error) {
      console.error('🔥 Failed to start PCM streaming:', error);
      this.emit('error', error);
      throw error;
    }
  }

  handleRecordingStatusUpdate(status) {
    if (status.isRecording) {
      // Emit voice level for UI feedback
      const voiceLevel = status.metering || 0;
      this.emit('voiceLevel', Math.max(0, (voiceLevel + 50) / 50)); // Normalize to 0-1
    }
  }

  async extractAndStreamAudioChunk() {
    try {
      const currentTime = Date.now();
      
      // Only extract if enough time has passed
      if (currentTime - this.lastStreamTime < this.streamingConfig.chunkDuration) {
        return;
      }
      
      this.lastStreamTime = currentTime;
      
      // Get current recording status
      const status = await this.recording.getStatusAsync();
      if (!status.isRecording) {
        return;
      }
      
      // For real-time streaming, we need to extract PCM data differently
      // This is a workaround since expo-av doesn't expose direct PCM buffers
      await this.streamRecordingData();
      
    } catch (error) {
      console.error('🔥 Audio chunk extraction error:', error);
    }
  }

  async streamRecordingData() {
    try {
      // Get the current recording URI
      const uri = this.recording.getURI();
      if (!uri) return;
      
      // Read the audio file and extract raw audio data
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      
      // Extract PCM data from WAV file (skip WAV headers)
      const pcmData = this.extractPCMFromWAV(arrayBuffer);
      
      // Only send new audio data (not entire file each time)
      const newPCMData = this.getNewAudioData(pcmData);
      
      if (newPCMData && newPCMData.byteLength > 0) {
        // Convert PCM data to base64 and send in the required JSON format
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const base64Audio = this.arrayBufferToBase64?.bind(this)(newPCMData) || btoa(String.fromCharCode(...new Uint8Array(newPCMData)));
          const audioMessage = {
            type: 'audio',
            audio: base64Audio
          };
          this.ws.send(JSON.stringify(audioMessage));
          console.log(`📤 SENT: ${newPCMData.byteLength} bytes to backend as base64`);
        }
      }
      
    } catch (error) {
      console.error('🔥 PCM streaming error:', error);
    }
  }

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  extractPCMFromWAV(wavArrayBuffer) {
    try {
      // WAV file structure: 44-byte header + PCM data
      const headerSize = 44;
      
      if (wavArrayBuffer.byteLength <= headerSize) {
        return new ArrayBuffer(0);
      }
      
      // Extract PCM data (everything after the 44-byte WAV header)
      return wavArrayBuffer.slice(headerSize);
      
    } catch (error) {
      console.error('🔥 PCM extraction error:', error);
      return new ArrayBuffer(0);
    }
  }

  getNewAudioData(currentPCMData) {
    try {
      const currentLength = currentPCMData.byteLength;
      const lastLength = this.lastPCMLength || 0;
      
      // If we have new data, extract only the new portion
      if (currentLength > lastLength) {
        const newData = currentPCMData.slice(lastLength);
        this.lastPCMLength = currentLength;
        return newData;
      }
      
      return null;
      
    } catch (error) {
      console.error('🔥 New audio data extraction error:', error);
      return null;
    }
  }

  async stopRealTimeStreaming() {
    try {
      console.log('🛑 Stopping real-time PCM streaming...');
      
      if (this.streamingInterval) {
        clearInterval(this.streamingInterval);
        this.streamingInterval = null;
      }

      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      this.isRecording = false;
      this.lastPCMLength = 0;
      this.audioChunks = [];
      
      this.emit('recordingStopped');
      console.log('✅ PCM streaming stopped');

    } catch (error) {
      console.error('🔥 Error stopping PCM streaming:', error);
    }
  }

  async handleWebSocketMessage(message) {
    try {
      // Try to parse as JSON for conversational intelligence messages
      let data;
      try {
        data = JSON.parse(message);
      } catch (e) {
        // Handle simple string messages
        if (typeof message === 'string') {
          return this.handleSimpleMessage(message);
        }
        // If not JSON, treat as binary audio data (legacy)
        return this.handleIncomingAudio(message);
      }
      
      // Handle full conversational intelligence messages
      switch(data.type) {
        // Speech Detection Events
        case 'speech_detected':
          this.handleSpeechDetected(data);
          break;
          
        case 'speech_end_detected':
          this.handleSpeechEnded(data);
          break;
        
        // Transcription Events  
        case 'transcription_partial':
          this.handlePartialTranscription(data);
          break;
          
        case 'transcription_complete':
          this.handleCompleteTranscription(data);
          break;
        
        // LLM Processing Events
        case 'processing_started':
          this.handleProcessingStarted(data);
          break;
          
        case 'llm_thinking':
          this.handleLLMThinking(data);
          break;
        
        // AI Response Events
        case 'response_start':
          this.prepareForStreamingResponse(data);
          break;
          
        case 'audio_chunk':
        case 'audio_stream':  // CRITICAL FIX: Backend sends 'audio_stream', not 'audio_chunk'
        case 'streaming_audio_chunk':  // NEW: Backend now sends 'streaming_audio_chunk'
          console.log('🚨 CRITICAL: audio_stream message reached handler! Data keys:', Object.keys(data));
          await this.handleAudioChunk(data);
          break;
          
        case 'response_complete':
          this.handleResponseComplete(data);
          break;
        
        // Conversation Flow Events
        case 'listening_ready':
          this.handleListeningReady(data);
          break;
          
        case 'conversation_state':
          this.handleConversationState(data);
          break;
          
        case 'turn_taking':
          this.handleTurnTaking(data);
          break;
        
        // Character Events
        case 'character_switched':
          this.handleCharacterSwitch(data);
          break;
        
        // Error Events
        case 'error':
          this.handleBackendError(data);
          break;
          
        // Backend audio confirmation
        case 'audio_received':
          console.log('✅ Backend confirmed audio received:', data);
          break;
          
        default:
          console.log('📨 Received message:', data.type, data);
          console.log('🔍 EXACT TYPE DEBUG:', JSON.stringify(data.type));
          console.log('🔍 TYPE LENGTH:', data.type?.length);
          console.log('🔍 ALL DATA KEYS:', Object.keys(data));
          if (data.type && data.type.includes('audio')) {
            console.log('🚨 AUDIO MESSAGE IN DEFAULT CASE! Type:', JSON.stringify(data.type));
          }
      }
      
    } catch (error) {
      console.error('🔥 Error handling WebSocket message:', error);
    }
  }

  handleSimpleMessage(message) {
    console.log('📨 Simple message:', message);
    if (message === 'connected') {
      this.emit('backendConnected');
    }
  }

  // Speech Detection Handlers
  handleSpeechDetected(data) {
    console.log('🗣️ BACKEND HEARD YOU: Speech detected:', data);
    console.log('🎯 Backend is processing your voice input!');
    this.emit('speechDetected', {
      confidence: data.confidence || 0,
      timestamp: data.timestamp || Date.now()
    });
  }

  handleSpeechEnded(data) {
    console.log('🤐 Speech ended by backend:', data);
    this.emit('speechEnded', {
      duration: data.duration || 0,
      timestamp: data.timestamp || Date.now()
    });
    
    // Automatically stop streaming when backend detects speech end
    if (this.isRecording) {
      this.stopRealTimeStreaming();
    }
  }

  // Transcription Handlers
  handlePartialTranscription(data) {
    console.log('📝 BACKEND UNDERSTANDING: Partial transcription:', data.text);
    console.log('🔄 Backend is converting your speech to text...');
    this.emit('partialTranscription', {
      text: data.text || '',
      confidence: data.confidence || 0,
      is_final: false
    });
  }

  handleCompleteTranscription(data) {
    console.log('✅ BACKEND UNDERSTOOD: Complete transcription:', data.text);
    console.log('💬 Backend successfully processed your speech!');
    this.emit('completeTranscription', {
      text: data.text || '',
      confidence: data.confidence || 0,
      is_final: true
    });
  }

  // LLM Processing Handlers
  handleProcessingStarted(data) {
    console.log('🧠 LLM processing started:', data);
    this.emit('processingStarted', {
      character: data.character || 'unknown',
      input_text: data.input_text || ''
    });
  }

  handleLLMThinking(data) {
    console.log('💭 LLM thinking:', data);
    this.emit('llmThinking', {
      progress: data.progress || 0,
      stage: data.stage || 'processing'
    });
  }

  // Conversation Flow Handlers
  handleListeningReady(data) {
    console.log('👂 Ready to listen again:', data);
    this.emit('listeningReady', {
      character: data.character || 'unknown',
      conversation_id: data.conversation_id
    });
    
    // Automatically restart listening for next user input
    if (!this.isRecording && this.isConnected) {
      setTimeout(() => {
        this.startRealTimeStreaming();
      }, 500); // Small delay for natural conversation flow
    }
  }

  handleConversationState(data) {
    console.log('💬 Conversation state update:', data);
    this.emit('conversationStateUpdate', {
      state: data.state || 'unknown',
      turn: data.turn || 'user',
      participants: data.participants || []
    });
  }

  handleTurnTaking(data) {
    console.log('🔄 Turn taking event:', data);
    this.emit('turnTaking', {
      current_speaker: data.current_speaker || 'user',
      next_speaker: data.next_speaker || 'ai',
      can_interrupt: data.can_interrupt || false
    });
  }

  // Character Handlers
  handleCharacterSwitch(data) {
    console.log('🎭 Character switched:', data);
    this.emit('characterSwitched', {
      from_character: data.from_character || 'unknown',
      to_character: data.to_character || 'unknown',
      voice_changed: data.voice_changed || false
    });
  }

  // Error Handlers
  handleBackendError(data) {
    console.error('❌ Backend error:', data);
    this.emit('backendError', {
      error_type: data.error_type || 'unknown',
      message: data.message || 'Unknown error',
      recoverable: data.recoverable || false
    });
  }

  prepareForStreamingResponse(data) {
    console.log('🎬 Preparing for streaming response:', data);
    
    // Force speaker output for iOS voice chat
    if (AudioOutputManager.isAvailable()) {
      AudioOutputManager.forceSpeakerOutput().catch(error => {
        console.warn('⚠️ Could not force speaker output:', error);
      });
    }
    
    // Update streaming state
    this.streamingState = {
      isStreaming: true,
      currentChunk: 0,
      totalChunks: data.total_chunks || 0,
      fullText: data.full_text || ''
    };
    
    // Set up audio queue callbacks
    this.audioQueue.setOnChunkStarted((chunkId) => {
      this.emit('chunkStarted', chunkId);
    });
    
    this.audioQueue.setOnComplete(() => {
      this.emit('audioReceived');
      this.streamingState.isStreaming = false;
    });
    
    this.emit('streamingStarted', this.streamingState);
  }

  async handleAudioChunk(data) {
    console.log(`🎵 Received audio chunk ${data.chunk_id}/${this.streamingState.totalChunks}`);
    
    // Update progress
    this.streamingState.currentChunk = data.chunk_id;
    
    // 🔍 DETAILED DEBUG INFO
    console.log('🔍 DEBUG: About to call audioQueue.addChunk');
    console.log('🔍 DEBUG: Audio data length:', data.audio_data?.length || 'undefined');
    console.log('🔍 DEBUG: AudioQueue exists?', !!this.audioQueue);
    console.log('🔍 DEBUG: Audio data preview:', data.audio_data?.substring(0, 50) + '...');
    
    try {
      // 🚨 CRITICAL FIX: Add await + comprehensive error handling
      await this.audioQueue.addChunk(data.audio_data, data.chunk_id);
      console.log('✅ DEBUG: audioQueue.addChunk completed successfully');
    } catch (error) {
      console.error('🚨 AUDIO ERROR REVEALED:', error);
      console.error('🚨 Error name:', error.name);
      console.error('🚨 Error message:', error.message);
      console.error('🚨 Error stack:', error.stack);
      console.error('🚨 THIS IS WHY YOUR AUDIO IS SILENT! ☝️');
    }
    
    // Emit progress event
    this.emit('streamingProgress', {
      currentChunk: data.chunk_id,
      totalChunks: this.streamingState.totalChunks,
      text: data.text || ''
    });
  }

  handleResponseComplete(data) {
    console.log('✅ Response streaming complete');
    this.streamingState.isStreaming = false;
    this.emit('streamingComplete', data);
  }

  async handleIncomingAudio(audioData) {
    try {
      console.log('🔊 Received audio response from backend');
      
      // Convert audio data back to playable format
      // For now, we'll save it temporarily and play it
      const audioBlob = new Blob([audioData], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      this.sound = sound;
      
      // Clean up when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          URL.revokeObjectURL(audioUrl);
        }
      });

      this.emit('audioReceived');

    } catch (error) {
      console.error('🔥 Error playing audio:', error);
      this.emit('error', error);
    }
  }

  sendInitializationMessage(character = 'adina') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const initMessage = {
        type: "initialize",
        character: character
      };
      this.ws.send(JSON.stringify(initMessage));
      console.log('🎭 Sent initialization message:', initMessage);
    }
  }

  async sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        content: message
      }));
    }
  }

  async disconnect() {
    try {
      console.log('🔌 Disconnecting WebSocket audio service...');
      
      // Stop any ongoing streaming
      await this.stopRealTimeStreaming();
      
      // Stop audio queue
      await this.audioQueue.stop();
      
      // Stop any playing audio
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      // Reset streaming state
      this.streamingState = {
        isStreaming: false,
        currentChunk: 0,
        totalChunks: 0,
        fullText: ''
      };
      
      // Close WebSocket connection
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      
      this.isConnected = false;
      console.log('✅ Disconnected successfully');
      
    } catch (error) {
      console.error('🔥 Error during disconnect:', error);
    }
  }

  // Utility methods
  isConnectionActive() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // Streaming state getters
  getStreamingState() {
    return { ...this.streamingState };
  }

  isStreaming() {
    return this.streamingState.isStreaming;
  }

  getStreamingProgress() {
    if (!this.streamingState.totalChunks) return 0;
    return this.streamingState.currentChunk / this.streamingState.totalChunks;
  }

  isAudioPlaying() {
    return this.audioQueue.isCurrentlyPlaying();
  }
}

export default WebSocketAudioService; 