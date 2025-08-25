import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { getFolders, createFolder, deleteFolder, updateFolder } from '../../features/study/services/notesService';
import { showErrorAlert } from '../../src/utils/errorHandling';
import FolderItemSkeleton from '../../src/components/loading/FolderItemSkeleton';
import EmptyFolders from '../../src/components/empty/EmptyFolders';
import { useFeedbackContext } from '../../src/components/feedback/FeedbackProvider';

// FolderList Component - Now connected to real Supabase data
const FolderList = ({ navigation }) => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const { showSuccess, showError } = useFeedbackContext();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const folderData = await getFolders();
      setFolders(folderData || []);
      console.log('✅ Loaded', folderData?.length || 0, 'folders');
    } catch (error) {
      console.error('Error loading folders:', error);
      showErrorAlert(error, 'Failed to Load Folders');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    try {
      setIsLoading(true);
      await createFolder(newFolderName.trim());
      console.log('✅ Created folder:', newFolderName);
      showSuccess(`Folder "${newFolderName}" created!`);
      setNewFolderName('');
      setIsCreatingFolder(false);
      await loadFolders(); // Refresh the list
    } catch (error) {
      console.error('Error creating folder:', error);
      showError('Failed to create folder. Please try again.');
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
              console.log('🗑️ Deleted folder:', folderName);
              showSuccess(`Folder "${folderName}" deleted!`);
              await loadFolders(); // Refresh the list
            } catch (error) {
              console.error('Error deleting folder:', error);
              showError('Failed to delete folder. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder.id);
    setEditFolderName(folder.name);
  };

  const handleSaveEditFolder = async () => {
    if (!editFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    try {
      setIsLoading(true);
      await updateFolder(editingFolder, { name: editFolderName.trim() });
      console.log('✅ Updated folder name to:', editFolderName);
      setEditingFolder(null);
      setEditFolderName('');
      await loadFolders(); // Refresh the list
    } catch (error) {
      console.error('Error updating folder:', error);
      showErrorAlert(error, 'Failed to Update Folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEditFolder = () => {
    setEditingFolder(null);
    setEditFolderName('');
  };

  const handleFolderPress = (folder) => {
    console.log('🗂️ Opening folder:', folder.name);
    navigation.navigate('Notes', { 
      folderId: folder.id, 
      folderName: folder.name 
    });
  };

  const renderFolder = ({ item }) => {
    if (editingFolder === item.id) {
      return (
        <View style={styles.folderItem}>
          <View style={styles.editForm}>
            <TextInput
              style={styles.editInput}
              value={editFolderName}
              onChangeText={setEditFolderName}
              autoFocus
              placeholder="Folder name..."
              placeholderTextColor="#8E8E93"
            />
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelEditButton}
                onPress={handleCancelEditFolder}
              >
                <Text style={styles.cancelEditButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveEditButton}
                onPress={handleSaveEditFolder}
              >
                <Text style={styles.saveEditButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.folderItem}
        onPress={() => handleFolderPress(item)}
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
            style={styles.editButton}
            onPress={() => handleEditFolder(item)}
          >
            <Feather name="edit-2" size={16} color="#007AFF" />
          </TouchableOpacity>
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
  };

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

      {/* Loading State */}
      {isLoading ? (
        <FolderItemSkeleton count={6} />
      ) : (
        <>
                        {/* Folders List */}
              <FlatList
                data={filteredFolders}
                renderItem={renderFolder}
                keyExtractor={(item) => `folder-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                // 🚀 PERFORMANCE: Virtualization optimizations for folders
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
                initialNumToRender={12}
                windowSize={8}
                updateCellsBatchingPeriod={100}
                scrollEventThrottle={16}
              />

          {/* Empty States */}
          {filteredFolders.length === 0 && searchQuery.length > 0 && (
            <View style={styles.emptyState}>
              <Feather name="search" size={40} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No folders found</Text>
              <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
            </View>
          )}

          {folders.length === 0 && searchQuery.length === 0 && !isCreatingFolder && (
            <EmptyFolders
              onCreateFolder={() => setIsCreatingFolder(true)}
            />
          )}
        </>
      )}
    </View>
  );
};

// Main StudyHomeScreen Component
export default function StudyHomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('notes');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return <FolderList navigation={navigation} />;
      case 'highlights':
        return (
          <View style={styles.comingSoonContainer}>
            <Feather name="bookmark" size={50} color="#8E8E93" />
            <Text style={styles.comingSoonText}>Highlights Coming Soon</Text>
            <Text style={styles.comingSoonSubtext}>
              Save and organize your favorite Bible verses
            </Text>
          </View>
        );
      case 'resources':
        return (
          <View style={styles.comingSoonContainer}>
            <Feather name="book-open" size={50} color="#8E8E93" />
            <Text style={styles.comingSoonText}>Resources Coming Soon</Text>
            <Text style={styles.comingSoonSubtext}>
              Access study materials and commentaries
            </Text>
          </View>
        );
      default:
        return <FolderList navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]} 
          onPress={() => setActiveTab('notes')}
        >
          <Feather 
            name="file-text" 
            size={18} 
            color={activeTab === 'notes' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            Notes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'highlights' && styles.activeTab]} 
          onPress={() => setActiveTab('highlights')}
        >
          <Feather 
            name="bookmark" 
            size={18} 
            color={activeTab === 'highlights' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'highlights' && styles.activeTabText]}>
            Highlights
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'resources' && styles.activeTab]} 
          onPress={() => setActiveTab('resources')}
        >
          <Feather 
            name="book-open" 
            size={18} 
            color={activeTab === 'resources' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>
            Resources
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  // FolderList specific styles
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  folderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  editForm: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelEditButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
  },
  cancelEditButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  saveEditButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  saveEditButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
