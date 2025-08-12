// Voice Test Utilities - Simple testing functions for React Native
import VoiceAgentService from './VoiceAgentService';
import healthCheckService from './healthCheckService';

// Quick health check test
export const testHealthCheck = async () => {
  try {
    console.log('🏥 Testing health check...');
    const isHealthy = await healthCheckService.checkHealth();
    console.log(`✅ Health check: ${isHealthy ? 'PASSED' : 'FAILED'}`);
    return isHealthy;
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return false;
  }
};

// Quick connectivity test
export const testQuickConnection = async () => {
  try {
    console.log('⚡ Starting quick connectivity test...');
    
    // Test health first
    const healthy = await testHealthCheck();
    if (!healthy) {
      return { success: false, message: 'Health check failed' };
    }

    // Test WebSocket connection
    const userId = `quick_test_${Date.now()}`;
    console.log('🔌 Testing WebSocket connection...');
    
    let connected = false;
    const onConnected = () => {
      connected = true;
      console.log('✅ WebSocket connected successfully');
    };
    
    VoiceAgentService.on('connected', onConnected);
    
    try {
      await VoiceAgentService.connect(userId);
      
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (connected) {
        console.log('✅ Quick test PASSED - All systems operational');
        await VoiceAgentService.disconnect();
        return { 
          success: true, 
          message: 'All systems operational',
          details: { healthy: true, connected: true }
        };
      } else {
        console.log('❌ Quick test FAILED - WebSocket connection failed');
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
    console.error('❌ Quick test error:', error.message);
    return { success: false, message: error.message };
  }
};

// Test session management
export const testSessionManagement = async () => {
  try {
    console.log('📝 Testing session management...');
    
    const userId = `test_user_${Date.now()}`;
    const instructions = "You are a test AI assistant.";

    // Test session creation
    console.log('Creating session...');
    const sessionId = await VoiceAgentService.createSession(userId, instructions);
    
    if (sessionId) {
      console.log(`✅ Session created: ${sessionId}`);
      
      // Test session deletion
      console.log('Deleting session...');
      await VoiceAgentService.deleteSession();
      console.log('✅ Session deleted successfully');
      
      return true;
    } else {
      console.log('❌ Session creation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Session management error:', error.message);
    return false;
  }
};

// Complete test runner
export const runCompleteTest = async () => {
  console.log('🚀 Starting complete voice integration test...');
  console.log('Testing against: https://livekit-voice-agent-0jz0.onrender.com');
  
  const results = {
    healthCheck: false,
    sessionManagement: false,
    quickConnection: false
  };
  
  try {
    // Test 1: Health Check
    console.log('\n--- Test 1: Health Check ---');
    results.healthCheck = await testHealthCheck();
    
    // Test 2: Session Management
    console.log('\n--- Test 2: Session Management ---');
    results.sessionManagement = await testSessionManagement();
    
    // Test 3: Quick Connection
    console.log('\n--- Test 3: WebSocket Connection ---');
    const connectionResult = await testQuickConnection();
    results.quickConnection = connectionResult.success;
    
    // Summary
    const allPassed = Object.values(results).every(result => result === true);
    
    console.log('\n📊 Test Results Summary:');
    console.log(`  ${results.healthCheck ? '✅' : '❌'} Health Check`);
    console.log(`  ${results.sessionManagement ? '✅' : '❌'} Session Management`);
    console.log(`  ${results.quickConnection ? '✅' : '❌'} WebSocket Connection`);
    
    console.log(`\n🎯 Overall Test: ${allPassed ? 'PASSED' : 'FAILED'}`);
    
    if (allPassed) {
      console.log('🎉 All systems are ready for production use!');
    } else {
      console.log('⚠️ Some tests failed - check the logs above');
    }
    
    return {
      success: allPassed,
      results,
      message: allPassed ? 'All tests passed' : 'Some tests failed'
    };
    
  } catch (error) {
    console.error('❌ Complete test error:', error.message);
    return {
      success: false,
      results,
      message: error.message
    };
  }
};

// Simple test functions for the UI
export const VoiceTestUtils = {
  testHealthCheck,
  testQuickConnection,
  testSessionManagement,
  runCompleteTest
}; 