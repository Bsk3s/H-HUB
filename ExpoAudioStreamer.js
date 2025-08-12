import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export class ExpoAudioStreamer {
  constructor(onAudioData) {
    this.onAudioData = onAudioData;
    this.recording = null;
    this.isStreaming = false;
    this.streamingInterval = null;
    this.recordingUri = null;
    
    // Updated configuration for better streaming
    this.config = {
      chunkDurationMs: 250, // Smaller chunks: 250ms instead of 1000ms
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16
    };
  }

  async start() {
    try {
      console.log('🎤 Starting Expo audio streaming with optimized settings...');
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording with optimized settings for streaming
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: this.config.sampleRate,
          numberOfChannels: this.config.channels,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: this.config.sampleRate,
          numberOfChannels: this.config.channels,
          bitRate: 128000,
          linearPCMBitDepth: this.config.bitDepth,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();

      this.isStreaming = true;
      
      // Start the optimized streaming process
      this.startOptimizedStreaming();
      
      console.log(`✅ Expo audio streaming started (${this.config.chunkDurationMs}ms chunks)`);
      return true;
      
    } catch (error) {
      console.error('❌ Error starting Expo audio streaming:', error);
      return false;
    }
  }

  startOptimizedStreaming() {
    // Use smaller intervals for better real-time performance
    this.streamingInterval = setInterval(async () => {
      if (!this.isStreaming || !this.recording) return;

      try {
        // Stop current recording to get the chunk
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        
        if (uri) {
          // Extract raw PCM data instead of sending entire WAV file
          const rawPCMData = await this.extractRawPCMData(uri);
          
          if (rawPCMData && rawPCMData.byteLength > 0) {
            // Send the raw PCM data
            if (this.onAudioData) {
              this.onAudioData(rawPCMData);
            }
            
            console.log(`📤 Sent PCM chunk: ${rawPCMData.byteLength} bytes (${this.config.chunkDurationMs}ms)`);
          }
          
          // Clean up the temporary file
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }

        // Immediately start a new recording to minimize gaps
        if (this.isStreaming) {
          await this.startNewRecording();
        }
        
      } catch (error) {
        console.error('❌ Error in optimized streaming:', error);
      }
    }, this.config.chunkDurationMs);
  }

  async startNewRecording() {
    const recordingOptions = {
      android: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
        sampleRate: this.config.sampleRate,
        numberOfChannels: this.config.channels,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: this.config.sampleRate,
        numberOfChannels: this.config.channels,
        bitRate: 128000,
        linearPCMBitDepth: this.config.bitDepth,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/wav',
        bitsPerSecond: 128000,
      },
    };
    
    this.recording = new Audio.Recording();
    await this.recording.prepareToRecordAsync(recordingOptions);
    await this.recording.startAsync();
  }

  /**
   * Extract raw PCM data from WAV file, stripping headers
   */
  async extractRawPCMData(uri) {
    try {
      // Read the WAV file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Convert base64 to binary buffer
      const wavBuffer = this.base64ToBuffer(base64Audio);
      
      // Extract raw PCM data by skipping WAV header
      const rawPCMData = this.stripWAVHeader(wavBuffer);
      
      return rawPCMData;
      
    } catch (error) {
      console.error('❌ Failed to extract raw PCM data:', error);
      return null;
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
        
        console.log(`📊 Extracted PCM: ${pcmSize} bytes from WAV (header was ${pcmOffset} bytes)`);
        return wavBuffer.slice(pcmOffset, pcmOffset + pcmSize);
      }
      
      // Move to next chunk
      offset += 8 + chunkSize;
    }
    
    // If no data chunk found, return the buffer minus likely header size (44 bytes typical)
    console.warn('⚠️ No data chunk found, using fallback header strip');
    const headerSize = 44;
    if (wavBuffer.byteLength > headerSize) {
      return wavBuffer.slice(headerSize);
    }
    
    return wavBuffer;
  }

  base64ToBuffer(base64String) {
    // Convert base64 to binary string
    const binaryString = atob(base64String);
    
    // Create buffer from binary string
    const buffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(buffer);
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return buffer;
  }

  async stop() {
    try {
      console.log('🛑 Stopping Expo audio streaming...');
      
      this.isStreaming = false;
      
      // Clear the streaming interval
      if (this.streamingInterval) {
        clearInterval(this.streamingInterval);
        this.streamingInterval = null;
      }
      
      // Stop and clean up recording
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
          const uri = this.recording.getURI();
          if (uri) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          }
        } catch (error) {
          console.warn('⚠️ Error cleaning up recording:', error);
        }
        this.recording = null;
      }
      
      console.log('✅ Expo audio streaming stopped');
      
    } catch (error) {
      console.error('❌ Error stopping Expo audio streaming:', error);
    }
  }

  pause() {
    this.isStreaming = false;
    console.log('⏸️ Expo audio streaming paused');
  }

  resume() {
    this.isStreaming = true;
    console.log('▶️ Expo audio streaming resumed');
  }

  getStatus() {
    return {
      isStreaming: this.isStreaming,
      config: this.config,
      hasRecording: !!this.recording
    };
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 ExpoAudioStreamer config updated:', this.config);
  }
} 