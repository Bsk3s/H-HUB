import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { getJournalsGroupedByPillar, getJournalCountsByPillar } from '../services/journalService';

// Auto-tagged Journal Folders Component
const FolderList = () => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [journalCounts, setJournalCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Load journal counts on mount
  useEffect(() => {
    loadJournalCounts();
  }, []);

  const loadJournalCounts = async () => {
    setLoading(true);
    const counts = await getJournalCountsByPillar();
    setJournalCounts(counts);
    setLoading(false);
  };

  // Auto-tagged folders based on pillars - only show if they have journals
  const autoTaggedFolders = [
    { id: 'Faith', name: 'Faith', noteCount: journalCounts.Faith || 0, emoji: '✝️' },
    { id: 'Hope', name: 'Hope', noteCount: journalCounts.Hope || 0, emoji: '💙' },
    { id: 'Prayer', name: 'Prayer', noteCount: journalCounts.Prayer || 0, emoji: '🙏' },
    { id: 'Love', name: 'Love', noteCount: journalCounts.Love || 0, emoji: '❤️' },
  ].filter(folder => folder.noteCount > 0); // Only show if has journals!

  const totalJournals = Object.values(journalCounts).reduce((a, b) => a + b, 0);

  const folders = [
    // Show "All Notes" only if there are any journals
    ...(totalJournals > 0 ? [{ id: 'all', name: 'All Notes', noteCount: totalJournals, emoji: '📝' }] : []),
    // Add auto-tagged folders that have content
    ...autoTaggedFolders,
    // Manual folders (always show for user to add notes)
    { id: 'bible-study', name: 'Bible Study', noteCount: 0, emoji: '📖' },
  ];

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    // In real app: create folder via service
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const renderFolder = ({ item }) => (
    <TouchableOpacity style={styles.folderItem}>
      <View style={styles.folderInfo}>
        <View style={styles.folderHeader}>
          <Text style={styles.folderEmoji}>{item.emoji}</Text>
          <Text style={styles.folderName}>{item.name}</Text>
        </View>
        <Text style={styles.noteCount}>{item.noteCount} notes</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#C7C7CC" />
    </TouchableOpacity>
  );

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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading journals...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredFolders}
            renderItem={renderFolder}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          {/* Empty State */}
          {filteredFolders.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="folder" size={50} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>No folders found</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first folder to organize your notes
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

// EXACT HB1 Study Screen Component
export default function StudyScreen() {
  const [activeTab, setActiveTab] = useState('notes');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return <FolderList />;
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
        return <FolderList />;
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
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});