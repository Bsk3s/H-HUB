import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmptyState from './EmptyState';

/**
 * Empty state for when a folder has no notes
 */
const EmptyNotes = ({ folderName, onCreateNote }) => {
  // Custom illustration for notes
  const NotesIllustration = () => (
    <View style={styles.illustration}>
      <View style={styles.notesStack}>
        <View style={[styles.notePage, styles.note3]} />
        <View style={[styles.notePage, styles.note2]} />
        <View style={[styles.notePage, styles.note1]}>
          <View style={styles.noteLine} />
          <View style={styles.noteLine} />
          <View style={[styles.noteLine, styles.shortLine]} />
        </View>
      </View>
      <Text style={styles.pen}>✏️</Text>
    </View>
  );

  return (
    <EmptyState
      imageComponent={<NotesIllustration />}
      title={`No notes in ${folderName || 'this folder'}`}
      description="Capture your thoughts, sermon notes, and spiritual insights. Your notes are automatically saved as you type."
      buttonText="Create First Note"
      onButtonPress={onCreateNote}
    />
  );
};

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    marginBottom: 24,
  },
  notesStack: {
    position: 'relative',
    width: 100,
    height: 120,
    marginBottom: 16,
  },
  notePage: {
    position: 'absolute',
    width: 80,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  note1: {
    bottom: 0,
    left: 10,
    zIndex: 3,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  note2: {
    bottom: 3,
    left: 5,
    zIndex: 2,
    backgroundColor: '#F9FAFB',
  },
  note3: {
    bottom: 6,
    left: 0,
    zIndex: 1,
    backgroundColor: '#F3F4F6',
  },
  noteLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 6,
    borderRadius: 1,
  },
  shortLine: {
    width: '60%',
  },
  pen: {
    fontSize: 24,
    transform: [{ rotate: '45deg' }],
    marginLeft: 40,
    marginTop: -20,
  },
});

export default EmptyNotes;


