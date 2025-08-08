import AsyncStorage from '@react-native-async-storage/async-storage';
import dailyVerses from '../../assets/daily_verses_365.json';

/**
 * Simple Daily Verse Service
 * Handles fetching daily verses with caching
 */
class DailyVerseService {
  
  /**
   * Get today's verse based on day of year
   * @returns {Promise<Object>} Today's verse object
   */
  async getTodaysVerse() {
    try {
      console.log('📖 DailyVerseService: Getting today\'s verse...');
      console.log('📖 Verses array length:', dailyVerses ? dailyVerses.length : 'undefined');
      
      // Check cache first
      const cachedVerse = await this.getCachedVerse();
      if (cachedVerse && this.isSameDay(cachedVerse.date, new Date())) {
        console.log('📖 Using cached verse:', cachedVerse.verse);
        return cachedVerse.verse;
      }

      // Calculate today's verse
      const today = new Date();
      const dayOfYear = this.getDayOfYear(today);
      const verseIndex = (dayOfYear - 1) % 365; // Handle leap years
      
      console.log('📖 Today:', today.toDateString());
      console.log('📖 Day of year:', dayOfYear);
      console.log('📖 Verse index:', verseIndex);
      
      const todaysVerse = dailyVerses[verseIndex];
      console.log('📖 Today\'s verse:', todaysVerse);
      
      if (!todaysVerse) {
        // Fallback to first verse if something goes wrong
        console.warn('Could not find verse for day:', dayOfYear, 'using first verse');
        return dailyVerses[0];
      }

      // Cache the verse with today's date
      await this.cacheVerse(todaysVerse, today);

      return todaysVerse;
    } catch (error) {
      console.error('📖 Error getting today\'s verse:', error);
      // Return fallback verse
      return {
        day: 1,
        verse: "1 John 4:16",
        text: "And we have known and believed the love that God has for us. God is love, and he who abides in love abides in God, and God in him.",
        theme: "Love",
        category: ["comfort", "popular"],
        version: "NKJV"
      };
    }
  }

  /**
   * Calculate day of year from date
   * @param {Date} date - Date object
   * @returns {number} Day of year (1-365/366)
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * Check if two dates are the same day
   * @param {Date|string} date1 
   * @param {Date|string} date2 
   * @returns {boolean}
   */
  isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  /**
   * Cache verse with timestamp
   * @param {Object} verse - Verse object
   * @param {Date} date - Date for cache
   */
  async cacheVerse(verse, date) {
    try {
      const cacheData = {
        verse,
        date: date.toISOString(),
        timestamp: Date.now()
      };
      await AsyncStorage.setItem('daily_verse_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching verse:', error);
    }
  }

  /**
   * Get cached verse if it's still valid for today
   * @returns {Promise<Object|null>}
   */
  async getCachedVerse() {
    try {
      const cached = await AsyncStorage.getItem('daily_verse_cache');
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      return cacheData;
    } catch (error) {
      console.error('Error getting cached verse:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new DailyVerseService();
