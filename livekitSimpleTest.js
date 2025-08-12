/**
 * Simple LiveKit Test - Without React Native Package
 * Tests basic livekit-client functionality for Expo compatibility
 */

/**
 * Test basic LiveKit client import and room creation
 */
export const testBasicLiveKit = () => {
  console.log('🧪 Testing basic LiveKit client...');
  
  try {
    // Check WebRTC globals first
    console.log('WebRTC globals check:');
    console.log('- RTCPeerConnection:', typeof global.RTCPeerConnection !== 'undefined');
    console.log('- RTCIceCandidate:', typeof global.RTCIceCandidate !== 'undefined');
    console.log('- RTCSessionDescription:', typeof global.RTCSessionDescription !== 'undefined');
    
    // Test livekit-client import
    const { Room, RoomEvent, Track } = require('livekit-client');
    console.log('✅ livekit-client import successful');
    
    // Test Room creation (without connecting)
    const room = new Room();
    console.log('✅ Room instance created successfully');
    
    // Test event listener setup
    room.on(RoomEvent.Connected, () => {
      console.log('Room connected event listener works');
    });
    console.log('✅ Event listeners setup successful');
    
    return {
      success: true,
      message: 'Basic LiveKit client works with WebRTC globals',
      webrtcGlobals: {
        RTCPeerConnection: typeof global.RTCPeerConnection !== 'undefined',
        RTCIceCandidate: typeof global.RTCIceCandidate !== 'undefined',
        RTCSessionDescription: typeof global.RTCSessionDescription !== 'undefined'
      }
    };
    
  } catch (error) {
    console.error('❌ Basic LiveKit test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test token generation only (without LiveKit connection)
 */
export const testTokenOnly = async () => {
  console.log('🧪 Testing token generation only...');
  
  try {
    const response = await fetch('https://livekit-voice-agent-0jz0.onrender.com/api/spiritual-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character: 'adina',
        user_id: 'simple_test_user',
        user_name: 'Simple Test',
        session_duration_minutes: 30
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Token generation successful');
    
    return {
      success: true,
      token: data.token ? 'Present' : 'Missing',
      data
    };
    
  } catch (error) {
    console.error('❌ Token generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run minimal compatibility test
 */
export const runMinimalTest = async () => {
  console.log('🚀 Running minimal LiveKit compatibility test...');
  
  const basicTest = testBasicLiveKit();
  const tokenTest = await testTokenOnly();
  
  const success = basicTest.success && tokenTest.success;
  
  console.log('\n📋 Minimal Test Results:');
  console.log(`Basic LiveKit: ${basicTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Token Generation: ${tokenTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Overall: ${success ? '🎉 COMPATIBLE' : '⚠️ ISSUES'}`);
  
  return {
    success,
    basic: basicTest,
    token: tokenTest
  };
};

export default {
  testBasicLiveKit,
  testTokenOnly,
  runMinimalTest
}; 