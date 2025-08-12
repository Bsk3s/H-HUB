// Simple Voice Test - No UI dependencies, just console logging
import healthCheckService from './healthCheckService';
import VoiceAgentService from './VoiceAgentService';

// Simple test functions that can be run from console
export const quickHealthCheck = async () => {
  console.log('🏥 Testing backend health...');
  try {
    const isHealthy = await healthCheckService.checkHealth();
    console.log(`Result: ${isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    return isHealthy;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

export const quickConnectionTest = async () => {
  console.log('🔌 Testing WebSocket connection...');
  try {
    const userId = `test_${Date.now()}`;
    let connected = false;
    
    const onConnected = () => {
      connected = true;
      console.log('✅ Connected successfully!');
    };
    
    VoiceAgentService.on('connected', onConnected);
    
    await VoiceAgentService.connect(userId);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    
    VoiceAgentService.off('connected', onConnected);
    
    if (connected) {
      console.log('✅ Connection test PASSED');
      await VoiceAgentService.disconnect();
      return true;
    } else {
      console.log('❌ Connection test FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ Connection test error:', error.message);
    return false;
  }
};

export const runBasicTest = async () => {
  console.log('🚀 Running basic voice integration test...');
  
  const healthOk = await quickHealthCheck();
  const connectionOk = await quickConnectionTest();
  
  const allGood = healthOk && connectionOk;
  
  console.log('\n📊 Test Results:');
  console.log(`Health Check: ${healthOk ? '✅' : '❌'}`);
  console.log(`Connection: ${connectionOk ? '✅' : '❌'}`);
  console.log(`Overall: ${allGood ? '✅ PASSED' : '❌ FAILED'}`);
  
  return allGood;
};

// Export everything as a simple object
export default {
  quickHealthCheck,
  quickConnectionTest,
  runBasicTest
}; 