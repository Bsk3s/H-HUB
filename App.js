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
              component={require('./screens/EmailSignInScreen').default}
            />
            <Stack.Screen
              name="Profile"
              component={require('./screens/ProfileScreen').default}
            />
            <Stack.Screen
              name="Settings"
              component={require('./screens/SettingsScreen').default}
            />
            <Stack.Screen
              name="Help"
              component={require('./screens/HelpScreen').default}
            />
            <Stack.Screen
              name="EditProfile"
              component={require('./screens/EditProfileScreen').default}
            />
            <Stack.Screen
              name="ChangePassword"
              component={require('./screens/ChangePasswordScreen').default}
            />
            <Stack.Screen
              name="Stories"
              component={require('./screens/StoriesScreen').default}
            />
            <Stack.Screen
              name="StoryDetail"
              component={require('./screens/StoryDetailScreen').default}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </FeedbackProvider>
  );
}