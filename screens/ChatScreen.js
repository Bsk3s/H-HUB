import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
// import { useLiveKitVoiceChat } from '../app/hooks/useLiveKitVoiceChat'; // Temporarily disabled for production build
// Removed useNavigation as we use custom navigation from App.js
import { showErrorAlert, showRetryErrorAlert, getUserFriendlyErrorMessage } from '../src/utils/errorHandling';
import ErrorBoundary from '../src/components/ErrorBoundary';
import PressableWithFeedback from '../src/components/feedback/PressableWithFeedback';
import { useFeedbackContext } from '../src/components/feedback/FeedbackProvider';

// Import beautiful HB1 chat components
import AIToggle from '../app/components/chat/AIToggle';
import VoiceVisualization from '../app/components/chat/VoiceVisualization';
import QuickReplies from '../app/components/chat/QuickReplies';
import VoiceControls from '../app/components/chat/VoiceControls';
import useVoiceAnimation from '../app/components/chat/useVoiceAnimation';

// Full LiveKit Voice Chat integrated into Chat tab
const Chat = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [activeAI, setActiveAI] = useState('adina'); // Lowercase for HB1 compatibility
  const scrollViewRef = useRef(null);
  const { showInfo } = useFeedbackContext();
  
  // Handle Bible navigation with feedback
  const handleBibleNavigation = () => {
    console.log('📖 Bible button pressed - navigating to Bible');
    showInfo('Opening Bible...', { duration: 1500 });
    navigation.navigate('Bible');
  };
  
  // Friendly Error Message Helpers
  const getFriendlyErrorTitle = (error) => {
    if (!error) return "Something went wrong";
    
    if (error.includes('Microphone') || error.includes('microphone')) {
      return "Need microphone access";
    }
    if (error.includes('Connection failed') || error.includes('network') || error.includes('timeout')) {
      return "Can't connect right now";
    }
    if (error.includes('Authentication') || error.includes('token') || error.includes('auth')) {
      return "Session expired";
    }
    if (error.includes('Server') || error.includes('500') || error.includes('unavailable')) {
      return `${activeAI?.charAt(0).toUpperCase() + activeAI?.slice(1) || 'AI'} is taking a break`;
    }
    return "Something's not working";
  };

  const getFriendlyErrorMessage = (error) => {
    if (!error) return "Tap to try again";
    
    if (error.includes('Microphone') || error.includes('microphone')) {
      return "Go to Settings > Privacy > Microphone to allow access";
    }
    if (error.includes('Connection failed') || error.includes('network') || error.includes('timeout')) {
      return "Check your wifi or mobile data, then try again";
    }
    if (error.includes('Authentication') || error.includes('token') || error.includes('auth')) {
      return "Close and reopen the app to reconnect";
    }
    if (error.includes('Server') || error.includes('500') || error.includes('unavailable')) {
      return "Our voice chat is temporarily down. Try again in a few minutes";
    }
    return "Don't worry, let's try again together";
  };

  const getRetryButtonText = (error) => {
    if (!error) return "Try Again";
    
    if (error.includes('Microphone') || error.includes('microphone')) {
      return "Open Settings";
    }
    if (error.includes('Authentication') || error.includes('token') || error.includes('auth')) {
      return "Restart App";
    }
    return "Try Again";
  };
  
  // HB1 Voice Animation Hook
  const {
    blobScale,
    glowOpacity,
    particles,
    particleOpacity,
    particleScale
  } = useVoiceAnimation(isListening);
  
  // Quick replies data (from HB1)
  const quickReplies = [
    "Tell me more",
    "Give me a verse",
    "How does this apply to me?",
    "Explain further"
  ];
  
  const {
    conversationState,
    isListening,
    isRecording,
    isPlaying,
    isProcessing,
    error,
    isInitialized,
    isConnected,
    isActive,
    voiceLevel,
    startVoiceChat,
    endVoiceChat,
    toggleListening,
    sendTextMessage,
    clearError
  } = useLiveKitVoiceChat();

  // Capture console logs for real-time display
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const message = args.join(' ');
      
      setLogs(prevLogs => [...prevLogs.slice(-50), {
        timestamp: `[${timestamp}]`,
        message,
        id: Date.now() + Math.random()
      }]);
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  // Auto scroll to bottom when new logs appear
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  const checkBackend = () => {
    console.log('🔄 Checking backend connection...');
  };

  const handleStartChat = () => {
    const aiName = activeAI.charAt(0).toUpperCase() + activeAI.slice(1); // Capitalize for display
    console.log(`🚀 Starting conversation with ${aiName}...`);
    startVoiceChat(activeAI);
  };

  // Smart voice handler - seamless flow
  const handleVoiceAction = () => {
    if (!isConnected && !isActive) {
      // First press: Start voice chat with selected AI
      const aiName = activeAI.charAt(0).toUpperCase() + activeAI.slice(1);
      console.log(`🚀 Initiating voice chat with ${aiName}...`);
      startVoiceChat(activeAI);
    } else if (isConnected && isActive) {
      // Session active: Toggle listening
      toggleListening();
    }
  };

  // Quick reply handler - send text prompts to AI
  const handleQuickReply = async (replyText) => {
    try {
      if (!isConnected) {
        console.log('⚠️ Not connected - starting voice chat first');
        // Start voice chat if not connected
        await startVoiceChat(activeAI);
        // Wait a moment for connection, then send message
        setTimeout(() => {
          sendTextMessage(replyText);
        }, 2000);
      } else {
        // Already connected - send immediately
        console.log(`💬 Sending quick reply: "${replyText}"`);
        await sendTextMessage(replyText);
      }
    } catch (error) {
      console.error('❌ Error sending quick reply:', error);
      showErrorAlert(error, 'Message Failed', () => {
        // Optionally retry or clear the error state
        console.log('User acknowledged message error');
      });
    }
  };

  const connectionStatus = isConnected ? 'Connected' : 'Disconnected';

  return (
    <ErrorBoundary 
      screenName="Chat"
      onRetry={() => {
        // Reset chat state and reconnect
        console.log('🔄 Retrying Chat screen...');
      }}
    >
      <SafeAreaView style={styles.container}>
      {/* AI Selection Header - Clean and minimal */}
      <View style={styles.floatingHeader}>
        {/* Header Row with centered AI Toggle and right-aligned Bible Button */}
        <View style={styles.headerRow}>
          {/* Spacer for centering */}
          <View style={styles.spacer} />
          
          {/* Beautiful HB1 AI Toggle - Centered */}
          <AIToggle 
            activeAI={activeAI} 
            setActiveAI={setActiveAI} 
          />
          
          {/* Bible Quick Access - Right aligned */}
          <PressableWithFeedback 
            style={styles.bibleButtonInline}
            onPress={handleBibleNavigation}
            hapticType="light"
            scaleValue={0.95}
          >
            <Text style={styles.bibleIcon}>📖</Text>
          </PressableWithFeedback>
        </View>
        
        {/* Connection Status - More spacing */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
          <Text style={styles.statusText}>{connectionStatus}</Text>
          
          {/* Agent Connected Indicator */}
          {isConnected && (
            <View style={styles.agentIndicator}>
              <View style={[
                styles.agentDot,
                activeAI === 'adina' ? styles.adinaAgent : styles.rafaAgent
              ]} />
              <Text style={[
                styles.agentText,
                activeAI === 'adina' ? styles.adinaText : styles.rafaText
              ]}>
                {activeAI.charAt(0).toUpperCase() + activeAI.slice(1)} ready
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* UNIFIED VOICE EXPERIENCE - Everything flows together */}
      <View style={styles.unifiedVoiceArea}>
        {/* Voice Visualization - Integrated */}
        <VoiceVisualization
          activeAI={activeAI}
          isListening={isListening}
          isConnected={isConnected}
          isPlaying={isPlaying}
          isProcessing={isProcessing}
          voiceLevel={voiceLevel}
          blobScale={blobScale}
          glowOpacity={glowOpacity}
          particles={particles}
          particleOpacity={particleOpacity}
          particleScale={particleScale}
        />

      </View>

      {/* Quick Replies - COMPLETELY SEPARATE from blob */}
      <View style={styles.quickRepliesSection}>
        <QuickReplies 
          activeAI={activeAI}
          quickReplies={quickReplies}
          onQuickReply={handleQuickReply}
        />
      </View>

      {/* Enhanced Status Message with Better Error Handling */}
      <View style={styles.statusSection}>
        {error ? (
          <View style={styles.modernErrorContainer}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>😔</Text>
            </View>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                {getFriendlyErrorTitle(error)}
              </Text>
              <Text style={styles.errorMessage}>
                {getFriendlyErrorMessage(error)}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  clearError();
                  // Smart retry based on error type
                  if (error.includes('Connection failed') || error.includes('Connection lost') || error.includes('Microphone')) {
                    handleVoiceAction();
                  }
                }}
                accessible={true}
                accessibilityLabel="Retry connection"
              >
                <Text style={styles.retryButtonText}>
                  {getRetryButtonText(error)}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.modernDismissButton}
              onPress={clearError}
              accessible={true}
              accessibilityLabel="Dismiss error"
            >
              <Text style={styles.modernDismissText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusMessageContainer}>
            <Text style={styles.statusMessageText}>
              {isConnected ? '✨ Ready for conversation' : 
               isActive ? '🔄 Connecting...' : 
               (conversationState === 'error' || conversationState === 'failed') ? '😔 Connection trouble' :
               '🎤 Tap mic to start'}
            </Text>
            {isConnected && (
              <Text style={styles.statusSubtext}>
                Speak naturally or tap a quick reply
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Voice Controls - Bottom fixed */}
      <VoiceControls
        isListening={isListening}
        setIsListening={handleVoiceAction}
        activeAI={activeAI}
        showQuickReplies={true}
        setShowQuickReplies={() => {}}
        isConnected={isConnected}
        isSessionActive={isActive}
        conversationState={isConnected ? 'connected' : isActive ? 'connecting' : error ? 'error' : 'disconnected'}
        onEndConversation={endVoiceChat}
        hasError={!!error}
      />


    </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  floatingHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    paddingTop: 40, // More padding at top
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    position: 'relative',
  },
  spacer: {
    width: 44, // Same width as Bible button to balance the layout
  },
  bibleButtonInline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc', // Match the page tone instead of pure white
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bibleIcon: {
    fontSize: 20,
  },
  unifiedVoiceArea: {
    flex: 1,
    position: 'relative',
    // Everything flows together here
  },
  quickRepliesSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    // Natural flow - no overlapping!
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    // Clean separation
  },
  modernErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    maxWidth: '95%',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  errorIconText: {
    fontSize: 20,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modernDismissButton: {
    padding: 8,
    marginLeft: 8,
  },
  modernDismissText: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statusMessageContainer: {
    alignItems: 'center',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  // Legacy error styles (keep for backward compatibility)
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '90%',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  aiToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  aiButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  aiButtonActive: {
    backgroundColor: '#3498db',
  },
  aiButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  aiButtonTextActive: {
    color: 'white',
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,  // More spacing from toggle
  },
  agentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  agentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  adinaAgent: {
    backgroundColor: '#ec4899',
  },
  rafaAgent: {
    backgroundColor: '#3b82f6',
  },
  agentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  adinaText: {
    color: '#ec4899',
  },
  rafaText: {
    color: '#3b82f6',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#27ae60',
  },
  disconnected: {
    backgroundColor: '#95a5a6',
  },
  statusText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  voiceVisualizationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    minHeight: 320,
    width: '100%', // Ensure full width ✅
  },
  readySection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  readyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  readyText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activeSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  activeText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 15,
  },
  logSection: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
  },
  logSectionMinimized: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    padding: 10,
  },
  statusMessage: {
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  statusMessageText: {
    fontSize: 17,
    color: '#64748b',
    fontWeight: '500',
    opacity: 0.9,
    letterSpacing: 0.2,
  },
  logHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  logHeaderMinimized: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    fontFamily: 'Courier New',
  },
  logScrollView: {
    flex: 1,
  },
  logEntry: {
    fontSize: 13,
    color: '#34495e',
    marginBottom: 2,
    fontFamily: 'Courier New',
  },
  noLogsText: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#3498db',
  },
  clearButton: {
    backgroundColor: '#95a5a6',
  },
  endButton: {
    backgroundColor: '#e74c3c',
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default Chat;