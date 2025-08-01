import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { registerGlobals } from '@livekit/react-native';
import { Text } from 'react-native';

// Import existing HB1 screens and components
import HomeScreen from './app/index';
import BibleScreen from './app/(tabs)/bible';
import StudyScreen from './app/(tabs)/study/index';
import ChatScreen from './app/(tabs)/chat';

// Initialize LiveKit for React Native
registerGlobals();

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
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
            name="Chat" 
            component={ChatScreen}
            options={{
              tabBarLabel: 'Voice Chat',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 20, color }}>🎤</Text>
              ),
            }}
          />
          <Tab.Screen 
            name="Bible" 
            component={BibleScreen}
            options={{
              tabBarLabel: 'Bible',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 20, color }}>📖</Text>
              ),
            }}
          />
          <Tab.Screen 
            name="Study" 
            component={StudyScreen}
            options={{
              tabBarLabel: 'Study',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: 20, color }}>📚</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
