// Test Service to verify backend STT works with known audio
export class AudioTestService {
  constructor() {
    this.ws = null;
  }

  async testBackendWithWorkingAudio() {
    try {
      console.log('🧪 Testing backend with known working audio...');
      
      // Connect to backend
      this.ws = new WebSocket('wss://livekit-voice-agent-0jz0.onrender.com/ws/audio');
      
      await new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          console.log('✅ Test WebSocket connected');
          resolve();
        };
        this.ws.onerror = reject;
      });

      // Initialize session
      this.ws.send(JSON.stringify({
        character: "adina",
        type: "initialize"
      }));

      // Wait for initialization
      await new Promise(resolve => {
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'initialized') {
            console.log('✅ Test session initialized');
            resolve();
          }
        };
      });

      // Generate a simple audio test signal (sine wave)
      const testAudio = this.generateTestAudioPCM();
      const base64Audio = this.arrayBufferToBase64(testAudio);
      
      console.log('🎵 Sending test audio:', testAudio.byteLength, 'bytes');
      
      // Send test audio
      this.ws.send(JSON.stringify({
        type: 'audio',
        audio: base64Audio
      }));

      // Listen for transcription response
      return new Promise((resolve) => {
        let timeoutId = setTimeout(() => {
          resolve({ success: false, error: 'No response in 10 seconds' });
        }, 10000);

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('📨 Test response:', data);
          
          if (data.type === 'transcription_complete') {
            clearTimeout(timeoutId);
            resolve({ 
              success: true, 
              transcription: data.text || data.transcription || 'Empty',
              message: 'Backend STT is working!' 
            });
          }
        };
      });

    } catch (error) {
      console.error('❌ Backend test failed:', error);
      return { success: false, error: error.message };
    } finally {
      if (this.ws) {
        this.ws.close();
      }
    }
  }

  // Generate a simple test audio signal (440Hz sine wave for 1 second)
  generateTestAudioPCM() {
    const sampleRate = 16000;
    const duration = 1; // 1 second
    const frequency = 440; // A4 note
    const samples = sampleRate * duration;
    
    const buffer = new ArrayBuffer(samples * 2); // 16-bit audio
    const view = new DataView(buffer);
    
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 32767;
      view.setInt16(i * 2, sample, true); // little endian
    }
    
    return buffer;
  }

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export default new AudioTestService(); 