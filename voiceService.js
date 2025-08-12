import { API_URL } from './apiService';

/**
 * Send audio file to backend for transcription and AI response
 * @param {string} audioUri - URI of the recorded audio file
 * @param {string} persona - 'adina' or 'rafa'
 * @returns {Promise<Object>} Response with transcription and AI reply
 */
export const sendVoiceMessage = async (audioUri, persona = 'adina') => {
  try {
    console.log('🎤 Sending voice message to backend...', { audioUri, persona });

    // Create FormData to send audio file
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/wav',
      name: 'voice-message.wav',
    });
    formData.append('persona', persona);

    const response = await fetch(`${API_URL}/api/voice/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Voice API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('✅ Voice message processed:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send voice message:', error);
    throw error;
  }
};

/**
 * Test voice connection to backend
 * @returns {Promise<Object>} Connection test result
 */
export const testVoiceConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/api/voice/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Voice connection test failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Voice connection test failed:', error);
    throw error;
  }
};

export default {
  sendVoiceMessage,
  testVoiceConnection,
}; 