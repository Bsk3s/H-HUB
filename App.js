import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import providers
import { AuthProvider } from './src/auth/context';
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

export default function App() {
  return (
    <FeedbackProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
            initialRouteName="Landing"
          >
            <Stack.Screen
              name="Landing"
              component={LandingScreen}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
            />
            <Stack.Screen name="Onboarding">
              {(props) => <OnboardingNavigator {...props} parentNavigation={props.navigation} />}
            </Stack.Screen>
            <Stack.Screen
              name="EmailSignIn"
              component={EmailSignInScreen}
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
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </FeedbackProvider>
  );
}