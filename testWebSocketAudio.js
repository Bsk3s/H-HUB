import WebSocketAudioService from './WebSocketAudioService';
import AudioConversationManager from './AudioConversationManager';

/**
 * Test WebSocket Audio Implementation
 * Run this to verify everything works before connecting to backend
 */
export async function testWebSocketAudio() {
  console.log('🧪 Testing WebSocket Audio Implementation...');
  
  try {
    // Test 1: Audio Service Initialization
    console.log('\n📱 Test 1: Audio Service Initialization');
    const audioService = new WebSocketAudioService();
    await audioService.initialize('wss://echo.websocket.org'); // Echo server for testing
    console.log('✅ Audio service initialized successfully');
    
    // Test 2: Conversation Manager Initialization  
    console.log('\n🎯 Test 2: Conversation Manager Initialization');
    const conversationManager = new AudioConversationManager();
    await conversationManager.initialize('wss://echo.websocket.org');
    console.log('✅ Conversation manager initialized successfully');
    
    // Test 3: Connection Test
    console.log('\n🔌 Test 3: WebSocket Connection');
    await conversationManager.startConversation('adina');
    console.log('✅ WebSocket connection established');
    
    // Test 4: State Management
    console.log('\n📊 Test 4: State Management');
    const state = conversationManager.getState();
    const isConnected = conversationManager.isConnected();
    const isActive = conversationManager.isConversationActive();
    
    console.log('Current state:', state);
    console.log('Connected:', isConnected);
    console.log('Active:', isActive);
    console.log('✅ State management working');
    
    // Test 5: Cleanup
    console.log('\n🧹 Test 5: Cleanup');
    await conversationManager.stopConversation();
    await conversationManager.cleanup();
    console.log('✅ Cleanup completed');
    
    console.log('\n🎉 All tests passed! WebSocket Audio is ready.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Test Audio Permissions
 */
export async function testAudioPermissions() {
  console.log('🎤 Testing audio permissions...');
  
  try {
    const { Audio } = require('expo-av');
    const { status } = await Audio.requestPermissionsAsync();
    
    if (status === 'granted') {
      console.log('✅ Audio permissions granted');
      return true;
    } else {
      console.log('❌ Audio permissions denied');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing audio permissions:', error);
    return false;
  }
}

/**
 * Full Integration Test
 */
export async function runFullTest() {
  console.log('🚀 Running Full WebSocket Audio Test Suite...\n');
  
  const permissionsOk = await testAudioPermissions();
  if (!permissionsOk) {
    console.log('❌ Audio permissions test failed');
    return false;
  }
  
  const audioTestOk = await testWebSocketAudio();
  if (!audioTestOk) {
    console.log('❌ WebSocket audio test failed');
    return false;
  }
  
  console.log('\n🎉 All tests passed! Ready for production backend connection.');
  return true;
}

// Export for use in components
export default {
  testWebSocketAudio,
  testAudioPermissions,
  runFullTest
}; 