import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const VoiceVisualization = ({ 
  activeAI, 
  isListening, 
  blobScale, 
  glowOpacity, 
  particles, 
  particleOpacity, 
  particleScale 
}) => {
  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={`${activeAI} voice interaction area. ${isListening ? 'Currently listening' : 'Not listening'}`}
    >
      {/* Background Glow */}
      <Animated.View 
        style={[
          styles.backgroundGlow,
          { opacity: glowOpacity, transform: [{ scale: 1 }] }
        ]}
        accessible={false}
      >
        <LinearGradient
          colors={activeAI === 'adina' 
            ? ['#fce7f3', '#f3e8ff']
            : ['#dbeafe', '#e0e7ff']
          }
          style={styles.gradientFull}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
      
      {/* Voice Visualization Blob */}
      <View style={styles.blobContainer}>
        {/* Outer Glow */}
        <Animated.View 
          style={[
            styles.outerGlow,
            { transform: [{ scale: blobScale }] }
          ]}
          accessible={false}
        >
          <LinearGradient
            colors={activeAI === 'adina' 
              ? ['rgba(251, 207, 232, 0.6)', 'rgba(233, 213, 255, 0.6)']
              : ['rgba(191, 219, 254, 0.6)', 'rgba(199, 210, 254, 0.6)']
            }
            style={styles.gradientFull}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        
        {/* Main Blob */}
        <Animated.View 
          style={[
            styles.mainBlob,
            { transform: [{ scale: Animated.multiply(blobScale, 0.95) }] }
          ]}
          accessible={false}
        >
          <LinearGradient
            colors={activeAI === 'adina' 
              ? ['rgba(251, 207, 232, 0.9)', 'rgba(233, 213, 255, 0.9)']
              : ['rgba(191, 219, 254, 0.9)', 'rgba(199, 210, 254, 0.9)']
            }
            style={styles.gradientFull}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Inner Details */}
          <View style={styles.innerDetail} />
        </Animated.View>

        {/* Floating Particles - only when listening */}
        {isListening && particles.map((particle, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: activeAI === 'adina' ? 'rgba(244, 114, 182, 0.8)' : 'rgba(96, 165, 250, 0.8)',
                opacity: particleOpacity[i],
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particleScale[i] }
                ],
                top: '50%',
                left: '50%',
                marginLeft: -4,
                marginTop: -4
              }
            ]}
            accessible={false}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
  },
  gradientFull: {
    width: '100%',
    height: '100%',
    borderRadius: 128,
  },
  blobContainer: {
    position: 'relative',
    width: 144,
    height: 144,
  },
  outerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 72,
  },
  mainBlob: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 72,
  },
  innerDetail: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 60,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default VoiceVisualization;
