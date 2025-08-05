import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import feature flags system
import { FEATURES, isFeatureEnabled, validateCriticalFeatures } from './config/features';
import VoiceChat from './VoiceChat';

// Import AppHeader with theme system
import AppHeader from './app/components/layout/AppHeader';

const Tab = createBottomTabNavigator();

// Placeholder screens for HB1 features (currently disabled by feature flags)
function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Heavenly Hub</Text>
      <Text style={styles.subtitle}>Home Screen</Text>
      <Text style={styles.status}>
        {isFeatureEnabled('ENABLE_BIBLE_READER') ? '✅ Bible Reader Enabled' : '⏸️ Bible Reader Disabled'}
      </Text>
      <Text style={styles.status}>
        {FEATURES.PRESERVE_LIVEKIT_VOICE ? '🎤 LiveKit Voice Protected' : '❌ LiveKit Not Protected'}
      </Text>
    </View>
  );
}

function BibleScreen() {
  if (!isFeatureEnabled('ENABLE_BIBLE_READER')) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Bible Reader</Text>
        <Text style={styles.disabled}>Feature currently disabled</Text>
        <Text style={styles.note}>Will be enabled during migration Phase 1</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Bible Reader</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

function StudyScreen() {
  if (!isFeatureEnabled('ENABLE_STUDY_SYSTEM')) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Study System</Text>
        <Text style={styles.disabled}>Feature currently disabled</Text>
        <Text style={styles.note}>Will be enabled during migration Phase 1</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Study System</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

function ChatScreen() {
  if (!isFeatureEnabled('ENABLE_AI_CHAT')) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>AI Chat</Text>
        <Text style={styles.disabled}>Feature currently disabled</Text>
        <Text style={styles.note}>Will be enabled during migration Phase 1</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>AI Chat</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

function VoiceTestScreen() {
  return <VoiceChat />;
}

// 🎯 Main App Component
export default function App() {
  // Validate critical features on app start
  if (__DEV__) {
    validateCriticalFeatures();
  }

  return (
    <SafeAreaProvider>
      <AppHeader />
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
              title: 'Home',
              tabBarIcon: () => <Text>🏠</Text>
            }}
          />
          <Tab.Screen 
            name="Bible" 
            component={BibleScreen}
            options={{
              title: 'Bible',
              tabBarIcon: () => <Text>��</Text>
            }}
          />
          <Tab.Screen 
            name="Study" 
            component={StudyScreen}
            options={{
              title: 'Study',
              tabBarIcon: () => <Text>📚</Text>
            }}
          />
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              title: 'Chat',
              tabBarIcon: () => <Text>💬</Text>
            }}
          />
          <Tab.Screen 
            name="VoiceTest" 
            component={VoiceTestScreen}
            options={{
              title: 'Voice Test',
              tabBarIcon: () => <Text>🎤</Text>
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  status: {
    fontSize: 14,
    marginVertical: 5,
    color: '#007AFF',
  },
  disabled: {
    fontSize: 16,
    color: '#ff6b6b',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
