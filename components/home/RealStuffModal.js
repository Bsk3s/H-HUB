import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

// Modal popup for detailed real stuff card content
const RealStuffModal = ({ card, isVisible, onClose }) => {
  if (!card) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{card.title}</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>{card.subtext}</Text>
          <TouchableOpacity 
            onPress={onClose}
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RealStuffModal;