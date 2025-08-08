import { useRef, useEffect } from 'react';
import { Animated, AccessibilityInfo } from 'react-native';

const useVoiceAnimation = (isListening) => {
  // Animation values
  const blobScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const particles = useRef([
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 })
  ]).current;
  const particleOpacity = useRef([
    new Animated.Value(0.2),
    new Animated.Value(0.2),
    new Animated.Value(0.2)
  ]).current;
  const particleScale = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1)
  ]).current;

  // Announce listening state changes for screen readers
  useEffect(() => {
    if (AccessibilityInfo.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(
        isListening ? "Listening started" : "Listening stopped"
      );
    }
  }, [isListening]);

  // Start/Stop animations based on listening state
  useEffect(() => {
    if (isListening) {
      // Continuous pulsating blob animation (like AI is talking)
      const pulsateAnimation = () => {
        Animated.sequence([
          Animated.spring(blobScale, {
            toValue: 1.15,
            friction: 4,
            tension: 50,
            useNativeDriver: true
          }),
          Animated.spring(blobScale, {
            toValue: 1.05,
            friction: 4,
            tension: 50,
            useNativeDriver: true
          })
        ]).start(() => {
          // Loop the pulsation continuously
          if (isListening) {
            pulsateAnimation();
          }
        });
      };
      
      // Start pulsating
      pulsateAnimation();
      
      // Enhanced glow effect (stronger for film)
      const glowAnimation = () => {
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 1200,
            useNativeDriver: true
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true
          })
        ]).start(() => {
          // Loop the glow continuously
          if (isListening) {
            glowAnimation();
          }
        });
      };
      
      // Start glowing
      glowAnimation();
      
      // Enhanced floating particles (more active)
      particles.forEach((particle, index) => {
        const animateParticle = () => {
          const randomX = (Math.random() - 0.5) * 80; // Wider range
          const randomY = -30 - Math.random() * 40; // Higher float
          
          // Reset position
          particle.setValue({ x: 0, y: 0 });
          particleOpacity[index].setValue(0.3);
          particleScale[index].setValue(0.8);
          
          // Create enhanced animation sequence
          Animated.sequence([
            Animated.delay(index * 200), // Faster succession
            Animated.parallel([
              Animated.timing(particle, {
                toValue: { x: randomX, y: randomY },
                duration: 2000, // Slightly faster
                useNativeDriver: true
              }),
              Animated.timing(particleOpacity[index], {
                toValue: 1, // More visible
                duration: 1000,
                useNativeDriver: true
              }),
              Animated.timing(particleScale[index], {
                toValue: 1.5, // Bigger particles
                duration: 1000,
                useNativeDriver: true
              }),
              Animated.timing(particleOpacity[index], {
                toValue: 0.2,
                duration: 1000,
                delay: 1000,
                useNativeDriver: true
              }),
              Animated.timing(particleScale[index], {
                toValue: 0.8,
                duration: 1000,
                delay: 1000,
                useNativeDriver: true
              })
            ])
          ]).start(() => {
            // Continuously loop particles
            if (isListening) {
              animateParticle();
            }
          });
        };
        
        // Start particle animation
        animateParticle();
      });
    } else {
      // Reset animations
      Animated.spring(blobScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true
      }).start();
      
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true
      }).start();
    }
  }, [isListening]);

  return {
    blobScale,
    glowOpacity,
    particles,
    particleOpacity,
    particleScale
  };
};

export default useVoiceAnimation;
