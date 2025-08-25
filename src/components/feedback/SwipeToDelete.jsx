import React, { useRef, useState } from 'react';
import { View, Text, Animated, PanResponder, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

/**
 * Swipe to delete component with smooth animations
 */
const SwipeToDelete = ({
  children,
  onDelete,
  deleteText = 'Delete',
  disabled = false,
  style = {},
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        if (disabled) return;
        // Haptic feedback when swipe starts
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (disabled || isDeleting) return;
        
        // Only allow swiping left (negative values)
        const newTranslateX = Math.min(0, gestureState.dx);
        translateX.setValue(newTranslateX);

        // Haptic feedback when reaching threshold
        if (Math.abs(newTranslateX) > SWIPE_THRESHOLD) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (disabled || isDeleting) return;

        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          // Trigger delete
          setIsDeleting(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          
          // Animate to full swipe
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            if (onDelete) onDelete();
          });
        } else {
          // Animate back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const deleteOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const deleteScale = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      {/* Delete background */}
      <View style={styles.deleteBackground}>
        <Animated.View
          style={[
            styles.deleteContent,
            {
              opacity: deleteOpacity,
              transform: [{ scale: deleteScale }],
            },
          ]}
        >
          <Feather name="trash-2" size={20} color="#FFFFFF" />
          <Text style={styles.deleteText}>{deleteText}</Text>
        </Animated.View>
      </View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    backgroundColor: '#FFFFFF',
  },
});

export default SwipeToDelete;


