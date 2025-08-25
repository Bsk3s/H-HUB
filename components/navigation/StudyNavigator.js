import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ErrorBoundary from '../../src/components/ErrorBoundary';

// Import the individual study screens (we'll create these)
import StudyHomeScreen from '../../screens/study/StudyHomeScreen';
import NotesScreen from '../../screens/study/NotesScreen';
import NoteEditorScreen from '../../screens/study/NoteEditorScreen';

const Stack = createNativeStackNavigator();

export default function StudyNavigator() {
  return (
    <ErrorBoundary 
      screenName="Study"
      onRetry={() => {
        // Reset study navigation state
        console.log('🔄 Retrying Study navigation...');
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="StudyHome"
      >
        <Stack.Screen
          name="StudyHome"
          component={StudyHomeScreen}
        />
        <Stack.Screen
          name="Notes"
          component={NotesScreen}
        />
        <Stack.Screen
          name="NoteEditor"
          component={NoteEditorScreen}
          options={{
            presentation: 'fullScreenModal',
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </ErrorBoundary>
  );
}
