import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PILLAR_GRADIENTS = {
  Faith: ['#A78BFA', '#6366F1'],
  Relationships: ['#F472B6', '#EC4899'],
  Money: ['#F59E0B', '#F97316'],
};

function getGradient(card) {
  if (card.gradient) return card.gradient;
  const byPillar = PILLAR_GRADIENTS[card.pillar];
  if (byPillar) return byPillar;
  switch (card.color) {
    case 'indigo':
      return ['#9B8CFF', '#6F7CFF'];
    case 'pink':
      return ['#F472B6', '#EC4899'];
    default:
      return ['#9CA3AF', '#6B7280'];
  }
}

const RealStuffCard = ({ card, width, onPress }) => {
  const gradientColors = getGradient(card);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress && onPress(card)}
      style={{ width, marginRight: 20 }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 20, minHeight: 190, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 }}
      >
        {/* Pillar chip */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: 'white', marginRight: 8 }}>✝️</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>{(card.pillar || 'Faith').toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', lineHeight: 24, marginBottom: 10 }}>
          {card.title}
        </Text>
        {/* Subtext */}
        <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
          {card.subtext}
        </Text>

        {/* CTA pill */}
        <View style={{ marginTop: 'auto' }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start' }}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>{card.actions?.[0] || 'Reflect With God'}</Text>
          </View>
        </View>

        {/* Micro-dot */}
        <View style={{ position: 'absolute', top: 14, right: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' }} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default RealStuffCard;


