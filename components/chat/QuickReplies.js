import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

// Quick reply suggestions for voice chat
const QuickReplies = ({ activeAI, quickReplies }) => {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 12 }}>
        Quick Replies
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickReplies?.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: '#f0f0f0',
              borderRadius: 16,
              marginRight: 8
            }}
          >
            <Text style={{ fontSize: 12, color: '#333' }}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default QuickReplies;