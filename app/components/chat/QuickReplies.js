import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuickReplies = ({ activeAI, quickReplies, onQuickReply }) => {
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
            onPress={() => onQuickReply && onQuickReply(reply)}
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
    paddingHorizontal: 12,  // Smaller
    paddingVertical: 8,     // Smaller  
    margin: 4,              // Tighter
    borderRadius: 18,       // Smaller
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },  // Lighter shadow
    shadowOpacity: 0.05,    // Lighter
    shadowRadius: 2,        // Smaller
    elevation: 2,           // Lower
  },
  replyButtonAdina: {
    backgroundColor: '#f8fafc', // Match page tone
    borderWidth: 1,
    borderColor: '#f9a8d4',
  },
  replyButtonRafa: {
    backgroundColor: '#f8fafc', // Match page tone  
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  replyText: {
    fontSize: 13,    // Smaller text
    fontWeight: '500', // Lighter weight
    textAlign: 'center',
  },
  replyTextAdina: {
    color: '#ec4899',
  },
  replyTextRafa: {
    color: '#3b82f6',
  },
});

export default QuickReplies;
