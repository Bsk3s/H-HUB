import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const DailyProgressRow = ({ activities, onActivitySelect, onViewAll, getCurrentProgress }) => {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Daily Progress</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ color: '#007AFF' }}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {activities?.slice(0, 4).map((activity) => (
          <TouchableOpacity 
            key={activity.id} 
            onPress={() => onActivitySelect(activity)}
            style={{ 
              flex: 1, 
              marginHorizontal: 4, 
              padding: 12, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 8, 
              alignItems: 'center' 
            }}
          >
            <Text style={{ fontSize: 12, textAlign: 'center' }}>{activity.title}</Text>
            <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{activity.progress}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default DailyProgressRow;