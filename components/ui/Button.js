import React, { useState } from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function Button({ 
  onPress, 
  title = "Continue",
  disabled = false,
  style 
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable 
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.button,
        isPressed ? styles.buttonPressed : styles.buttonNormal,
        disabled && styles.buttonDisabled,
        style
      ]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {title}
      </Text>
      <View style={styles.iconContainer}>
        <ChevronRight 
          size={24} 
          color={disabled ? '#9CA3AF' : 'white'}
          strokeWidth={3}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '90%',
    position: 'relative',
  },
  buttonNormal: {
    backgroundColor: '#3A3A3A',
  },
  buttonPressed: {
    backgroundColor: '#2A2A2A',
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  textDisabled: {
    color: '#9CA3AF',
  },
  iconContainer: {
    position: 'absolute',
    right: 24,
  },
});


