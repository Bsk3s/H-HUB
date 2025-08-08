import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Text,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
// Using enhanced TextInput with formatting helpers - 100% mobile native
import { getNoteById, createNote, updateNote, deleteNote } from '../services/notesService';

// Debounce function for auto-save
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function EditorScreen({ 
  noteId, 
  folderId, 
  onBack,
  onDelete 
}) {
  const contentInputRef = useRef(null);

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use a ref to track the creation status to avoid stale closures in debounce
  const isCreatingRef = useRef(false);
  const isNewNote = !noteId;
  const currentNoteId = useRef(noteId);

  useEffect(() => {
    if (isNewNote) {
      setNote({ title: '', content: '' });
      setTitle('');
      setContent('');
      setIsLoading(false);
    } else {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      setIsLoading(true);
      const loadedNote = await getNoteById(noteId);

      if (loadedNote) {
        setNote(loadedNote);
        setTitle(loadedNote.title || '');
        setContent(loadedNote.content || '');
      } else {
        Alert.alert(
          'Note Not Found', 
          'This note could not be loaded. It may have been deleted.', 
          [{ text: 'OK', onPress: () => onBack && onBack() }]
        );
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Error', 'Failed to load the note.');
      onBack && onBack();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async (content) => {
    // Check the ref for the most up-to-date value.
    // This prevents a race condition when creating a new note.
    if (isNewNote && isCreatingRef.current) {
        return; 
    }

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim() || 'Untitled Note',
        content: content,
      };

      if (isNewNote) {
        isCreatingRef.current = true; // Set the lock
        const newNote = await createNote(folderId, noteData);
        currentNoteId.current = newNote.id;
        setNote(newNote);
      } else {
        await updateNote(currentNoteId.current, noteData);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save the note.');
      if (isNewNote) {
        isCreatingRef.current = false; // Release lock on failure
      }
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };
  
  const debouncedSave = useCallback(debounce(handleSave, 1500), [title, content, folderId]);

  const handleContentChange = (text) => {
    setContent(text);
    debouncedSave(text);
  };
  
  const handleTitleChange = (text) => {
    setTitle(text);
    // Also trigger save when title changes
    debouncedSave(content);
  };

  // Text formatting helpers for mobile-native experience
  const insertText = (textToInsert) => {
    const currentText = content;
    const newText = currentText + textToInsert;
    setContent(newText);
    debouncedSave(newText);
  };

  const formatText = (prefix, suffix = '') => {
    const currentText = content;
    const newText = currentText + prefix + suffix;
    setContent(newText);
    debouncedSave(newText);
    // Focus back to text input
    setTimeout(() => contentInputRef.current?.focus(), 100);
  };

  const handleDeleteNote = () => {
    if (!currentNoteId.current) {
      // If it's a new note, just go back
      onBack && onBack();
      return;
    }

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(currentNoteId.current);
              onDelete && onDelete();
              onBack && onBack();
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Feather name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          {isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity onPress={handleDeleteNote} style={styles.headerButton}>
          <Feather name="trash-2" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.editorContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Note title..."
          value={title}
          onChangeText={handleTitleChange}
          placeholderTextColor="#8E8E93"
          fontSize={24}
          fontWeight="bold"
        />

        {/* Enhanced Text Editor - Mobile Native */}
        <TextInput
          ref={contentInputRef}
          style={styles.contentInput}
          placeholder="Start writing your note...

Tip: Use the formatting buttons below to add structure to your notes!"
          value={content}
          onChangeText={handleContentChange}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#8E8E93"
        />

        {/* Mobile-Native Formatting Toolbar */}
        <View style={styles.formatToolbar}>
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => formatText('\n\n# ', '\n')}
          >
            <Text style={styles.formatButtonText}>H1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => formatText('\n\n## ', '\n')}
          >
            <Text style={styles.formatButtonText}>H2</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => formatText('\n• ')}
          >
            <Feather name="list" size={18} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => formatText('\n1. ')}
          >
            <Text style={styles.formatButtonText}>1.</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => formatText('\n\n--- Bible Verse ---\n"', '"\n--- End Verse ---\n')}
          >
            <Feather name="book-open" size={18} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => formatText('\n\n📝 Note: ', '\n')}
          >
            <Feather name="edit-3" size={18} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => formatText('\n\n🙏 Prayer: ', '\n')}
          >
            <Text style={styles.formatButtonText}>🙏</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerButton: {
    padding: 4,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
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
  editorContainer: {
    flex: 1,
  },
  titleInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  contentInput: {
    flex: 1,
    backgroundColor: '#fff',
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    color: '#000',
  },
  formatToolbar: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  formatButton: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    marginVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  formatButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
