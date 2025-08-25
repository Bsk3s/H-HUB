// LOCAL BACKEND ENDPOINTS
const LOCAL_API_BASE = "http://208.78.106.135:10000";
const TOKEN_ENDPOINT = `${LOCAL_API_BASE}/api/generate-token`;
const DISPATCH_ENDPOINT = `${LOCAL_API_BASE}/api/dispatch-agent`;

// Add API key header for dispatch
const DISPATCH_HEADERS = {
  "Content-Type": "application/json",
  "X-API-Key": "dev"
};

// LIVEKIT CREDENTIALS (SAME AS PRODUCTION)
const LIVEKIT_URL = "wss://hb-j73yzwmu.livekit.cloud";
// API keys stay the same - using same LiveKit Cloud instance

const USE_LOCAL = false; // Change this to switch backends

const API_BASE_URL = USE_LOCAL 
  ? "http://208.78.106.135:10000"     // Local
  : "http://165.232.39.14:10000";     // Production

class SpiritualAPI {
  async getSpiritualToken(character = 'Adina') {
    try {
      console.log(`🔌 Requesting token for ${character}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          character: character.toLowerCase()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Token received:', {
        room: data.room,
        wsUrl: data.wsUrl,
        url: data.url,
        token_length: data.token?.length || 0
      });

      return {
        token: data.token,
        roomName: data.room,
        character: character.toLowerCase(),
        sessionId: data.room?.split('-').pop() || 'unknown',
        serverUrl: data.wsUrl || LIVEKIT_URL // Use wsUrl from response, fallback to constant
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
      
      // Use DigitalOcean complete system with REAL agent dispatch functionality
      const response = await fetch(`${API_BASE_URL}/api/dispatch-agent`, {
        method: 'POST',
        headers: DISPATCH_HEADERS,
        body: JSON.stringify({
          room_name: roomName,
          character: character.toLowerCase()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Agent dispatched successfully via ${USE_LOCAL ? 'LOCAL' : 'PRODUCTION'}:`, data);
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