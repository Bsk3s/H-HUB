// RealAudioStreamer is deprecated - using ExpoAudioStreamer instead
// This file kept for reference only

import { Buffer } from 'buffer';

export class RealAudioStreamer {
  constructor(onAudioData) {
    this.onAudioData = onAudioData;
    this.subscription = null;
    this.isStreaming = false;
  }

  async start() {
    try {
      console.log('🎤 Starting real audio streaming...');
      
      // DEPRECATED: ExpoPlayAudioStream requires custom development build
      // Using ExpoAudioStreamer instead
      throw new Error('RealAudioStreamer is deprecated - use ExpoAudioStreamer instead');
      
      /* 
      const { recordingResult, subscription } = await ExpoPlayAudioStream.startMicrophone({
        sampleRate: 16000, // Deepgram optimized sample rate
        channels: 1, // Mono audio
        enableProcessing: true, // Voice processing with echo cancellation
        onAudioStream: (event) => {
          if (this.isStreaming && this.onAudioData) {
            // Convert base64 to binary buffer for WebSocket transmission
            const audioBuffer = Buffer.from(event.data, 'base64');
            this.onAudioData(audioBuffer);
          }
        }
      });
      */
      
      this.subscription = subscription;
      this.isStreaming = true;
      
      console.log('✅ Real audio streaming started successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Error starting real audio streaming:', error);
      return false;
    }
  }

  async stop() {
    try {
      console.log('🛑 Stopping real audio streaming...');
      
      this.isStreaming = false;
      
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }
      
      // await ExpoPlayAudioStream.stopMicrophone();
      console.log('✅ Real audio streaming stopped');
      
    } catch (error) {
      console.error('❌ Error stopping real audio streaming:', error);
    }
  }

  pause() {
    this.isStreaming = false;
    console.log('⏸️ Audio streaming paused');
  }

  resume() {
    this.isStreaming = true;
    console.log('▶️ Audio streaming resumed');
  }

  getStatus() {
    return {
      isStreaming: this.isStreaming,
      hasSubscription: !!this.subscription
    };
  }
} 