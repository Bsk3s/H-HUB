import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { registerGlobals } from '@livekit/react-native';
import { Text } from 'react-native';

// 🚩 Import Feature Flags
import { FEATURES, logEnabledFeatures, validateCriticalFeatures } from './config/features';

// Import existing HB1 screens and components
import HomeScreen from './app/index';
import BibleScreen from './app/(tabs)/bible';
import StudyScreen from './app/(tabs)/study/index';
import ChatScreen from './app/(tabs)/chat';

// Initialize LiveKit for React Native
registerGlobals();

// Initialize feature system
if (__DEV__) {
  logEnabledFeatures();
  validateCriticalFeatures();
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 📚 Bible Stack Navigator (for nested Bible screens)
function BibleStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BibleMain" component={BibleScreen} />
      {/* Future: BibleChapter, BibleVerse, BibleSearch screens */}
    </Stack.Navigator>
  );
}

// 📖 Study Stack Navigator (for nested Study screens)  
function StudyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyMain" component={StudyScreen} />
      {/* Future: StudyEditor, StudyNotes, StudyMaterials screens */}
    </Stack.Navigator>
  );
}

// 🎤 Voice Chat Stack (for potential voice-related screens)
function VoiceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VoiceChatMain" component={ChatScreen} />
      {/* Future: VoiceSettings, VoiceHistory screens */}
    </Stack.Navigator>
  );
}

// 🏠 Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="VoiceChat" 
        component={VoiceStack}
        options={{
          tabBarLabel: 'Voice Chat',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 20, color }}>🎤</Text>
          ),
        }}
      />
      
      {/* 🚩 Bible Reader - Feature Flag Controlled */}
      {FEATURES.ENABLE_BIBLE_READER && (
        <Tab.Screen 
          name="Bible" 
          component={BibleStack}
          options={{
            tabBarLabel: 'Bible',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: 20, color }}>📖</Text>
            ),
          }}
        />
      )}
      
      {/* 🚩 Study System - Feature Flag Controlled */}
      {FEATURES.ENABLE_STUDY_SYSTEM && (
        <Tab.Screen 
          name="Study" 
          component={StudyStack}
          options={{
            tabBarLabel: 'Study',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: 20, color }}>📚</Text>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// 🏗️ Root Stack Navigator (for modals, auth screens, etc.)
function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainApp" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      
      {/* 🚩 Future: Modal screens for advanced features */}
      {FEATURES.ENABLE_SUPABASE_AUTH && (
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          {/* Future: Login, Register, Profile modals */}
        </Stack.Group>
      )}
      
      {FEATURES.ENABLE_ADVANCED_UI && (
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          {/* Future: Settings, Help, About modals */}
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

// 🎯 Main App Component
export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </>
  );
}
