import { NativeModules } from 'react-native';

class AudioOutputManager {
  /**
   * Force audio output to the speaker for voice chat
   * This is required on iOS to route audio to speaker instead of earpiece
   * when using PlayAndRecord audio session category
   */
  static async forceSpeakerOutput() {
    try {
      await NativeModules.AudioOutputManager.forceSpeaker();
      console.log('🔊 Speaker override successful!');
      return true;
    } catch (error) {
      console.error('❌ Speaker override failed:', error);
      throw error;
    }
  }

  /**
   * Check if the native module is available
   */
  static isAvailable() {
    return !!NativeModules.AudioOutputManager;
  }
}

export default AudioOutputManager; 