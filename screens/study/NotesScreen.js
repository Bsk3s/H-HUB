import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { getNotesByFolder, deleteNote } from '../../features/study/services/notesService';
import { showErrorAlert } from '../../src/utils/errorHandling';
import { startMeasurement, endMeasurement, measureListPerformance } from '../../src/utils/performanceMonitor';
import NoteItemSkeleton from '../../src/components/loading/NoteItemSkeleton';
import EmptyNotes from '../../src/components/empty/EmptyNotes';

export default function NotesScreen({ route, navigation }) {
  const { folderId, folderName } = route.params;
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (folderId) {
      loadNotes();
    }
  }, [folderId]);

  // 🚀 PERFORMANCE: Add focus listener to refresh notes when returning from editor
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (folderId) {
        console.log('📝 Screen focused, refreshing notes...');
        loadNotes();
      }
    });

    return unsubscribe;
  }, [navigation, folderId]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      startMeasurement('loadNotes');
      console.log('📝 Loading notes for folder:', folderId);
      const noteData = await getNotesByFolder(folderId);
      
      setNotes(noteData || []);
      measureListPerformance('NotesScreen', noteData?.length || 0);
      console.log('✅ Loaded', noteData?.length || 0, 'notes for folder:', folderName);
      endMeasurement('loadNotes', `${noteData?.length || 0} notes`);
    } catch (error) {
      console.error('Error loading notes:', error);
      showErrorAlert(error, 'Failed to Load Notes');
      endMeasurement('loadNotes', 'failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddNote = () => {
    console.log('📝 Adding new note to folder:', folderId);
    navigation.navigate('NoteEditor', { 
      folderId: folderId,
      folderName: folderName 
    });
  };

  const handleEditNote = (note) => {
    console.log('✏️ Editing note:', note.title);
    navigation.navigate('NoteEditor', {
      noteId: note.id,
      folderId: folderId,
      folderName: folderName
    });
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
              setIsLoading(true);
              await deleteNote(noteId);
              console.log('🗑️ Deleted note:', noteTitle);
              
              // Remove from local state and refresh
              setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
              await loadNotes();
            } catch (error) {
              console.error('Error deleting note:', error);
              showErrorAlert(error, 'Failed to Delete Note');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredNotes = notes.filter(note => {
    const title = note.title || 'Untitled Note';
    // Strip HTML tags for search
    const stripHtml = (html) => {
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    };
    const content = typeof note.content === 'string' ? stripHtml(note.content) : '';
    const searchLower = searchQuery.toLowerCase();
    return title.toLowerCase().includes(searchLower) || 
           content.toLowerCase().includes(searchLower);
  });

  const renderEmptyNotes = () => (
    <EmptyNotes
      folderName={folderName}
      onCreateNote={handleAddNote}
    />
  );

  // 🚀 PERFORMANCE: Memoize the HTML stripping function
  const stripHtml = React.useCallback((html) => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }, []);

  // 🚀 PERFORMANCE: Memoized note item renderer
  const renderNoteItem = React.useCallback(({ item }) => {
    const title = item.title || 'Untitled Note';
    const date = new Date(item.updatedAt).toLocaleDateString();
    
    const content = stripHtml(item.content);
    const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;

    return (
      <TouchableOpacity 
        style={styles.noteItem}
        onPress={() => handleEditNote(item)}
      >
        <View style={styles.noteContent}>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>{title}</Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteNote(item.id, title)}
            >
              <Feather name="trash-2" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          <Text style={styles.noteDate}>{date}</Text>
          <Text style={styles.notePreview} numberOfLines={2}>{preview}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [stripHtml]);

  // 🚀 PERFORMANCE: Optimized key extractor
  const keyExtractor = React.useCallback((item) => `note-${item.id}`, []);

  // 🚀 PERFORMANCE: Estimated item size for better virtualization
  const getItemLayout = React.useCallback((data, index) => ({
    length: 85, // Approximate height of each note item
    offset: 85 * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {folderName || 'Notes'}
        </Text>
        <TouchableOpacity onPress={handleAddNote} style={styles.addButton}>
          <Feather name="plus-circle" size={26} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color="#8E8E93" />
          <TextInput
            placeholder="Search notes"
            style={styles.searchInput}
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Notes List */}
      {isLoading ? (
        <NoteItemSkeleton count={8} />
      ) : (
        <View style={styles.listContainer}>
          {filteredNotes.length === 0 && !searchQuery ? (
            renderEmptyNotes()
          ) : (
            <FlatList
              data={filteredNotes}
              keyExtractor={keyExtractor}
              renderItem={renderNoteItem}
              getItemLayout={getItemLayout}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              // 🚀 PERFORMANCE: Virtualization optimizations
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              initialNumToRender={15}
              windowSize={10}
              updateCellsBatchingPeriod={100}
              // 🚀 PERFORMANCE: Memory optimizations
              scrollEventThrottle={16}
              ListEmptyComponent={
                searchQuery ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No notes match your search</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      )}
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
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  noteItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  noteContent: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
