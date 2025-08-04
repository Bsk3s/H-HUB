import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

// Import feature flags system
import { FEATURES, isFeatureEnabled, validateCriticalFeatures } from './config/features';
import VoiceChat from './VoiceChat';

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

export default function App() {
  // Validate critical features on app start
  React.useEffect(() => {
    const isValid = validateCriticalFeatures();
    if (!isValid) {
      console.error('🚨 CRITICAL: Feature flags validation failed! LiveKit may be at risk.');
    }
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#333',
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
            tabBarIcon: () => <Text>📖</Text>
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
