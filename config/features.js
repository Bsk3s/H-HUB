/**
 * Feature Flags for Heavenly Hub Migration
 * 
 * This system allows granular control over HB1 features during migration.
 * LiveKit voice capabilities are protected by keeping all HB1 features disabled initially.
 */

export const FEATURES = {
  // === CORE HB1 MODULES ===
  ENABLE_BIBLE_READER: false,
  ENABLE_STUDY_SYSTEM: false,
  ENABLE_CALENDAR: false,
  ENABLE_AI_CHAT: false,
  
  // === AUTHENTICATION ===
  ENABLE_SUPABASE_AUTH: false,
  ENABLE_GOOGLE_SIGNIN: false,
  ENABLE_APPLE_SIGNIN: false,
  ENABLE_GUEST_MODE: false,
  
  // === UI COMPONENTS ===
  ENABLE_CUSTOM_HEADER: false,
  ENABLE_BOTTOM_TAB_BAR: false,
  ENABLE_SPLASH_SCREEN: false,
  ENABLE_LOADING_STATES: false,
  
  // === BIBLE FEATURES ===
  ENABLE_VERSE_HIGHLIGHTING: false,
  ENABLE_BOOKMARKS: false,
  ENABLE_VERSE_SHARING: false,
  ENABLE_READING_PLANS: false,
  ENABLE_CROSS_REFERENCES: false,
  
  // === STUDY FEATURES ===
  ENABLE_NOTE_TAKING: false,
  ENABLE_STUDY_GROUPS: false,
  ENABLE_PRAYER_JOURNAL: false,
  ENABLE_DEVOTIONALS: false,
  
  // === SOCIAL FEATURES ===
  ENABLE_USER_PROFILES: false,
  ENABLE_COMMUNITY: false,
  ENABLE_FRIEND_SYSTEM: false,
  ENABLE_ACTIVITY_FEED: false,
  
  // === ADVANCED FEATURES ===
  ENABLE_OFFLINE_MODE: false,
  ENABLE_SYNC: false,
  ENABLE_PUSH_NOTIFICATIONS: false,
  ENABLE_ANALYTICS: false,
  
  // === MEDIA FEATURES ===
  ENABLE_AUDIO_BIBLE: false,
  ENABLE_PODCASTS: false,
  ENABLE_MUSIC: false,
  ENABLE_VIDEO_CONTENT: false,
  
  // === DEVELOPMENT & DEBUG ===
  ENABLE_DEBUG_MODE: typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production',
  ENABLE_PERFORMANCE_MONITORING: typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production',
  ENABLE_FEATURE_LOGGING: typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production',
  ENABLE_DEV_TOOLS: typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production',
  
  // === LIVEKIT PROTECTION ===
  // These flags ensure LiveKit voice remains functional
  PRESERVE_LIVEKIT_VOICE: true,
  ALLOW_NAVIGATION_OVERRIDE: false,
  SAFE_MODE: true
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  if (typeof featureName !== 'string') {
    console.warn(`[Features] Invalid feature name: ${featureName}`);
    return false;
  }
  
  const enabled = FEATURES[featureName];
  
  if (FEATURES.ENABLE_FEATURE_LOGGING) {
    console.log(`[Features] ${featureName}: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }
  
  return Boolean(enabled);
};

/**
 * Log all enabled features (development only)
 */
export const logEnabledFeatures = () => {
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
  if (!isDev) return;
  
  console.group('🎛️ Feature Flags Status');
  Object.entries(FEATURES)
    .filter(([key, value]) => value === true)
    .forEach(([key, value]) => {
      console.log(`✅ ${key}`);
    });
  console.groupEnd();
};

/**
 * Validate that critical features are properly configured
 */
export const validateCriticalFeatures = () => {
  const critical = {
    livekitProtected: FEATURES.PRESERVE_LIVEKIT_VOICE,
    safeMode: FEATURES.SAFE_MODE,
    noNavigationOverride: !FEATURES.ALLOW_NAVIGATION_OVERRIDE
  };
  
  const allValid = Object.values(critical).every(Boolean);
  
  if (!allValid) {
    console.error('🚨 CRITICAL: LiveKit protection features are disabled!');
    console.table(critical);
  }
  
  return allValid;
};

/**
 * Feature groups for bulk operations
 */
export const Features = {
  // Core HB1 modules
  CORE: [
    'ENABLE_BIBLE_READER',
    'ENABLE_STUDY_SYSTEM', 
    'ENABLE_CALENDAR',
    'ENABLE_AI_CHAT'
  ],
  
  // Authentication features
  AUTH: [
    'ENABLE_SUPABASE_AUTH',
    'ENABLE_GOOGLE_SIGNIN',
    'ENABLE_APPLE_SIGNIN',
    'ENABLE_GUEST_MODE'
  ],
  
  // UI components
  UI: [
    'ENABLE_CUSTOM_HEADER',
    'ENABLE_BOTTOM_TAB_BAR',
    'ENABLE_SPLASH_SCREEN',
    'ENABLE_LOADING_STATES'
  ],
  
  // Bible-specific features
  BIBLE: [
    'ENABLE_VERSE_HIGHLIGHTING',
    'ENABLE_BOOKMARKS',
    'ENABLE_VERSE_SHARING',
    'ENABLE_READING_PLANS',
    'ENABLE_CROSS_REFERENCES'
  ],
  
  // Study features
  STUDY: [
    'ENABLE_NOTE_TAKING',
    'ENABLE_STUDY_GROUPS',
    'ENABLE_PRAYER_JOURNAL',
    'ENABLE_DEVOTIONALS'
  ],
  
  // Development features
  DEV: [
    'ENABLE_DEBUG_MODE',
    'ENABLE_PERFORMANCE_MONITORING',
    'ENABLE_FEATURE_LOGGING',
    'ENABLE_DEV_TOOLS'
  ]
};

/**
 * Check if all features in a group are enabled
 */
export const isFeatureGroupEnabled = (groupName) => {
  const group = Features[groupName];
  if (!group) {
    console.warn(`[Features] Unknown feature group: ${groupName}`);
    return false;
  }
  
  return group.every(feature => isFeatureEnabled(feature));
};

/**
 * Get enabled features in a group
 */
export const getEnabledFeaturesInGroup = (groupName) => {
  const group = Features[groupName];
  if (!group) {
    console.warn(`[Features] Unknown feature group: ${groupName}`);
    return [];
  }
  
  return group.filter(feature => isFeatureEnabled(feature));
};

// Initialize feature validation on load  
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
if (isDev) {
  validateCriticalFeatures();
  logEnabledFeatures();
} 