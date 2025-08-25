import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const RealStuffCard = ({ card, onPress }) => {
  const getGradientColors = () => {
    switch (card.color) {
      case 'indigo':
        return ['#a5b4fc', '#8b5cf6', '#6366f1'];
      case 'rose':
        return ['#fda4af', '#f472b6', '#fdba74'];
      case 'teal':
        return ['#7dd3fc', '#06b6d4', '#67e8f9'];
      case 'clay':
        return ['#fdba74', '#f472b6', '#fda4af'];
      default:
        return ['#cbd5e1', '#94a3b8', '#64748b'];
    }
  };

  const getPillarEmoji = () => {
    switch (card.pillar) {
      case 'Faith':
        return '✝️';
      case 'Love':
        return '💕';
      case 'Relationships':
        return '🤝';
      case 'Lust':
        return '🔥';
      default:
        return '✝️';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(card)}
      style={[styles.cardContainer, { width: CARD_WIDTH }]}
    >
      <View style={styles.shadowContainer}>
        <LinearGradient colors={getGradientColors()} style={styles.gradient}>
        {/* Background Effect Layer */}
        <View style={styles.backgroundEffect} />
        
        {/* Pillar Badge */}
        <View style={styles.pillarBadge}>
          <Text style={styles.pillarEmoji}>
            {getPillarEmoji()}
          </Text>
          <Text style={styles.pillarText}>
            {card.pillar.toUpperCase()}
          </Text>
        </View>

        {/* Main Title */}
        <Text style={styles.title}>
          {card.title}
        </Text>

        {/* Subtext */}
        <Text style={styles.subtitle}>
          {card.subtitle}
        </Text>

        {/* Action Button (CTA pill) */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>{card.actions?.[0] || 'Open'}</Text>
          </TouchableOpacity>
        </View>

        {/* Subtle Corner Accent */}
        <View style={styles.cornerAccent} />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexShrink: 0,
    marginRight: 20,
  },
  shadowContainer: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: '#4F46E5', // Add background color for shadow efficiency
  },
  gradient: {
    borderRadius: 24,
    padding: 24,
    minHeight: 180,
  },
  backgroundEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pillarEmoji: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: 8,
  },
  pillarText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
    marginBottom: 12,
    fontFamily: 'System',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'System',
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  cornerAccent: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
  },
});

export default RealStuffCard;