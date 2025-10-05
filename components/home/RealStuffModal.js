import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  StyleSheet,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Heart, MessageCircle, Star, BookOpen, Edit3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import PrayerModal from './PrayerModal';
import JournalEditor from '../journal/JournalEditor';
import { getJournalByCardId } from '../../services/journalService';

const { height, width } = Dimensions.get('window');

const RealStuffModal = ({ card, isVisible, onClose, onSave, onShare, onCTA, onNavigateToBible, onSaveJournal, onViewJournal }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Cinematic entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations and button state for next time
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      backgroundOpacityAnim.setValue(0);
      setPressedAction(null); // Reset button state when modal closes
      setIsNavigating(false); // Reset navigation state
    }
  }, [isVisible]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Cinematic exit
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Declare ALL state hooks BEFORE any early returns
  const [pressedAction, setPressedAction] = useState(null);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showJournalEditor, setShowJournalEditor] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isNewReflection, setIsNewReflection] = useState(false);
  const [existingJournal, setExistingJournal] = useState(null);

  if (!card) return null;

  const getGradientColors = () => {
    switch (card.color) {
      case 'indigo':
        return ['#a5b4fc', '#8b5cf6', '#6366f1'];
      case 'rose':
        return ['#fda4af', '#f472b6', '#fdba74'];
      case 'teal':
        return ['#7dd3fc', '#06b6d4', '#67e8f9'];
      case 'clay':
        return ['#fdba74', '#f472b6', '#fda4af'];
      default:
        return ['#cbd5e1', '#94a3b8', '#64748b'];
    }
  };

  const getPillarEmoji = () => {
    // Handle story objects (which have emoji property)
    if (card.emoji) {
      return card.emoji;
    }

    // Handle Real Stuff cards (which have pillar property)
    switch (card.pillar) {
      case 'Faith':
        return '✝️';
      case 'Love':
        return '💕';
      case 'Relationships':
        return '🤝';
      case 'Lust':
        return '🔥';
      default:
        return '✝️';
    }
  };

  const handleAction = async (action) => {
    // Visual feedback
    setPressedAction(action);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    console.log('Action pressed:', action);

    if (action.includes('Read the full passage')) {
      // Navigate to Bible with specific verse/passage
      console.log('Navigate to Bible:', card.scriptureRef);
      if (onNavigateToBible && card.scriptureRef) {
        setIsNavigating(true);
        // Brief delay for visual feedback, then navigate
        setTimeout(() => {
          onNavigateToBible(card.scriptureRef);
          setIsNavigating(false);
        }, 300);
      }
    } else if (action.includes('Pray this verse')) {
      // Open guided prayer with this specific verse
      console.log('Start guided prayer with:', card.scripture);
      setShowPrayerModal(true);
    } else if (action.includes('Journal about this')) {
      // Check if journal already exists for this card
      console.log('Checking for existing journal for card:', card.id);
      const existing = await getJournalByCardId(card.id);

      if (existing) {
        // Journal exists - show options
        const reflectionCount = existing.reflections?.length || 1;
        const lastDate = new Date(existing.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        Alert.alert(
          'Journal Exists',
          `You journaled about this ${lastDate}${reflectionCount > 1 ? ` (${reflectionCount} reflections)` : ''}.\n\nWhat would you like to do?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'View Journal',
              onPress: () => {
                console.log('📖 View Journal pressed:', existing.id);
                if (onViewJournal) {
                  onViewJournal(existing);
                }
              }
            },
            {
              text: 'Add Reflection',
              onPress: () => {
                setExistingJournal(existing);
                setIsNewReflection(true);
                setShowJournalEditor(true);
              }
            }
          ]
        );
      } else {
        // No existing journal - open fresh editor
        console.log('Open journal for:', card.title);
        setIsNewReflection(false);
        setExistingJournal(null);
        setShowJournalEditor(true);
      }
    }
  };

  const getActionIcon = (action, isPrimary = false) => {
    const iconColor = isPrimary ? 'white' : '#6b7280';

    if (action.includes('Read the full passage')) {
      return <BookOpen size={18} color={iconColor} />;
    } else if (action.includes('Pray this verse')) {
      return <Heart size={18} color={iconColor} />;
    } else if (action.includes('Journal about this')) {
      return <Edit3 size={18} color={iconColor} />;
    } else {
      return <Star size={18} color={iconColor} />;
    }
  };

  return (
    <Modal
      animationType="none" // We handle animations ourselves
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />

      {/* Cinematic Background Blur */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backgroundOpacityAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Cinematic Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={styles.gradientContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.pillarBadge}>
              <Text style={styles.pillarEmoji}>
                {getPillarEmoji()}
              </Text>
              <Text style={styles.pillarText}>
                {card.pillar?.toUpperCase() || 'STORY'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {card.title}
            </Text>
            <Text style={styles.subtext}>
              {card.subtext}
            </Text>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Scripture Section */}
          {card.scripture && (
            <View style={styles.scriptureSection}>
              <Text style={styles.sectionLabel}>SCRIPTURE</Text>
              <View style={styles.scriptureBox}>
                <Text style={styles.scriptureText}>
                  "{card.scripture}"
                </Text>
                <Text style={styles.scriptureRef}>
                  — {card.scriptureRef}
                </Text>
              </View>
            </View>
          )}

          {/* Reflection Section */}
          {card.reflection && (
            <View style={styles.reflectionSection}>
              <Text style={styles.sectionLabel}>REFLECTION</Text>
              <Text style={styles.reflectionText}>
                {card.reflection}
              </Text>
            </View>
          )}

          {/* Actions Section */}
          {card.actions && (
            <View style={styles.actionsSection}>
              <Text style={styles.sectionLabel}>TAKE ACTION</Text>
              <View style={styles.actionButtons}>
                {card.actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleAction(action)}
                    style={[
                      styles.actionButton,
                      index === 0 && styles.primaryActionButton,
                      pressedAction === action && styles.pressedActionButton,
                      isNavigating && action.includes('Read the full passage') && styles.navigatingButton
                    ]}
                  >
                    <View style={styles.actionButtonContent}>
                      {getActionIcon(action, index === 0)}
                      <Text style={[
                        styles.actionButtonText,
                        index === 0 && styles.primaryActionButtonText
                      ]}>
                        {action}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity onPress={onSave} style={styles.bottomButton}>
              <Text style={styles.bottomButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onShare} style={styles.bottomButton}>
              <Text style={styles.bottomButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Prayer Modal */}
      <PrayerModal
        card={card}
        isVisible={showPrayerModal}
        onClose={() => setShowPrayerModal(false)}
      />

      {/* Journal Editor */}
      <JournalEditor
        isVisible={showJournalEditor}
        onClose={() => setShowJournalEditor(false)}
        onSave={onSaveJournal}
        cardData={card}
        isNewReflection={isNewReflection}
        existingJournal={existingJournal}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 60,
    borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
    overflow: 'hidden',
  },
  gradientContainer: {
    paddingTop: 50, // Account for status bar
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pillarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarEmoji: {
    color: 'white',
    fontSize: 20,
    marginRight: 12,
  },
  pillarText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    padding: 10,
  },
  titleSection: {
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  scriptureSection: {
    marginBottom: 32,
  },
  scriptureBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 24,
  },
  scriptureText: {
    color: '#111827',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  scriptureRef: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  reflectionSection: {
    marginBottom: 32,
  },
  reflectionText: {
    color: '#374151',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
  },
  primaryActionButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryActionButtonText: {
    color: 'white',
  },
  pressedActionButton: {
    transform: [{ scale: 0.95 }],
    opacity: 0.7,
  },
  navigatingButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  bottomButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RealStuffModal;