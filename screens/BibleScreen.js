import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, FlatList, Pressable, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import professional Bible components
import BibleHeader from '../features/bible/components/BibleHeader';
import SearchBar from '../features/bible/components/SearchBar';
import VerseItem from '../features/bible/components/VerseItem';
import SelectionModal from '../features/bible/components/SelectionModal';
import { VersesProvider, useVerses } from '../features/bible/contexts/VersesContext';
import useBibleVersions from '../features/bible/hooks/useBibleVersions';
import { getBibleVersions, getBooks, getChapters, getChapterContent } from '../features/bible/services/bibleService';
import { ALL_BOOKS, getBookNameById } from '../features/bible/constants/books';
import { parseScriptureReference, createBookId, createChapterId, getContextRange } from '../utils/scriptureParser';

// EXACT HB1 Bible Service API
const API_KEY = 'c9afcb2ed06b4d336db834d2e03526cf';
const BASE_URL = 'https://api.scripture.api.bible/v1';

const headers = {
  'api-key': API_KEY,
  'Content-Type': 'application/json',
};

const handleApiError = async (response, context) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const status = response.status;
    let errorMessage = `Failed to ${context}`;

    if (status === 401) {
      errorMessage = 'Invalid or missing Bible API key. Please check your API key configuration.';
    } else if (status === 403) {
      errorMessage = 'Access forbidden. Your API key may not have the necessary permissions.';
    } else if (status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }

    console.error(`Bible API Error (${context}):`, {
      status,
      statusText: response.statusText,
      errorData,
      message: errorMessage
    });

    throw new Error(errorMessage);
  }
  return response;
};

// Using imported functions from bibleService.js instead of duplicates

// SAFE HB1-style FloatingNavigation without Reanimated (virus-proof)
const FloatingNavigation = ({ onPrevious, onNext }) => {
  const buttonStyle = {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Translucent background like HB1
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  };

  return (
    <View 
      style={{ 
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        height: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        pointerEvents: 'box-none',
        zIndex: 1000,
      }}
    >
      {/* Left Button - Previous Chapter */}
      <TouchableOpacity
        onPress={onPrevious}
        style={buttonStyle}
        activeOpacity={0.8}
      >
        <Ionicons 
          name="chevron-back" 
          size={32} 
          color="rgba(0, 0, 0, 0.8)" // Dark icon for translucent background
        />
      </TouchableOpacity>

      {/* Right Button - Next Chapter */}
      <TouchableOpacity
        onPress={onNext}
        style={buttonStyle}
        activeOpacity={0.8}
      >
        <Ionicons 
          name="chevron-forward" 
          size={32} 
          color="rgba(0, 0, 0, 0.8)" // Dark icon for translucent background
        />
      </TouchableOpacity>
    </View>
  );
};

// Clean, user-friendly Bible version display names
const FRIENDLY_VERSION_NAMES = {
  'engKJV': { name: 'King James Version', abbrev: 'KJV', description: 'Traditional English translation' },
  'WEB': { name: 'World English Bible', abbrev: 'WEB', description: 'Modern English, public domain' },
  'ASV': { name: 'American Standard Version', abbrev: 'ASV', description: 'Classic American translation' },
  'LSV': { name: 'Literal Standard Version', abbrev: 'LSV', description: 'Word-for-word accuracy' },
  'FBV': { name: 'Free Bible Version', abbrev: 'FBV', description: 'Contemporary English' }
};

// EXACT HB1 Bible Component
const Bible = ({ route }) => {
  const scrollViewRef = useRef(null);
  
  // Use the enhanced useBibleVersions hook
  const { 
    versions, 
    categorizedVersions, 
    loading: versionsLoading, 
    error: versionsError,
    currentVersion: hookCurrentVersion,
    changeVersion 
  } = useBibleVersions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Bible data state
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  
  // Use hook's current version
  const currentVersion = hookCurrentVersion;
  
  // UI state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedBookInModal, setSelectedBookInModal] = useState(null);
  const [alphabeticalOrder, setAlphabeticalOrder] = useState(false);
  
  // Navigation state for verse targeting
  const [targetVerse, setTargetVerse] = useState(null);
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const [pendingScriptureRef, setPendingScriptureRef] = useState(null);
  
  // Scroll state for floating navigation
  const [showFloatingNav, setShowFloatingNav] = useState(false);

  // Get clean, unique core versions for modal display
  const getCoreVersionsForDisplay = () => {
    if (!categorizedVersions.priorityEnglish) return [];
    
    const uniqueVersions = [];
    const seenAbbreviations = new Set();
    
    // Filter out duplicates and only show versions in our friendly names list
    categorizedVersions.priorityEnglish.forEach(version => {
      const abbrev = version.abbreviation || version.nameLocal || version.name;
      if (FRIENDLY_VERSION_NAMES[abbrev] && !seenAbbreviations.has(abbrev)) {
        seenAbbreviations.add(abbrev);
        uniqueVersions.push({
          ...version,
          friendlyName: FRIENDLY_VERSION_NAMES[abbrev].name,
          friendlyAbbrev: FRIENDLY_VERSION_NAMES[abbrev].abbrev,
          description: FRIENDLY_VERSION_NAMES[abbrev].description
        });
      }
    });
    

    return uniqueVersions;
  };
  
  // Load books when current version changes (from hook)
  useEffect(() => {
    if (currentVersion && !versionsLoading) {
      loadBooks(currentVersion.id);
    }
  }, [currentVersion, versionsLoading]);

  // Handle verse navigation from route params
  useEffect(() => {

    
    const scriptureRef = route?.params?.scriptureRef;
    
    if (scriptureRef) {
      if (currentVersion && books.length > 0) {
        console.log('📖 Ready to navigate! Attempting navigation to:', scriptureRef);
        navigateToScripture(scriptureRef);
        setPendingScriptureRef(null); // Clear pending since we're navigating
      } else {
        console.log('📖 Not ready yet, queuing scripture reference:', scriptureRef);
        setPendingScriptureRef(scriptureRef); // Queue for later
      }
    }
  }, [route?.params?.scriptureRef, currentVersion, books]);

  // Process pending scripture navigation when books become available
  useEffect(() => {
    if (pendingScriptureRef && currentVersion && books.length > 0) {
      console.log('📖 Processing pending scripture navigation:', pendingScriptureRef);
      navigateToScripture(pendingScriptureRef);
      setPendingScriptureRef(null);
    }
  }, [pendingScriptureRef, currentVersion, books]);

  // Update loading state based on hook
  useEffect(() => {
    setIsLoading(versionsLoading);
    if (versionsError) {
      setError(versionsError);
    }
  }, [versionsLoading, versionsError]);

  const loadBooks = async (versionId) => {
    try {
      const data = await getBooks(versionId);
      setBooks(data);
      
      // Try to load saved book or use first available
      const savedBookId = await AsyncStorage.getItem('currentBookId');
      const defaultBook = savedBookId ? 
        data.find(b => b.id === savedBookId) : 
        data[0];
      
      if (defaultBook) {
        setCurrentBook(defaultBook);
        await AsyncStorage.setItem('currentBookId', defaultBook.id);
        await loadChapters(versionId, defaultBook.id);
      }
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Failed to load books.');
    }
  };

  const loadChapters = async (versionId, bookId, targetChapterNumber = null) => {
    try {
      const data = await getChapters(versionId, bookId);
      setChapters(data);
      
      let selectedChapter;
      
      if (targetChapterNumber) {
        // Look for the target chapter number
        selectedChapter = data.find(c => {
          // Extract chapter number from ID (e.g., "de4e12af7f28f599-02.PSA.46" -> 46)
          const chapterNum = parseInt(c.id.split('.').pop());
          return chapterNum === targetChapterNumber;
        });
        console.log('📖 Target chapter found:', selectedChapter);
      }
      
      if (!selectedChapter) {
        // Fall back to saved chapter or first available
        const savedChapterId = await AsyncStorage.getItem('currentChapterId');
        selectedChapter = savedChapterId ? 
          data.find(c => c.id === savedChapterId) : 
          data[0];
      }
      
      if (selectedChapter) {
        setCurrentChapter(selectedChapter);
        await AsyncStorage.setItem('currentChapterId', selectedChapter.id);
        await loadVerses(versionId, selectedChapter.id);
        
        // Mark loading as complete after initial setup
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error loading chapters:', err);
      setError('Failed to load chapters.');
    }
  };

  const loadVerses = async (versionId, chapterId) => {
    try {
      const data = await getChapterContent(versionId, chapterId);
      
      if (data && data.verses) {
        setVerses(data.verses);
        
        // If we have a target verse, scroll to it after verses load
        if (targetVerse) {
          setTimeout(() => {
            scrollToTargetVerse();
          }, 500); // Give time for verses to render
        }
      } else {
        setVerses([]);
      }
    } catch (err) {
      console.error('Error loading verses:', err);
      setError('Failed to load chapter content.');
    }
  };

  // Handle scroll events to show/hide floating navigation
  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    
    // Show floating nav after scrolling down 100 pixels
    const shouldShow = currentScrollY > 100;
    if (shouldShow !== showFloatingNav) {
      setShowFloatingNav(shouldShow);
    }
  };

  const scrollToTargetVerse = () => {
    if (scrollViewRef.current && targetVerse) {
      // Since verses are rendered in order, we can calculate approximate position
      // Each verse is roughly 60px high (this is an estimate)
      const estimatedPosition = (targetVerse - 1) * 60;
      scrollViewRef.current.scrollTo({ 
        y: estimatedPosition, 
        animated: true 
      });
    }
  };

  const handleVersionSelect = async (version) => {
    console.log('📖 🔄 Changing to version:', version.abbreviation || version.name);
    await changeVersion(version.id);
    setShowVersionModal(false);
    // Books will be loaded automatically via useEffect when currentVersion changes
  };

  const resetToEnglishVersion = async () => {
    try {
      // Clear all saved preferences
      await AsyncStorage.removeItem('currentBibleVersionId');
      await AsyncStorage.removeItem('currentBookId');
      await AsyncStorage.removeItem('currentChapterId');
      
      // Reset state
      setCurrentVersion(null);
      setCurrentBook(null);
      setCurrentChapter(null);
      setVerses([]);
      
      // Reload Bible versions with fresh start
      await loadBibleVersions();
    } catch (err) {
      console.error('Error resetting to English version:', err);
      setError('Failed to reset to English version. Please try again.');
    }
  };

  const handleBookSelect = async (book) => {
    // If this book is already selected in modal, expand to show chapters
    if (selectedBookInModal && selectedBookInModal.id === book.id) {
      setSelectedBookInModal(null);
      return;
    }
    
    // Set the selected book in modal to show its chapters
    setSelectedBookInModal(book);
    await loadChapters(currentVersion.id, book.id);
  };

  const handleChapterSelectFromModal = async (chapter) => {
    if (selectedBookInModal) {
      setCurrentBook(selectedBookInModal);
      setCurrentChapter(chapter);
      setSelectedBookInModal(null);
      setShowBookModal(false);
      await AsyncStorage.setItem('currentBookId', selectedBookInModal.id);
      await AsyncStorage.setItem('currentChapterId', chapter.id);
      await loadVerses(currentVersion.id, chapter.id);
    }
  };

  const handleChapterSelect = async (chapter) => {
    setCurrentChapter(chapter);
    setShowChapterModal(false);
    await AsyncStorage.setItem('currentChapterId', chapter.id);
    await loadVerses(currentVersion.id, chapter.id);
  };

  // Navigate to a specific scripture reference
  const navigateToScripture = async (scriptureRef) => {
    try {
      console.log('📖 🎯 Starting navigation to scripture:', scriptureRef);
      
      // Check prerequisites
      if (!currentVersion) {
        console.error('📖 ❌ No current version available');
        return;
      }
      
      if (!books || books.length === 0) {
        console.error('📖 ❌ No books available');
        return;
      }
      
      const parsed = parseScriptureReference(scriptureRef);
      if (!parsed) {
        console.error('📖 ❌ Could not parse scripture reference:', scriptureRef);
        return;
      }

      console.log('📖 ✅ Parsed scripture successfully:', parsed);

      // Find the book in our books array
      // Book IDs from API are simple abbreviations like "PSA", "MAT", etc.
      const targetBook = books.find(book => {
        // Direct ID match (e.g., "PSA" === "PSA")
        const idMatches = book.id === parsed.book;
        // Also check name for extra safety
        const nameMatches = book.name.toLowerCase().includes(parsed.bookName);
        console.log(`📖 Checking book: ${book.id} (${book.name}) - ID matches ${parsed.book}? ${idMatches} - Name matches? ${nameMatches}`);
        return idMatches || nameMatches;
      });

      if (!targetBook) {
        console.error('📖 ❌ Book not found for:', parsed.book);
        console.error('📖 📚 All available books:', books.map(b => ({ id: b.id, name: b.name })));
        console.error('📖 🔍 Looking for book ID:', parsed.book, 'or name containing:', parsed.bookName);
        return;
      }

      console.log('📖 ✅ Found target book:', { id: targetBook.id, name: targetBook.name });

      // Set the target verse for highlighting
      setTargetVerse(parsed.startVerse);
      setHighlightedVerse(parsed.startVerse);

      // Load the book and chapter
      console.log('📖 🔄 Loading book and chapter...');
      setCurrentBook(targetBook);
      await AsyncStorage.setItem('currentBookId', targetBook.id);
      
      // Load chapters for this book with target chapter
      await loadChapters(currentVersion.id, targetBook.id, parsed.chapter);
      
      console.log('📖 ✅ Scripture navigation completed successfully!');

    } catch (error) {
      console.error('📖 ❌ Error navigating to scripture:', error);
      // Reset pending scripture on error
      setPendingScriptureRef(null);
    }
  };

  // Navigation functions for floating buttons
  const handleNavigate = async (direction) => {
    if (!currentBook || !currentChapter || !chapters.length) return;
    
    const currentChapterIndex = chapters.findIndex(c => c.id === currentChapter.id);
    
    if (direction === 'prev') {
      if (currentChapterIndex > 0) {
        // Go to previous chapter in same book
        const prevChapter = chapters[currentChapterIndex - 1];
        await handleChapterSelect(prevChapter);
      } else {
        // Go to last chapter of previous book
        const currentBookIndex = books.findIndex(b => b.id === currentBook.id);
        if (currentBookIndex > 0) {
          const prevBook = books[currentBookIndex - 1];
          await changeBookAndGoToLastChapter(prevBook);
        }
      }
    } else if (direction === 'next') {
      if (currentChapterIndex < chapters.length - 1) {
        // Go to next chapter in same book
        const nextChapter = chapters[currentChapterIndex + 1];
        await handleChapterSelect(nextChapter);
      } else {
        // Go to first chapter of next book
        const currentBookIndex = books.findIndex(b => b.id === currentBook.id);
        if (currentBookIndex < books.length - 1) {
          const nextBook = books[currentBookIndex + 1];
          await changeBookAndGoToFirstChapter(nextBook);
        }
      }
    }
    
    // Scroll to top after navigation
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const changeBookAndGoToLastChapter = async (book) => {
    setCurrentBook(book);
    await AsyncStorage.setItem('currentBookId', book.id);
    const bookChapters = await getChapters(currentVersion.id, book.id);
    setChapters(bookChapters);
    const lastChapter = bookChapters[bookChapters.length - 1];
    if (lastChapter) {
      setCurrentChapter(lastChapter);
      await AsyncStorage.setItem('currentChapterId', lastChapter.id);
      await loadVerses(currentVersion.id, lastChapter.id);
    }
  };

  const changeBookAndGoToFirstChapter = async (book) => {
    setCurrentBook(book);
    await AsyncStorage.setItem('currentBookId', book.id);
    const bookChapters = await getChapters(currentVersion.id, book.id);
    setChapters(bookChapters);
    const firstChapter = bookChapters[0];
    if (firstChapter) {
      setCurrentChapter(firstChapter);
      await AsyncStorage.setItem('currentChapterId', firstChapter.id);
      await loadVerses(currentVersion.id, firstChapter.id);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#4B5563" />
          <Text style={{ color: '#6B7280', marginTop: 8 }}>Loading Bible...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Ionicons name="warning-outline" size={48} color="#EF4444" />
          <Text style={{ color: '#DC2626', fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
            Unable to Load Bible
          </Text>
          <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            {error}
          </Text>
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                loadBibleVersions();
              }}
              style={{ backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
            </TouchableOpacity>
    
            <TouchableOpacity
              onPress={resetToEnglishVersion}
              style={{ backgroundColor: '#6B7280', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Reset to English</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      
      {/* Warning banner for non-English versions */}
      {currentVersion && currentVersion.language?.id !== 'eng' && (
        <View style={{ backgroundColor: '#FEF3C7', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#92400E', fontWeight: '500' }}>
                Non-English Bible Version Detected
              </Text>
              <Text style={{ color: '#B45309', fontSize: 14 }}>
                Current version: {currentVersion.abbreviation} ({currentVersion.language?.name || 'Unknown'})
              </Text>
            </View>
            <TouchableOpacity 
              onPress={resetToEnglishVersion}
              style={{ backgroundColor: '#D97706', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Switch to English</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setShowBookModal(true)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}
            >
              <Text style={{ color: '#111827', fontWeight: '500' }}>
                {currentBook?.name || 'Select Book'} {currentChapter?.number || '1'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowVersionModal(true)}
              style={{ backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Text style={{ color: '#111827', fontWeight: '500' }}>
                {currentVersion?.abbreviation || 'Select Version'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ padding: 8 }}>
              <Ionicons name="play" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }}>
              <Ionicons name="search" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 120 }} // Extend to edges, padding for floating buttons
        onScroll={handleScroll}
        scrollEventThrottle={16} // Smooth scroll tracking
      >
        {currentChapter && (
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 24 }}>
            {currentBook?.name} {currentChapter.number}
          </Text>
        )}
        
        {verses.length > 0 ? (
          <View>
            {verses.map((verse) => (
              <Text 
                key={verse.id} 
                style={{ 
                  fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                  fontSize: 18,
                  color: '#1F2937',
                  lineHeight: 32,
                  marginBottom: 8
                }}
              >
                <Text style={{ fontWeight: '700', color: '#6B7280', paddingRight: 4 }}>{verse.number}</Text>
                {` ${verse.text}`}
              </Text>
            ))}
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 16 }}>
              {currentVersion && currentBook && currentChapter 
                ? `Loading verses for ${currentBook.name} ${currentChapter.number}...`
                : 'Select a Bible version, book, and chapter to begin reading.'
              }
            </Text>

          </View>
        )}
      </ScrollView>

      {/* Floating Navigation - Only show when scrolling */}
      {showFloatingNav && (
        <FloatingNavigation
          onPrevious={() => handleNavigate('prev')}
          onNext={() => handleNavigate('next')}
        />
      )}

      {/* Version Selection Modal */}
      <Modal
        visible={showVersionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVersionModal(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowVersionModal(false)}
        >
          <Pressable>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: 384 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '600' }}>Select Bible Version</Text>
                <TouchableOpacity onPress={() => setShowVersionModal(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={{ maxHeight: 300 }}>
                {/* Core Bible Versions */}
                {(() => {
                  const coreVersions = getCoreVersionsForDisplay();
                  return coreVersions.length > 0 && (
                    <>
                      <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12, marginTop: 8, paddingHorizontal: 4 }}>Bible Versions</Text>
                      {coreVersions.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => handleVersionSelect(item)}
                          style={{
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 12,
                            backgroundColor: currentVersion?.id === item.id ? '#DBEAFE' : '#F9FAFB',
                            borderWidth: currentVersion?.id === item.id ? 2 : 1,
                            borderColor: currentVersion?.id === item.id ? '#3B82F6' : '#E5E7EB'
                          }}
                        >
                          <Text style={{ fontWeight: '600', fontSize: 16, color: '#1F2937', marginBottom: 4 }}>
                            {item.friendlyName}
                          </Text>
                          <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 2 }}>
                            {item.friendlyAbbrev}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                            {item.description}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  );
                })()}

                {/* Note about version availability */}
                <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F0F9FF', borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, color: '#0369A1', textAlign: 'center' }}>
                    All versions are public domain and freely available
                  </Text>
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Book Selection Modal - Enhanced with Chapter Selection */}
      <Modal
        visible={showBookModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowBookModal(false);
          setSelectedBookInModal(null);
        }}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => {
            setShowBookModal(false);
            setSelectedBookInModal(null);
          }}
        >
          <Pressable>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: 384 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '600' }}>
                  {selectedBookInModal ? `${selectedBookInModal.name} Chapters` : 'Select Book'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {!selectedBookInModal && (
                    <TouchableOpacity 
                      onPress={() => setAlphabeticalOrder(!alphabeticalOrder)}
                      style={{ marginRight: 12, padding: 4 }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: '#2563EB', fontWeight: '500', marginRight: 4 }}>
                          {alphabeticalOrder ? 'ABC' : 'Trad'}
                        </Text>
                        <Ionicons name="swap-horizontal" size={16} color="#2563EB" />
                      </View>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => {
                    setShowBookModal(false);
                    setSelectedBookInModal(null);
                  }}>
                    <Ionicons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {!selectedBookInModal ? (
                // Book List View
                <>
                  <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                    {alphabeticalOrder ? 'Alphabetical Order' : 'Traditional Order'}
                  </Text>
                  <FlatList
                    key="book-list"
                    data={alphabeticalOrder ? 
                      [...books].sort((a, b) => a.name.localeCompare(b.name)) : 
                      books
                    }
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleBookSelect(item)}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                          backgroundColor: currentBook?.id === item.id ? '#DBEAFE' : '#F3F4F6'
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={{ fontWeight: '500', color: '#1F2937' }}>{item.name}</Text>
                          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </>
              ) : (
                // Chapter List View
                <>
                  <TouchableOpacity 
                    onPress={() => setSelectedBookInModal(null)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                  >
                    <Ionicons name="chevron-back" size={16} color="#6B7280" />
                    <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 4 }}>Back to books</Text>
                  </TouchableOpacity>
                  <FlatList
                    key="chapter-list"
                    data={chapters}
                    keyExtractor={(item) => item.id}
                    numColumns={5}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleChapterSelectFromModal(item)}
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          margin: 4,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          backgroundColor: currentChapter?.id === item.id ? '#3B82F6' : '#F3F4F6'
                        }}
                      >
                        <Text style={{
                          fontWeight: '500',
                          color: currentChapter?.id === item.id ? 'white' : '#1F2937'
                        }}>
                          {item.number}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Chapter Selection Modal */}
      <Modal
        visible={showChapterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChapterModal(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowChapterModal(false)}
        >
          <Pressable>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: 384 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '600' }}>Select Chapter</Text>
                <TouchableOpacity onPress={() => setShowChapterModal(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={chapters}
                keyExtractor={(item) => item.id}
                numColumns={5}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleChapterSelect(item)}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      margin: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      backgroundColor: currentChapter?.id === item.id ? '#3B82F6' : '#F3F4F6'
                    }}
                  >
                    <Text style={{
                      fontWeight: '500',
                      color: currentChapter?.id === item.id ? 'white' : '#1F2937'
                    }}>
                      {item.number}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

// Main BibleScreen component wrapped in context
export default function BibleScreen({ route }) {
  return (
    <VersesProvider>
      <Bible route={route} />
    </VersesProvider>
  );
}
