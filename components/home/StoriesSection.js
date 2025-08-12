import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import StoryCard from './StoryCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const StoriesSection = ({ stories, navigation, onStoryPress }) => {
  // Only show first 3 stories on home page
  const featuredStories = stories?.slice(0, 3) || [];

  const handleSeeAllStories = () => {
    navigation.navigate('Stories');
  };

  return (
    <View>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>
            This Can't Be Just Me
          </Text>
          <Text style={styles.subtitle}>
            Stories that sound too familiar
          </Text>
        </View>
        <TouchableOpacity onPress={handleSeeAllStories}>
          <Text style={styles.seeAllText}>
            See all stories →
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH + 20} // Card width + margin
        contentContainerStyle={styles.scrollContent}
      >
        {featuredStories.map((story) => (
          <StoryCard 
            key={story.id} 
            story={story}
            onPress={onStoryPress}
          />
        ))}
      </ScrollView>
      
      {/* Subtle hint text */}
      <Text style={styles.hintText}>
        Stories that hit different • New reflections added regularly
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
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
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  seeAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 20,
  },
  hintText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default StoriesSection;