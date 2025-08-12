/**
 * WebRTC TurboModule Compatibility Layer
 * Fixes promise handling issues between React Native WebRTC and TurboModules
 */

/**
 * Wrap WebRTC methods to handle TurboModule promise conversion issues
 */
export const setupWebRTCCompatibility = () => {
  console.log('🔧 Setting up WebRTC TurboModule compatibility...');
  
  if (typeof global.RTCPeerConnection === 'undefined') {
    console.warn('⚠️ RTCPeerConnection not found, skipping compatibility setup');
    return false;
  }

  try {
    const OriginalRTCPeerConnection = global.RTCPeerConnection;
    
    // Create wrapper class to handle promise issues
    class CompatibleRTCPeerConnection extends OriginalRTCPeerConnection {
      constructor(...args) {
        super(...args);
        console.log('📡 Creating compatible RTCPeerConnection instance');
      }

      // Override setRemoteDescription to handle promise conversion
      setRemoteDescription(description) {
        return new Promise((resolve, reject) => {
          try {
            // Use the original method but wrap in our own promise
            const result = super.setRemoteDescription(description);
            
            if (result && typeof result.then === 'function') {
              // If it returns a promise, use it
              result.then(resolve).catch(reject);
            } else {
              // If it doesn't return a promise, resolve immediately
              resolve(result);
            }
          } catch (error) {
            console.error('❌ setRemoteDescription error:', error);
            reject(error);
          }
        });
      }

      // Override setLocalDescription to handle promise conversion
      setLocalDescription(description) {
        return new Promise((resolve, reject) => {
          try {
            const result = super.setLocalDescription(description);
            
            if (result && typeof result.then === 'function') {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            console.error('❌ setLocalDescription error:', error);
            reject(error);
          }
        });
      }

      // Override addIceCandidate to handle promise conversion
      addIceCandidate(candidate) {
        return new Promise((resolve, reject) => {
          try {
            const result = super.addIceCandidate(candidate);
            
            if (result && typeof result.then === 'function') {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            console.error('❌ addIceCandidate error:', error);
            reject(error);
          }
        });
      }
    }

    // Replace the global RTCPeerConnection with our compatible version
    global.RTCPeerConnection = CompatibleRTCPeerConnection;
    
    console.log('✅ WebRTC TurboModule compatibility layer installed');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to setup WebRTC compatibility:', error);
    return false;
  }
};

/**
 * Alternative compatibility approach - disable TurboModule for WebRTC
 */
export const disableTurboModuleForWebRTC = () => {
  console.log('🔧 Disabling TurboModule for WebRTC compatibility...');
  
  try {
    // Set React Native to use old architecture for WebRTC
    if (global.__turboModuleProxy) {
      console.log('🔄 TurboModule proxy detected, applying compatibility mode');
      
      // Store original proxy
      global.__originalTurboModuleProxy = global.__turboModuleProxy;
      
      // Temporarily disable for WebRTC operations
      global.__turboModuleProxy = undefined;
      
      // Re-enable after a delay (this is a hack, but may work)
      setTimeout(() => {
        if (global.__originalTurboModuleProxy) {
          global.__turboModuleProxy = global.__originalTurboModuleProxy;
          console.log('🔄 TurboModule proxy restored');
        }
      }, 5000);
      
      console.log('✅ TurboModule temporarily disabled for WebRTC');
      return true;
    }
    
    console.log('ℹ️ No TurboModule proxy found');
    return false;
    
  } catch (error) {
    console.error('❌ Failed to disable TurboModule for WebRTC:', error);
    return false;
  }
};

/**
 * Run all compatibility fixes
 */
export const applyAllWebRTCCompatibilityFixes = () => {
  console.log('🚀 Applying all WebRTC compatibility fixes...');
  
  const results = {
    compatibilityLayer: setupWebRTCCompatibility(),
    turboModuleDisabled: disableTurboModuleForWebRTC()
  };
  
  const success = Object.values(results).some(Boolean);
  
  console.log('📊 WebRTC Compatibility Results:', results);
  console.log(success ? '✅ WebRTC compatibility applied' : '❌ WebRTC compatibility failed');
  
  return { success, results };
};

export default {
  setupWebRTCCompatibility,
  disableTurboModuleForWebRTC,
  applyAllWebRTCCompatibilityFixes
}; 