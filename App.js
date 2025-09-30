import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LogBox, ActivityIndicator, View } from 'react-native';

// Import providers
import { AuthProvider, useAuth } from './src/auth/context';
import { FeedbackProvider } from './src/components/feedback/FeedbackProvider';

// Import screens
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import OnboardingNavigator from './components/navigation/OnboardingNavigator';
import EmailSignInScreen from './screens/EmailSignInScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import StoriesScreen from './screens/StoriesScreen';
import StoryDetailScreen from './screens/StoryDetailScreen';

const Stack = createNativeStackNavigator();

// Auth Stack - Only for non-authenticated users
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
      initialRouteName="Landing"
    >
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
      />
      <Stack.Screen name="Onboarding">
        {(props) => <OnboardingNavigator {...props} parentNavigation={props.navigation} />}
      </Stack.Screen>
      <Stack.Screen
        name="EmailSignIn"
        component={EmailSignInScreen}
      />
    </Stack.Navigator>
  );
}

// App Stack - Only for authenticated users
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
      initialRouteName="Home"
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          gestureEnabled: false, // Disable swipe back on Home
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
      />
      <Stack.Screen
        name="Stories"
        component={StoriesScreen}
      />
      <Stack.Screen
        name="StoryDetail"
        component={StoryDetailScreen}
      />
    </Stack.Navigator>
  );
}

// Root Navigator - Conditionally renders Auth or App stack
function RootNavigator() {
  const { user, initializing } = useAuth();

  // Show loading screen while checking auth state
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  // Render appropriate stack based on auth state
  return user ? <AppStack /> : <AuthStack />;
}

export default function App() {
  // Suppress ugly error messages in production
  LogBox.ignoreAllLogs(true);

  return (
    <FeedbackProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </FeedbackProvider>
  );
}