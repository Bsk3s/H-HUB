import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { thisCantBeJustMe } from '../data/homeData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 2; // 2-column grid with padding

const StoriesScreen = ({ navigation }) => {
  const getGradientColors = (color) => {
    switch (color) {
      case 'blue': return ['#60a5fa', '#3b82f6', '#2563eb'];
      case 'green': return ['#34d399', '#10b981', '#059669'];
      case 'purple': return ['#a78bfa', '#8b5cf6', '#7c3aed'];
      case 'pink': return ['#f472b6', '#ec4899', '#db2777'];
      case 'orange': return ['#fb923c', '#f97316', '#ea580c'];
      case 'teal': return ['#2dd4bf', '#14b8a6', '#0d9488'];
      case 'indigo': return ['#a5b4fc', '#8b5cf6', '#6366f1'];
      case 'red': return ['#f87171', '#ef4444', '#dc2626'];
      default: return ['#60a5fa', '#3b82f6', '#2563eb'];
    }
  };

  const getCategoryName = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('ghost') || lowerTitle.includes('dating') || lowerTitle.includes('relationship')) {
      return 'LOVE';
    } else if (lowerTitle.includes('overdraft') || lowerTitle.includes('money') || lowerTitle.includes('tithe') || lowerTitle.includes('financial')) {
      return 'MONEY';
    } else if (lowerTitle.includes('church') || lowerTitle.includes('worship') || lowerTitle.includes('pastor')) {
      return 'CHURCH';
    } else if (lowerTitle.includes('friend') || lowerTitle.includes('social')) {
      return 'RELATIONSHIPS';
    } else if (lowerTitle.includes('anxiety') || lowerTitle.includes('mental') || lowerTitle.includes('fear')) {
      return 'MENTAL HEALTH';
    } else if (lowerTitle.includes('sin') || lowerTitle.includes('struggle') || lowerTitle.includes('shame')) {
      return 'STRUGGLE';
    } else if (lowerTitle.includes('pray') || lowerTitle.includes('prayer') || lowerTitle.includes('worship')) {
      return 'PRAYER';
    }
    return 'LIFE';
  };

  const GridStoryCard = ({ story }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('StoryDetail', { storyId: story.id })}
      style={[styles.gridCard, { width: CARD_WIDTH }]}
    >
      <LinearGradient
        colors={getGradientColors(story.color)}
        style={styles.gridCardGradient}
      >
        {/* Top Section - Category Badge */}
        <View style={styles.gridCardHeader}>
          <Text style={styles.gridCardEmoji}>
            {story.emoji || '💭'}
          </Text>
          <Text style={styles.gridCardCategory}>
            {getCategoryName(story.title)}
          </Text>
        </View>

        {/* Middle Section - Title */}
        <View style={styles.gridCardContent}>
          <Text
            style={[
              styles.gridCardTitle,
              { fontSize: story.title.length > 50 ? 15 : 17 }
            ]}
            numberOfLines={4}
          >
            {story.title}
          </Text>
        </View>

        {/* Bottom Section - Read Time */}
        <View style={styles.gridCardFooter}>
          <Text style={styles.gridCardReadTime}>
            {story.readTime}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Create rows for 2-column grid
  const createRows = () => {
    const rows = [];
    for (let i = 0; i < thisCantBeJustMe.length; i += 2) {
      const pair = thisCantBeJustMe.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.gridRow}>
          {pair.map((story) => (
            <GridStoryCard key={story.id} story={story} />
          ))}
          {/* Add empty placeholder if odd number of items */}
          {pair.length === 1 && <View style={{ width: CARD_WIDTH }} />}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            This Can't Be Just Me
          </Text>
          <Text style={styles.headerSubtitle}>
            Stories that sound too familiar
          </Text>
        </View>
      </View>

      {/* Stories Grid */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {createRows()}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCard: {
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderRadius: 24,
    backgroundColor: '#60a5fa', // Default background color for shadow efficiency
  },
  gridCardGradient: {
    borderRadius: 24,
    padding: 16,
    height: 216,
    justifyContent: 'space-between',
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCardEmoji: {
    color: 'white',
    fontSize: 16,
    marginRight: 8,
  },
  gridCardCategory: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  gridCardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  gridCardTitle: {
    color: 'white',
    fontWeight: 'bold',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  gridCardFooter: {
    alignItems: 'flex-start',
  },
  gridCardReadTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 48,
  },
});

export default StoriesScreen;


