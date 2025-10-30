import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useAuth } from '../src/auth/context';
import { showErrorAlert, getUserFriendlyErrorMessage } from '../src/utils/errorHandling';
// TODO: Import these services when implemented
// import { getUserProfile, updateUserProfile, createUserProfile } from '../src/auth/services/profile-service';

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    age: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      // TODO: Implement actual profile fetching
      // For now, use mock data from user
      setProfile({
        name: user?.email?.split('@')[0] || 'User',
        age: '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = profile.name.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters long');
      return;
    }

    if (trimmedName.length > 100) {
      Alert.alert('Error', 'Name must be less than 100 characters long');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: trimmedName,
      };

      // Only include age if it's provided and is a valid number
      if (profile.age.trim()) {
        const ageNumber = parseInt(profile.age.trim(), 10);
        if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 150) {
          Alert.alert('Error', 'Please enter a valid age between 1 and 150');
          setLoading(false);
          return;
        }
        updateData.age = ageNumber;
      }

      // TODO: Implement actual profile update
      // const result = await updateUserProfile(user.id, updateData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => handleBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);

      // More detailed error messages
      let errorMessage = 'Failed to update profile';
      if (error.message?.includes('duplicate')) {
        errorMessage = 'This name is already taken';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Profile not found';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Permission denied';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showErrorAlert(error, 'Profile Update Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      navigation.navigate('Profile');
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButton}
          >
            <Save size={24} color={loading ? "#9CA3AF" : "#8B5CF6"} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.fieldsContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your name"
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                autoCapitalize="words"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your age"
                value={profile.age}
                onChangeText={(text) => setProfile({ ...profile, age: text })}
                keyboardType="number-pad"
                maxLength={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={[
              styles.saveChangesButton,
              loading && styles.saveChangesButtonDisabled
            ]}
          >
            <Text style={styles.saveChangesButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  fieldsContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveChangesButton: {
    marginTop: 32,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#8B5CF6',
  },
  saveChangesButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveChangesButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
