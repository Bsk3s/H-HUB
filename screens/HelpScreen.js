import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import { 
  ArrowLeft, 
  Play, 
  MessageCircle, 
  User, 
  Mail, 
  Bug,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Mic,
} from 'lucide-react-native';

export default function HelpScreen({ navigation }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const handleBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleContactSupport = () => {
    const email = 'support@heavenlyhub.com';
    const subject = 'Help Request';
    const body = 'Please describe your issue or question:';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Unable to open email app. Please contact support@heavenlyhub.com');
    });
  };

  const handleReportBug = () => {
    const email = 'bugs@heavenlyhub.com';
    const subject = 'Bug Report';
    const body = 'Please describe the bug you encountered:\n\n1. What were you doing when the bug occurred?\n2. What did you expect to happen?\n3. What actually happened?\n4. Device information (iPhone/Android, version):';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Unable to open email app. Please contact bugs@heavenlyhub.com');
    });
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const HelpSection = ({ title, children, icon: Icon }) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderContent}>
          <Icon size={20} color="#6B7280" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const HelpItem = ({ title, content }) => (
    <View style={styles.helpItem}>
      <Text style={styles.helpItemTitle}>{title}</Text>
      <Text style={styles.helpItemContent}>{content}</Text>
    </View>
  );

  const ExpandableSection = ({ title, children, icon: Icon }) => {
    const isExpanded = expandedSection === title;
    
    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          onPress={() => toggleSection(title)}
          style={styles.expandableSectionHeader}
        >
          <View style={styles.sectionHeaderContent}>
            <Icon size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          {isExpanded ? (
            <ChevronDown size={20} color="#6B7280" />
          ) : (
            <ChevronRight size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Getting Started Section */}
        <HelpSection title="Getting Started" icon={Play}>
          <HelpItem
            title="Welcome to Heavenly Hub"
            content="Heavenly Hub helps you build consistent spiritual habits through prayer, Bible reading, devotionals, and AI-powered conversations. Start by setting up your daily activities in the main app."
          />
          <HelpItem
            title="Setting Up Activities"
            content="Track your prayer time, Bible reading, devotionals, and evening prayers. Set personal goals and build streaks to stay motivated in your spiritual journey."
          />
          <HelpItem
            title="Navigating the App"
            content="Use the bottom tabs to access Bible reading, voice chat, study tools, and your home dashboard. Your progress is automatically saved and tracked."
          />
        </HelpSection>

        {/* Common Questions Section */}
        <ExpandableSection title="Common Questions" icon={HelpCircle}>
          <HelpItem
            title="How do streaks work?"
            content="Streaks track consecutive days you complete an activity. Missing a day resets your streak to 0. Your best streak is always saved as a personal record."
          />
          <HelpItem
            title="How to track Bible reading?"
            content="Use the Bible tab to read chapters. Your progress is automatically tracked when you finish reading. You can also manually log chapters in the activity tracker."
          />
          <HelpItem
            title="Voice chat not working?"
            content="Make sure microphone permissions are enabled in Settings. Check your internet connection and try again. If issues persist, contact support."
          />
          <HelpItem
            title="How are goals set?"
            content="Default goals are: 15 mins prayer, 1 chapter Bible reading, 20 mins devotional, 10 mins evening prayer. You can customize these in your activity settings."
          />
        </ExpandableSection>

        {/* Account Issues Section */}
        <ExpandableSection title="Account Issues" icon={User}>
          <HelpItem
            title="Forgot Password"
            content="Go to the login screen and tap 'Forgot Password'. Enter your email to receive a password reset link. Check your spam folder if you don't see the email."
          />
          <HelpItem
            title="Change Profile Information"
            content="Go to Settings > Account > Edit Profile to update your name, denomination, and other personal information."
          />
          <HelpItem
            title="My Progress Isn't Saving"
            content="Make sure you have a stable internet connection. Log out and log back in if the issue persists. Your data is automatically synced when connected."
          />
          <HelpItem
            title="Connected Accounts"
            content="If you signed up with Google or Apple, you can still set a password in Settings > Account > Change Password for additional security."
          />
        </ExpandableSection>

        {/* Contact Support Section */}
        <HelpSection title="Contact Support" icon={MessageCircle}>
          <TouchableOpacity
            onPress={handleContactSupport}
            style={styles.supportButton}
          >
            <View style={styles.supportButtonLeft}>
              <Mail size={20} color="#3B82F6" />
              <Text style={styles.supportButtonText}>Email Support</Text>
            </View>
            <ChevronRight size={16} color="#3B82F6" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleReportBug}
            style={styles.bugButton}
          >
            <View style={styles.supportButtonLeft}>
              <Bug size={20} color="#EF4444" />
              <Text style={styles.bugButtonText}>Report Bug</Text>
            </View>
            <ChevronRight size={16} color="#EF4444" />
          </TouchableOpacity>
          
          <View style={styles.responseTimeContainer}>
            <Text style={styles.responseTimeTitle}>Response Time</Text>
            <Text style={styles.responseTimeText}>
              We typically respond to support emails within 24-48 hours. For urgent issues, please include "URGENT" in your subject line.
            </Text>
          </View>
        </HelpSection>

        {/* App Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Heavenly Hub v1.0.0
          </Text>
          <Text style={styles.versionSubtext}>
            Built with ❤️ for your spiritual journey
          </Text>
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
  expandableSectionHeader: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  sectionContent: {
    padding: 16,
  },
  helpItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  helpItemTitle: {
    color: '#111827',
    fontWeight: '500',
    marginBottom: 8,
  },
  helpItemContent: {
    color: '#6B7280',
    lineHeight: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginBottom: 12,
  },
  bugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginBottom: 12,
  },
  supportButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 12,
  },
  bugButtonText: {
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 12,
  },
  responseTimeContainer: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  responseTimeTitle: {
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  responseTimeText: {
    color: '#6B7280',
  },
  versionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  versionText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
  versionSubtext: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
});


