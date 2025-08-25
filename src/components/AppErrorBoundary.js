// src/components/AppErrorBoundary.js
// App-level error boundary with enhanced UX and navigation

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions
} from 'react-native';
import { Heart, RefreshCw, MessageSquare } from 'lucide-react-native';
import ErrorBoundary from './ErrorBoundary';

const { width } = Dimensions.get('window');

class AppErrorBoundary extends ErrorBoundary {
  constructor(props) {
    super(props);
  }

  handleGoHome = () => {
    // Reset the error boundary
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Navigate to the main app screen
    if (this.props.navigation) {
      // Reset navigation stack and go to home
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' }], // or 'Home' depending on your setup
      });
    }
  };

  handleContactSupport = () => {
    // TODO: Open support contact (email, in-app chat, etc.)
    console.log('Contact support from app error boundary');
    
    // For now, we could open the chat screen if available
    if (this.props.navigation) {
      try {
        this.setState({ hasError: false, error: null, errorInfo: null });
        this.props.navigation.navigate('Chat');
      } catch (navError) {
        console.error('Failed to navigate to chat:', navError);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* App Logo/Icon Area */}
            <View style={styles.logoContainer}>
              <View style={styles.heartIcon}>
                <Heart size={48} color="#007AFF" fill="#007AFF" />
              </View>
              <Text style={styles.appName}>Heavenly Hub</Text>
            </View>

            {/* Friendly Error Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.title}>We'll be right back!</Text>
              <Text style={styles.subtitle}>
                Something unexpected happened, but don't worry - your data is safe. 
                We're working to make the app better for you.
              </Text>
            </View>

            {/* What happened? (Development only) */}
            {__DEV__ && this.state.error && (
              <View style={styles.devInfo}>
                <Text style={styles.devTitle}>Technical Details:</Text>
                <Text style={styles.devError} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleRetry}
                accessibilityLabel="Restart the app"
              >
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Restart App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleContactSupport}
                accessibilityLabel="Get help"
              >
                <MessageSquare size={20} color="#007AFF" />
                <Text style={styles.secondaryButtonText}>Get Help</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                If this keeps happening, try restarting your device.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    // Normal render
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heartIcon: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width - 64,
  },
  devInfo: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFE69C',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    maxWidth: '100%',
  },
  devTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  devError: {
    fontSize: 13,
    color: '#856404',
    fontFamily: 'monospace',
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AppErrorBoundary;


