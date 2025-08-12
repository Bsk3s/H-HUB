import { API_URL } from './apiService';

/**
 * Backend Connection Test Utilities
 * Test your deployed LiveKit Voice Agent backend
 */

const BACKEND_URL = 'https://livekit-voice-agent-0jz0.onrender.com';

/**
 * Test backend health endpoint
 */
export const testBackendHealth = async () => {
  try {
    console.log('🏥 Testing backend health...');
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('✅ Backend health check passed:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test spiritual token generation
 */
export const testTokenGeneration = async (character = 'adina', userId = 'test_user_123') => {
  try {
    console.log('🎫 Testing token generation...');
    const response = await fetch(`${BACKEND_URL}/api/spiritual-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character: character,
        user_id: userId,
        user_name: 'Test User',
        session_duration_minutes: 30
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Token generation successful:', {
      token: data.token ? 'Generated' : 'Missing',
      character: data.character,
      user_id: data.user_id
    });
    return { success: true, data };
  } catch (error) {
    console.error('❌ Token generation failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run complete backend connectivity test
 */
export const runBackendTest = async () => {
  console.log('🚀 Starting complete backend test...');
  
  // Test 1: Health Check
  const healthResult = await testBackendHealth();
  
  // Test 2: Token Generation for both characters
  const adinaTokenResult = await testTokenGeneration('adina');
  const raffaTokenResult = await testTokenGeneration('raffa');
  
  // Results Summary
  const results = {
    health: healthResult,
    tokens: {
      adina: adinaTokenResult,
      raffa: raffaTokenResult
    }
  };
  
  const allPassed = healthResult.success && 
                   adinaTokenResult.success && 
                   raffaTokenResult.success;
  
  console.log(allPassed ? '✅ All backend tests passed!' : '❌ Some backend tests failed');
  console.log('📊 Test Results:', results);
  
  return { success: allPassed, results };
};

export default {
  testBackendHealth,
  testTokenGeneration,
  runBackendTest,
  BACKEND_URL
}; 