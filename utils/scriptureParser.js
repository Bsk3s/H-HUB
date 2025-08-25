/**
 * Utility functions for parsing scripture references
 */

// Common book name mappings and abbreviations
const BOOK_MAPPINGS = {
  // Old Testament
  'genesis': 'GEN',
  'gen': 'GEN',
  'exodus': 'EXO', 
  'exo': 'EXO',
  'leviticus': 'LEV',
  'lev': 'LEV',
  'numbers': 'NUM',
  'num': 'NUM',
  'deuteronomy': 'DEU',
  'deut': 'DEU',
  'deu': 'DEU',
  'joshua': 'JOS',
  'josh': 'JOS',
  'jos': 'JOS',
  'judges': 'JDG',
  'judg': 'JDG',
  'jdg': 'JDG',
  'ruth': 'RUT',
  'rut': 'RUT',
  '1 samuel': '1SA',
  '1sam': '1SA',
  '1sa': '1SA',
  '2 samuel': '2SA',
  '2sam': '2SA',
  '2sa': '2SA',
  '1 kings': '1KI',
  '1ki': '1KI',
  '2 kings': '2KI',
  '2ki': '2KI',
  '1 chronicles': '1CH',
  '1ch': '1CH',
  '2 chronicles': '2CH',
  '2ch': '2CH',
  'ezra': 'EZR',
  'ezr': 'EZR',
  'nehemiah': 'NEH',
  'neh': 'NEH',
  'esther': 'EST',
  'est': 'EST',
  'job': 'JOB',
  'psalms': 'PSA',
  'psalm': 'PSA',
  'psa': 'PSA',
  'ps': 'PSA',
  'proverbs': 'PRO',
  'prov': 'PRO',
  'pro': 'PRO',
  'ecclesiastes': 'ECC',
  'eccl': 'ECC',
  'ecc': 'ECC',
  'song of solomon': 'SNG',
  'song': 'SNG',
  'sng': 'SNG',
  'isaiah': 'ISA',
  'isa': 'ISA',
  'jeremiah': 'JER',
  'jer': 'JER',
  'lamentations': 'LAM',
  'lam': 'LAM',
  'ezekiel': 'EZK',
  'ezek': 'EZK',
  'ezk': 'EZK',
  'daniel': 'DAN',
  'dan': 'DAN',
  'hosea': 'HOS',
  'hos': 'HOS',
  'joel': 'JOL',
  'jol': 'JOL',
  'amos': 'AMO',
  'amo': 'AMO',
  'obadiah': 'OBA',
  'oba': 'OBA',
  'jonah': 'JON',
  'jon': 'JON',
  'micah': 'MIC',
  'mic': 'MIC',
  'nahum': 'NAM',
  'nam': 'NAM',
  'habakkuk': 'HAB',
  'hab': 'HAB',
  'zephaniah': 'ZEP',
  'zeph': 'ZEP',
  'zep': 'ZEP',
  'haggai': 'HAG',
  'hag': 'HAG',
  'zechariah': 'ZEC',
  'zech': 'ZEC',
  'zec': 'ZEC',
  'malachi': 'MAL',
  'mal': 'MAL',

  // New Testament
  'matthew': 'MAT',
  'matt': 'MAT',
  'mat': 'MAT',
  'mark': 'MRK',
  'mrk': 'MRK',
  'luke': 'LUK',
  'luk': 'LUK',
  'john': 'JHN',
  'jhn': 'JHN',
  'acts': 'ACT',
  'act': 'ACT',
  'romans': 'ROM',
  'rom': 'ROM',
  '1 corinthians': '1CO',
  '1cor': '1CO',
  '1co': '1CO',
  '2 corinthians': '2CO',
  '2cor': '2CO',
  '2co': '2CO',
  'galatians': 'GAL',
  'gal': 'GAL',
  'ephesians': 'EPH',
  'eph': 'EPH',
  'philippians': 'PHP',
  'phil': 'PHP',
  'php': 'PHP',
  'colossians': 'COL',
  'col': 'COL',
  '1 thessalonians': '1TH',
  '1thess': '1TH',
  '1th': '1TH',
  '2 thessalonians': '2TH',
  '2thess': '2TH',
  '2th': '2TH',
  '1 timothy': '1TI',
  '1tim': '1TI',
  '1ti': '1TI',
  '2 timothy': '2TI',
  '2tim': '2TI',
  '2ti': '2TI',
  'titus': 'TIT',
  'tit': 'TIT',
  'philemon': 'PHM',
  'phlm': 'PHM',
  'phm': 'PHM',
  'hebrews': 'HEB',
  'heb': 'HEB',
  'james': 'JAS',
  'jas': 'JAS',
  '1 peter': '1PE',
  '1pet': '1PE',
  '1pe': '1PE',
  '2 peter': '2PE',
  '2pet': '2PE',
  '2pe': '2PE',
  '1 john': '1JN',
  '1jn': '1JN',
  '2 john': '2JN',
  '2jn': '2JN',
  '3 john': '3JN',
  '3jn': '3JN',
  'jude': 'JUD',
  'jud': 'JUD',
  'revelation': 'REV',
  'rev': 'REV',
};

/**
 * Parse a scripture reference like "Psalm 46:10" or "1 Corinthians 13:4-7"
 * @param {string} reference - The scripture reference string
 * @returns {object|null} - Parsed reference object or null if invalid
 */
export function parseScriptureReference(reference) {
  if (!reference || typeof reference !== 'string') {
    return null;
  }

  // Clean up the reference
  const cleanRef = reference.trim().toLowerCase();
  
  // Regex patterns for different reference formats
  const patterns = [
    // "Psalm 46:10" or "1 Corinthians 13:4-7"
    /^(\d?\s*\w+)\s+(\d+):(\d+)(?:-(\d+))?$/,
    // "Psalm 46" (chapter only)
    /^(\d?\s*\w+)\s+(\d+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleanRef.match(pattern);
    if (match) {
      const bookName = match[1].trim();
      const chapter = parseInt(match[2]);
      const startVerse = match[3] ? parseInt(match[3]) : null;
      const endVerse = match[4] ? parseInt(match[4]) : startVerse;

      // Find book abbreviation
      const bookAbbrev = BOOK_MAPPINGS[bookName];
      if (!bookAbbrev) {
        console.warn(`Book not found for: ${bookName}`);
        return null;
      }

      return {
        book: bookAbbrev,
        bookName: bookName,
        chapter: chapter,
        startVerse: startVerse,
        endVerse: endVerse,
        hasVerses: startVerse !== null,
        originalReference: reference
      };
    }
  }

  console.warn(`Could not parse scripture reference: ${reference}`);
  return null;
}

/**
 * Get context verses around a target verse
 * @param {number} targetVerse - The main verse number
 * @param {number} contextSize - How many verses before/after (default: 2)
 * @returns {object} - Start and end verse numbers for context
 */
export function getContextRange(targetVerse, contextSize = 2) {
  const startVerse = Math.max(1, targetVerse - contextSize);
  const endVerse = targetVerse + contextSize;
  
  return {
    startVerse,
    endVerse,
    targetVerse
  };
}

/**
 * Create a Bible API-compatible book ID from abbreviation
 * @param {string} bookAbbrev - Book abbreviation (e.g., 'PSA')
 * @param {string} versionId - Bible version ID (e.g., 'de4e12af7f28f599-02')
 * @returns {string} - API book ID
 */
export function createBookId(bookAbbrev, versionId) {
  // Bible API typically uses format like "de4e12af7f28f599-02.PSA"
  return `${versionId}.${bookAbbrev}`;
}

/**
 * Create a Bible API-compatible chapter ID
 * @param {string} bookId - Book ID from createBookId
 * @param {number} chapter - Chapter number
 * @returns {string} - API chapter ID
 */
export function createChapterId(bookId, chapter) {
  // Bible API typically uses format like "de4e12af7f28f599-02.PSA.46"
  return `${bookId}.${chapter}`;
}

/**
 * Example usage:
 * 
 * const parsed = parseScriptureReference("Psalm 46:10");
 * // Returns: {
 * //   book: 'PSA',
 * //   bookName: 'psalm',
 * //   chapter: 46,
 * //   startVerse: 10,
 * //   endVerse: 10,
 * //   hasVerses: true,
 * //   originalReference: "Psalm 46:10"
 * // }
 * 
 * const context = getContextRange(10, 2);
 * // Returns: { startVerse: 8, endVerse: 12, targetVerse: 10 }
 */


