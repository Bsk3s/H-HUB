import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

// Displays horizontal scrollable cards for real life topics
const RealStuffSection = ({ cards, onCardPress }) => {
  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>The Real Stuff</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cards?.map((card) => (
          <TouchableOpacity 
            key={card.id}
            onPress={() => onCardPress(card)}
            style={{ 
              width: 200, 
              marginRight: 12, 
              padding: 16, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 8 
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>{card.title}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{card.subtext}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default RealStuffSection;