import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

// Modal for activity interaction (prayer timer, Bible reading, etc.)
const ActivityModal = ({ activity, onClose, onSetLiveDraft }) => {
  if (!activity) return null;

  return (
    <Modal visible={true} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{activity.title}</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>{activity.duration}</Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Progress: {activity.progress}%</Text>
          
          <TouchableOpacity 
            onPress={() => onSetLiveDraft && onSetLiveDraft(activity.id, activity.progress + 10)}
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Continue Activity</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onClose}
            style={{ backgroundColor: '#666', padding: 12, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ActivityModal;