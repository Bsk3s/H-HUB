import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Star, Heart, BookOpen, Sun, Moon } from 'lucide-react-native';
import dailyVerseService from '../src/services/dailyVerseService';

const { width } = Dimensions.get('window');

// EXACT HB1 DailyVerse Component
const DailyVerse = () => {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodaysVerse = async () => {
      try {
        const todaysVerse = await dailyVerseService.getTodaysVerse();
        setVerse(todaysVerse);
      } catch (error) {
        console.error('Error loading daily verse:', error);
        // Fallback verse
        setVerse({
          text: "And we have known and believed the love that God has for us. God is love, and he who abides in love abides in God, and God in him.",
          verse: "1 John 4:16",
          version: "NKJV"
        });
      } finally {
        setLoading(false);
      }
    };

    loadTodaysVerse();
  }, []);

  if (loading || !verse) {
    return (
      <View style={{ backgroundColor: '#f0f8f0', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2d5d2d', marginBottom: 8 }}>Daily Verse</Text>
        <Text style={{ fontSize: 18, color: '#9ca3af' }}>Loading today's verse...</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#f0f8f0', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#2d5d2d', marginBottom: 8 }}>
        Daily Verse
      </Text>
      <Text style={{ fontSize: 18, color: '#1f2937', marginBottom: 8 }}>
        "{verse.text}"
      </Text>
      <Text style={{ fontSize: 14, color: '#6b7280' }}>{verse.verse} {verse.version}</Text>
    </View>
  );
};

// EXACT HB1 ActivityRing Component  
const ICONS = {
  Heart,
  BookOpen,
  Sun,
  Moon,
  Star, // Fallback
};

const ActivityRing = ({ activity, onClick, size: customSize, hideText = false, isCalendarView = false, date, color: propColor, getCurrentProgress }) => {
  const { title, progress, dailyGoal, streak, color: activityColor = "blue", icon: iconName } = activity;
  const Icon = ICONS[iconName] || ICONS.Star;
  
  // Use propColor if provided, otherwise fall back to activityColor
  const color = propColor || activityColor;
  
  // Ring configuration
  const size = customSize || 90;
  // Better balanced stroke width - not too thin, not too thick
  const strokeWidth = isCalendarView ? size * 0.11 : (hideText ? size * 0.15 : size * 0.13);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Use live progress if available, otherwise fall back to stored progress
  const goal = isCalendarView ? 100 : (dailyGoal || 1);
  const currentProgress = getCurrentProgress ? getCurrentProgress(activity.id) : (progress || 0);
  
  // Simple progress calculation - percentage of goal completed (max 100%)
  const progressPercentage = goal > 0 ? Math.min((currentProgress / goal) * 100, 100) : 0;
  const isComplete = currentProgress >= goal;
  
  const progressOffset = circumference - (progressPercentage / 100) * circumference;
  
  // Map legacy color names to new color names
  const colorNameMap = {
    'red': 'rose',
    'orange': 'amber',
    'purple': 'indigo'
  };

  // Convert legacy color names to new color names
  const normalizedColorName = colorNameMap[color] || color;
  
  // Professional, high-contrast colors - KEEP ORIGINAL COLORS ALWAYS
  const colorMap = {
    rose: {
      ring: '#ff2d55', // Always red
      bg: '#fff1f2',
      inactiveRing: 'rgba(255, 45, 85, 0.1)'
    },
    blue: {
      ring: '#0a84ff', // Always blue  
      bg: '#dbeafe',
      inactiveRing: 'rgba(10, 132, 255, 0.1)'
    },
    amber: {
      ring: '#ffcc00', // Always yellow
      bg: '#fffbeb', 
      inactiveRing: 'rgba(255, 204, 0, 0.1)'
    },
    indigo: {
      ring: '#bf5af2', // Always purple
      bg: '#eef2ff',
      inactiveRing: 'rgba(191, 90, 242, 0.1)'
    }
  };
  
  // Use the activity's color or fallback to blue
  const colors = colorMap[normalizedColorName] || colorMap.blue;

  // Format display text
  const formatDisplayText = () => {
    if (activity.type === 'bible') {
      return `${currentProgress}/${goal} chapters`;
    }
    return `${currentProgress}m / ${goal}m`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Determine if this is an empty/inactive ring for calendar view
  const isEmptyRing = isCalendarView && progressPercentage <= 0;

  return (
    <TouchableOpacity onPress={onClick} style={{ width: hideText ? size : size * 1.11, alignItems: 'center' }}>
      <View style={{ position: 'relative' }}>
        <Svg width={size} height={size}>
          {/* Background circle with better visibility */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.inactiveRing}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="butt"
          />
          
          {/* Progress circle with better visibility */}
          {progressPercentage > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.ring}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference}`}
              strokeDashoffset={progressOffset}
              strokeLinecap="butt"
              transform={`rotate(-90, ${size / 2}, ${size / 2})`}
              fill="none"
            />
          )}
        </Svg>
        
        {!hideText && (
          <>
            {/* Icon Circle */}
            <View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <View 
                style={{
                  borderRadius: (size * 0.64) / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.bg,
                  width: size * 0.64,
                  height: size * 0.64,
                }}
              >
                <Icon stroke={colors.ring} size={size * 0.29} strokeWidth={2} />
              </View>
            </View>
            
            {/* Streak Badge */}
            {streak > 0 && (
              <View 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 20,
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  backgroundColor: colors.bg
                }}
              >
                <Star size={12} color={colors.ring} fill={colors.ring} />
                <Text 
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: colors.ring
                  }}
                >
                  {streak}d
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Title and Duration Text */}
      {!hideText && (
        <>
          <Text 
            style={{
              textAlign: 'center',
              fontWeight: '500',
              marginTop: 8,
              width: '100%',
              fontSize: size * 0.16
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text 
            style={{
              color: '#6b7280',
              textAlign: 'center',
              width: '100%',
              fontSize: size * 0.12
            }}
          >
            {formatDisplayText()}
          </Text>
          <Text 
            style={{
              color: '#9ca3af',
              textAlign: 'center',
              width: '100%',
              fontSize: size * 0.11
            }}
          >
            {date ? formatDate(date) : ''}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// EXACT HB1 DailyProgressRow Component
const DailyProgressRow = ({ activities, onActivitySelect, onViewAll, getCurrentProgress }) => {
  // Ensure all activities have their streaks properly set
  const activitiesWithStreaks = activities.map(activity => {
    // Preserve the original streak value, ensuring it's a valid number
    const streak = typeof activity.streak === 'number' ? activity.streak : 0;
    return { ...activity, streak };
  });

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Daily Progress</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '500' }}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {/* Use ScrollView to handle potential overflow on smaller screens */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', gap: 1 }}>
          {activitiesWithStreaks.map((activity) => (
            <ActivityRing
              key={activity.type}
              activity={activity}
              onClick={() => onActivitySelect(activity)}
              getCurrentProgress={getCurrentProgress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// EXACT HB1 RealStuffCard Component
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
      style={{
        flexShrink: 0,
        marginRight: 20,
        width: CARD_WIDTH
      }}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={{
          borderRadius: 24,
          padding: 24,
          minHeight: 180,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5
        }}
      >
        {/* Pillar Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: 'white', fontSize: 16, marginRight: 8 }}>
            {getPillarEmoji()}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
            {card.pillar.toUpperCase()}
          </Text>
        </View>

        {/* Main Title - Lighter Weight */}
        <Text style={{ 
          color: 'white',
          fontSize: 20,
          fontWeight: '700',
          lineHeight: 24,
          marginBottom: 12,
          fontFamily: 'System',
          letterSpacing: -0.3
        }}>
          {card.title}
        </Text>

        {/* Subtext - Softer Weight */}
        <Text style={{
          color: 'rgba(255,255,255,0.95)',
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 20,
          fontFamily: 'System',
          fontWeight: '400'
        }}>
          {card.subtext}
        </Text>

        {/* Action Button - Gentler Style */}
        <View style={{ marginTop: 'auto' }}>
          <TouchableOpacity 
            style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 20,
              alignSelf: 'flex-start',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
              {card.actions[0]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subtle Corner Accent - Lighter */}
        <View style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 6,
          height: 6,
          backgroundColor: 'rgba(255,255,255,0.4)',
          borderRadius: 3
        }} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// EXACT HB1 StoryCard Component
const StoryCard = ({ story }) => {
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

  return (
    <TouchableOpacity
      style={{
        flexShrink: 0,
        marginRight: 20,
        width: CARD_WIDTH
      }}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={{
          borderRadius: 24,
          padding: 24,
          minHeight: 180,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5
        }}
      >
        {/* Category Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: 'white', fontSize: 16, marginRight: 8 }}>
            {getCategoryEmoji()}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
            {getCategoryName()}
          </Text>
        </View>

        {/* Main Title - Only the title, no subtext */}
        <Text style={{ 
          color: 'white',
          fontSize: 20,
          fontWeight: '700',
          lineHeight: 24,
          marginBottom: 32,
          fontFamily: 'System',
          letterSpacing: -0.3
        }}>
          {story.title}
        </Text>

        {/* Action Button - Gentler Style */}
        <View style={{ marginTop: 'auto' }}>
          <TouchableOpacity 
            style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 20,
              alignSelf: 'flex-start',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
              Tap to Read
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subtle Corner Accent - Lighter */}
        <View style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 6,
          height: 6,
          backgroundColor: 'rgba(255,255,255,0.4)',
          borderRadius: 3
        }} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// EXACT HB1 StoriesSection Component
const StoriesSection = ({ stories }) => {
  // Only show first 3 stories on home page
  const featuredStories = stories.slice(0, 3);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <View>
          <Text style={{ 
            fontSize: 24,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 4,
            fontFamily: 'System',
            letterSpacing: -0.3
          }}>
            This Can't Be Just Me
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '500' }}>
            Stories that sound too familiar
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={{ color: '#2563eb', fontSize: 14, fontWeight: '600' }}>
            See all stories →
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginHorizontal: -16 }}
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH + 20} // Card width + margin
        contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 20 }}
      >
        {featuredStories.map((story) => (
          <StoryCard 
            key={story.id} 
            story={story}
          />
        ))}
      </ScrollView>
      
      {/* Subtle hint text */}
      <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, textAlign: 'center', fontWeight: '500' }}>
        Stories that hit different • New reflections added regularly
      </Text>
    </View>
  );
};

// EXACT HB1 RealStuffSection Component
const RealStuffSection = ({ cards, onCardPress }) => {
  // Get today's cards (for now, we'll show first 5 cards as daily cards)
  // In a real app, this would be filtered based on date and rotation logic
  const todaysCards = cards.slice(0, 5);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <View>
          <Text style={{ 
            fontSize: 24,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 4,
            fontFamily: 'System',
            letterSpacing: -0.3
          }}>
            The Real Stuff
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '500' }}>
            What you're actually thinking about
          </Text>
        </View>
        <View style={{ backgroundColor: '#374151', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            TODAY
          </Text>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginHorizontal: -16 }}
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={CARD_WIDTH + 20} // Card width + margin
        contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 20 }}
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
      <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, textAlign: 'center', fontWeight: '500' }}>
        Swipe through today's reflections • New cards every morning
      </Text>
    </View>
  );
};

// EXACT HB1 Main Home Screen Component
const HomeScreen = () => {
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [showDailyProgress, setShowDailyProgress] = useState(false);
  const [selectedRealStuffCard, setSelectedRealStuffCard] = useState(null);
  const [showRealStuffModal, setShowRealStuffModal] = useState(false);
  
  // Simplified activities data (matching exact HB1 structure)
  const activities = [
    {
      id: 1,
      type: 'prayer',
      title: 'Prayer Time',
      progress: 11,
      dailyGoal: 15,
      streak: 0,
      color: 'rose',
      icon: 'Heart'
    },
    {
      id: 2,
      type: 'bible',
      title: 'Bible Reading',
      progress: 0,
      dailyGoal: 1,
      streak: 0,
      color: 'blue',
      icon: 'BookOpen'
    },
    {
      id: 3,
      type: 'devotional',
      title: 'Devotional',
      progress: 0,
      dailyGoal: 20,
      streak: 0,
      color: 'amber',
      icon: 'Sun'
    },
    {
      id: 4,
      type: 'evening-prayer',
      title: 'Evening Prayer',
      progress: 0,
      dailyGoal: 10,
      streak: 0,
      color: 'indigo',
      icon: 'Moon'
    }
  ];

  // Simplified Real Stuff data (first few cards from EXACT HB1 data)
  const realStuffCards = [
    {
      id: 1,
      pillar: 'Faith',
      title: 'What if I never feel God again?',
      subtext: 'I keep praying. I keep showing up. But lately… it\'s just been quiet.',
      scripture: 'Be still and know that I am God.',
      scriptureRef: 'Psalm 46:10',
      color: 'indigo',
      actions: ['Reflect With God', 'Ask Adina', 'I Feel This']
    },
    {
      id: 2,
      pillar: 'Love',
      title: 'I\'m scared I\'ll never find real love.',
      subtext: 'Everyone around me seems to have found their person. What if I\'m meant to be alone?',
      scripture: 'I have loved you with an everlasting love.',
      scriptureRef: 'Jeremiah 31:3',
      color: 'rose',
      actions: ['Open My Heart', 'Ask Adina', 'I Feel This']
    },
    {
      id: 3,
      pillar: 'Relationships',
      title: 'They stopped responding to my messages.',
      subtext: 'We used to talk all the time. Now I\'m left wondering what I did wrong.',
      scripture: 'The Lord is close to the brokenhearted…',
      scriptureRef: 'Psalm 34:18',
      color: 'teal',
      actions: ['Find Peace', 'Ask Adina', 'I Feel This']
    }
  ];

  // EXACT HB1 thisCantBeJustMe data (first few stories for home page)
  const thisCantBeJustMe = [
    {
      id: 1,
      emoji: "👻",
      title: "He ghosted me... then sent a Bible verse",
      subtitle: "When spiritual manipulation meets dating",
      color: 'pink',
      readTime: '3 min read',
      category: 'Dating & Love'
    },
    {
      id: 2,
      emoji: "💸",
      title: "I overdrafted — and still tithed like I'm rich",
      subtitle: "When faith meets financial reality",
      color: 'orange',
      readTime: '4 min read',
      category: 'Money & Faith'
    },
    {
      id: 3,
      emoji: "😰",
      title: "Anxiety doesn't even knock anymore. It just walks in.",
      subtitle: "When your mind becomes your enemy",
      color: 'purple',
      readTime: '5 min read',
      category: 'Mental Health'
    }
  ];

  const handleActivitySelect = (activity) => {
    setSelectedActivityType(activity.type);
  };

  const handleRealStuffCardPress = (card) => {
    setSelectedRealStuffCard(card);
    setShowRealStuffModal(true);
  };

  const getCurrentProgress = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.progress : 0;
  };

  const renderHomeContent = () => (
    <>
      {/* Daily Verse */}
      <View style={{ marginTop: 24 }}>
        <DailyVerse />
      </View>

      {/* Daily Progress */}
      <View style={{ marginTop: 32 }}>
        <DailyProgressRow 
          activities={activities}
          onActivitySelect={handleActivitySelect}
          onViewAll={() => setShowDailyProgress(true)}
          getCurrentProgress={getCurrentProgress}
        />
      </View>

      {/* The Real Stuff */}
      <View style={{ marginTop: 32 }}>
        <RealStuffSection 
          cards={realStuffCards} 
          onCardPress={handleRealStuffCardPress}
        />
      </View>

      {/* This Can't Be Just Me */}
      <View style={{ marginTop: 32 }}>
        <StoriesSection stories={thisCantBeJustMe} />
      </View>

      {/* Bottom spacing */}
      <View style={{ marginTop: 32, marginBottom: 24 }} />
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          {renderHomeContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;