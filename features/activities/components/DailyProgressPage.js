import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

// Full-screen activities progress page
const DailyProgressPage = ({ activities, activityLogs, onBack, onActivitySelect, getCurrentProgress }) => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 16, color: '#007AFF' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Daily Progress</Text>
      </View>
      
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {activities?.map((activity) => (
          <TouchableOpacity 
            key={activity.id}
            onPress={() => onActivitySelect(activity)}
            style={{ 
              padding: 16, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 8, 
              marginBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{activity.title}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>{activity.duration}</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#007AFF' }}>{activity.progress}%</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default DailyProgressPage;