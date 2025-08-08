import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuickReplies = ({ activeAI, quickReplies }) => {
  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel="Quick reply suggestions"
      accessibilityRole="menu"
    >
      <View style={styles.repliesContainer}>
        {quickReplies.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.replyButton,
              activeAI === 'adina' 
                ? styles.replyButtonAdina 
                : styles.replyButtonRafa
            ]}
            accessible={true}
            accessibilityLabel={`Quick reply: ${reply}`}
            accessibilityRole="menuitem"
          >
            <Text style={[
              styles.replyText,
              activeAI === 'adina'
                ? styles.replyTextAdina 
                : styles.replyTextRafa
            ]}>
              {reply}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  repliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  replyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 20,
  },
  replyButtonAdina: {
    backgroundColor: '#fdf2f8',
  },
  replyButtonRafa: {
    backgroundColor: '#eff6ff',
  },
  replyText: {
    fontSize: 14,
  },
  replyTextAdina: {
    color: '#dc2626',
  },
  replyTextRafa: {
    color: '#2563eb',
  },
});

export default QuickReplies;
