// Simple integration test for voice chat functionality
import VoiceAgentService from './VoiceAgentService';
import SimpleAudioStreamer from './SimpleAudioStreamer';
import AudioPlayer from './AudioPlayer';

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
  
  // Test array buffer conversion
  const testString = 'Hello World';
  const buffer = VoiceAgentService.arrayBufferToBase64(new TextEncoder().encode(testString).buffer);
  console.log('🔧 Buffer conversion test:', buffer ? 'Works' : 'Failed');
  
  console.log('✅ Voice integration test complete!');
  
  return {
    eventSystem: true,
    backendUrl: VoiceAgentService.backendUrl,
    audioStreamer: !!SimpleAudioStreamer,
    audioPlayer: !!AudioPlayer,
    bufferConversion: !!buffer
  };
}; 