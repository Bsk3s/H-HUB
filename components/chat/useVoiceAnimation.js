import { useRef, useEffect } from 'react';

// Hook for voice animation values (placeholder for reanimated animations)
const useVoiceAnimation = (isListening) => {
  const blobScale = useRef(1);
  const glowOpacity = useRef(0.5);
  const particles = useRef([]);
  const particleOpacity = useRef(0);
  const particleScale = useRef(1);

  useEffect(() => {
    if (isListening) {
      blobScale.current = 1.2;
      glowOpacity.current = 0.8;
      particleOpacity.current = 1;
    } else {
      blobScale.current = 1;
      glowOpacity.current = 0.3;
      particleOpacity.current = 0;
    }
  }, [isListening]);

  return {
    blobScale: blobScale.current,
    glowOpacity: glowOpacity.current,
    particles: particles.current,
    particleOpacity: particleOpacity.current,
    particleScale: particleScale.current
  };
};

export default useVoiceAnimation;