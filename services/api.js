const API_BASE_URL = 'http://208.78.106.135:10000';

class SpiritualAPI {
  async getSpiritualToken(character = 'Adina') {
    try {
      console.log(`🔌 Requesting token for ${character}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/spiritual-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character: character.toLowerCase(),
          user_id: `mobile-user-${Date.now()}`,
          user_name: "Mobile App User",
          session_duration_minutes: 30
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Token received:', {
        character: data.character,
        room_name: data.room_name,
        session_id: data.session_id,
        token_length: data.token?.length || 0
      });

      return {
        token: data.token,
        roomName: data.room_name,
        character: data.character,
        sessionId: data.session_id,
        serverUrl: 'wss://hb-j73yzwmu.livekit.cloud'
      };
    } catch (error) {
      console.error('❌ Failed to get spiritual token:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  async dispatchAgent(roomName, character = 'adina') {
    try {
      console.log(`🤖 Dispatching ${character} agent to room ${roomName}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/dispatch-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_name: roomName,
          character: character.toLowerCase()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Agent dispatched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to dispatch agent:', error);
      throw error;
    }
  }

  // Test function to validate complete flow
  async testCompleteFlow() {
    try {
      console.log('🧪 Starting complete flow test...');
      
      // Test 1: Health check
      console.log('📋 Test 1: Health check...');
      const health = await this.checkHealth();
      console.log(`Health check result: ${health ? '✅ PASS' : '❌ FAIL'}`);
      
      // Test 2: Token request
      console.log('📋 Test 2: Token request...');
      const tokenData = await this.getSpiritualToken('Adina');
      console.log(`Token request result: ${tokenData.token ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Room: ${tokenData.roomName}`);
      console.log(`Server: ${tokenData.serverUrl}`);
      
      return {
        health,
        tokenData,
        success: health && !!tokenData.token
      };
    } catch (error) {
      console.error('❌ Complete flow test failed:', error);
      return {
        health: false,
        tokenData: null,
        success: false,
        error: error.message
      };
    }
  }
}

export default new SpiritualAPI(); 