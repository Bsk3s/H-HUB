import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import RealStuffCard from './RealStuffCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const RealStuffSection = ({ cards, onCardPress }) => {
  // Get today's cards (for now, we'll show first 5 cards as daily cards)
  // In a real app, this would be filtered based on date and rotation logic
  const todaysCards = cards.slice(0, 5);

  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            The Real Stuff
          </Text>
          <Text style={styles.subtitle}>
            What you're actually thinking about
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TODAY</Text>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH + 20} // Card width + margin
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {todaysCards.map((card) => (
          <RealStuffCard 
            key={card.id} 
            card={card} 
            onPress={onCardPress}
          />
        ))}
      </ScrollView>
      
      {/* Subtle hint text */}
      <Text style={styles.hintText}>
        Swipe through today's reflections • New cards every morning
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'System',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#1f2937',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RealStuffSection;