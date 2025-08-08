import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

// Simple notes folder list for StudyScreen
const FolderList = () => {
  const folders = [
    { id: 1, name: 'My Notes', count: 0 },
    { id: 2, name: 'Bible Study', count: 0 },
    { id: 3, name: 'Sermons', count: 0 }
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Notes & Folders
      </Text>
      {folders.map((folder) => (
        <TouchableOpacity 
          key={folder.id}
          style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: 16, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 8, 
            marginBottom: 8 
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{folder.name}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>{folder.count} notes</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default FolderList;