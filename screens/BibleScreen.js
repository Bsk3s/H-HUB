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

const getBibleVersions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/bibles`, {
      method: 'GET',
      headers,
    });

    await handleApiError(response, 'fetch Bible versions');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    throw error;
  }
};

const getBooks = async (bibleId) => {
  try {
    const response = await fetch(`${BASE_URL}/bibles/${bibleId}/books`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

const getChapters = async (bibleId, bookId) => {
  try {
    if (!bibleId || !bookId) {
      throw new Error('Bible ID and Book ID are required');
    }

    const response = await fetch(`${BASE_URL}/bibles/${bibleId}/books/${bookId}/chapters`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch chapters: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.data) {
      throw new Error('Invalid response format from API');
    }

    // Process chapters to ensure they have all required fields and filter out intros
    const processedChapters = data.data
      .filter(chapter => {
        const chapterNum = parseInt(chapter.number, 10);
        return !isNaN(chapterNum) && chapter.number !== 'intro';
      })
      .map(chapter => ({
        id: chapter.id,
        bookId: chapter.bookId,
        number: chapter.number,
        reference: chapter.reference || `Chapter ${chapter.number}`
      }));

    // Sort chapters by number
    processedChapters.sort((a, b) => {
      const aNum = parseInt(a.number, 10);
      const bNum = parseInt(b.number, 10);
      return aNum - bNum;
    });

    return processedChapters;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    throw error;
  }
};

const getChapterContent = async (bibleId, chapterId) => {
  try {
    // Skip intro chapters
    if (chapterId.endsWith('.intro')) {
      throw new Error('Cannot fetch content for intro chapters');
    }

    const response = await fetch(`${BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch chapter content: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.data) {
      throw new Error('Invalid response format from Bible API');
    }

    // Process the response to ensure we have the correct format
    const processedData = {
      id: data.data.id,
      bookId: data.data.bookId,
      number: data.data.number,
      reference: data.data.reference,
      verses: []
    };

    // Parse HTML content to extract verses
    if (typeof data.data.content === 'string') {
      const content = data.data.content;

      // Find all verse spans in the content
      const verses = [];

      // First, clean up the HTML content
      const cleanContent = content
        .replace(/<\/?p>/g, ' ')  // Replace paragraph tags with spaces
        .replace(/<br\s*\/?>/g, ' ')  // Replace line breaks with spaces
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .trim();

      // Split content by verse markers
      const verseParts = cleanContent.split(/<span[^>]*data-number="(\d+)"[^>]*class="v"[^>]*>\d+<\/span>/);

      for (let i = 1; i < verseParts.length; i += 2) {
        const verseNum = parseInt(verseParts[i], 10);
        let verseText = verseParts[i + 1] || '';

        // Clean up the verse text
        verseText = verseText
          .replace(/<[^>]+>/g, ' ')  // Remove any remaining HTML tags
          .replace(/¶/g, '')         // Remove pilcrow symbols
          .replace(/\s+/g, ' ')      // Normalize whitespace
          .trim();

        if (verseNum && verseText) {
          verses.push({
            id: `${chapterId}.${verseNum}`,
            number: verseNum,
            text: verseText
          });
        }
      }

      processedData.verses = verses;
    }

    // Sort verses by number
    processedData.verses.sort((a, b) => a.number - b.number);

    return processedData;
  } catch (error) {
    console.error('Error fetching chapter content:', error);
    throw error;
  }
};

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

// EXACT HB1 Bible Component
const Bible = () => {
  const scrollViewRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Bible data state
  const [versions, setVersions] = useState([]);
  const [categorizedVersions, setCategorizedVersions] = useState({
    priorityEnglish: [],
    otherEnglish: [],
    otherLanguages: {}
  });
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  
  // UI state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedBookInModal, setSelectedBookInModal] = useState(null);
  const [alphabeticalOrder, setAlphabeticalOrder] = useState(false);
  
  // Load Bible versions on mount
  useEffect(() => {
    loadBibleVersions();
  }, []);

  const loadBibleVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getBibleVersions();
      setVersions(data);

      // EXACT HB1 CATEGORIZATION LOGIC
      const PRIORITY_VERSIONS = ['KJV', 'NKJV', 'ESV', 'NIV', 'NLT', 'NASB', 'CSB'];
      
      // Categorize versions exactly like HB1
      const priority = [];
      const otherEnglish = [];
      const otherLanguages = {};

      data.forEach(version => {
        // Check if it's an English version
        if (version.language?.id === 'eng') {
          // Check if it's a priority version
          if (PRIORITY_VERSIONS.includes(version.abbreviation)) {
            priority.push(version);
          } else {
            otherEnglish.push(version);
          }
        } else {
          // Group by language
          const langName = version.language?.name || 'Other';
          if (!otherLanguages[langName]) {
            otherLanguages[langName] = [];
          }
          otherLanguages[langName].push(version);
        }
      });

      // Sort priority versions according to PRIORITY_VERSIONS order
      priority.sort((a, b) => {
        return PRIORITY_VERSIONS.indexOf(a.abbreviation) - PRIORITY_VERSIONS.indexOf(b.abbreviation);
      });

      // Sort other English versions alphabetically
      otherEnglish.sort((a, b) => a.name.localeCompare(b.name));

      // Sort other languages alphabetically
      Object.keys(otherLanguages).forEach(lang => {
        otherLanguages[lang].sort((a, b) => a.name.localeCompare(b.name));
      });

      setCategorizedVersions({
        priorityEnglish: priority,
        otherEnglish,
        otherLanguages
      });
      
      const savedVersionId = await AsyncStorage.getItem('currentBibleVersionId');
      let defaultVersion = null;
      
      if (savedVersionId) {
        const savedVersion = data.find(v => v.id === savedVersionId);
        if (savedVersion && savedVersion.language?.id === 'eng') {
          defaultVersion = savedVersion;
        }
      }
      
      if (!defaultVersion) {
        // Default to KJV or first priority version if available
        defaultVersion = priority.find(v => v.abbreviation === 'KJV') ||
          priority[0] ||
          otherEnglish[0] ||
          data[0];
      }
      
      if (defaultVersion) {
        setCurrentVersion(defaultVersion);
        await AsyncStorage.setItem('currentBibleVersionId', defaultVersion.id);
        await loadBooks(defaultVersion.id);
      } else {
        setError('No English Bible version could be found. Please check your connection or try resetting.');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading Bible versions:', err);
      setError('Failed to load Bible versions. Please check your internet connection.');
      setIsLoading(false);
    }
  };

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

  const loadChapters = async (versionId, bookId) => {
    try {
      const data = await getChapters(versionId, bookId);
      setChapters(data);
      
      // Try to load saved chapter or use first available
      const savedChapterId = await AsyncStorage.getItem('currentChapterId');
      const defaultChapter = savedChapterId ? 
        data.find(c => c.id === savedChapterId) : 
        data[0];
      
      if (defaultChapter) {
        setCurrentChapter(defaultChapter);
        await AsyncStorage.setItem('currentChapterId', defaultChapter.id);
        await loadVerses(versionId, defaultChapter.id);
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
      }
    } catch (err) {
      console.error('Error loading verses:', err);
      setError('Failed to load chapter content.');
    }
  };

  const handleVersionSelect = async (version) => {
    setCurrentVersion(version);
    setShowVersionModal(false);
    await AsyncStorage.setItem('currentBibleVersionId', version.id);
    await loadBooks(version.id);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#4B5563" />
          <Text style={{ color: '#6B7280', marginTop: 8 }}>Loading Bible...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
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
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding for floating buttons
      >
        {currentChapter && (
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 24 }}>
            {currentBook?.name} {currentChapter.number}
          </Text>
        )}
        
        {verses.length > 0 ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
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
            <Text style={{ color: '#6B7280', textAlign: 'center' }}>
              Select a Bible version, book, and chapter to begin reading.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Navigation */}
      <FloatingNavigation
        onPrevious={() => handleNavigate('prev')}
        onNext={() => handleNavigate('next')}
      />

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
                {/* Priority English Versions */}
                {categorizedVersions.priorityEnglish.length > 0 && (
                  <>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8, marginTop: 8, paddingHorizontal: 4 }}>Popular English Versions</Text>
                    {categorizedVersions.priorityEnglish.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleVersionSelect(item)}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                          backgroundColor: currentVersion?.id === item.id ? '#DBEAFE' : '#F3F4F6'
                        }}
                      >
                        <Text style={{ fontWeight: '600', color: '#1F2937' }}>{item.abbreviation}</Text>
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Other English Versions */}
                {categorizedVersions.otherEnglish.length > 0 && (
                  <>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8, marginTop: 16, paddingHorizontal: 4 }}>Other English Versions</Text>
                    {categorizedVersions.otherEnglish.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleVersionSelect(item)}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                          backgroundColor: currentVersion?.id === item.id ? '#DBEAFE' : '#F3F4F6'
                        }}
                      >
                        <Text style={{ fontWeight: '500', color: '#1F2937' }}>{item.abbreviation}</Text>
                        <Text style={{ fontSize: 14, color: '#6B7280' }}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Other Languages */}
                {Object.keys(categorizedVersions.otherLanguages).length > 0 && (
                  <>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8, marginTop: 16, paddingHorizontal: 4 }}>Other Languages</Text>
                    {Object.entries(categorizedVersions.otherLanguages).map(([languageName, languageVersions]) => (
                      <View key={languageName}>
                        <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 12, paddingHorizontal: 4 }}>{languageName}</Text>
                        {languageVersions.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => handleVersionSelect(item)}
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              marginBottom: 8,
                              backgroundColor: currentVersion?.id === item.id ? '#DBEAFE' : '#F3F4F6'
                            }}
                          >
                            <Text style={{ fontWeight: '500', color: '#1F2937' }}>{item.abbreviation}</Text>
                            <Text style={{ fontSize: 14, color: '#6B7280' }}>{item.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </>
                )}
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
    </SafeAreaView>
  );
};

// Main BibleScreen component wrapped in context
export default function BibleScreen() {
  return (
    <VersesProvider>
      <Bible />
    </VersesProvider>
  );
