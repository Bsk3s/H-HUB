// Test Runner for Voice Integration - Fixed import issues
import VoiceAgentService from './VoiceAgentService';
import healthCheckService from './healthCheckService';

class TestRunner {
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  // Quick connectivity test - run this first
  static async runQuickTest() {
    console.log('🚀 Starting Quick Voice Integration Test...');
    
    try {
      // Test health check
      TestRunner.log('Testing health check...', 'info');
      const isHealthy = await healthCheckService.checkHealth();
      
      if (!isHealthy) {
        return { 
          success: false, 
          message: 'Health check failed - backend not available' 
        };
      }

      // Test WebSocket connection
      TestRunner.log('Testing WebSocket connection...', 'info');
      const userId = `quick_test_${Date.now()}`;
      
      let connected = false;
      const onConnected = () => {
        connected = true;
        TestRunner.log('WebSocket connected successfully', 'success');
      };
      
      VoiceAgentService.on('connected', onConnected);
      
      try {
        await VoiceAgentService.connect(userId);
        await TestRunner.delay(3000); // Wait 3 seconds for connection
        
        if (connected) {
          TestRunner.log('Quick test PASSED', 'success');
          await VoiceAgentService.disconnect();
          
          return { 
            success: true, 
            message: 'All systems operational',
            details: { healthy: true, connected: true }
          };
        } else {
          return { 
            success: false, 
            message: 'WebSocket connection failed',
            details: { healthy: true, connected: false }
          };
        }
      } finally {
        VoiceAgentService.off('connected', onConnected);
      }
      
    } catch (error) {
      TestRunner.log(`Quick test error: ${error.message}`, 'error');
      return { success: false, message: error.message };
    }
  }

  // Complete integration test
  static async runCompleteTest() {
    console.log('🚀 Starting Complete Voice Integration Test...');
    
    const tests = [
      { name: 'Health Check', test: () => TestRunner.testHealthCheck() },
      { name: 'Session Management', test: () => TestRunner.testSessionManagement() },
      { name: 'WebSocket Connection', test: () => TestRunner.testWebSocketConnection() }
    ];

    const results = {};
    let overallSuccess = true;

    for (const { name, test } of tests) {
      TestRunner.log(`\n--- Testing ${name} ---`, 'info');
      try {
        const result = await test();
        results[name] = result;
        if (!result) overallSuccess = false;
        TestRunner.log(`${name} test ${result ? 'PASSED' : 'FAILED'}`, result ? 'success' : 'error');
      } catch (error) {
        results[name] = false;
        overallSuccess = false;
        TestRunner.log(`${name} test crashed: ${error.message}`, 'error');
      }
      
      await TestRunner.delay(1000); // Delay between tests
    }

    // Final cleanup
    TestRunner.log('Performing final cleanup...', 'info');
    try {
      await VoiceAgentService.disconnect();
      healthCheckService.stopPeriodicHealthChecks();
    } catch (error) {
      TestRunner.log(`Cleanup warning: ${error.message}`, 'warning');
    }

    // Summary
    TestRunner.log('Test Results Summary:', 'info');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${test}`);
    });

    console.log(`\n🎯 Overall Integration Test: ${overallSuccess ? 'PASSED' : 'FAILED'}`);
    
    return {
      success: overallSuccess,
      results,
      message: overallSuccess ? 'All tests passed' : 'Some tests failed'
    };
  }

  // Individual test methods
  static async testHealthCheck() {
    try {
      TestRunner.log('Testing health check...', 'info');
      const isHealthy = await healthCheckService.checkHealth();
      TestRunner.log(`Health check: ${isHealthy ? 'PASSED' : 'FAILED'}`, isHealthy ? 'success' : 'error');
      return isHealthy;
    } catch (error) {
      TestRunner.log(`Health check error: ${error.message}`, 'error');
      return false;
    }
  }

  static async testSessionManagement() {
    try {
      TestRunner.log('Testing session management...', 'info');
      
      const userId = `test_user_${Date.now()}`;
      const instructions = "You are a test AI assistant.";

      // Test session creation
      TestRunner.log('Creating session...', 'info');
      const sessionId = await VoiceAgentService.createSession(userId, instructions);
      
      if (sessionId) {
        TestRunner.log(`Session created: ${sessionId}`, 'success');
        
        // Test session deletion
        TestRunner.log('Deleting session...', 'info');
        await VoiceAgentService.deleteSession();
        TestRunner.log('Session deleted successfully', 'success');
        
        return true;
      } else {
        TestRunner.log('Session creation failed', 'error');
        return false;
      }
    } catch (error) {
      TestRunner.log(`Session management error: ${error.message}`, 'error');
      return false;
    }
  }

  static async testWebSocketConnection() {
    try {
      TestRunner.log('Testing WebSocket connection...', 'info');
      
      const userId = `ws_test_user_${Date.now()}`;
      let connectionEstablished = false;

      const onConnected = () => {
        connectionEstablished = true;
        TestRunner.log('WebSocket connected', 'success');
      };

      const onError = (error) => {
        TestRunner.log(`WebSocket error: ${error}`, 'error');
      };

      VoiceAgentService.on('connected', onConnected);
      VoiceAgentService.on('error', onError);

      // Connect to WebSocket
      TestRunner.log('Connecting to WebSocket...', 'info');
      await VoiceAgentService.connect(userId);

      // Wait for connection
      await TestRunner.delay(3000);

      // Cleanup
      VoiceAgentService.off('connected', onConnected);
      VoiceAgentService.off('error', onError);

      if (connectionEstablished) {
        TestRunner.log('WebSocket connection test PASSED', 'success');
        return true;
      } else {
        TestRunner.log('WebSocket connection test FAILED', 'error');
        return false;
      }
    } catch (error) {
      TestRunner.log(`WebSocket test error: ${error.message}`, 'error');
      return false;
    }
  }
}

export default TestRunner; 