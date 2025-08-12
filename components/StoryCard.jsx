import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const StoryCard = ({ story }) => {
  const router = useRouter();

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
    } else if (title.includes('money') || title.includes('tithe') || title.includes('financial')) {
      return 'MONEY';
    }
    return 'LIFE';
  };

  const getBackgroundEffect = () => {
    // Light, airy background effects
    const baseStyle = "absolute inset-0 opacity-10";
    
    switch (story.color) {
      case 'blue':
        return `${baseStyle} bg-gradient-to-tr from-white/20 to-transparent`;
      case 'green':
        return `${baseStyle} bg-gradient-to-bl from-white/15 to-transparent`;
      case 'purple':
        return `${baseStyle} bg-gradient-to-r from-white/10 via-transparent to-white/10`;
      case 'pink':
        return `${baseStyle} bg-gradient-to-t from-white/5 to-transparent`;
      default:
        return `${baseStyle} bg-white/5`;
    }
  };

  const handlePress = () => {
    router.push(`/story-detail?id=${story.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-shrink-0 mr-5"
      style={{ width: CARD_WIDTH }}
    >
      <LinearGradient
        colors={getGradientColors()}
        className="rounded-3xl p-6 shadow-lg"
        style={{ minHeight: 180 }}
      >
        {/* Background Effect Layer */}
        <View className={getBackgroundEffect()} />
        
        {/* Category Badge */}
        <View className="flex-row items-center mb-5">
          <Text className="text-white text-base mr-2">
            {getCategoryEmoji()}
          </Text>
          <Text className="text-white/90 text-xs font-semibold tracking-wide">
            {getCategoryName()}
          </Text>
        </View>

        {/* Main Title - Only the title, no subtext */}
        <Text className="text-white text-xl font-bold leading-tight mb-8" style={{ 
          fontFamily: 'System', 
          letterSpacing: -0.3,
          lineHeight: 24
        }}>
          {story.title}
        </Text>

        {/* Action Button - Gentler Style */}
        <View className="mt-auto">
          <TouchableOpacity 
            className="bg-white/30 backdrop-blur-sm rounded-xl py-2.5 px-5 self-start"
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Text className="text-white text-sm font-medium">
              Tap to Read
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subtle Corner Accent - Lighter */}
        <View className="absolute top-5 right-5 w-1.5 h-1.5 bg-white/40 rounded-full" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default StoryCard; 