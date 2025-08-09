import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const VoiceVisualization = ({ 
  activeAI, 
  isListening,
  isConnected = false,
  isPlaying = false,
  isProcessing = false,
  voiceLevel = 0,
  blobScale,
  glowOpacity,
  particles,
  particleOpacity,
  particleScale
}) => {
  // Animation state logic based on conversation flow
  const getAnimationState = () => {
    if (!isConnected) {
      return 'idle'; // Static base glow
    }
    if (isListening && !isPlaying) {
      return 'userSpeaking'; // COMPLETELY STILL - AI listening
    }
    if (isPlaying) {
      return 'aiSpeaking'; // FULL ANIMATION - AI responding
    }
    if (isProcessing) {
      return 'thinking'; // Gentle thinking animation
    }
    return 'ready'; // Connected but quiet - subtle breathing
  };

  const animationState = getAnimationState();
  
  // Calculate animation intensity based on state
  const getAnimationIntensity = () => {
    switch (animationState) {
      case 'idle': return 0.3; // Minimal
      case 'userSpeaking': return 0; // ZERO - completely still
      case 'aiSpeaking': return 1.0 + (voiceLevel * 0.5); // Maximum + voice level
      case 'thinking': return 0.5; // Moderate
      case 'ready': return 0.4; // Gentle breathing
      default: return 0.3;
    }
  };

  const intensity = getAnimationIntensity();
  
  // Override animations based on state
  const shouldAnimate = animationState !== 'userSpeaking';
  const scaleValue = shouldAnimate ? blobScale : new Animated.Value(1);
  const opacityValue = shouldAnimate ? glowOpacity : new Animated.Value(intensity);

  return (
    <View style={styles.container}>
      {/* DEBUG: Show current state */}
      {/* <Text style={{position: 'absolute', top: 10, left: 10, fontSize: 10, color: 'red'}}>
        {animationState} - {intensity.toFixed(2)}
      </Text> */}
      
      {/* LAYER 1: Far Background Glow */}
      <Animated.View 
        style={[
          styles.farGlow,
          { 
            opacity: Animated.multiply(opacityValue, 0.3),
            transform: [{ scale: Animated.multiply(scaleValue, 1.8) }]
          }
        ]}
      >
        <LinearGradient
          colors={activeAI === 'adina' 
            ? ['rgba(236, 72, 153, 0.15)', 'rgba(168, 85, 247, 0.15)', 'rgba(244, 114, 182, 0.1)']
            : ['rgba(59, 130, 246, 0.15)', 'rgba(99, 102, 241, 0.15)', 'rgba(147, 197, 253, 0.1)']
          }
          style={styles.gradientFull}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* LAYER 2: Medium Background Glow */}
      <Animated.View 
        style={[
          styles.mediumGlow,
          { 
            opacity: Animated.multiply(glowOpacity, 0.5),
            transform: [{ scale: Animated.multiply(blobScale, 1.4) }]
          }
        ]}
      >
        <LinearGradient
          colors={activeAI === 'adina' 
            ? ['rgba(251, 207, 232, 0.4)', 'rgba(233, 213, 255, 0.4)', 'rgba(248, 180, 225, 0.3)']
            : ['rgba(191, 219, 254, 0.4)', 'rgba(199, 210, 254, 0.4)', 'rgba(147, 197, 253, 0.3)']
          }
          style={styles.gradientFull}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* LAYER 3: Close Glow */}
      <Animated.View 
        style={[
          styles.closeGlow,
          { 
            opacity: Animated.multiply(glowOpacity, 0.7),
            transform: [{ scale: Animated.multiply(blobScale, 1.1) }]
          }
        ]}
      >
        <LinearGradient
          colors={activeAI === 'adina' 
            ? ['rgba(251, 207, 232, 0.6)', 'rgba(244, 144, 215, 0.7)', 'rgba(233, 213, 255, 0.6)']
            : ['rgba(191, 219, 254, 0.6)', 'rgba(147, 197, 253, 0.7)', 'rgba(199, 210, 254, 0.6)']
          }
          style={styles.gradientFull}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* LAYER 4: Main Blob with Premium Depth */}
      <Animated.View 
        style={[
          styles.mainBlob,
          { 
            transform: [{ scale: blobScale }],
            shadowOpacity: Animated.multiply(glowOpacity, 0.4),
          }
        ]}
      >
        <LinearGradient
          colors={activeAI === 'adina' 
            ? [
                'rgba(251, 207, 232, 0.95)', 
                'rgba(248, 180, 225, 0.9)', 
                'rgba(244, 144, 215, 0.85)',
                'rgba(233, 213, 255, 0.9)'
              ]
            : [
                'rgba(191, 219, 254, 0.95)', 
                'rgba(147, 197, 253, 0.9)', 
                'rgba(96, 165, 250, 0.85)',
                'rgba(199, 210, 254, 0.9)'
              ]
          }
          style={styles.gradientFull}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Inner Highlight */}
        <View style={styles.innerHighlight}>
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.6)', 
              'rgba(255, 255, 255, 0.3)', 
              'rgba(255, 255, 255, 0.1)', 
              'rgba(255, 255, 255, 0)'
            ]}
            style={styles.gradientFull}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      </Animated.View>

      {/* LAYER 5: Floating Particles - Enhanced */}
      {isListening && particles && particles.map((particle, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: activeAI === 'adina' 
                ? 'rgba(244, 114, 182, 0.9)' 
                : 'rgba(147, 197, 253, 0.9)',
              opacity: particleOpacity[i],
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particleScale[i] }
              ],
              top: '50%',
              left: '50%',
              marginLeft: -6,
              marginTop: -6,
              shadowColor: activeAI === 'adina' ? '#ec4899' : '#3b82f6',
              shadowOpacity: 0.6,
              shadowRadius: 8,
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    // Fill the unified voice area completely
  },
  
  // GLOW LAYERS
  farGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  mediumGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  closeGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  
  // MAIN BLOB
  mainBlob: {
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
  },
  
  // INNER HIGHLIGHT
  innerHighlight: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 80,
    overflow: 'hidden',
  },
  
  // PARTICLES
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    elevation: 8,
  },
  
  // GRADIENT HELPER
  gradientFull: {
    width: '100%',
    height: '100%',
    borderRadius: 200, // Large enough for all cases
  },
});

export default VoiceVisualization;