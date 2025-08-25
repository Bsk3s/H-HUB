import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Heart, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { height, width } = Dimensions.get('window');

const PrayerModal = ({ card, isVisible, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  
  const [prayerStep, setPrayerStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Reset prayer state when modal opens
      setPrayerStep(0);
      setIsCompleted(false);
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const getGradientColors = () => {
    return ['#7c3aed', '#a855f7', '#c084fc']; // Purple gradient for prayer
  };

  const prayerSteps = [
    {
      title: "Take a moment to center yourself",
      content: "Find a quiet space. Take three deep breaths. God is present with you right now.",
      duration: "Take your time"
    },
    {
      title: "Reflect on this verse",
      content: card?.scripture || "Be still and know that I am God.",
      scriptureRef: card?.scriptureRef,
      duration: "Read slowly"
    },
    {
      title: "Open your heart to God",
      content: "Share what's on your mind. Talk to God about how this verse speaks to your situation. He's listening.",
      duration: "Speak freely"
    },
    {
      title: "Listen in the quiet",
      content: "Rest in God's presence. Sometimes He speaks in the silence. Let His peace wash over you.",
      duration: "Be still"
    }
  ];

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (prayerStep < prayerSteps.length - 1) {
      setPrayerStep(prayerStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const currentStep = prayerSteps[prayerStep];

  if (!card) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backgroundOpacityAnim }
        ]}
      />

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={getGradientColors()}
          style={styles.header}
        >
          {/* Close button */}
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={20} color="white" />
          </TouchableOpacity>

          {/* Header content */}
          <View style={styles.headerContent}>
            <View style={styles.pillarBadge}>
              <Heart size={16} color="white" />
              <Text style={styles.pillarText}>PRAYER</Text>
            </View>
            
            <Text style={styles.title}>
              Pray with {card.scriptureRef}
            </Text>
            
            <Text style={styles.subtitle}>
              A guided moment with God
            </Text>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {prayerSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= prayerStep && styles.progressDotActive
                ]}
              />
            ))}
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            
            {!isCompleted ? (
              <>
                {/* Step content */}
                <View style={styles.stepSection}>
                  <Text style={styles.stepTitle}>{currentStep.title}</Text>
                  
                  <Text style={styles.stepContent}>{currentStep.content}</Text>
                  
                  {currentStep.scriptureRef && (
                    <View style={styles.scriptureBox}>
                      <Text style={styles.scriptureText}>
                        "{currentStep.content}"
                      </Text>
                      <Text style={styles.scriptureRef}>
                        {currentStep.scriptureRef}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.durationHint}>
                    <Clock size={16} color="#9ca3af" />
                    <Text style={styles.durationText}>{currentStep.duration}</Text>
                  </View>
                </View>

                {/* Next button */}
                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>
                    {prayerStep === prayerSteps.length - 1 ? 'Amen' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Completion screen */
              <View style={styles.completionSection}>
                <View style={styles.completionIcon}>
                  <Heart size={48} color="#7c3aed" />
                </View>
                
                <Text style={styles.completionTitle}>Prayer Complete</Text>
                
                <Text style={styles.completionText}>
                  You've spent time with God. He has heard your heart and is working in your life, even when you can't see it.
                </Text>
                
                <TouchableOpacity onPress={handleClose} style={styles.closeButtonFinal}>
                  <Text style={styles.closeButtonFinalText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    bottom: 100,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    padding: 10,
    alignSelf: 'flex-end',
  },
  headerContent: {
    marginTop: 16,
  },
  pillarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pillarText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  stepSection: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 20,
    fontWeight: '400',
  },
  scriptureBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderColor: '#7c3aed',
    paddingLeft: 20,
    paddingVertical: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  scriptureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  scriptureRef: {
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: 14,
  },
  durationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    color: '#9ca3af',
    fontSize: 14,
    fontStyle: 'italic',
  },
  nextButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completionSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  completionIcon: {
    backgroundColor: '#f3f4f6',
    borderRadius: 50,
    padding: 24,
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  completionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
  },
  closeButtonFinal: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  closeButtonFinalText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrayerModal;


