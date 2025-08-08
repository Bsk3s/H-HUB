import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';

const VerseItem = ({
  verse,
  isHighlighted = false,
  isSelected = false,
  onPress,
  onLongPress,
  isFirstInParagraph = false,
}) => {
  return (
    <Pressable
      onPress={() => onPress && onPress(verse)}
      onLongPress={() => onLongPress && onLongPress(verse)}
      style={({ pressed }) => [
        styles.container,
        isFirstInParagraph && styles.firstInParagraph,
        isHighlighted && styles.highlighted,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.verseContent}>
        <Text style={styles.verseNumber}>{verse.verseNumber || verse.number}</Text>
        <Text style={[
          styles.verseText,
          isHighlighted && styles.highlightedText,
          isSelected && styles.selectedText,
        ]}>
          {verse.text}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 1,
  },
  firstInParagraph: {
    marginTop: 12,
  },
  highlighted: {
    backgroundColor: '#FEF3C7',
  },
  selected: {
    backgroundColor: '#DBEAFE',
  },
  pressed: {
    backgroundColor: '#F3F4F6',
  },
  verseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
    marginTop: 2,
    minWidth: 24,
    textAlign: 'right',
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  highlightedText: {
    color: '#92400E',
  },
  selectedText: {
    color: '#1E40AF',
  },
});

export default VerseItem;
