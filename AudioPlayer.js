import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// AudioPlayer - Simple audio playback using Expo Audio
class AudioPlayer {
  constructor() {
    this.currentSound = null;
    this.isPlaying = false;
  }

  async initialize() {
    try {
      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      return true;
    } catch (error) {
      console.error('❌ AudioPlayer init failed:', error);
      return false;
    }
  }

  async playAudioFromBase64(base64Audio) {
    try {
      // Stop any currently playing audio
      await this.stopAudio();
      
      const tempPath = `${FileSystem.cacheDirectory}agent_audio_${Date.now()}.wav`;
      
      // Write base64 audio to temporary file
      await FileSystem.writeAsStringAsync(tempPath, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Create and load sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: tempPath },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        }
      );

      this.currentSound = sound;
      this.isPlaying = true;

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          this.isPlaying = false;
          this.currentSound = null;
          
          // Cleanup temp file
          FileSystem.deleteAsync(tempPath).catch(console.error);
          
          console.log('🔊 Audio playback finished');
        }
      });
      
      console.log('🔊 Audio playback started');
      
    } catch (error) {
      console.error('❌ Audio playback error:', error);
    }
  }

  async stopAudio() {
    if (this.currentSound && this.isPlaying) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        this.isPlaying = false;
        console.log('🛑 Audio playback stopped');
      } catch (error) {
        console.error('❌ Error stopping audio:', error);
      }
    }
  }
}

export default new AudioPlayer(); 