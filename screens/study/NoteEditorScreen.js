import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { createNote, updateNote, getNoteById } from '../../features/study/services/notesService';
import LoadingOverlay from '../../src/components/loading/LoadingOverlay';
import { useFeedbackContext } from '../../src/components/feedback/FeedbackProvider';

// Simple debounce function
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function NoteEditorScreen({ route, navigation }) {
  const { noteId, folderId, folderName } = route.params;
  const richText = useRef(null);
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useFeedbackContext();

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Use a ref to track the creation status to avoid stale closures in debounce
  const isCreatingRef = useRef(false);
  const isNewNote = !noteId;

  useEffect(() => {
    if (isNewNote) {
      setNote({ title: '', content: '' });
      setTitle('');
      setIsLoading(false);
    } else {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      setIsLoading(true);
      console.log('📖 Loading note:', noteId);
      const loadedNote = await getNoteById(noteId);

      if (loadedNote) {
        setNote(loadedNote);
        setTitle(loadedNote.title || '');
        richText.current?.setContentHTML(loadedNote.content || '');
        console.log('✅ Note loaded successfully:', loadedNote.title);
      } else {
        console.warn('⚠️ Note not found:', noteId);
        Alert.alert('Note Not Found', 'This note could not be loaded. It may have been deleted.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Error', 'Failed to load the note.');
      navigation.goBack();
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
        content,
      };

      if (isNewNote) {
        isCreatingRef.current = true; // Set the lock
        console.log('💾 Creating new note:', noteData);
        const newNote = await createNote(folderId, noteData);
        console.log('✅ Note created successfully:', newNote.id);

        showSuccess('Note created successfully!');

        // Navigate back after successful creation
        navigation.goBack();
      } else {
        console.log('💾 Updating note:', noteId, noteData);
        await updateNote(noteId, noteData);
        console.log('✅ Note updated successfully');

        showSuccess('Note saved!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error saving note:', error);
      showError('Failed to save note. Please try again.');
      if (isNewNote) {
        isCreatingRef.current = false; // Release lock on failure
      }
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  // Debounced save function
  const debouncedSave = useCallback(debounce(handleSave, 1500), [title, noteId, folderId]);

  const handleContentChange = (html) => {
    debouncedSave(html);
  };

  const handleTitleChange = (text) => {
    setTitle(text);
    richText.current?.getContentHtml().then(content => {
      debouncedSave(content);
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!isNewNote) {
                // TODO: Implement actual note deletion
                // await deleteNote(noteId);
                console.log('🗑️ Deleting note:', noteId);
              }
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note.');
            }
          }
        }
      ]
    );
  };

  const handleDone = () => {
    if (isNewNote && title.trim()) {
      // Save new note before leaving
      richText.current?.getContentHtml().then(content => {
        handleSave(content);
      });
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: 8, paddingBottom: 12 }]}>
          <View style={styles.headerLeft}>
            {isSaving ?
              <ActivityIndicator size="small" color="#999" /> :
              <Text style={styles.statusText}>
                {isNewNote ? 'New Note' : 'Saved'}
              </Text>
            }
          </View>
          <View style={styles.headerRight}>
            {!isNewNote && (
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Feather name="trash-2" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDone} style={[styles.headerButton, styles.doneButton]}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor="#ccc"
              value={title}
              onChangeText={handleTitleChange}
              autoFocus={isNewNote}
              multiline={false}
            />
            <View style={styles.editorContainer}>
              <RichEditor
                ref={richText}
                style={styles.editor}
                initialContentHTML={note?.content || ''}
                onChange={handleContentChange}
                placeholder="Start writing your note here..."
                editorStyle={{
                  contentCSSText: `
                    font-size: 16px; 
                    color: #1a1a1a; 
                    line-height: 1.6;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 16px;
                    background-color: #ffffff;
                    min-height: 300px;
                  `,
                  placeholderColor: '#9CA3AF',
                }}
              />
            </View>
          </ScrollView>
        </View>

        {/* Rich Text Toolbar */}
        <RichToolbar
          editor={richText}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.undo,
            actions.redo,
          ]}
          iconTint="#6B7280"
          selectedIconTint="#007AFF"
          selectedButtonStyle={styles.selectedToolbarButton}
          unselectedButtonStyle={styles.unselectedToolbarButton}
          style={styles.toolbar}
          flatContainerStyle={styles.toolbarContainer}
        />
        <View style={{ height: insets.bottom, backgroundColor: styles.toolbar.backgroundColor }} />
      </KeyboardAvoidingView>

      {/* Loading Overlay for saving operations */}
      <LoadingOverlay
        visible={isSaving}
        message={isNewNote ? "Creating note..." : "Saving changes..."}
        description="Your note is being saved"
        transparent={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 16,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statusText: {
    color: '#999',
    fontSize: 14,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: '700',
    paddingVertical: 20,
    paddingHorizontal: 16,
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  editor: {
    flex: 1,
    minHeight: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  editorContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  toolbar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toolbarContainer: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  selectedToolbarButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  unselectedToolbarButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginHorizontal: 2,
  },
});
