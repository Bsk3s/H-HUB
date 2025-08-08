import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

// Displays story cards in horizontal scroll
const StoriesSection = ({ stories }) => {
  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>This Can't Be Just Me</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {stories?.map((story) => (
          <TouchableOpacity 
            key={story.id}
            style={{ 
              width: 220, 
              marginRight: 12, 
              padding: 16, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 8 
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 8 }}>{story.emoji}</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>{story.title}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{story.subtitle}</Text>
            <Text style={{ fontSize: 10, color: '#999', marginTop: 8 }}>{story.readTime}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default StoriesSection;