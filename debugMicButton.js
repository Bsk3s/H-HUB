import { useWebSocketVoiceChat } from '../hooks/useWebSocketVoiceChat';
import AudioConversationManager from './AudioConversationManager';
import WebSocketAudioService from './WebSocketAudioService';

/**
 * Comprehensive Mic Button Flow Debugger
 * This traces the complete flow from button press to audio streaming
 */
class MicButtonDebugger {
  constructor() {
    this.debug = true;
    this.testUserId = 'debug-user-' + Date.now(); // Generate test user ID for debugging
  }

  log(message, data = null) {
    if (this.debug) {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  }

  async testDirectAudioService() {
    this.log('Testing WebSocketAudioService directly...');
    
    try {
      const audioService = new WebSocketAudioService();
      const backendUrl = 'https://livekit-voice-agent-0jz0.onrender.com';
      
      this.log('Initializing audio service...');
      await audioService.initialize(backendUrl, this.testUserId);
      
      this.log('Connecting to WebSocket...');
      await audioService.connect();
      
      this.log('Starting real-time streaming...');
      await audioService.startRealTimeStreaming();
      
      this.log('Audio service test completed successfully');
      
      // Cleanup
      await audioService.stopRealTimeStreaming();
      await audioService.disconnect();
      
      return true;
    } catch (error) {
      this.log('Audio service test failed:', error);
      return false;
    }
  }

  async testAudioConversationManager() {
    this.log('Testing AudioConversationManager...');
    
    try {
      const manager = new AudioConversationManager();
      const backendUrl = 'https://livekit-voice-agent-0jz0.onrender.com';
      
      this.log('Initializing conversation manager...');
      await manager.initialize(backendUrl, this.testUserId);
      
      this.log('Starting conversation...');
      await manager.startConversation('adina');
      
      this.log('Conversation manager test completed successfully');
      
      // Cleanup
      await manager.stopConversation();
      
      return true;
    } catch (error) {
      this.log('Conversation manager test failed:', error);
      return false;
    }
  }

  async testVoiceHookSimulation() {
    this.log('Testing voice hook simulation...');
    
    try {
      // Simulate what the hook does
      const manager = new AudioConversationManager();
      const backendUrl = 'https://livekit-voice-agent-0jz0.onrender.com';
      
      this.log('Initializing manager (hook simulation)...');
      await manager.initialize(backendUrl, this.testUserId);
      
      this.log('Starting voice chat (hook simulation)...');
      await manager.startConversation('adina');
      
      // Simulate some user interaction
      this.log('Simulating 3 seconds of voice activity...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      this.log('Ending voice chat (hook simulation)...');
      await manager.stopConversation();
      
      this.log('Voice hook simulation completed successfully');
      
      return true;
    } catch (error) {
      this.log('Voice hook simulation failed:', error);
      return false;
    }
  }

  async testMicButtonFlow() {
    this.log('Testing complete mic button flow...');
    
    try {
      const manager = new AudioConversationManager();
      const backendUrl = 'https://livekit-voice-agent-0jz0.onrender.com';
      
      // Step 1: Initialize
      this.log('Step 1: Initialize system...');
      await manager.initialize(backendUrl, this.testUserId);
      
      // Step 2: Start conversation (equivalent to button press)
      this.log('Step 2: Start conversation (mic button press)...');
      await manager.startConversation('adina');
      
      // Step 3: Simulate voice input
      this.log('Step 3: Simulating voice input...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 4: End conversation (button press again)
      this.log('Step 4: End conversation (mic button press)...');
      await manager.stopConversation();
      
      this.log('Complete mic button flow test completed successfully');
      
      return true;
    } catch (error) {
      this.log('Complete mic button flow test failed:', error);
      return false;
    }
  }

  async testWebSocketConnectionOnly() {
    this.log('Testing WebSocket connection only...');
    
    try {
      const manager = new AudioConversationManager();
      const backendUrl = 'https://livekit-voice-agent-0jz0.onrender.com';
      
      this.log('Initializing for connection test...');
      await manager.initialize(backendUrl, this.testUserId);
      
      // Just test connection, no audio
      this.log('Testing WebSocket connection...');
      await manager.audioService.connect();
      
      this.log('Connection successful, disconnecting...');
      await manager.audioService.disconnect();
      
      this.log('WebSocket connection test completed successfully');
      
      return true;
    } catch (error) {
      this.log('WebSocket connection test failed:', error);
      return false;
    }
  }
}

export default MicButtonDebugger;

// Export convenience functions
export const debugMicButtonFlow = async () => {
  const micDebugger = new MicButtonDebugger();
  await micDebugger.testMicButtonFlow();
};

export const quickMicTest = async () => {
  const micDebugger = new MicButtonDebugger();
  await micDebugger.testWebSocketConnectionOnly();
}; 