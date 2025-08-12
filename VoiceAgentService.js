// import { Room, RoomEvent, Track } from 'livekit-client'; // DISABLED - using WebSocket instead
import { Audio } from 'expo-av';

/**
 * VoiceAgentService - STUBBED VERSION
 * LiveKit dependency removed - WebSocketAudioService is used instead
 * This is kept for compatibility with existing test files
 */

class VoiceAgentService {
  constructor() {
    this.room = null;
    this.isConnected = false;
    this.isStreaming = false;
    this.eventListeners = {};
    this.backendUrl = 'https://livekit-voice-agent-0jz0.onrender.com';
    this.livekitUrl = 'wss://hb-j73yzwmu.livekit.cloud';
    this.currentToken = null;
    this.sessionId = null;
    this.userId = null;
    
    console.log('⚠️ VoiceAgentService initialized in stub mode - LiveKit disabled');
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
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

  // Stub methods for compatibility
  async generateToken(character, userId, displayName) {
    console.log('🔧 VoiceAgentService.generateToken (stub) - using WebSocket instead');
    return Promise.resolve('stub-token');
  }

  async connect(userId, character, displayName) {
    console.log('🔧 VoiceAgentService.connect (stub) - using WebSocket instead');
    this.isConnected = false; // Always false since we're using WebSocket
    return Promise.resolve();
  }

  async disconnect() {
    console.log('🔧 VoiceAgentService.disconnect (stub)');
    this.isConnected = false;
    return Promise.resolve();
  }

  async startStreaming() {
    console.log('🔧 VoiceAgentService.startStreaming (stub)');
    this.isStreaming = false;
    return Promise.resolve();
  }

  async stopStreaming() {
    console.log('🔧 VoiceAgentService.stopStreaming (stub)');
    this.isStreaming = false;
    return Promise.resolve();
  }

  async healthCheck() {
    console.log('🔧 VoiceAgentService.healthCheck (stub)');
    return Promise.resolve({ status: 'ok', service: 'stub' });
  }

  async createSession(userId, instructions) {
    console.log('🔧 VoiceAgentService.createSession (stub)');
    return Promise.resolve('stub-session-id');
  }

  async deleteSession() {
    console.log('🔧 VoiceAgentService.deleteSession (stub)');
    return Promise.resolve();
  }

  async startSession(agent, instructions) {
    console.log('🔧 VoiceAgentService.startSession (stub)');
    return Promise.resolve();
  }

  getSessionInfo() {
    return {
      isConnected: this.isConnected,
      sessionId: this.sessionId,
      userId: this.userId,
      isStreaming: this.isStreaming,
      service: 'stub'
    };
  }

  send(data) {
    console.log('🔧 VoiceAgentService.send (stub)');
  }

  sendAudio(audioBuffer) {
    console.log('🔧 VoiceAgentService.sendAudio (stub)');
  }

  arrayBufferToBase64(buffer) {
    // Keep this utility method working
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export default new VoiceAgentService();