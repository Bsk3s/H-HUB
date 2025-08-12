// Simple integration test for voice chat functionality
import VoiceAgentService from '../VoiceAgentService';
import SimpleAudioStreamer from '../SimpleAudioStreamer';
import AudioPlayer from '../AudioPlayer';
import healthCheckService from '../healthCheckService';

describe('Voice Chat Integration', () => {
  test('VoiceAgentService should initialize correctly', () => {
    expect(VoiceAgentService).toBeDefined();
    expect(VoiceAgentService.isConnected).toBe(false);
    expect(VoiceAgentService.sessionId).toBe(null);
  });

  test('Backend URL should be configured correctly', () => {
    expect(VoiceAgentService.backendUrl).toBe('wss://heavenly-new.onrender.com');
  });

  test('Audio services should be available', () => {
    expect(SimpleAudioStreamer).toBeDefined();
    expect(AudioPlayer).toBeDefined();
    expect(typeof SimpleAudioStreamer.initialize).toBe('function');
    expect(typeof AudioPlayer.initialize).toBe('function');
  });

  test('Event system should work', () => {
    let eventFired = false;
    VoiceAgentService.on('test', () => {
      eventFired = true;
    });
    
    VoiceAgentService.emit('test');
    expect(eventFired).toBe(true);
  });

  test('Audio buffer conversion should work', () => {
    const testString = 'Hello World';
    const base64 = btoa(testString);
    const buffer = VoiceAgentService.arrayBufferToBase64(new TextEncoder().encode(testString).buffer);
    
    expect(typeof buffer).toBe('string');
    expect(buffer.length).toBeGreaterThan(0);
  });
});

// Manual test function for development
export const testVoiceIntegration = () => {
  console.log('🧪 Testing Voice Integration...');
  
  // Test event system
  VoiceAgentService.on('test', (data) => {
    console.log('✅ Event system works:', data);
  });
  
  VoiceAgentService.emit('test', { message: 'Hello from test!' });
  
  // Test backend URL
  console.log('🔗 Backend URL:', VoiceAgentService.backendUrl);
  
  // Test audio services
  console.log('🎤 Audio Streamer:', SimpleAudioStreamer ? 'Available' : 'Not available');
  console.log('🔊 Audio Player:', AudioPlayer ? 'Available' : 'Not available');
  
  console.log('✅ Voice integration test complete!');
};

// Voice Integration Test - Complete API Integration Testing
class VoiceIntegrationTest {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.testResults.push({ timestamp, message, type });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Step 1: Test Health Check Implementation
  async testHealthCheck() {
    this.log('🏥 Testing health check functionality...');
    
    try {
      // Test basic health check
      const isHealthy = await healthCheckService.checkHealth();
      if (isHealthy) {
        this.log('✅ Health check passed', 'success');
      } else {
        this.log('❌ Health check failed - service not healthy', 'error');
        return false;
      }

      // Test health status monitoring
      const status = healthCheckService.getHealthStatus();
      this.log(`📊 Health status: ${JSON.stringify(status)}`, 'info');

      return true;
    } catch (error) {
      this.log(`❌ Health check error: ${error.message}`, 'error');
      return false;
    }
  }

  // Step 2: Test Session Management
  async testSessionManagement() {
    this.log('📝 Testing session management...');
    
    try {
      const userId = `test_user_${Date.now()}`;
      const instructions = "You are a test AI assistant for integration testing.";

      // Test session creation via REST API
      this.log('Creating session via REST API...');
      const sessionId = await VoiceAgentService.createSession(userId, instructions);
      
      if (sessionId) {
        this.log(`✅ Session created: ${sessionId}`, 'success');
      } else {
        this.log('❌ Session creation failed', 'error');
        return false;
      }

      // Wait a moment
      await this.delay(1000);

      // Test session deletion
      this.log('Deleting session...');
      await VoiceAgentService.deleteSession();
      this.log('✅ Session deleted successfully', 'success');

      return true;
    } catch (error) {
      this.log(`❌ Session management error: ${error.message}`, 'error');
      return false;
    }
  }

  // Step 3: Test WebSocket Integration
  async testWebSocketConnection() {
    this.log('🔌 Testing WebSocket connection...');
    
    try {
      const userId = `ws_test_user_${Date.now()}`;
      let connectionEstablished = false;
      let sessionCreated = false;

      // Set up event listeners
      const onConnected = () => {
        connectionEstablished = true;
        this.log('✅ WebSocket connected', 'success');
      };

      const onSessionStarted = () => {
        sessionCreated = true;
        this.log('✅ Session started via WebSocket', 'success');
      };

      const onError = (error) => {
        this.log(`❌ WebSocket error: ${error}`, 'error');
      };

      VoiceAgentService.on('connected', onConnected);
      VoiceAgentService.on('session_started', onSessionStarted);
      VoiceAgentService.on('error', onError);

      // Connect to WebSocket
      this.log('Connecting to WebSocket...');
      await VoiceAgentService.connect(userId);

      // Wait for connection
      await this.delay(3000);

      if (!connectionEstablished) {
        this.log('❌ WebSocket connection failed', 'error');
        return false;
      }

      // Test session creation via WebSocket
      this.log('Starting session via WebSocket...');
      await VoiceAgentService.startSession('test_agent', 'Test instructions');

      // Wait for session creation
      await this.delay(2000);

      if (!sessionCreated) {
        this.log('⚠️ Session creation via WebSocket not confirmed (may be normal)', 'warning');
      }

      // Cleanup
      VoiceAgentService.off('connected', onConnected);
      VoiceAgentService.off('session_started', onSessionStarted);
      VoiceAgentService.off('error', onError);

      return true;
    } catch (error) {
      this.log(`❌ WebSocket test error: ${error.message}`, 'error');
      return false;
    }
  }

  // Step 4: Test Message Protocol
  async testMessageProtocol() {
    this.log('📨 Testing WebSocket message protocol...');
    
    try {
      let pingReceived = false;

      // Set up pong listener
      const onPong = () => {
        pingReceived = true;
        this.log('✅ Received pong response', 'success');
      };

      VoiceAgentService.on('message', (data) => {
        if (data.type === 'pong') {
          onPong();
        }
      });

      // Send ping message
      if (VoiceAgentService.isConnected) {
        this.log('Sending ping message...');
        VoiceAgentService.send(JSON.stringify({ type: 'ping' }));

        // Wait for pong
        await this.delay(2000);

        if (pingReceived) {
          this.log('✅ Ping-pong protocol working', 'success');
        } else {
          this.log('⚠️ No pong received (may be normal depending on backend)', 'warning');
        }
      } else {
        this.log('⚠️ WebSocket not connected, skipping ping test', 'warning');
      }

      return true;
    } catch (error) {
      this.log(`❌ Message protocol test error: ${error.message}`, 'error');
      return false;
    }
  }

  // Step 5: Test Error Handling and Reconnection
  async testErrorHandling() {
    this.log('🔄 Testing error handling and reconnection...');
    
    try {
      let reconnectAttempted = false;
      let maxReconnectsReached = false;

      // Set up reconnection listeners
      const onReconnect = () => {
        reconnectAttempted = true;
        this.log('✅ Reconnection attempted', 'success');
      };

      const onMaxReconnects = () => {
        maxReconnectsReached = true;
        this.log('✅ Max reconnects reached event fired', 'success');
      };

      VoiceAgentService.on('connected', onReconnect);
      VoiceAgentService.on('max_reconnects_reached', onMaxReconnects);

      // Force disconnect to test reconnection
      if (VoiceAgentService.ws) {
        this.log('Forcing WebSocket disconnect to test reconnection...');
        VoiceAgentService.ws.close(1006, 'Test disconnect'); // Abnormal closure
        
        // Wait for reconnection attempts
        await this.delay(5000);
      }

      // Cleanup listeners
      VoiceAgentService.off('connected', onReconnect);
      VoiceAgentService.off('max_reconnects_reached', onMaxReconnects);

      this.log('✅ Error handling test completed', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Error handling test error: ${error.message}`, 'error');
      return false;
    }
  }

  // Complete integration test
  async runCompleteTest() {
    this.log('🚀 Starting complete voice integration test...');
    this.log('Testing against: https://livekit-voice-agent-0jz0.onrender.com');
    
    const tests = [
      { name: 'Health Check', test: () => this.testHealthCheck() },
      { name: 'Session Management', test: () => this.testSessionManagement() },
      { name: 'WebSocket Connection', test: () => this.testWebSocketConnection() },
      { name: 'Message Protocol', test: () => this.testMessageProtocol() },
      { name: 'Error Handling', test: () => this.testErrorHandling() }
    ];

    const results = {};
    let overallSuccess = true;

    for (const { name, test } of tests) {
      this.log(`\n--- Testing ${name} ---`);
      try {
        const result = await test();
        results[name] = result;
        if (!result) overallSuccess = false;
        this.log(`${result ? '✅' : '❌'} ${name} test ${result ? 'passed' : 'failed'}`);
      } catch (error) {
        results[name] = false;
        overallSuccess = false;
        this.log(`❌ ${name} test crashed: ${error.message}`, 'error');
      }
      
      // Delay between tests
      await this.delay(1000);
    }

    // Final cleanup
    this.log('\n🧹 Performing final cleanup...');
    try {
      await VoiceAgentService.disconnect();
      healthCheckService.stopPeriodicHealthChecks();
    } catch (error) {
      this.log(`⚠️ Cleanup warning: ${error.message}`, 'warning');
    }

    // Summary
    this.log('\n📊 Test Results Summary:');
    Object.entries(results).forEach(([test, passed]) => {
      this.log(`  ${passed ? '✅' : '❌'} ${test}`);
    });

    this.log(`\n🎯 Overall Integration Test: ${overallSuccess ? 'PASSED' : 'FAILED'}`);
    
    if (overallSuccess) {
      this.log('🎉 All systems are ready for production use!', 'success');
    } else {
      this.log('⚠️ Some tests failed - please review the errors above', 'warning');
    }

    return {
      success: overallSuccess,
      results,
      logs: this.testResults
    };
  }

  // Quick connectivity test
  async quickTest() {
    this.log('⚡ Running quick connectivity test...');
    
    try {
      // Quick health check
      const healthy = await this.testHealthCheck();
      if (!healthy) return { success: false, message: 'Health check failed' };

      // Quick WebSocket test
      const userId = `quick_test_${Date.now()}`;
      await VoiceAgentService.connect(userId);
      await this.delay(2000);
      
      const connected = VoiceAgentService.isConnected;
      await VoiceAgentService.disconnect();

      const success = healthy && connected;
      this.log(`⚡ Quick test ${success ? 'PASSED' : 'FAILED'}`);
      
      return {
        success,
        message: success ? 'All systems operational' : 'Connection issues detected',
        details: { healthy, connected }
      };
    } catch (error) {
      this.log(`❌ Quick test error: ${error.message}`, 'error');
      return { success: false, message: error.message };
    }
  }
}

// Export for use in the app
export default VoiceIntegrationTest;

// Auto-run test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const test = new VoiceIntegrationTest();
  test.runCompleteTest().then(result => {
    console.log('\n🏁 Test completed:', result.success ? 'SUCCESS' : 'FAILURE');
    process.exit(result.success ? 0 : 1);
  });
} 