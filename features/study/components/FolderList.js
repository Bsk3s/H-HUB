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
import { getFolders, createFolder, deleteFolder } from '../services/notesService';

const FolderList = ({ onNavigateToFolder }) => {
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const folderData = await getFolders();
      setFolders(folderData);
    } catch (error) {
      console.error('Error loading folders:', error);
      Alert.alert('Error', 'Failed to load folders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    try {
      setIsLoading(true);
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      await loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', 'Failed to create folder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = (folderId, folderName) => {
    Alert.alert(
      'Delete Folder',
      `Are you sure you want to delete "${folderName}"? All notes in this folder will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteFolder(folderId);
              await loadFolders();
            } catch (error) {
              console.error('Error deleting folder:', error);
              Alert.alert('Error', 'Failed to delete folder. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFolder = ({ item }) => (
    <TouchableOpacity 
      style={styles.folderItem}
      onPress={() => onNavigateToFolder && onNavigateToFolder(item.id, item.name)}
    >
      <View style={styles.folderInfo}>
        <View style={styles.folderHeader}>
          <Text style={styles.folderEmoji}>📁</Text>
          <Text style={styles.folderName}>{item.name}</Text>
        </View>
        <Text style={styles.noteCount}>{item.note_count || 0} notes</Text>
      </View>
      <View style={styles.folderActions}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteFolder(item.id, item.name)}
        >
          <Feather name="trash-2" size={16} color="#FF3B30" />
        </TouchableOpacity>
        <Feather name="chevron-right" size={18} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyFolders = () => (
    <View style={styles.emptyState}>
      <Feather name="folder" size={50} color="#C7C7CC" />
      <Text style={styles.emptyStateText}>No folders found</Text>
      <Text style={styles.emptyStateSubtext}>
        Create your first folder to organize your notes
      </Text>
    </View>
  );

  if (isLoading && folders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading folders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search folders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      {/* Create New Folder Section */}
      <View style={styles.createSection}>
        {!isCreatingFolder ? (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setIsCreatingFolder(true)}
          >
            <Feather name="plus" size={18} color="#007AFF" />
            <Text style={styles.createButtonText}>Create New Folder</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.createForm}>
            <TextInput
              style={styles.createInput}
              placeholder="Folder name..."
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
              placeholderTextColor="#8E8E93"
            />
            <View style={styles.createActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleCreateFolder}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Folders List */}
      <FlatList
        data={filteredFolders}
        renderItem={renderFolder}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyFolders}
        refreshing={isLoading}
        onRefresh={loadFolders}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchContainer: {
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
  createSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  createButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  createForm: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  createInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
  },
  folderInfo: {
    flex: 1,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  folderEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  noteCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 32,
  },
  folderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateSubtext: {
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

export default FolderList;
