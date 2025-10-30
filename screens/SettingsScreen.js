import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  User,
  BookOpen,
  Bell,
  Mic,
  Smartphone,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Shield,
  FileText,
} from 'lucide-react-native';
import { useAuth } from '../src/auth/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Import when implemented
// import { clearUserOnboardingData } from '../src/auth/services/onboarding-service';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    streakAlerts: true,
    quietHours: false,
    microphoneEnabled: true,
    voiceChatEnabled: true,
    darkMode: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete:\n\n• All your journals and notes\n• Your onboarding preferences\n• Your profile and settings\n• All your saved data\n\nThis action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => confirmAccountDeletion()
        }
      ]
    );
  };

  const confirmAccountDeletion = () => {
    Alert.prompt(
      '🔐 Confirm Deletion',
      'Enter your password to permanently delete your account:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async (password) => {
            if (!password || password.trim() === '') {
              Alert.alert('Error', 'Password is required to delete your account.');
              return;
            }
            await executeAccountDeletion(password);
          }
        }
      ],
      'secure-text'
    );
  };

  const executeAccountDeletion = async (password) => {
    try {
      // Import supabase
      const { supabase } = await import('../src/auth/supabase-client');

      // Verify password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (verifyError) {
        Alert.alert('Error', 'Incorrect password. Account deletion cancelled.');
        return;
      }

      // Delete all user data from Supabase database
      // Note: Supabase RLS policies should allow users to delete their own data
      const userId = user.id;

      // Delete user's journals
      await supabase.from('journals').delete().eq('user_id', userId);

      // Delete user's notes
      await supabase.from('notes').delete().eq('user_id', userId);

      // Delete user's prayers (if table exists)
      await supabase.from('prayers').delete().eq('user_id', userId);

      // Delete user's profile data
      await supabase.from('profiles').delete().eq('id', userId);

      // Delete user's onboarding data (if stored separately)
      await supabase.from('onboarding').delete().eq('user_id', userId);

      // Delete the user account from Supabase Auth
      // This uses the user's own session, not admin privileges
      const { error: deleteError } = await supabase.rpc('delete_user');

      if (deleteError) {
        console.error('Error deleting user account:', deleteError);
        Alert.alert('Error', 'Failed to delete account. Please contact support at support@heavenlyhub.com');
        return;
      }

      // Clear local storage
      await AsyncStorage.clear();

      // Sign out (will happen automatically after account deletion)
      await supabase.auth.signOut();

      // Show success message
      Alert.alert(
        'Account Deleted',
        'Your account and all associated data have been permanently deleted.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert('Error', 'An error occurred while deleting your account. Please try again or contact support at support@heavenlyhub.com');
    }
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will clear your onboarding data and you can go through the setup process again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              // Clear AsyncStorage onboarding data
              await AsyncStorage.removeItem('onboardingCompleted');
              await AsyncStorage.removeItem('selectedDenomination');
              await AsyncStorage.removeItem('selectedAgeGroup');
              await AsyncStorage.removeItem('selectedBibleVersion');
              await AsyncStorage.removeItem('selectedSpiritualJourney');
              await AsyncStorage.removeItem('selectedFaithChallenges');
              await AsyncStorage.removeItem('selectedGrowthPriorities');
              await AsyncStorage.removeItem('selectedPrayerHabits');
              await AsyncStorage.removeItem('selectedSatisfactionLevel');
              await AsyncStorage.removeItem('selectedWantsStructure');
              await AsyncStorage.removeItem('userName');
              await AsyncStorage.removeItem('userAge');

              // TODO: Clear database onboarding data if user is logged in
              // if (user?.id) {
              //   await clearUserOnboardingData(user.id);
              // }

              Alert.alert('Success', 'Onboarding data has been reset. You can now go through the setup process again.');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert('Error', 'Failed to reset onboarding data.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    console.log('📝 Edit Profile pressed - navigating to EditProfile');
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    console.log('🔒 Change Password pressed - navigating to ChangePassword');
    navigation.navigate('ChangePassword');
  };

  const handleBibleVersionSettings = () => {
    console.log('📖 Bible Version Settings pressed - TODO: Create BibleVersionSettingsScreen');
    Alert.alert('Coming Soon', 'Bible version settings will be available soon.');
  };

  const handlePrivacyPolicy = () => {
    const privacyUrl = 'https://a-heavenlyhub.com/privacy';
    Linking.openURL(privacyUrl).catch(() => {
      Alert.alert('Error', 'Unable to open privacy policy. Please visit a-heavenlyhub.com/privacy in your browser.');
    });
  };

  const handleTermsOfService = () => {
    const termsUrl = 'https://a-heavenlyhub.com/terms';
    Linking.openURL(termsUrl).catch(() => {
      Alert.alert('Error', 'Unable to open terms of service. Please visit a-heavenlyhub.com/terms in your browser.');
    });
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        console.log('✅ Logout successful - App.js will handle navigation automatically');
        // Navigation happens automatically via App.js when user becomes null
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ icon: Icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingRow}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#6B7280" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <ChevronRight size={16} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  const ToggleRow = ({ icon: Icon, title, subtitle, value, onToggle }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#6B7280" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Account Section */}
        <SettingSection title="Account">
          <SettingRow
            icon={User}
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={handleEditProfile}
          />
          <SettingRow
            icon={User}
            title="Change Password"
            subtitle="Update your account password"
            onPress={handleChangePassword}
          />
          <SettingRow
            icon={Trash2}
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
          />
        </SettingSection>

        {/* Bible Section */}
        <SettingSection title="Bible">
          <SettingRow
            icon={BookOpen}
            title="Default Bible Version"
            subtitle="Choose your preferred Bible translation"
            onPress={handleBibleVersionSettings}
          />
        </SettingSection>

        {/* Notifications Section */}
        <SettingSection title="Notifications">
          <ToggleRow
            icon={Bell}
            title="Daily Reminders"
            subtitle="Get reminded about your daily activities"
            value={settings.notifications}
            onToggle={() => handleToggle('notifications')}
          />
          <ToggleRow
            icon={Bell}
            title="Streak Alerts"
            subtitle="Notifications when your streak is at risk"
            value={settings.streakAlerts}
            onToggle={() => handleToggle('streakAlerts')}
          />
          <ToggleRow
            icon={Moon}
            title="Quiet Hours"
            subtitle="Disable notifications during quiet hours"
            value={settings.quietHours}
            onToggle={() => handleToggle('quietHours')}
          />
        </SettingSection>

        {/* Audio/Voice Section */}
        <SettingSection title="Audio & Voice">
          <ToggleRow
            icon={Mic}
            title="Microphone Access"
            subtitle="Allow microphone for voice features"
            value={settings.microphoneEnabled}
            onToggle={() => handleToggle('microphoneEnabled')}
          />
          <ToggleRow
            icon={Mic}
            title="Voice Chat"
            subtitle="Enable voice conversations with AI"
            value={settings.voiceChatEnabled}
            onToggle={() => handleToggle('voiceChatEnabled')}
          />
        </SettingSection>

        {/* App Section */}
        <SettingSection title="App">
          <ToggleRow
            icon={settings.darkMode ? Moon : Sun}
            title="Theme"
            subtitle={settings.darkMode ? 'Dark mode enabled' : 'Light mode enabled'}
            value={settings.darkMode}
            onToggle={() => handleToggle('darkMode')}
          />
          <SettingRow
            icon={Smartphone}
            title="Reset Onboarding"
            subtitle="Go through the setup process again"
            onPress={handleResetOnboarding}
          />
        </SettingSection>

        {/* Legal Section */}
        <SettingSection title="Legal & Privacy">
          <SettingRow
            icon={Shield}
            title="Privacy Policy"
            subtitle="View our privacy policy"
            onPress={handlePrivacyPolicy}
          />
          <SettingRow
            icon={FileText}
            title="Terms of Service"
            subtitle="View our terms of service"
            onPress={handleTermsOfService}
          />
        </SettingSection>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionContent: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    color: '#111827',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
});
