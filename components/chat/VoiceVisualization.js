import React from 'react';
import { View, Text } from 'react-native';

// Voice visualization with animated blob and particles
const VoiceVisualization = ({ activeAI, isListening, blobScale, glowOpacity, particles, particleOpacity, particleScale }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <View 
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: isListening ? '#007AFF' : '#e0e0e0',
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ scale: isListening ? 1.1 : 1 }]
        }}
      >
        <Text style={{ fontSize: 24, color: 'white' }}>
          {activeAI === 'adina' ? '👩' : '👨'}
        </Text>
      </View>
      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#333' }}>
        {activeAI === 'adina' ? 'Adina' : 'Rafa'}
      </Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' }}>
        {isListening ? 'Listening...' : 'Tap to start conversation'}
      </Text>
    </View>
  );
};

export default VoiceVisualization;