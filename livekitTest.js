import VoiceAgentService from './VoiceAgentService';
import { testBackendHealth, testTokenGeneration } from './backendTest';

/**
 * LiveKit Integration Test
 * Test the complete LiveKit voice agent flow
 */

/**
 * Test the complete LiveKit flow
 */
export const testLiveKitFlow = async () => {
  console.log('🧪 Starting LiveKit Integration Test...');
  
  try {
    // Step 1: Backend Health Check
    console.log('\n1️⃣ Testing backend health...');
    const healthResult = await testBackendHealth();
    if (!healthResult.success) {
      throw new Error(`Backend health check failed: ${healthResult.error}`);
    }
    
    // Step 2: Token Generation Test
    console.log('\n2️⃣ Testing token generation...');
    const tokenResult = await testTokenGeneration('adina', 'test_user_livekit');
    if (!tokenResult.success) {
      throw new Error(`Token generation failed: ${tokenResult.error}`);
    }
    
    // Step 3: LiveKit Connection Test
    console.log('\n3️⃣ Testing LiveKit connection...');
    const userId = `test_${Date.now()}`;
    
    // Connect to LiveKit
    await VoiceAgentService.connect(userId, 'adina', 'Test User');
    console.log('✅ Connected to LiveKit successfully');
    
    // Check session info
    const sessionInfo = VoiceAgentService.getSessionInfo();
    console.log('📊 Session Info:', sessionInfo);
    
    // Step 4: Audio Streaming Test
    console.log('\n4️⃣ Testing audio streaming...');
    await VoiceAgentService.startStreaming();
    console.log('✅ Audio streaming started');
    
    // Wait a bit to simulate conversation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 5: Cleanup
    console.log('\n5️⃣ Cleaning up...');
    await VoiceAgentService.stopStreaming();
    await VoiceAgentService.disconnect();
    console.log('✅ Cleanup completed');
    
    console.log('\n🎉 LiveKit Integration Test PASSED!');
    return { success: true, message: 'All tests passed successfully' };
    
  } catch (error) {
    console.error('\n❌ LiveKit Integration Test FAILED:', error);
    
    // Cleanup on error
    try {
      await VoiceAgentService.disconnect();
    } catch (cleanupError) {
      console.error('❌ Cleanup error:', cleanupError.message);
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Test just the connection without streaming
 */
export const testLiveKitConnection = async () => {
  console.log('🧪 Testing LiveKit connection only...');
  
  try {
    const userId = `connection_test_${Date.now()}`;
    
    // Test connection
    await VoiceAgentService.connect(userId, 'adina', 'Connection Test User');
    console.log('✅ LiveKit connection successful');
    
    // Get session info
    const sessionInfo = VoiceAgentService.getSessionInfo();
    console.log('📊 Connection Info:', sessionInfo);
    
    // Disconnect
    await VoiceAgentService.disconnect();
    console.log('✅ Disconnection successful');
    
    return { success: true, sessionInfo };
    
  } catch (error) {
    console.error('❌ LiveKit connection test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test the voice agent service directly
 */
export const testVoiceAgentService = async () => {
  console.log('🧪 Testing VoiceAgentService directly...');
  
  try {
    // Health check
    const health = await VoiceAgentService.healthCheck();
    console.log('🏥 Health check result:', health);
    
    // Generate token
    const token = await VoiceAgentService.generateToken('adina', 'test_user', 'Test User');
    console.log('🎫 Token generated:', token ? 'Success' : 'Failed');
    
    return { 
      success: true, 
      health, 
      tokenGenerated: !!token 
    };
    
  } catch (error) {
    console.error('❌ VoiceAgentService test failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  testLiveKitFlow,
  testLiveKitConnection,
  testVoiceAgentService
}; 