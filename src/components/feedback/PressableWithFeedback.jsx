import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Enhanced Pressable with scale animation and haptic feedback
 */
const PressableWithFeedback = ({
  children,
  onPress,
  onLongPress,
  style = {},
  scaleValue = 0.95,
  hapticType = 'light', // 'light', 'medium', 'heavy', 'selection', 'none'
  disabled = false,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;

    // Haptic feedback
    if (hapticType !== 'none') {
      switch (hapticType) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selection':
          Haptics.selectionAsync();
          break;
      }
    }

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    // Scale back to normal
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      disabled={disabled}
      style={[styles.pressable, disabled && styles.disabled]}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    // Base pressable styles
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PressableWithFeedback;


