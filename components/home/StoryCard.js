import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const StoryCard = ({ story, onPress }) => {
  const getGradientColors = () => {
    switch (story.color) {
      case 'blue':
        return ['#60a5fa', '#3b82f6', '#2563eb'];
      case 'green':
        return ['#34d399', '#10b981', '#059669'];
      case 'purple':
        return ['#a78bfa', '#8b5cf6', '#7c3aed'];
      case 'pink':
        return ['#f472b6', '#ec4899', '#db2777'];
      case 'orange':
        return ['#fb923c', '#f97316', '#ea580c'];
      case 'teal':
        return ['#2dd4bf', '#14b8a6', '#0d9488'];
      case 'indigo':
        return ['#a5b4fc', '#8b5cf6', '#6366f1'];
      case 'red':
        return ['#f87171', '#ef4444', '#dc2626'];
      default:
        return ['#60a5fa', '#3b82f6', '#2563eb'];
    }
  };

  const getCategoryEmoji = () => {
    return story.emoji || '💭';
  };

  const getCategoryName = () => {
    const title = story.title.toLowerCase();
    if (title.includes('ghost') || title.includes('dating') || title.includes('relationship')) {
      return 'LOVE';
    } else if (title.includes('mom') || title.includes('family') || title.includes('parent')) {
      return 'FAMILY';
    } else if (title.includes('job') || title.includes('fired') || title.includes('work')) {
      return 'WORK';
    } else if (title.includes('church') || title.includes('worship') || title.includes('pastor')) {
      return 'CHURCH';
    } else if (title.includes('friend') || title.includes('social')) {
      return 'RELATIONSHIPS';
    } else if (title.includes('money') || title.includes('tithe') || title.includes('financial') || title.includes('overdraft')) {
      return 'MONEY';
    } else if (title.includes('anxiety') || title.includes('mental') || title.includes('fear')) {
      return 'MENTAL HEALTH';
    } else if (title.includes('sin') || title.includes('struggle') || title.includes('shame')) {
      return 'STRUGGLE';
    } else if (title.includes('pray') || title.includes('prayer') || title.includes('worship')) {
      return 'PRAYER';
    }
    return 'LIFE';
  };

  const handlePress = () => {
    // TODO: Navigate to story detail
    console.log('Navigate to story detail:', story.id);
    onPress && onPress(story);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.cardContainer, { width: CARD_WIDTH }]}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
      >
        {/* Background Effect Layer */}
        <View style={styles.backgroundEffect} />
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>
            {getCategoryEmoji()}
          </Text>
          <Text style={styles.categoryText}>
            {getCategoryName()}
          </Text>
        </View>

        {/* Main Title */}
        <Text style={styles.title}>
          {story.title}
        </Text>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handlePress}
          >
            <Text style={styles.actionButtonText}>
              Tap to Read
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subtle Corner Accent */}
        <View style={styles.cornerAccent} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginRight: 20,
  },
  gradient: {
    borderRadius: 24,
    padding: 24,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'space-between',
  },
  backgroundEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryEmoji: {
    color: 'white',
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
    marginBottom: 32,
    letterSpacing: -0.3,
    flex: 1,
  },
  actionContainer: {
    marginTop: 'auto',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
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

export default StoryCard;
