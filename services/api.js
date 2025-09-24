// BACKEND ENDPOINTS - CONFIRMED WORKING WITH CURL!
const API_BASE_URL = "https://back.a-heavenlyhub.com";

// Add API key header for dispatch
const DISPATCH_HEADERS = {
  "Content-Type": "application/json",
  "X-API-Key": "dev"
};

// LIVEKIT CREDENTIALS
const LIVEKIT_URL = "wss://hb-j73yzwmu.livekit.cloud";

class SpiritualAPI {
  async getSpiritualToken(character = 'Adina') {
    try {
      console.log(`🔌 Requesting token for ${character}...`);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_BASE_URL}/api/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          character: character.toLowerCase()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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

  async testAllEndpoints() {
    console.log('🧪 Testing all backend endpoints...');

    const endpoints = [
      '/health',
      '/api/health',
      '/status',
      '/api/status',
      '/',
      '/api'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing: ${API_BASE_URL}${endpoint}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📊 ${endpoint}: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const text = await response.text();
          console.log(`✅ WORKING: ${endpoint} - Response: ${text.substring(0, 100)}...`);
          return { endpoint, status: response.status, working: true };
        }

      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }

    return { working: false };
  }

  async checkHealth() {
    try {
      console.log(`🏥 Health check: ${API_BASE_URL}/health`);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('✅ Backend is healthy');
        return true;
      } else {
        console.log(`❌ Backend unhealthy: ${response.status}`);
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Health check timed out');
      } else {
        console.error('❌ Health check failed:', error);
      }
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
      console.log(`✅ Agent dispatched successfully:`, data);
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