/**
 * Manual WebRTC Globals Test
 * Test to verify manual registration of WebRTC globals
 */

/**
 * Test manual WebRTC globals registration
 */
export const testManualWebRTCGlobals = () => {
  console.log('🧪 Testing manual WebRTC globals registration...');
  
  const results = {
    RTCPeerConnection: {
      available: typeof global.RTCPeerConnection !== 'undefined',
      type: typeof global.RTCPeerConnection,
      constructor: global.RTCPeerConnection?.name || 'undefined'
    },
    RTCIceCandidate: {
      available: typeof global.RTCIceCandidate !== 'undefined',
      type: typeof global.RTCIceCandidate,
      constructor: global.RTCIceCandidate?.name || 'undefined'
    },
    RTCSessionDescription: {
      available: typeof global.RTCSessionDescription !== 'undefined',
      type: typeof global.RTCSessionDescription,
      constructor: global.RTCSessionDescription?.name || 'undefined'
    },
    MediaStream: {
      available: typeof global.MediaStream !== 'undefined',
      type: typeof global.MediaStream,
      constructor: global.MediaStream?.name || 'undefined'
    },
    MediaStreamTrack: {
      available: typeof global.MediaStreamTrack !== 'undefined',
      type: typeof global.MediaStreamTrack,
      constructor: global.MediaStreamTrack?.name || 'undefined'
    }
  };
  
  console.log('📊 Manual WebRTC Globals Test Results:');
  Object.entries(results).forEach(([key, info]) => {
    console.log(`${info.available ? '✅' : '❌'} ${key}:`, 
      `Available: ${info.available}, Type: ${info.type}, Constructor: ${info.constructor}`);
  });
  
  const allAvailable = Object.values(results).every(r => r.available);
  const coreAvailable = results.RTCPeerConnection.available && 
                       results.RTCIceCandidate.available && 
                       results.RTCSessionDescription.available;
  
  console.log(`🎯 Core WebRTC (RTC*): ${coreAvailable ? '✅ AVAILABLE' : '❌ MISSING'}`);
  console.log(`📡 All WebRTC: ${allAvailable ? '✅ AVAILABLE' : '⚠️ PARTIAL'}`);
  console.log(`🚀 LiveKit Ready: ${coreAvailable ? '✅ YES' : '❌ NO'}`);
  
  return {
    success: coreAvailable,
    allAvailable,
    results,
    liveKitReady: coreAvailable
  };
};

/**
 * Test LiveKit Room creation with manual globals
 */
export const testLiveKitWithManualGlobals = () => {
  console.log('🧪 Testing LiveKit with manual globals...');
  
  try {
    // First check globals
    const globalsTest = testManualWebRTCGlobals();
    if (!globalsTest.liveKitReady) {
      throw new Error('WebRTC globals not ready for LiveKit');
    }
    
    // Test LiveKit Room creation
    const { Room, RoomEvent, Track } = require('livekit-client');
    console.log('✅ livekit-client import successful');
    
    const room = new Room();
    console.log('✅ Room instance created with manual globals');
    
    // Test event listener
    room.on(RoomEvent.Connected, () => {
      console.log('Room event listener works');
    });
    console.log('✅ Event listeners setup successful');
    
    return {
      success: true,
      message: 'LiveKit works with manual WebRTC globals',
      globalsTest
    };
    
  } catch (error) {
    console.error('❌ LiveKit test with manual globals failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run complete manual WebRTC test
 */
export const runCompleteManualTest = () => {
  console.log('🚀 Running complete manual WebRTC test...');
  
  const globalsTest = testManualWebRTCGlobals();
  const livekitTest = testLiveKitWithManualGlobals();
  
  console.log('\n📋 Complete Manual Test Summary:');
  console.log(`WebRTC Globals: ${globalsTest.success ? '✅ REGISTERED' : '❌ MISSING'}`);
  console.log(`LiveKit Ready: ${livekitTest.success ? '✅ READY' : '❌ FAILED'}`);
  console.log(`Overall: ${globalsTest.success && livekitTest.success ? '🎉 MANUAL REGISTRATION SUCCESS' : '⚠️ MANUAL REGISTRATION FAILED'}`);
  
  return {
    success: globalsTest.success && livekitTest.success,
    globals: globalsTest,
    livekit: livekitTest
  };
};

export default {
  testManualWebRTCGlobals,
  testLiveKitWithManualGlobals,
  runCompleteManualTest
}; 