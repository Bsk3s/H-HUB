// Bundle analysis utility for identifying optimization opportunities
// Run this in development to identify large dependencies and unused imports

const BundleAnalyzer = {
  /**
   * Log information about large dependencies
   */
  logLargeDependencies() {
    if (!__DEV__) return;

    console.log('📦 Bundle Analysis - Large Dependencies:');
    
    // Common heavy libraries to watch out for
    const heavyLibraries = [
      'react-native-reanimated',
      'react-native-gesture-handler', 
      'react-native-webview',
      '@react-navigation/native',
      'react-native-svg',
      'expo-av',
      'expo-camera',
      'expo-image-picker',
    ];

    heavyLibraries.forEach(lib => {
      try {
        require.resolve(lib);
        console.log(`✅ ${lib} - included`);
      } catch (e) {
        console.log(`❌ ${lib} - not included`);
      }
    });
  },

  /**
   * Analyze component render performance
   */
  analyzeComponentPerformance(componentName, renderCount, props) {
    if (!__DEV__) return;

    const propsSize = JSON.stringify(props).length;
    
    if (renderCount > 10) {
      console.warn(`⚠️ ${componentName} has rendered ${renderCount} times`);
    }
    
    if (propsSize > 1000) {
      console.warn(`⚠️ ${componentName} has large props (${propsSize} chars)`);
    }
  },

  /**
   * Check for unused style objects
   */
  checkUnusedStyles(styles, usedStyleNames) {
    if (!__DEV__) return;

    const allStyleNames = Object.keys(styles);
    const unusedStyles = allStyleNames.filter(name => !usedStyleNames.includes(name));
    
    if (unusedStyles.length > 0) {
      console.warn(`🎨 Unused styles detected:`, unusedStyles);
    }
  },

  /**
   * Monitor memory usage patterns
   */
  trackMemoryUsage(context) {
    if (!__DEV__) return;

    const memoryInfo = {
      context,
      timestamp: Date.now(),
      // Rough memory estimation
      roughMemoryMB: process.memoryUsage ? (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) : 'unknown'
    };

    console.log('💾 Memory usage:', memoryInfo);
    return memoryInfo;
  },

  /**
   * Optimization recommendations
   */
  getOptimizationTips() {
    if (!__DEV__) return;

    const tips = [
      '🚀 Use React.memo for components that receive stable props',
      '🚀 Use useCallback for functions passed to child components',
      '🚀 Use useMemo for expensive calculations',
      '🚀 Implement FlatList virtualization for long lists',
      '🚀 Remove unused imports and dependencies',
      '🚀 Use Image caching for repeated images',
      '🚀 Implement lazy loading for heavy components',
      '🚀 Use AsyncStorage sparingly and batch operations',
    ];

    console.log('💡 Performance Optimization Tips:');
    tips.forEach(tip => console.log(tip));
  }
};

// Auto-run bundle analysis in development
// Disabled to reduce startup log spam
/*
if (__DEV__) {
  // Delay to avoid interfering with app startup
  setTimeout(() => {
    BundleAnalyzer.logLargeDependencies();
    BundleAnalyzer.getOptimizationTips();
  }, 3000);
}
*/

export default BundleAnalyzer;
