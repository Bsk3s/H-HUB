import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AIToggle = ({ activeAI, setActiveAI }) => {
  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel="Select AI assistant"
    >
      <TouchableOpacity
        onPress={() => setActiveAI('adina')}
        style={[
          styles.button,
          activeAI === 'adina' && styles.activeButton
        ]}
        accessible={true}
        accessibilityLabel="Adina assistant"
        accessibilityRole="radio"
        accessibilityState={{ checked: activeAI === 'adina' }}
      >
        <Text style={[
          styles.buttonText,
          activeAI === 'adina' 
            ? styles.activeTextAdina 
            : styles.inactiveText
        ]}>
          Adina
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setActiveAI('rafa')}
        style={[
          styles.button,
          activeAI === 'rafa' && styles.activeButton
        ]}
        accessible={true}
        accessibilityLabel="Rafa assistant"
        accessibilityRole="radio"
        accessibilityState={{ checked: activeAI === 'rafa' }}
      >
        <Text style={[
          styles.buttonText,
          activeAI === 'rafa' 
            ? styles.activeTextRafa 
            : styles.inactiveText
        ]}>
          Rafa
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 28,
    padding: 6,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
  },
  activeButton: {
    backgroundColor: '#f8fafc', // Match page tone instead of pure white
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTextAdina: {
    color: '#ec4899',
  },
  activeTextRafa: {
    color: '#3b82f6',
  },
  inactiveText: {
    color: '#6b7280',
  },
});

export default AIToggle;
