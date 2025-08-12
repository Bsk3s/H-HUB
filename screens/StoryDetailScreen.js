import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StyleSheet,
  SafeAreaView,
  Animated 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { thisCantBeJustMe } from '../data/homeData';

const { height } = Dimensions.get('window');

const StoryDetailScreen = ({ route, navigation }) => {
  const { storyId } = route.params;
  const [story, setStory] = useState(null);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(height * 0.4)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const titleScale = useRef(new Animated.Value(1)).current;
  const titleTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (storyId) {
      const foundStory = thisCantBeJustMe.find(s => s.id === parseInt(storyId));
      setStory(foundStory);
    }
  }, [storyId]);

  // Handle scroll transformation
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const maxScroll = height * 0.25; // Start transforming after 25% of screen height
    
    // Update scrollY for interpolations
    scrollY.setValue(offsetY);
    
    // Calculate progress (0 to 1)
    const progress = Math.min(Math.max(offsetY / maxScroll, 0), 1);
    
    // Animate header height (40% to 15% of screen)
    const newHeight = (height * 0.4) - (progress * (height * 0.25));
    headerHeight.setValue(newHeight);
    
    // Animate gradient opacity (1 to 0.3)
    const newOpacity = 1 - (progress * 0.7);
    headerOpacity.setValue(newOpacity);
    
    // Animate title scale (1 to 0.7)
    const newScale = 1 - (progress * 0.3);
    titleScale.setValue(newScale);
    
    // Animate title position (move up)
    const newTranslateY = -(progress * 20);
    titleTranslateY.setValue(newTranslateY);
  };
  
  if (!story) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Story not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getGradientColors = () => {
    switch (story.color) {
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Story Content - Psychological Journey */}
      <ScrollView 
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header Content (part of scroll) */}
        <LinearGradient
          colors={getGradientColors()}
          style={[styles.scrollableHeader, { minHeight: height * 0.4 }]}
        >
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.headerBackButton}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
              
          {/* Story Title - The Hook */}
          <View style={styles.headerContent}>
            <Text style={styles.categoryLabel}>
              {story.emoji} {story.category?.toUpperCase() || 'LIFE'}
            </Text>
            
            <Text style={styles.storyTitle}>
              {story.title}
            </Text>
            
            <Text style={styles.storySubtitle}>
              {story.subtitle}
            </Text>
          </View>

          {/* Scroll Hint */}
          <View style={styles.scrollHint}>
            <Ionicons name="chevron-down" size={24} color="white" style={styles.scrollIcon} />
            <Text style={styles.scrollText}>Keep reading</Text>
          </View>
        </LinearGradient>
        
        {/* Content Sections with white background */}
        <View style={styles.contentSections}>
          {/* Opening Hook - Modern Pain Point */}
          <View style={styles.hookSection}>
            <Text style={styles.hookText}>
              {story.hook}
            </Text>
          </View>

        {/* The Journey - Building Emotional Investment */}
        <View style={styles.narrativeSection}>
          {story.narrative.split('\n\n').map((paragraph, index) => (
            <Text 
              key={index}
              style={styles.narrativeText}
            >
              {paragraph}
            </Text>
          ))}
        </View>

        {/* Transition - The Psychological Pivot */}
        <View style={styles.transitionSection}>
          <Text style={styles.transitionText}>
            But this story isn't new...
          </Text>
        </View>

        {/* The Reveal - Biblical Connection */}
        <View style={styles.revelationSection}>
          <Text style={styles.revelationTitle}>
            The Ancient Echo
          </Text>
          
          <Text style={styles.revelationText}>
            {story.revelation}
          </Text>

          {/* Scripture - The Sacred Payoff */}
          <View style={styles.scriptureSection}>
            <Text style={styles.scriptureText}>
              "{story.scripture}"
            </Text>
            <Text style={styles.scriptureRef}>
              {story.scriptureRef}
            </Text>
          </View>
        </View>

        {/* Reflection Space */}
        <View style={styles.reflectionSection}>
          <Text style={styles.reflectionText}>
            Some struggles echo across thousands of years. You're not alone in this.
          </Text>
        </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollableHeader: {
    paddingTop: 50, // Account for status bar
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  headerBackButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 12,
    opacity: 0.9,
  },
  storyTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  storySubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
  },
  scrollHint: {
    alignItems: 'center',
    marginTop: 16,
  },
  scrollIcon: {
    opacity: 0.7,
  },
  scrollText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  contentSections: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  hookSection: {
    marginBottom: 48,
  },
  hookText: {
    color: '#111827',
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  narrativeSection: {
    marginBottom: 64,
  },
  narrativeText: {
    color: '#374151',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
    letterSpacing: -0.1,
  },
  transitionSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#d1d5db',
    paddingLeft: 24,
    marginBottom: 48,
  },
  transitionText: {
    color: '#6b7280',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  revelationSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
  },
  revelationTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  revelationText: {
    color: '#374151',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 32,
  },
  scriptureSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    paddingLeft: 24,
  },
  scriptureText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    marginBottom: 12,
  },
  scriptureRef: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  reflectionSection: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  reflectionText: {
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 280,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default StoryDetailScreen;
