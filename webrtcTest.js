/**
 * WebRTC Test Utility
 * Tests to verify WebRTC globals are properly registered for LiveKit
 */

/**
 * Test if WebRTC globals are available
 */
export const testWebRTCGlobals = () => {
  console.log('🧪 Testing WebRTC globals...');
  
  const results = {
    RTCPeerConnection: typeof global.RTCPeerConnection !== 'undefined',
    RTCIceCandidate: typeof global.RTCIceCandidate !== 'undefined',
    RTCSessionDescription: typeof global.RTCSessionDescription !== 'undefined',
    MediaStream: typeof global.MediaStream !== 'undefined',
    MediaStreamTrack: typeof global.MediaStreamTrack !== 'undefined',
    getUserMedia: typeof navigator?.getUserMedia !== 'undefined' || typeof navigator?.mediaDevices?.getUserMedia !== 'undefined',
    WebSocket: typeof global.WebSocket !== 'undefined',
    crypto: typeof global.crypto !== 'undefined',
    URL: typeof global.URL !== 'undefined'
  };
  
  console.log('📊 WebRTC Globals Test Results:');
  Object.entries(results).forEach(([key, available]) => {
    console.log(`${available ? '✅' : '❌'} ${key}: ${available ? 'Available' : 'Missing'}`);
  });
  
  const allAvailable = Object.values(results).every(Boolean);
  console.log(allAvailable ? '🎉 All WebRTC globals are available!' : '⚠️ Some WebRTC globals are missing');
  
  return {
    success: allAvailable,
    results,
    missing: Object.entries(results).filter(([, available]) => !available).map(([key]) => key)
  };
};

/**
 * Test LiveKit specific requirements
 */
export const testLiveKitRequirements = () => {
  console.log('🧪 Testing LiveKit requirements...');
  
  try {
    // Test if we can import LiveKit client
    const { Room } = require('livekit-client');
    console.log('✅ LiveKit client import successful');
    
    // Test if we can create a Room instance
    const room = new Room();
    console.log('✅ LiveKit Room creation successful');
    
    // Test if basic WebRTC is available (no need for registerGlobals with livekit-client)
    console.log('✅ Using livekit-client for WebRTC compatibility');
    
    return {
      success: true,
      message: 'LiveKit requirements met'
    };
    
  } catch (error) {
    console.error('❌ LiveKit requirements test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run complete WebRTC and LiveKit test
 */
export const runCompleteWebRTCTest = () => {
  console.log('🚀 Running complete WebRTC and LiveKit test...');
  
  const webrtcTest = testWebRTCGlobals();
  const livekitTest = testLiveKitRequirements();
  
  const overallSuccess = webrtcTest.success && livekitTest.success;
  
  console.log('\n📋 Test Summary:');
  console.log(`WebRTC Globals: ${webrtcTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`LiveKit Requirements: ${livekitTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Overall: ${overallSuccess ? '🎉 READY FOR LIVEKIT' : '⚠️ SETUP NEEDED'}`);
  
  if (!overallSuccess) {
    console.log('\n🔧 Next Steps:');
    if (!webrtcTest.success) {
      console.log('- Register WebRTC globals using registerGlobals()');
      console.log('- Missing globals:', webrtcTest.missing.join(', '));
    }
    if (!livekitTest.success) {
      console.log('- Check LiveKit package installation');
      console.log('- Error:', livekitTest.error);
    }
  }
  
  return {
    success: overallSuccess,
    webrtc: webrtcTest,
    livekit: livekitTest
  };
};

export default {
  testWebRTCGlobals,
  testLiveKitRequirements,
  runCompleteWebRTCTest
}; 