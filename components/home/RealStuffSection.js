import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import RealStuffCard from './RealStuffCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.round(width * 0.86);

// Displays horizontal scrollable cards for real life topics
const RealStuffSection = ({ cards, onCardPress }) => {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4, letterSpacing: -0.3 }}>The Real Stuff</Text>
          <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '500' }}>What you're actually thinking about</Text>
        </View>
        <View style={{ backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>TODAY</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH + 20}
        contentContainerStyle={{ paddingRight: 20 }}
        style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
      >
        {(cards || []).map((card) => (
          <RealStuffCard key={card.id} card={card} width={CARD_WIDTH} onPress={onCardPress} />
        ))}
      </ScrollView>
      <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 12, textAlign: 'center', fontWeight: '500' }}>
        Swipe through today's reflections • New cards every morning
      </Text>
    </View>
  );
};

export default RealStuffSection;