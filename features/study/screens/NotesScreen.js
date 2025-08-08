import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import NoteList from '../components/NoteList';

export default function NotesScreen({ 
  folderId, 
  folderName, 
  onBack, 
  onNavigateToEditor 
}) {
  
  const handleAddNote = () => {
    onNavigateToEditor && onNavigateToEditor(null, folderId); // null noteId = new note
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {folderName || 'Notes'}
        </Text>
        <TouchableOpacity onPress={handleAddNote} style={styles.addButton}>
          <Feather name="plus-circle" size={26} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {/* Notes List */}
      <NoteList 
        folderId={folderId} 
        folderName={folderName}
        onNavigateToEditor={onNavigateToEditor}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  addButton: {
    padding: 4,
  },
});
