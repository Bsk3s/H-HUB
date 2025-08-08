import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Toggle between AI characters (Adina/Rafa)
const AIToggle = ({ activeAI, setActiveAI }) => {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 20, padding: 4 }}>
      <TouchableOpacity
        onPress={() => setActiveAI('adina')}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          backgroundColor: activeAI === 'adina' ? '#007AFF' : 'transparent'
        }}
      >
        <Text style={{ color: activeAI === 'adina' ? 'white' : '#666', fontWeight: '500' }}>
          Adina
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setActiveAI('rafa')}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          backgroundColor: activeAI === 'rafa' ? '#007AFF' : 'transparent'
        }}
      >
        <Text style={{ color: activeAI === 'rafa' ? 'white' : '#666', fontWeight: '500' }}>
          Rafa
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AIToggle;