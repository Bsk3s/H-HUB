# 🗺️ **HB1 TO LIVEKIT COMPREHENSIVE FILE MAPPING**

**Source:** HB1-source/ (208 files)  
**Target:** livekit-expo49-test/ (13 files currently)  
**Mission:** Complete systematic migration preserving LiveKit voice functionality

---

## 📊 **MIGRATION OVERVIEW**

### **Current State:**

- **HB1 Files:** 208 JavaScript/TypeScript files
- **LiveKit Files:** 13 files (minimal working voice setup)
- **Target Architecture:** React Navigation + Feature modules + LiveKit

### **Conflict Resolution:**

- **PRESERVE:** All LiveKit voice functionality (VoiceChat.js, useLiveKitVoiceChat.js)
- **REPLACE:** HB1 voice services with LiveKit integration
- **MERGE:** Authentication services (already partially migrated)

---

## 🎯 **PRIORITY MAPPING**

### **CRITICAL - PHASE 1 (Navigation Foundation)**

```
HB1-source/app/(tabs)/_layout.jsx          → components/navigation/TabNavigator.js
HB1-source/app/(tabs)/index.jsx            → screens/HomeScreen.js
HB1-source/app/(tabs)/bible.jsx            → screens/BibleScreen.js
HB1-source/app/(tabs)/chat.jsx             → screens/ChatScreen.js (merge with LiveKit)
HB1-source/app/(tabs)/study/index.jsx      → screens/StudyScreen.js
HB1-source/app/_layout.jsx                 → App.js (merge with existing)
```

### **HIGH - PHASE 2 (Core Features)**

```
HB1-source/app/features/bible/             → features/bible/
├── api/bibleService.js                     → features/bible/services/
├── components/                             → features/bible/components/
├── contexts/                               → features/bible/contexts/
├── hooks/                                  → features/bible/hooks/
├── services/                               → features/bible/services/
└── utils/                                  → features/bible/utils/

HB1-source/app/features/audio/             → features/audio/
├── components/                             → features/audio/components/
├── hooks/                                  → features/audio/hooks/
└── utils/                                  → features/audio/utils/
```

### **MEDIUM - PHASE 3 (Study System)**

```
HB1-source/app/(tabs)/study/               → features/study/
├── _layout.jsx                            → features/study/navigation/
├── editor.jsx                             → features/study/screens/EditorScreen.js
├── notes.jsx                              → features/study/screens/NotesScreen.js

HB1-source/app/components/notes/           → features/study/components/
├── FolderList.jsx                         → features/study/components/
├── NoteEditor.jsx                         → features/study/components/
└── NoteList.jsx                           → features/study/components/
```

### **MEDIUM - PHASE 4 (Home Dashboard)**

```
HB1-source/app/components/home/            → features/home/components/
├── ActivityRing.jsx                       → features/home/components/
├── BibleStoriesSection.jsx                → features/home/components/
├── DailyVerse.jsx                         → features/home/components/
├── DiscussionsSection.jsx                 → features/home/components/
└── [all other home components]            → features/home/components/

HB1-source/app/data/homeData.js            → features/home/data/
```

---

## 🔧 **SERVICE LAYER MAPPING**

### **Authentication (PARTIALLY COMPLETE ✅)**

```
HB1-source/src/auth/                       → src/auth/ (EXISTS)
├── context.js                             → contexts/AuthContext.js (NEW)
├── services/auth-service.js               → src/auth/services/ (EXISTS ✅)
├── services/social-auth.js                → src/auth/services/ (EXISTS ✅)
├── services/profile-service.js            → src/auth/services/ (EXISTS ✅)
└── supabase-client.js                     → src/auth/ (EXISTS ✅)
```

### **Voice Services (CRITICAL MERGE REQUIRED ⚠️)**

```
HB1-source/app/hooks/useVoiceChat.js       → REPLACE with useLiveKitVoiceChat.js ✅
HB1-source/app/hooks/useWebSocketVoiceChat.js → DELETE (replace with LiveKit)
HB1-source/app/services/[voice services]   → DELETE (replace with LiveKit)
HB1-source/app/components/chat/            → MERGE with VoiceChat.js ✅

PRESERVE:
- VoiceChat.js ✅
- app/hooks/useLiveKitVoiceChat.js ✅
- services/api.js ✅
```

### **Core Services**

```
HB1-source/app/services/                   → services/
├── apiService.js                          → services/ (merge with api.js)
├── notesService.js                        → features/study/services/
├── chatService.js                         → DELETE (use LiveKit)
└── activities.js                          → features/activities/services/

HB1-source/src/services/dailyVerseService.js → features/bible/services/
```

---

## 🏗️ **COMPONENT ARCHITECTURE MAPPING**

### **Layout Components**

```
HB1-source/app/components/layout/          → components/layout/
├── AppHeader.jsx                          → components/layout/Header.js
├── PageWrapper.jsx                        → components/layout/PageWrapper.js
└── TabBar.jsx                             → components/navigation/TabBar.js
```

### **UI Components**

```
HB1-source/app/components/                 → components/ui/
├── CustomButton.jsx                       → components/ui/Button.js
├── button.jsx                             → components/ui/Button.js (merge)
├── progress-indicator.jsx                 → components/ui/ProgressIndicator.js
└── back-button.jsx                        → components/ui/BackButton.js
```

### **Auth Components**

```
HB1-source/app/(auth)/                     → screens/auth/
├── Email-sign-in.jsx                      → screens/auth/SignInScreen.js
└── _layout.jsx                            → navigation/AuthNavigator.js

HB1-source/app/(onboarding)/               → screens/onboarding/
├── [all onboarding screens]               → screens/onboarding/
```

---

## 📱 **SCREEN ARCHITECTURE MAPPING**

### **Main Screens**

```
HB1-source/app/                            → screens/
├── index.jsx                              → screens/HomeScreen.js (merge with tabs/index.jsx)
├── profile.jsx                            → screens/ProfileScreen.js
├── settings.jsx                           → screens/SettingsScreen.js
├── help.jsx                               → screens/HelpScreen.js
└── bible-reader.jsx                       → features/bible/screens/ReaderScreen.js
```

### **Auxiliary Screens**

```
HB1-source/app/                            → screens/
├── edit-profile.jsx                       → screens/EditProfileScreen.js
├── change-password.jsx                    → screens/ChangePasswordScreen.js
├── bible-version-settings.jsx            → features/bible/screens/VersionSettings.js
└── stories.jsx                            → features/content/screens/StoriesScreen.js
```

---

## 🔄 **CONTEXT & HOOKS MAPPING**

### **React Contexts**

```
HB1-source/app/features/bible/contexts/   → contexts/
├── AudioContext.js                        → contexts/AudioContext.js
├── VersesContext.js                       → contexts/BibleContext.js
└── BibleBrainAudioContext.js             → contexts/BibleAudioContext.js

HB1-source/src/auth/context.js             → contexts/AuthContext.js
```

### **Custom Hooks**

```
HB1-source/app/hooks/                      → hooks/
├── useRotatingText.js                     → hooks/useRotatingText.js
├── useTypingText.js                       → hooks/useTypingText.js
└── [bible hooks]                          → features/bible/hooks/

HB1-source/src/hooks/                      → hooks/
├── useAudioPipeline.js                    → features/audio/hooks/
└── [other hooks]                          → appropriate feature/hooks/
```

---

## ⚠️ **CRITICAL CONFLICTS & RESOLUTIONS**

### **Voice System Replacement**

```
DELETE FROM HB1:
- app/hooks/useVoiceChat.js
- app/hooks/useWebSocketVoiceChat.js
- app/services/[all voice services]
- app/components/chat/VoiceControls.js (merge functionality)

PRESERVE IN LIVEKIT:
- VoiceChat.js ✅
- app/hooks/useLiveKitVoiceChat.js ✅
- services/api.js ✅

MERGE STRATEGY:
- Take HB1 chat UI components
- Integrate with LiveKit voice functionality
- Preserve LiveKit backend integration
```

### **Navigation System Conversion**

```
CONVERT:
- Expo Router file-based → React Navigation programmatic
- app/(tabs)/_layout.jsx → TabNavigator component
- All useRouter() → useNavigation()
- All navigation.navigate() calls → proper route names
```

### **Dependencies Compatibility**

```
DOWNGRADE REQUIRED:
- Expo SDK 53 → 49
- All Expo modules to 49-compatible versions
- React Navigation to compatible versions

VERSION CONFLICTS:
- Check each HB1 dependency against Expo 49
- Update package.json systematically
- Test iOS/Android builds at each phase
```

---

## 📋 **MIGRATION EXECUTION ORDER**

### **Phase 1: Foundation**

1. Create directory structure
2. Migrate core navigation
3. Migrate main screens (placeholder versions)
4. Test navigation flow + LiveKit preservation

### **Phase 2: Bible System**

5. Migrate Bible components
6. Migrate Bible contexts and hooks
7. Migrate Bible services
8. Test Bible functionality

### **Phase 3: Study System**

9. Migrate study components
10. Migrate note system
11. Migrate rich text editor
12. Test study functionality

### **Phase 4: Voice Integration**

13. Merge HB1 chat UI with LiveKit voice
14. Update voice characters/features
15. Test complete voice + content integration
16. Production voice UI polish

### **Phase 5: Production Ready**

17. Performance optimization
18. Error handling
19. Platform-specific testing
20. Launch preparation

---

## 🎯 **SUCCESS CRITERIA**

### **Each Phase Must Pass:**

- ✅ All migrated features work correctly
- ✅ LiveKit voice chat still functional
- ✅ No console errors
- ✅ iOS + Android builds successfully
- ✅ Navigation flows work end-to-end

### **Final Success:**

- ✅ Complete HB1 feature parity
- ✅ LiveKit voice integration seamless
- ✅ Ready for TikTok content strategy
- ✅ Gen-Z faith community platform launched

---

**🚀 MISSION: Transform HB1 into the biggest faith app in the world with bleeding-edge LiveKit voice AI! 🔥**
