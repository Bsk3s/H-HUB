import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Animated, PanResponder, SafeAreaView, ScrollView, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import { X, Play, Clock, Star, Pause, Check, XCircle, BookOpen, ChevronDown, Heart, Sun, Moon, Plus } from 'lucide-react-native';

const ICONS = {
  Heart,
  BookOpen,
  Sun,
  Moon,
  Star, // Fallback
};

// Bible books structure
const BIBLE_BOOKS = {
  'Old Testament': {
    'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
    'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  },
  'New Testament': {
    'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  }
};

const ActivityModal = ({ activity, onClose, onSetLiveDraft }) => {
  const [selectedTestament, setSelectedTestament] = useState('New Testament');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [sliderValue, setSliderValue] = useState(activity?.progress || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showTimerControls, setShowTimerControls] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOverallProgress, setShowOverallProgress] = useState(false);
  const [booksExpanded, setBooksExpanded] = useState(true);
  const activityIdRef = useRef(activity.id);
  const timerIntervalRef = useRef(null);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderGrant: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          closeModal();
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 8 }).start();
        }
      },
    })
  ).current;
  
  useEffect(() => {
    if (activity && activity.id !== activityIdRef.current) {
        activityIdRef.current = activity.id;
    }
    setSliderValue(activity.progress || 0);
  }, [activity]);

  // Animate modal entrance
  useEffect(() => {
    slideAnim.setValue(300);
    backdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, backdropOpacity]);

  // Timer functionality
  useEffect(() => {
    if (!isTimerRunning) return;

    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const updateDraft = useCallback((draftUpdate) => {
    if (!activity?.id) return;
    console.log('🔄 updateDraft called with:', draftUpdate);
    onSetLiveDraft(prev => ({
      ...prev,
      [activity.id]: {
        ...prev[activity.id],
        ...draftUpdate,
        initialProgress: prev[activity.id]?.initialProgress ?? activity.progress,
      }
    }));
  }, [activity?.id, activity?.progress, onSetLiveDraft]);
  
  const handleSliderChange = (value) => {
    const dailyGoal = activity.dailyGoal || 20;
    const cappedValue = Math.min(Math.round(value), dailyGoal);
    setSliderValue(cappedValue);
    updateDraft({ progress: cappedValue });
  }

  const handleSliderComplete = (value) => {
    // Final value is already set in handleSliderChange
    // No need to call updateDraft again
  };

  const handleStartTimer = () => {
    setShowTimerControls(true);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const handleCancelTimer = () => {
    setShowTimerControls(false);
    setIsTimerRunning(false);
  };
  
  const handleCompleteTimer = () => {
    setIsTimerRunning(false);
    const minutes = Math.floor(timerSeconds / 60);
    if (minutes > 0) {
      const newProgress = sliderValue + minutes;
      setSliderValue(newProgress);
      updateDraft({ progress: newProgress });
    }
    setShowTimerControls(false);
  };

  const handleQuickAdd = (minutes) => {
    const dailyGoal = activity.dailyGoal || 20;
    const newProgress = Math.min(sliderValue + minutes, dailyGoal);
    setSliderValue(newProgress);
    updateDraft({ progress: newProgress });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const closeModal = () => {
    // Run exit animation before closing
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose(); // This is passed from the parent
    });
  };

  // Format timer display
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activity) return null;

  const Icon = ICONS[activity.icon] || ICONS.Star;

  // Get the appropriate color for the activity
  const getActivityColor = (colorName) => {
    // Map legacy color names to new color names
    const colorNameMap = {
      'red': 'rose',
      'orange': 'amber',
      'purple': 'indigo'
    };

    // Convert legacy color names to new color names
    const normalizedColorName = colorNameMap[colorName] || colorName;
    
    const colorMap = {
      rose: '#f43f5e',
      blue: '#60a5fa',
      amber: '#f59e0b',
      indigo: '#6366f1'
    };

    return colorMap[normalizedColorName] || colorMap.blue;
  };

  const activityColor = getActivityColor(activity.color);

  // Get background color for buttons and icons
  const getActivityBgColor = (colorName) => {
    // Map legacy color names to new color names
    const colorNameMap = {
      'red': 'rose',
      'orange': 'amber',
      'purple': 'indigo'
    };

    // Convert legacy color names to new color names
    const normalizedColorName = colorNameMap[colorName] || colorName;
    
    const colorMap = {
      rose: '#fff1f2',
      blue: '#dbeafe',
      amber: '#fffbeb',
      indigo: '#eef2ff'
    };

    return colorMap[normalizedColorName] || colorMap.blue;
  };

  const activityBgColor = getActivityBgColor(activity.color);

  const isToday = (someDate) => {
    const today = new Date();
    const d = new Date(someDate);
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  }

  const handleChapterPress = async (book, chapter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const dateKey = new Date().toISOString();
    const chapterId = `${book}-${chapter}`;

    console.log('📖 Chapter pressed:', book, chapter);
    console.log('📖 Current activity read_chapters:', activity.read_chapters);

    // The `read_chapters` object is now the single source of truth for bible reading.
    const currentReadChapters = activity.read_chapters || {};
    const newReadChapters = { ...currentReadChapters };

    if (!newReadChapters[book]) {
      newReadChapters[book] = [];
    }

    const chapterIndex = newReadChapters[book].findIndex(item => item.chapter === chapter);

    if (chapterIndex > -1) {
      // Chapter already read, so un-log it
      newReadChapters[book].splice(chapterIndex, 1);
    } else {
      // Log the new chapter
      newReadChapters[book].push({ chapter: chapter, date: dateKey });
    }

    console.log('📖 New read_chapters:', newReadChapters);

    // Update the draft state
    updateDraft({
      read_chapters: newReadChapters,
      last_read_book: book,
      last_read_chapter: chapter
    });

    // Show confirmation toast
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  const calculateOverallProgress = () => {
    if (!activity.read_chapters) return { totalChapters: 0, readChaptersCount: 0, percentage: 0 };

    let totalChapters = 0;
    let readChaptersCount = 0;
    
    for (const testament in BIBLE_BOOKS) {
        for (const book in BIBLE_BOOKS[testament]) {
            totalChapters += BIBLE_BOOKS[testament][book];
            if (activity.read_chapters[book]) {
                readChaptersCount += activity.read_chapters[book].length;
            }
        }
    }
    
    return {
      totalChapters,
        readChaptersCount,
        percentage: totalChapters > 0 ? Math.round((readChaptersCount / totalChapters) * 100) : 0,
    };
  };

  const renderOverallProgress = () => {
    const progress = calculateOverallProgress();
    
    return (
      <View className="p-6 bg-gray-50 rounded-lg">
        <View>
          <Text className="text-base font-medium text-gray-800 mb-2">Overall Bible Progress</Text>
          <Text className="text-sm text-gray-600">
            {progress.readChaptersCount} of {progress.totalChapters} chapters read ({progress.percentage}%)
          </Text>
        </View>
        <View className="w-full h-2 bg-gray-200 rounded-full mt-2">
          <View 
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress.percentage}%` }}
          />
        </View>
      </View>
    );
  };

  const todaysChaptersRead = () => {
    if (!activity.read_chapters || typeof activity.read_chapters !== 'object') return 0;
    
    let count = 0;
    Object.values(activity.read_chapters).forEach(chapters => {
      if (Array.isArray(chapters)) {
        chapters.forEach(chapterLog => {
            // Check if the log is an object and has a date
            if(chapterLog && typeof chapterLog === 'object' && chapterLog.date && isToday(chapterLog.date)) {
                count++;
            }
        })
      }
    });
    return count;
    };

  // UI for Bible Reading activities
  const renderBibleReadingUI = () => {
    const dailyGoal = activity.dailyGoal || 1;
    const todayProgress = todaysChaptersRead();
    const hasReadToday = todayProgress > 0;
    const readChapters = activity.read_chapters || {};

    const getGoalMessage = () => {
      if (todayProgress === 0) {
        return `Your goal is ${dailyGoal} ${dailyGoal === 1 ? 'chapter' : 'chapters'}. Let's get started!`;
      } else if (todayProgress < dailyGoal) {
        return `Read ${dailyGoal - todayProgress} more ${dailyGoal - todayProgress === 1 ? 'chapter' : 'chapters'} to reach your goal.`;
      } else if (todayProgress === dailyGoal) {
        return "Daily goal complete! Great job! ✨";
      } else {
        return `Amazing! You've read ${todayProgress - dailyGoal} extra ${todayProgress - dailyGoal === 1 ? 'chapter' : 'chapters'} today! 👍`;
      }
    };

    return (
      <View className="px-6">
        {/* Confirmation Toast */}
        {showConfirmation && (
          <View className="absolute top-0 left-0 right-0 z-50 mx-6">
            <View className="bg-green-100 rounded-xl p-3 flex-row items-center justify-center">
              <Check size={16} color="#22C55E" />
              <Text className="ml-2 text-green-700 font-medium">
                {selectedBook} {selectedChapter} marked as read!
              </Text>
            </View>
          </View>
        )}

        {/* Daily Goal Section - Redesigned */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-600 mb-2">Today's Reading</Text>
          <View className="bg-white border border-gray-100 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-gray-800">Daily Goal</Text>
              <Text className={`text-sm font-semibold ${hasReadToday ? 'text-green-600' : 'text-gray-600'}`}>
                {todayProgress} of {dailyGoal} {dailyGoal === 1 ? 'chapter' : 'chapters'}
              </Text>
            </View>
            <View className="w-full h-2 bg-gray-200 rounded-full mb-3">
              <View 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min(100, (todayProgress / (dailyGoal || 1)) * 100)}%` }}
              />
            </View>
            <Text className="text-sm text-gray-600 text-center">{getGoalMessage()}</Text>
          </View>
        </View>

        {/* Book Selection - Now with collapsible section */}
        <View className="mb-6">
          <TouchableOpacity 
            className="flex-row items-center justify-between mb-2"
            onPress={() => setBooksExpanded(!booksExpanded)}
          >
            <Text className="text-sm font-medium text-gray-600">Select Book</Text>
            <ChevronDown 
              size={16} 
              color="#6B7280" 
              style={{ 
                transform: [{ rotate: booksExpanded ? '180deg' : '0deg' }]
              }} 
            />
          </TouchableOpacity>
          
          {booksExpanded && (
            <View className="space-y-2">
              {/* Testament Selector */}
              <View className="flex-row gap-2 mb-3">
                {['Old Testament', 'New Testament'].map((testament) => (
                  <TouchableOpacity
                    key={testament}
                    className={`py-2 px-4 rounded-full ${
                      selectedTestament === testament ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                    onPress={() => setSelectedTestament(testament)}
                  >
                    <Text
                      className={`text-sm ${
                        selectedTestament === testament ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {testament}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Books Grid - Now in a scrollable container with fixed height */}
              <View className="max-h-48">
                <ScrollView>
                  <View className="flex-row flex-wrap gap-2">
                    {Object.entries(BIBLE_BOOKS[selectedTestament]).map(([book, chapters]) => {
                      const isRead = readChapters[book]?.length === chapters;
                      const isPartiallyRead = readChapters[book]?.length > 0;
                      const isLastRead = activity.last_read_book === book;
                      
                      return (
                        <TouchableOpacity
                          key={book}
                          className={`py-2 px-4 rounded-lg ${
                            isLastRead ? 'bg-blue-100' :
                            isRead ? 'bg-green-100' : 
                            isPartiallyRead ? 'bg-green-50' :
                            'bg-gray-50'
                          }`}
                          onPress={() => {
                            setSelectedBook(book);
                            // Auto-scroll to show chapters when a book is selected
                            if (!selectedBook) {
                              setTimeout(() => setBooksExpanded(false), 300);
                            }
                          }}
                        >
                          <Text
                            className={`text-sm ${
                              isLastRead ? 'text-blue-700' :
                              isRead ? 'text-green-700' :
                              isPartiallyRead ? 'text-green-600' :
                              'text-gray-700'
                            }`}
                          >
                            {book}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
        </View>

        {/* Selected Book Details */}
        {selectedBook && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-2">
              {selectedBook} 
              {readChapters[selectedBook]?.length > 0 && 
                ` (${readChapters[selectedBook].length}/${BIBLE_BOOKS[selectedTestament][selectedBook]} chapters)`
              }
            </Text>
            <View className="bg-white border border-gray-100 rounded-xl p-4">
              <View className="flex-row flex-wrap gap-2">
                {[...Array(BIBLE_BOOKS[selectedTestament][selectedBook])].map((_, i) => {
                  const chapterNum = i + 1;
                  const isRead = readChapters[selectedBook]?.some(c => c.chapter === chapterNum);
                  const isLastRead = activity.last_read_book === selectedBook && 
                                   activity.last_read_chapter === chapterNum;
                  
                  return (
                    <View
                      key={chapterNum}
                      className={`w-10 h-10 rounded-lg items-center justify-center ${
                        isRead ? 'bg-blue-100' : 
                        'bg-gray-50'
                      }`}
                    >
                      <TouchableOpacity
                        className="w-full h-full items-center justify-center"
                        onPress={() => handleChapterPress(selectedBook, chapterNum)}
                      >
                        {isRead ? (
                          <View className="items-center justify-center">
                            <Text className="text-sm text-blue-700">
                              {chapterNum}
                            </Text>
                            <Check size={12} color="#1D4ED8" />
                          </View>
                        ) : (
                          <Text className="text-sm text-gray-700">
                            {chapterNum}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Optional Overall Progress */}
        <TouchableOpacity 
          className="mb-6 flex-row items-center justify-between"
          onPress={() => setShowOverallProgress(!showOverallProgress)}
        >
          <Text className="text-sm font-medium text-gray-600">View Overall Progress</Text>
          <ChevronDown 
            size={16} 
            color="#6B7280" 
            style={{ 
              transform: [{ rotate: showOverallProgress ? '180deg' : '0deg' }]
            }} 
          />
        </TouchableOpacity>

        {/* Show overall progress if expanded */}
        {showOverallProgress && renderOverallProgress()}
      </View>
    );
  };

  const renderGenericActivityUI = () => {
    const activityColor = getActivityColor(activity.color);
    const activityBgColor = getActivityBgColor(activity.color);

    return (
      <ScrollView>
        {showTimerControls && (
          <View className="px-6 mb-6">
            <Text className="text-4xl font-semibold text-center mb-4">{formatTime(timerSeconds)}</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity className="flex-1 py-3 items-center justify-center rounded-xl mr-2 bg-red-100" onPress={handleCancelTimer}>
                <View className="flex-row items-center">
                  <XCircle size={18} color="#EF4444" />
                  <Text className="ml-2 text-sm font-medium text-red-600">Cancel</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 items-center justify-center rounded-xl ml-2 bg-green-100" onPress={handleCompleteTimer}>
                <View className="flex-row items-center">
                  <Check size={18} color="#22C55E" />
                  <Text className="ml-2 text-sm font-medium text-green-600">Complete</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {!showTimerControls && (
          <View className="px-6 flex-row gap-4 mb-6">
            <TouchableOpacity 
              className="flex-1 py-6 items-center justify-center rounded-xl"
              style={{ backgroundColor: activityBgColor }}
              onPress={handleStartTimer}
            >
              <View className="items-center">
                <Play size={24} color={activityColor} />
                <Text className="mt-2 text-sm font-medium" style={{color: activityColor}}>
                  Start Timer
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 py-6 items-center justify-center rounded-xl"
              style={{ backgroundColor: activityBgColor }}
              onPress={() => setShowLogTimeModal(true)}
            >
              <View className="items-center">
                <Clock size={24} color={activityColor} />
                <Text className="mt-2 text-sm font-medium" style={{color: activityColor}}>Log Time</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Quick Add section */}
        <View className="px-6 mb-6">
          <Text className="text-sm font-medium text-gray-600 mb-3">Quick Add</Text>
          <View className="flex-row justify-around">
            {[5, 10, 15, 20].map((time) => (
              <TouchableOpacity
                key={time}
                className="py-2 px-4 rounded-lg"
                style={{ backgroundColor: activityBgColor }}
                onPress={() => handleQuickAdd(time)}
              >
                <Text className="text-sm" style={{ color: activityColor }}>{time} mins</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Progress slider */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-800">Progress</Text>
            <Text className="text-sm text-gray-600">{Math.round(sliderValue)} / {activity.dailyGoal} mins</Text>
          </View>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderComplete}
            minimumValue={0}
            maximumValue={activity.dailyGoal || 20}
            step={1}
            thumbTintColor={activityColor}
            minimumTrackTintColor={activityColor}
            maximumTrackTintColor="#E5E7EB"
          />
        </View>
      </ScrollView>
    );
  };

  const LogTimeModal = () => {
    const [minutes, setMinutes] = useState('');

    const handleLog = () => {
      if (!minutes || isNaN(parseInt(minutes, 10)) || parseInt(minutes, 10) <= 0) return;

      const newProgress = sliderValue + parseInt(minutes, 10);
      setSliderValue(newProgress);
      updateDraft({ progress: newProgress });
      setShowLogTimeModal(false);
      setMinutes('');
    };

    return (
      <Modal
        transparent={true}
        visible={showLogTimeModal}
        animationType="fade"
        onRequestClose={() => setShowLogTimeModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center items-center bg-black/50"
        >
          <View className="bg-white rounded-2xl p-6 w-11/12">
            <Text className="text-lg font-bold text-gray-800 mb-4">Log Time</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-lg mb-4"
              placeholder="Enter minutes"
              keyboardType="number-pad"
              value={minutes}
              onChangeText={setMinutes}
              autoFocus={true}
            />
            <View className="flex-row gap-2">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                onPress={() => setShowLogTimeModal(false)}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 py-3 rounded-lg items-center ${!minutes || parseInt(minutes, 10) <= 0 ? 'bg-blue-300' : 'bg-blue-500'}`}
                onPress={handleLog}
                disabled={!minutes || parseInt(minutes, 10) <= 0}
              >
                <Text className="text-white font-semibold">Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={!!activity}
      animationType="none"
      onRequestClose={closeModal}
    >
      <Animated.View 
        className="flex-1 bg-black/50" 
        style={{ opacity: backdropOpacity }}
      >
        <Pressable 
          className="flex-1" 
          onPress={closeModal}
        />
        
        <Animated.View 
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
          style={{ 
            transform: [{ translateY: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <SafeAreaView className="flex-1">
            {/* Drag handle - now with pan responder */}
            <View {...panResponder.panHandlers} className="w-full py-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
            </View>
            
            {/* Header with activity title */}
            <View className="px-6 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View 
                  className="mr-3 p-2 rounded-full" 
                  style={{ backgroundColor: getActivityBgColor(activity.color) }}
                >
                  <Icon size={20} color={getActivityColor(activity.color)} />
                </View>
                <Text className="text-lg font-semibold text-gray-800">{activity.title}</Text>
              </View>
              <TouchableOpacity onPress={closeModal} className="p-1">
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            {/* Streak info */}
            <View className="px-6 mb-4">
              <Text className="text-sm text-gray-500">{activity.streak || 0} day streak</Text>
            </View>
            
            {/* Main content */}
            {activity.type === 'bible' ? (
              <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
                bounces={true}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {renderBibleReadingUI()}
              </ScrollView>
            ) : (
              renderGenericActivityUI()
            )}
            
            {/* Stats */}
            <View className="px-6 mb-8">
              <View className="flex-row items-center mb-3">
                <Star size={16} color={getActivityColor(activity.color)} className="mr-2" />
                <Text className="text-sm font-medium text-gray-800">Progress</Text>
              </View>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">Current Streak</Text>
                  <Text className="font-medium text-gray-800">{activity.streak || 0} days</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">Best Streak</Text>
                  <Text className="font-medium text-gray-800">{activity.bestStreak || 0} days</Text>
                </View>
              </View>
            </View>
            <LogTimeModal />
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ActivityModal; 