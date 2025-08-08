import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getNotesByFolder, deleteNote } from '../services/notesService';

const NoteList = ({ folderId, onNavigateToEditor, folderName }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (folderId) {
      loadNotes();
    }
  }, [folderId]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const noteData = await getNotesByFolder(folderId);
      setNotes(noteData);
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = (noteId, noteTitle) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${noteTitle || 'Untitled Note'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              await loadNotes(); // Refresh the list
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          }
        }
      ]
    );
  };

  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNote = ({ item }) => {
    const preview = item.content?.replace(/<[^>]*>/g, '').slice(0, 100) || 'No content';
    const date = new Date(item.updated_at).toLocaleDateString();
    
    return (
      <TouchableOpacity 
        style={styles.noteItem}
        onPress={() => onNavigateToEditor && onNavigateToEditor(item.id, folderId)}
      >
        <View style={styles.noteContent}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.title || 'Untitled Note'}
          </Text>
          <Text style={styles.notePreview} numberOfLines={2}>
            {preview}
          </Text>
          <Text style={styles.noteDate}>{date}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteNote(item.id, item.title)}
        >
          <Feather name="trash-2" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyNotes = () => (
    <View style={styles.emptyContainer}>
      <Feather name="file-text" size={50} color="#8E8E93" />
      <Text style={styles.emptyText}>No notes in this folder</Text>
      <Text style={styles.emptySubtext}>Tap + to create your first note</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyNotes}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default NoteList;
