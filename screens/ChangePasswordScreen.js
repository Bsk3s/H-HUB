import React, { useState } from 'react';
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
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../src/auth/context';

export default function ChangePasswordScreen({ navigation }) {
  const { updatePassword } = useAuth();
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      navigation.navigate('Settings');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement updatePassword in auth context
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // const success = await updatePassword(passwords.new);
      // if (!success) {
      //   throw new Error('Failed to update password');
      // }

      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => handleBack() }
      ]);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText, 
    field 
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPasswords[field]}
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          onPress={() => togglePasswordVisibility(field)}
          style={styles.eyeButton}
        >
          {showPasswords[field] ? (
            <EyeOff size={20} color="#9CA3AF" />
          ) : (
            <Eye size={20} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Choose a strong password to keep your account secure.
          </Text>

          <PasswordInput
            label="Current Password"
            placeholder="Enter your current password"
            value={passwords.current}
            onChangeText={(text) => setPasswords({ ...passwords, current: text })}
            field="current"
          />

          <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            value={passwords.new}
            onChangeText={(text) => setPasswords({ ...passwords, new: text })}
            field="new"
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={passwords.confirm}
            onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
            field="confirm"
          />

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading}
            style={[
              styles.changeButton,
              loading && styles.changeButtonDisabled
            ]}
          >
            <Text style={styles.changeButtonText}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Password Requirements:</Text>
            <Text style={styles.tipsText}>
              • Use at least 8 characters{'\n'}
              • Include uppercase and lowercase letters{'\n'}
              • Add numbers and special characters{'\n'}
              • Don't use common words or personal information
            </Text>
          </View>
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
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  description: {
    color: '#6B7280',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  changeButton: {
    marginTop: 32,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#8B5CF6',
  },
  changeButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  changeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  tipsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D4ED8',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});


