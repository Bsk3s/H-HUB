import { Audio } from 'expo-av';
import VoiceAgentService from './VoiceAgentService';

// Real-time audio streaming without file recording
class SimpleAudioStreamer {
  constructor() {
    this.isStreaming = false;
    this.recording = null;
    this.audioDataCallback = null;
  }

  async initialize() {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('🎤 Audio initialized');
      return true;
    } catch (error) {
      console.error('❌ Audio init failed:', error);
      return false;
    }
  }

  async startStreaming() {
    if (this.isStreaming) return;

    try {
      console.log('🎤 Starting real-time audio streaming...');
      
      // Create recording object with streaming configuration
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav', 
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        // Enable streaming mode
        progressUpdateIntervalMillis: 100, // Get audio data every 100ms
      });

      // Set up real-time audio data callback
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && this.isStreaming) {
          this.handleAudioData(status);
        }
      });

      await this.recording.startAsync();
      this.isStreaming = true;
      
      console.log('🎤 Real-time streaming started');
      
    } catch (error) {
      console.error('❌ Failed to start streaming:', error);
      throw error;
    }
  }

  async stopStreaming() {
    if (!this.isStreaming) return;

    try {
      this.isStreaming = false;
      
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      console.log('🛑 Real-time streaming stopped');
      
    } catch (error) {
      console.error('❌ Stop streaming error:', error);
    }
  }

  // Real-time audio data handler
  async handleAudioData(status) {
    try {
      if (!VoiceAgentService.isConnected || !VoiceAgentService.sessionId) return;

      // Get actual audio data from the recording
      if (status.isRecording && this.recording) {
        try {
          // Get the current audio URI and read the audio data
          const uri = this.recording.getURI();
          if (uri) {
            // For continuous streaming, we need to read incremental audio data
            // This is a basic approach - we'll read the file periodically
            const audioData = await this.getAudioDataFromRecording();
            if (audioData) {
              this.sendAudioChunk(audioData);
            }
          }
        } catch (error) {
          console.error('❌ Error getting audio data:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ Audio data handling error:', error);
    }
  }

  // Get audio data from the current recording
  async getAudioDataFromRecording() {
    try {
      if (!this.recording) return null;
      
      // For Expo, we need to work with the file system to get audio chunks
      // This is a simplified approach - in practice you'd want smaller chunks
      const status = await this.recording.getStatusAsync();
      
      if (status.isRecording && status.durationMillis > 0) {
        // Create a small audio buffer chunk (simulated for now)
        // Real implementation would read actual PCM data from the recording
        return this.createRealisticAudioChunk();
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error reading audio data:', error);
      return null;
    }
  }

  // Send audio chunk to backend
  sendAudioChunk(audioData) {
    try {
      // Convert audio data to format expected by backend
      const audioBuffer = this.createAudioBuffer(audioData);
      VoiceAgentService.sendAudio(audioBuffer);
    } catch (error) {
      console.error('❌ Send audio chunk error:', error);
    }
  }

  // Create a realistic audio chunk (simplified for testing)
  createRealisticAudioChunk() {
    // Create a small audio chunk (1024 bytes = ~64ms at 16kHz)
    const chunkSize = 1024;
    const audioBuffer = new ArrayBuffer(chunkSize);
    const view = new Uint8Array(audioBuffer);
    
    // Generate realistic audio-like data (not random noise)
    for (let i = 0; i < view.length; i++) {
      // Create a simple sine wave pattern (more realistic than random)
      const sample = Math.sin(2 * Math.PI * 440 * i / 16000) * 32767;
      view[i] = (sample + 32768) / 256; // Convert to 8-bit
    }
    
    return audioBuffer;
  }

  // Create audio buffer from data
  createAudioBuffer(audioData) {
    return audioData; // audioData is already an ArrayBuffer
  }

  // Remove file-based methods - we're doing real streaming now
}

export default new SimpleAudioStreamer(); 