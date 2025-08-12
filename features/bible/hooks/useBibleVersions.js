import { useState, useEffect } from 'react';
import { getBibleVersions } from '../services/bibleService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Core Bible versions - limited to 5 for better UX (using available public domain versions)
const CORE_BIBLE_VERSIONS = ['engKJV', 'WEB', 'ASV', 'LSV', 'FBV'];

// Complete Bible versions whitelist - safety net for scripture navigation (using actual API abbreviations)
const COMPLETE_VERSIONS = [
  'engKJV', 'WEB', 'ASV', 'LSV', 'FBV', 'BSB', 'engDRA', 
  'engEMTV', 'enggnv', 'engRV', 'T4T', 'ASVBT', 'engLXXup',
  'engbrent', 'engKJVCPB', 'engF35', 'TOJB2011', 'TCENT',
  'engWEBU', 'WMB', 'WMBBE', 'WEBBE'
];

// Legacy priority versions (keeping for backward compatibility)
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
          // Default selection logic: WEB > first core > first complete > any available
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

  // Categorize versions with hybrid filtering
  const categorizeVersions = (versionsData) => {
    const coreVersions = [];
    const completeVersions = [];
    const otherVersions = [];
    const otherLanguages = {};

    versionsData.forEach(version => {
      const abbreviation = version.abbreviation || version.nameLocal || version.name;
      
      if (version.language?.id === 'eng') {
        // English versions with hybrid filtering
        const isCoreVersion = CORE_BIBLE_VERSIONS.includes(abbreviation);
        const isCompleteVersion = COMPLETE_VERSIONS.includes(abbreviation);
        
        if (isCoreVersion && isCompleteVersion) {
          // Perfect: Core version that's also complete
          coreVersions.push(version);
        } else if (isCompleteVersion) {
          // Safety net: Complete version but not in core 5
          completeVersions.push(version);
        } else {
          // Other English versions (potentially incomplete)
          otherVersions.push(version);
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

    // Sort core versions by preference order (engKJV → WEB → ASV → LSV → FBV)
    coreVersions.sort((a, b) => {
      const aIndex = CORE_BIBLE_VERSIONS.indexOf(a.abbreviation || a.nameLocal || a.name);
      const bIndex = CORE_BIBLE_VERSIONS.indexOf(b.abbreviation || b.nameLocal || b.name);
      return aIndex - bIndex;
    });

    // Sort complete versions alphabetically (safety net)
    completeVersions.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Sort other versions alphabetically
    otherVersions.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Sort languages and their versions alphabetically
    Object.keys(otherLanguages).forEach(lang => {
      otherLanguages[lang].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });



    return {
      priorityEnglish: coreVersions, // Legacy compatibility - now contains filtered core versions
      otherEnglish: completeVersions, // Safety net versions
      otherVersions, // Other English versions (potentially incomplete)
      otherLanguages
    };
  };

  // Get default version with hybrid logic
  const getDefaultVersion = (categorized) => {
    // Try WEB first (most modern public domain version)
    const web = categorized.priorityEnglish.find(v => 
      (v.abbreviation || v.nameLocal || v.name) === 'WEB'
    );
    if (web) return web.id;

    // Try first core version (engKJV, ASV, LSV, FBV in that order)
    if (categorized.priorityEnglish.length > 0) {
      return categorized.priorityEnglish[0].id;
    }

    // Safety net: Try first complete version
    if (categorized.otherEnglish.length > 0) {
      return categorized.otherEnglish[0].id;
    }

    // Last resort: Try any version
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
