import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import StoryCard from './StoryCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const StoriesSection = ({ stories }) => {
  const router = useRouter();

  // Only show first 3 stories on home page
  const featuredStories = stories.slice(0, 3);

  const handleSeeAllStories = () => {
    router.push('/stories');
  };

  return (
    <View>
      <View className="flex-row justify-between items-end mb-5">
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-1" style={{ 
            fontFamily: 'System', 
            letterSpacing: -0.3 
          }}>
            This Can't Be Just Me
          </Text>
          <Text className="text-gray-600 text-sm font-medium">
            Stories that sound too familiar
          </Text>
        </View>
        <TouchableOpacity onPress={handleSeeAllStories}>
          <Text className="text-blue-600 text-sm font-semibold">
            See all stories →
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="-mx-4 px-4"
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH + 20} // Card width + margin
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {featuredStories.map((story) => (
          <StoryCard 
            key={story.id} 
            story={story}
          />
        ))}
      </ScrollView>
      
      {/* Subtle hint text */}
      <Text className="text-xs text-gray-400 mt-4 text-center font-medium">
        Stories that hit different • New reflections added regularly
      </Text>
    </View>
  );
};

export default StoriesSection; 