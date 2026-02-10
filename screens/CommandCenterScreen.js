import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useAuth } from '../src/auth/context';
import { supabase } from '../src/auth/supabase-client';

// Quick notification templates
const TEMPLATES = [
  {
    id: 'benefit',
    emoji: '✨',
    label: 'Benefit',
    title: 'Try Heavenly Hub Free',
    body: 'We just opened free trials — even one conversation could shift your day.',
  },
  {
    id: 'emotional',
    emoji: '💜',
    label: 'Emotional',
    title: 'You Are Not Alone',
    body: 'Whatever you\'re carrying today, bring it to a conversation. God is listening.',
  },
  {
    id: 'support',
    emoji: '🤗',
    label: 'Support',
    title: 'Need Prayer Today?',
    body: 'Open Heavenly Hub and let\'s pray together. Your prayer journal is waiting.',
  },
  {
    id: 'welcome',
    emoji: '👋',
    label: 'Welcome',
    title: 'Welcome to Heavenly Hub',
    body: 'Your spiritual journey starts here. Explore devotions, prayer, and more.',
  },
  {
    id: 'streak',
    emoji: '🔥',
    label: 'Streak',
    title: 'Keep Your Streak Alive!',
    body: 'Don\'t break your streak — open the app for just 2 minutes today.',
  },
];

// Audience options
const AUDIENCES = [
  { id: 'non_convert', label: 'Non-Convert' },
  { id: 'premium', label: 'Premium' },
  { id: 'all', label: 'All Users' },
];

export default function CommandCenterScreen({ navigation }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [excludeRecent, setExcludeRecent] = useState(true);
  const [targetCount, setTargetCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Audience counts
  const [audienceCounts, setAudienceCounts] = useState({
    all: 0,
    premium: 0,
    non_convert: 0,
  });

  // Fetch audience counts on mount
  useEffect(() => {
    fetchAudienceCounts();
  }, []);

  // Update target count when audience or exclude toggle changes
  useEffect(() => {
    updateTargetCount();
  }, [selectedAudience, excludeRecent, audienceCounts]);

  const fetchAudienceCounts = async () => {
    try {
      setLoading(true);

      // Count all users with linked push tokens
      const { count: allCount } = await supabase
        .from('push_tokens')
        .select('*', { count: 'exact', head: true })
        .not('user_id', 'is', null);

      // Count premium users with tokens
      const { data: premiumTokens } = await supabase
        .from('push_tokens')
        .select('user_id')
        .not('user_id', 'is', null);

      let premiumCount = 0;
      let nonConvertCount = 0;

      if (premiumTokens && premiumTokens.length > 0) {
        const userIds = premiumTokens.map(t => t.user_id).filter(Boolean);

        if (userIds.length > 0) {
          const { count: pCount } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .in('id', userIds)
            .eq('has_premium_access', true);

          premiumCount = pCount || 0;
          nonConvertCount = (allCount || 0) - premiumCount;
        }
      }

      setAudienceCounts({
        all: allCount || 0,
        premium: premiumCount,
        non_convert: nonConvertCount,
      });
    } catch (error) {
      console.error('Error fetching audience counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTargetCount = useCallback(async () => {
    let count = audienceCounts[selectedAudience] || 0;

    if (excludeRecent && count > 0) {
      try {
        // Count tokens notified in last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { count: recentCount } = await supabase
          .from('push_tokens')
          .select('*', { count: 'exact', head: true })
          .not('user_id', 'is', null)
          .gte('last_notification_sent_at', twentyFourHoursAgo);

        count = Math.max(0, count - (recentCount || 0));
      } catch (error) {
        console.error('Error counting recent notifications:', error);
      }
    }

    setTargetCount(count);
  }, [selectedAudience, excludeRecent, audienceCounts]);

  const applyTemplate = (template) => {
    setTitle(template.title);
    setBody(template.body);
  };

  const handleRelease = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing Content', 'Please enter a title and message.');
      return;
    }

    if (targetCount === 0) {
      Alert.alert('No Audience', 'No users to send to. Check your audience selection.');
      return;
    }

    Alert.alert(
      'Send Notification',
      `Send "${title}" to ${targetCount} users?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release',
          onPress: async () => {
            await sendNotification();
          },
        },
      ]
    );
  };

  const sendNotification = async () => {
    setSending(true);

    try {
      // Build the target based on audience selection
      let target = 'all';

      if (selectedAudience === 'premium' || selectedAudience === 'non_convert') {
        // Get user IDs for the selected audience
        const { data: tokens } = await supabase
          .from('push_tokens')
          .select('user_id')
          .not('user_id', 'is', null);

        if (tokens && tokens.length > 0) {
          const userIds = tokens.map(t => t.user_id).filter(Boolean);

          if (selectedAudience === 'premium') {
            const { data: premiumUsers } = await supabase
              .from('user_profiles')
              .select('id')
              .in('id', userIds)
              .eq('has_premium_access', true);

            target = premiumUsers ? premiumUsers.map(u => u.id) : [];
          } else {
            // non_convert = users without premium
            const { data: freeUsers } = await supabase
              .from('user_profiles')
              .select('id')
              .in('id', userIds)
              .eq('has_premium_access', false);

            target = freeUsers ? freeUsers.map(u => u.id) : [];
          }
        } else {
          target = [];
        }
      }

      // Generate a campaign ID for tracking
      const campaignId = `manual-${Date.now()}`;

      // Call the Edge Function
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ocmhylirrfijyosxwtph.supabase.co'}/functions/v1/send-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            target,
            title: title.trim(),
            body: body.trim(),
            campaign_id: campaignId,
            data: {
              source: 'command_center',
              audience: selectedAudience,
              sent_by: user?.email || 'admin',
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Sent!',
          `Notification delivered.\n\nTokens targeted: ${result.total_tokens}\nSuccessful: ${result.success}\nFailed: ${result.errors}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTitle('');
                setBody('');
                fetchAudienceCounts(); // Refresh counts
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send notification.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Command Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Templates */}
        <Text style={styles.sectionLabel}>QUICK TEMPLATES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.templateRow}
          contentContainerStyle={styles.templateRowContent}
        >
          {TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateButton}
              onPress={() => applyTemplate(template)}
            >
              <View style={[styles.templateCircle, title === template.title && styles.templateCircleActive]}>
                <Text style={styles.templateEmoji}>{template.emoji}</Text>
              </View>
              <Text style={styles.templateLabel}>{template.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Compose Section */}
        <Text style={styles.sectionLabel}>COMPOSE</Text>
        <View style={styles.composeCard}>
          <TextInput
            style={styles.titleInput}
            placeholder="Notification Title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            maxLength={65}
          />
          <TextInput
            style={styles.bodyInput}
            placeholder="Write your message here..."
            placeholderTextColor="#9CA3AF"
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={3}
            maxLength={240}
          />

          {/* Preview */}
          {(title.trim() || body.trim()) ? (
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewAppIcon} />
                <Text style={styles.previewAppName}>HEAVENLY HUB</Text>
                <Text style={styles.previewTime}>now</Text>
              </View>
              <Text style={styles.previewTitle}>{title || 'Title'}</Text>
              <Text style={styles.previewBody} numberOfLines={2}>
                {body || 'Message body'}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Target Audience */}
        <Text style={styles.sectionLabel}>TARGET AUDIENCE</Text>
        <View style={styles.audienceCard}>
          <View style={styles.audienceRow}>
            {AUDIENCES.map((audience) => (
              <TouchableOpacity
                key={audience.id}
                style={[
                  styles.audienceButton,
                  selectedAudience === audience.id && styles.audienceButtonActive,
                ]}
                onPress={() => setSelectedAudience(audience.id)}
              >
                <Text
                  style={[
                    styles.audienceButtonText,
                    selectedAudience === audience.id && styles.audienceButtonTextActive,
                  ]}
                >
                  {audience.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exclude recently notified */}
          <View style={styles.excludeRow}>
            <Text style={styles.excludeLabel}>Exclude recently notified (24h)</Text>
            <Switch
              value={excludeRecent}
              onValueChange={setExcludeRecent}
              trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Target count */}
          <View style={styles.targetCountContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              <Text style={styles.targetCountText}>
                Targeting {targetCount} users
              </Text>
            )}
          </View>
        </View>

        {/* Release Button */}
        <TouchableOpacity
          style={[styles.releaseButton, sending && styles.releaseButtonDisabled]}
          onPress={handleRelease}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Send size={20} color="#FFFFFF" style={styles.releaseIcon} />
              <Text style={styles.releaseButtonText}>Release</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 12,
  },

  // Templates
  templateRow: {
    marginBottom: 8,
  },
  templateRowContent: {
    gap: 16,
    paddingRight: 16,
  },
  templateButton: {
    alignItems: 'center',
    width: 64,
  },
  templateCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  templateCircleActive: {
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  templateEmoji: {
    fontSize: 24,
  },
  templateLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Compose
  composeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    padding: 0,
  },
  bodyInput: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    padding: 0,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewAppIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: '#111827',
    marginRight: 8,
  },
  previewAppName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  previewTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  previewBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 19,
  },

  // Audience
  audienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  audienceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  audienceButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  audienceButtonActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  audienceButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  audienceButtonTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  excludeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  excludeLabel: {
    fontSize: 15,
    color: '#374151',
  },
  targetCountContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  targetCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Release Button
  releaseButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  releaseButtonDisabled: {
    opacity: 0.6,
  },
  releaseIcon: {
    marginRight: 8,
  },
  releaseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
