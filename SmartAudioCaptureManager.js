import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * Smart Audio Capture Manager
 * Records complete utterances based on voice activity detection
 * Only captures audio when actually needed (not continuous)
 */
export class SmartAudioCaptureManager {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.recordingStartTime = null;
    this.recordingBuffer = [];
    
    // Configuration
    this.config = {
      sampleRate: 16000,
      quality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
      format: 'wav'
    };

    // Event listeners
    this.eventListeners = {
      recordingStarted: [],
      recordingCompleted: [],
      error: []
    };
  }

  /**
   * Event management
   */
  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Start recording a complete utterance
   */
  async startRecording() {
    if (this.isRecording) {
      console.warn('⚠️ Already recording, ignoring start request');
      return false;
    }

    try {
      console.log('🎤 Starting smart audio capture...');

      // Set up audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording with optimized settings
      this.recording = new Audio.Recording();
      
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: this.config.sampleRate,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: this.config.quality,
          sampleRate: this.config.sampleRate,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      };

      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();

      // Update state
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      console.log('✅ Smart audio capture started');
      this.emit('recordingStarted', {
        timestamp: this.recordingStartTime
      });

      return true;

    } catch (error) {
      console.error('❌ Failed to start smart audio capture:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Stop recording and return the complete audio data
   */
  async stopRecording() {
    if (!this.isRecording || !this.recording) {
      console.warn('⚠️ Not recording, ignoring stop request');
      return null;
    }

    try {
      console.log('🛑 Stopping smart audio capture...');

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      // Calculate recording duration
      const duration = Date.now() - this.recordingStartTime;

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Read and process the audio file
      const audioData = await this.processRecordingFile(uri);

      // Clean up the temporary file
      await FileSystem.deleteAsync(uri, { idempotent: true });

      // Update state
      this.isRecording = false;
      this.recording = null;
      this.recordingStartTime = null;

      const recordingResult = {
        audioData: audioData,
        duration: duration,
        sampleRate: this.config.sampleRate,
        format: this.config.format,
        timestamp: Date.now()
      };

      console.log(`✅ Smart audio capture completed (${duration}ms)`);
      this.emit('recordingCompleted', recordingResult);

      return recordingResult;

    } catch (error) {
      console.error('❌ Failed to stop smart audio capture:', error);
      this.cleanup();
      this.emit('error', error);
      return null;
    }
  }

  /**
   * Process the recorded audio file
   */
  async processRecordingFile(uri) {
    try {
      // Read the audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to binary buffer
      const wavBuffer = this.base64ToBuffer(base64Audio);
      
      // Extract raw PCM data by stripping WAV headers
      const rawPCMData = this.stripWAVHeader(wavBuffer);

      return {
        base64: base64Audio, // Keep original for debugging
        buffer: rawPCMData,  // Send raw PCM data instead of WAV
        rawPCMSize: rawPCMData.byteLength,
        originalWAVSize: wavBuffer.byteLength,
        size: rawPCMData.byteLength // Update size to reflect PCM data
      };

    } catch (error) {
      console.error('❌ Failed to process recording file:', error);
      throw error;
    }
  }

  /**
   * Strip WAV header and return raw PCM data
   */
  stripWAVHeader(wavBuffer) {
    const dataView = new DataView(wavBuffer);
    
    // WAV file structure:
    // 0-3: "RIFF"
    // 4-7: File size
    // 8-11: "WAVE"
    // 12-15: "fmt "
    // 16-19: Format chunk size
    // 20+: Format data
    // Then "data" chunk with actual PCM data
    
    let offset = 12; // Skip RIFF header
    
    // Find the "data" chunk
    while (offset < wavBuffer.byteLength - 8) {
      const chunkId = String.fromCharCode(
        dataView.getUint8(offset),
        dataView.getUint8(offset + 1),
        dataView.getUint8(offset + 2),
        dataView.getUint8(offset + 3)
      );
      
      const chunkSize = dataView.getUint32(offset + 4, true); // little endian
      
      if (chunkId === 'data') {
        // Found data chunk, extract PCM data
        const pcmOffset = offset + 8;
        const pcmSize = Math.min(chunkSize, wavBuffer.byteLength - pcmOffset);
        
        console.log(`📊 SmartCapture - Extracted PCM: ${pcmSize} bytes from WAV (header was ${pcmOffset} bytes)`);
        return wavBuffer.slice(pcmOffset, pcmOffset + pcmSize);
      }
      
      // Move to next chunk
      offset += 8 + chunkSize;
    }
    
    // If no data chunk found, return the buffer minus likely header size (44 bytes typical)
    console.warn('⚠️ SmartCapture - No data chunk found, using fallback header strip');
    const headerSize = 44;
    if (wavBuffer.byteLength > headerSize) {
      return wavBuffer.slice(headerSize);
    }
    
    return wavBuffer;
  }

  /**
   * Convert base64 to buffer
   */
  base64ToBuffer(base64String) {
    const binaryString = atob(base64String);
    const buffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(buffer);
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return buffer;
  }

  /**
   * Cancel current recording
   */
  async cancelRecording() {
    if (!this.isRecording) {
      return;
    }

    try {
      console.log('❌ Cancelling smart audio capture...');
      
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }

      this.cleanup();
      console.log('✅ Smart audio capture cancelled');

    } catch (error) {
      console.error('❌ Error cancelling recording:', error);
      this.cleanup();
    }
  }

  /**
   * Cleanup recording state
   */
  cleanup() {
    this.isRecording = false;
    this.recording = null;
    this.recordingStartTime = null;
    this.recordingBuffer = [];
  }

  /**
   * Get current recording state
   */
  getState() {
    return {
      isRecording: this.isRecording,
      recordingStartTime: this.recordingStartTime,
      recordingDuration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Smart audio capture config updated:', this.config);
  }

  /**
   * Check if audio capture is available
   */
  async checkAvailability() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Audio availability check failed:', error);
      return false;
    }
  }
} 