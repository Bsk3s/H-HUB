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
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    padding: 4,
    width: 192,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
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
