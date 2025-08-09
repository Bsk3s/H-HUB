import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useLiveKitVoiceChat } from '../app/hooks/useLiveKitVoiceChat';

// Full LiveKit Voice Chat integrated into Chat tab
const Chat = () => {
  const [logs, setLogs] = useState([]);
  const [activeAI, setActiveAI] = useState('Adina');
  const scrollViewRef = useRef(null);
  
  const {
    isListening,
    isRecording,
    isPlaying,
    isProcessing,
    error,
    isInitialized,
    isConnected,
    isActive,
    startVoiceChat,
    endVoiceChat,
    toggleListening,
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
    console.log(`🚀 Starting conversation with ${activeAI}...`);
    startVoiceChat(activeAI);
  };

  const connectionStatus = isConnected ? 'Connected' : 'Disconnected';

  return (
    <SafeAreaView style={styles.container}>
      {/* AI Selection Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Chat</Text>
        
        {/* AI Toggle */}
        <View style={styles.aiToggle}>
          <TouchableOpacity
            onPress={() => setActiveAI('Adina')}
            style={[
              styles.aiButton,
              activeAI === 'Adina' && styles.aiButtonActive
            ]}
          >
            <Text style={[
              styles.aiButtonText,
              activeAI === 'Adina' && styles.aiButtonTextActive
            ]}>
              Adina 🕊️
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveAI('Rafa')}
            style={[
              styles.aiButton,
              activeAI === 'Rafa' && styles.aiButtonActive
            ]}
          >
            <Text style={[
              styles.aiButtonText,
              activeAI === 'Rafa' && styles.aiButtonTextActive
            ]}>
              Rafa 🌟
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
          <Text style={styles.statusText}>{connectionStatus}</Text>
        </View>
      </View>

      {/* Ready to Talk Section */}
      {!isActive && (
        <View style={styles.readySection}>
          <Text style={styles.readyIcon}>💭</Text>
          <Text style={styles.readyText}>Ready to talk with {activeAI}</Text>
        </View>
      )}

      {/* Active Chat Section */}
      {isActive && (
        <View style={styles.activeSection}>
          <Text style={styles.activeIcon}>🗣️</Text>
          <Text style={styles.activeText}>Chatting with {activeAI}</Text>
          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={endVoiceChat}
          >
            <Text style={styles.buttonText}>End Conversation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Debug Log Section */}
      <View style={styles.logSection}>
        <Text style={styles.logHeader}>Voice Chat Log:</Text>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.logScrollView}
          showsVerticalScrollIndicator={false}
        >
          {logs.map((log) => (
            <Text key={log.id} style={styles.logEntry}>
              {log.timestamp} {log.message}
            </Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles.noLogsText}>No logs yet...</Text>
          )}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isActive && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartChat}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonIcon}>🎤</Text>
            <Text style={styles.buttonText}>Talk with {activeAI}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={checkBackend}
        >
          <Text style={styles.buttonIcon}>🔄</Text>
          <Text style={styles.buttonText}>Check Backend</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearLogs}
        >
          <Text style={styles.buttonIcon}>🗑️</Text>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Pure voice conversations • No switching mid-chat</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  logHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
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