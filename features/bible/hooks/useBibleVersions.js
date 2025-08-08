import { useState, useEffect } from 'react';
import { getBibleVersions } from '../services/bibleService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Priority English versions
const PRIORITY_VERSIONS = ['KJV', 'NKJV', 'ESV', 'NIV', 'NLT', 'NASB', 'CSB'];

/**
 * Hook to fetch and manage Bible versions
 * @returns {Object} Bible versions data and state
 */
const useBibleVersions = () => {
  const [versions, setVersions] = useState([]);
  const [categorizedVersions, setCategorizedVersions] = useState({
    priorityEnglish: [],
    otherEnglish: [],
    otherLanguages: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVersionId, setCurrentVersionId] = useState(null);

  // Fetch Bible versions on mount
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        
        // Try to get cached current version
        const cachedVersionId = await AsyncStorage.getItem('selectedBibleVersion');
        
        const versionsData = await getBibleVersions();
        setVersions(versionsData);
        
        // Categorize versions
        const categorized = categorizeVersions(versionsData);
        setCategorizedVersions(categorized);
        
        // Set current version (cached or default)
        let selectedVersionId = cachedVersionId;
        
        if (!selectedVersionId || !versionsData.some(v => v.id === selectedVersionId)) {
          // Default selection logic: KJV > first priority > first other English > any available
          selectedVersionId = getDefaultVersion(categorized);
        }
        
        setCurrentVersionId(selectedVersionId);
        
      } catch (err) {
        console.error('Error fetching Bible versions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, []);

  // Categorize versions
  const categorizeVersions = (versionsData) => {
    const priorityEnglish = [];
    const otherEnglish = [];
    const otherLanguages = {};

    versionsData.forEach(version => {
      const abbreviation = version.abbreviation || version.nameLocal || version.name;
      
      if (version.language?.id === 'eng') {
        // English versions
        if (PRIORITY_VERSIONS.includes(abbreviation)) {
          priorityEnglish.push(version);
        } else {
          otherEnglish.push(version);
        }
      } else {
        // Non-English versions
        const languageName = version.language?.name || 'Other';
        if (!otherLanguages[languageName]) {
          otherLanguages[languageName] = [];
        }
        otherLanguages[languageName].push(version);
      }
    });

    // Sort priority English by PRIORITY_VERSIONS order
    priorityEnglish.sort((a, b) => {
      const aIndex = PRIORITY_VERSIONS.indexOf(a.abbreviation || a.nameLocal || a.name);
      const bIndex = PRIORITY_VERSIONS.indexOf(b.abbreviation || b.nameLocal || b.name);
      return aIndex - bIndex;
    });

    // Sort other English alphabetically
    otherEnglish.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Sort languages and their versions alphabetically
    Object.keys(otherLanguages).forEach(lang => {
      otherLanguages[lang].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });

    return {
      priorityEnglish,
      otherEnglish,
      otherLanguages
    };
  };

  // Get default version
  const getDefaultVersion = (categorized) => {
    // Try KJV first
    const kjv = categorized.priorityEnglish.find(v => 
      (v.abbreviation || v.nameLocal || v.name) === 'KJV'
    );
    if (kjv) return kjv.id;

    // Try first priority version
    if (categorized.priorityEnglish.length > 0) {
      return categorized.priorityEnglish[0].id;
    }

    // Try first other English version
    if (categorized.otherEnglish.length > 0) {
      return categorized.otherEnglish[0].id;
    }

    // Try any version
    const allLanguageVersions = Object.values(categorized.otherLanguages).flat();
    if (allLanguageVersions.length > 0) {
      return allLanguageVersions[0].id;
    }

    return null;
  };

  // Change version and cache selection
  const changeVersion = async (versionId) => {
    try {
      setCurrentVersionId(versionId);
      await AsyncStorage.setItem('selectedBibleVersion', versionId);
    } catch (err) {
      console.error('Error caching Bible version:', err);
    }
  };

  // Get current version object
  const getCurrentVersion = () => {
    return versions.find(v => v.id === currentVersionId) || null;
  };

  return {
    versions,
    categorizedVersions,
    loading,
    error,
    currentVersionId,
    currentVersion: getCurrentVersion(),
    changeVersion
  };
};

export default useBibleVersions;
