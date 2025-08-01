// 🚀 HB1 Migration Feature Flags
// Use these to safely enable/disable features during migration

export const FEATURES = {
  // 📖 Bible Reader System
  ENABLE_BIBLE_READER: false,
  ENABLE_BIBLE_AUDIO: false,
  ENABLE_BIBLE_SEARCH: false,
  ENABLE_BIBLE_BOOKMARKS: false,
  
  // 📚 Study System  
  ENABLE_STUDY_SYSTEM: false,
  ENABLE_NOTE_TAKING: false,
  ENABLE_RICH_EDITOR: false,
  ENABLE_STUDY_MATERIALS: false,
  
  // 🔐 Authentication System
  ENABLE_SUPABASE_AUTH: false,
  ENABLE_USER_PROFILES: false,
  ENABLE_SESSION_MANAGEMENT: false,
  
  // 💬 Chat & AI Features
  ENABLE_AI_CHAT: false,
  ENABLE_CHAT_HISTORY: false,
  ENABLE_AI_MEMORY: false,
  
  // 📅 Calendar & Scheduling
  ENABLE_CALENDAR: false,
  ENABLE_EVENTS: false,
  ENABLE_NOTIFICATIONS: false,
  
  // 🏗️ Infrastructure Features
  ENABLE_OFFLINE_STORAGE: false,
  ENABLE_DATA_SYNC: false,
  ENABLE_ADVANCED_CONTEXTS: false,
  
  // 🎨 UI & Advanced Features
  ENABLE_ADVANCED_UI: false,
  ENABLE_ANIMATIONS: false,
  ENABLE_THEMES: false,
  
  // 🧪 Development Features
  ENABLE_DEBUG_MODE: __DEV__,
  ENABLE_PERFORMANCE_MONITORING: __DEV__,
  ENABLE_FEATURE_LOGGING: __DEV__,
};

// 🔧 Feature Flag Utilities
export const isFeatureEnabled = (featureName) => {
  const enabled = FEATURES[featureName];
  
  if (FEATURES.ENABLE_FEATURE_LOGGING) {
    console.log(`🚩 Feature Check: ${featureName} = ${enabled}`);
  }
  
  return enabled;
};

// 🧪 Development Helper - Log all enabled features
export const logEnabledFeatures = () => {
  if (!__DEV__) return;
  
  console.log('🚩 === ENABLED FEATURES ===');
  Object.entries(FEATURES)
    .filter(([key, value]) => value === true)
    .forEach(([key, value]) => {
      console.log(`✅ ${key}: ${value}`);
    });
  console.log('🚩 === END FEATURES ===');
};

// 🚨 Safety Check - Ensure critical features
export const validateCriticalFeatures = () => {
  // LiveKit should always work (no feature flag for this)
  // Add other critical validations here
  
  if (FEATURES.ENABLE_DEBUG_MODE) {
    console.log('🔍 Critical features validation passed');
  }
};

// Export individual feature checkers for convenience
export const Features = {
  BibleReader: () => isFeatureEnabled('ENABLE_BIBLE_READER'),
  StudySystem: () => isFeatureEnabled('ENABLE_STUDY_SYSTEM'),
  SupabaseAuth: () => isFeatureEnabled('ENABLE_SUPABASE_AUTH'),
  AIChat: () => isFeatureEnabled('ENABLE_AI_CHAT'),
  Calendar: () => isFeatureEnabled('ENABLE_CALENDAR'),
  DebugMode: () => isFeatureEnabled('ENABLE_DEBUG_MODE'),
};

export default FEATURES; 