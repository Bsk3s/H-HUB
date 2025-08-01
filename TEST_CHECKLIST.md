# 🧪 MIGRATION TEST CHECKLIST

## 🚨 CRITICAL TEST POINTS

### **PHASE 0: Foundation Tests**

- [ ] **Git Status**: All branches created successfully
- [ ] **Feature Flags**: `console.log(FEATURES)` shows correct toggles
- [ ] **Navigation**: Can navigate between all tabs without crashes
- [ ] **Dependencies**: `npm start` runs without errors
- [ ] **LiveKit Core**: Voice chat still works (NEVER BREAK THIS)
- [ ] **Build**: Metro compilation succeeds

### **PHASE 1: Infrastructure Tests**

- [ ] **Context Import**: All contexts import without errors
- [ ] **Context Wrap**: App starts with all context providers
- [ ] **AsyncStorage**: Can read/write data successfully
- [ ] **Custom Hooks**: All hooks execute without errors
- [ ] **LiveKit + Infrastructure**: Voice chat works with all new infrastructure

### **PHASE 2: Supabase Tests**

- [ ] **Connection**: Supabase client connects successfully
- [ ] **Authentication**: Login/logout works
- [ ] **Token Refresh**: Auth tokens refresh automatically
- [ ] **Session Persistence**: Login survives app restart
- [ ] **Database CRUD**: Create, Read, Update, Delete all work
- [ ] **LiveKit + Auth**: Voice chat works with user authentication

### **PHASE 3: Bible Reader Tests**

- [ ] **Component Import**: All Bible components import
- [ ] **Navigation**: Bible navigation works (books/chapters/verses)
- [ ] **Audio**: Bible audio plays and controls work
- [ ] **Search**: Verse search and bookmarks work
- [ ] **Tab Switching**: Can switch between Bible and Voice Chat seamlessly
- [ ] **Performance**: Bible loads in < 2 seconds

### **PHASE 4: Study System Tests**

- [ ] **Note Creation**: Can create, edit, delete notes
- [ ] **Rich Editor**: Text formatting works and saves
- [ ] **Local Storage**: Notes persist locally
- [ ] **Sync**: Notes sync with Supabase
- [ ] **Navigation**: Study navigation works
- [ ] **Integration**: Works with Bible reader and auth

### **PHASE 5: Advanced Features Tests**

- [ ] **AI Chat**: AI responses work, no LiveKit conflicts
- [ ] **Calendar**: Can create/edit events, notifications work
- [ ] **Performance**: All features together perform well
- [ ] **Memory**: No memory leaks with all features enabled

## 🔧 TESTING COMMANDS

### Quick Health Check

```bash
# Run this after every major change
npm start
# In app: Test LiveKit voice chat
# In app: Navigate through all tabs
# Check console for errors
```

### Full Feature Test

```bash
# Enable all features in config/features.js
# Test each major user flow:
# 1. Login → Bible → Voice Chat → Study → Logout
# 2. Create note → Search Bible → Voice chat → Edit note
# 3. Voice chat → Bible audio → Study materials
```

### Performance Test

```bash
# Check startup time
# Monitor memory usage in dev tools
# Test on slower device/simulator
```

## 🚨 ROLLBACK TRIGGERS

**Immediately rollback if:**

- LiveKit voice stops working
- App crashes on startup
- Navigation breaks
- Build fails
- Memory usage > 200MB

## 🎯 SUCCESS CRITERIA

**Each phase passes when:**

- All tests in checklist pass ✅
- LiveKit still works ✅
- No console errors ✅
- Git tag created ✅
- Can proceed to next phase ✅

## 📊 PROGRESS TRACKING

### Phase 0: Foundation ⏳

- Tests Passed: 0/9
- Status: Not Started

### Phase 1: Infrastructure ⏳

- Tests Passed: 0/11
- Status: Not Started

### Phase 2: Supabase ⏳

- Tests Passed: 0/8
- Status: Not Started

### Phase 3: Bible Reader ⏳

- Tests Passed: 0/8
- Status: Not Started

### Phase 4: Study System ⏳

- Tests Passed: 0/8
- Status: Not Started

### Phase 5: Advanced Features ⏳

- Tests Passed: 0/10
- Status: Not Started

---

**REMEMBER: Test early, test often, never break LiveKit!** 🎤✅
