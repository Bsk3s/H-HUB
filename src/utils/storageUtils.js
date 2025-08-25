// src/utils/storageUtils.js
// Enhanced AsyncStorage utilities with error handling

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserFriendlyErrorMessage } from './errorHandling';

/**
 * Safely get data from AsyncStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist or error occurs
 * @returns {Promise<any>} The stored value or default value
 */
export async function getStorageItem(key, defaultValue = null) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    
    // Try to parse JSON, fallback to raw string
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Safely set data in AsyncStorage with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function setStorageItem(key, value) {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error(`Error writing to storage (${key}):`, error);
    throw new Error('Unable to save data locally. Storage may be full.');
  }
}

/**
 * Safely remove data from AsyncStorage with error handling
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function removeStorageItem(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
    return false;
  }
}

/**
 * Get multiple keys from storage efficiently
 * @param {string[]} keys - Array of storage keys
 * @returns {Promise<Object>} Object with key-value pairs
 */
export async function getMultipleStorageItems(keys) {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result = {};
    
    pairs.forEach(([key, value]) => {
      if (value !== null) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error reading multiple storage items:', error);
    return {};
  }
}

/**
 * Set multiple key-value pairs efficiently
 * @param {Object} keyValuePairs - Object with key-value pairs to store
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function setMultipleStorageItems(keyValuePairs) {
  try {
    const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value)
    ]);
    
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('Error writing multiple storage items:', error);
    throw new Error('Unable to save data locally. Storage may be full.');
  }
}

/**
 * Clear all app data from storage (use with caution!)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

/**
 * Get storage usage information
 * @returns {Promise<Object>} Storage info object
 */
export async function getStorageInfo() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    
    let totalSize = 0;
    const itemSizes = {};
    
    pairs.forEach(([key, value]) => {
      const size = value ? value.length : 0;
      itemSizes[key] = size;
      totalSize += size;
    });
    
    return {
      totalItems: keys.length,
      totalSize,
      itemSizes,
      keys
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      totalItems: 0,
      totalSize: 0,
      itemSizes: {},
      keys: []
    };
  }
}

/**
 * Cache data with expiration
 * @param {string} key - Storage key
 * @param {any} data - Data to cache
 * @param {number} expirationMinutes - Cache expiration in minutes (default: 60)
 * @returns {Promise<boolean>} True if successful
 */
export async function setCacheItem(key, data, expirationMinutes = 60) {
  const cacheData = {
    value: data,
    timestamp: Date.now(),
    expiration: Date.now() + (expirationMinutes * 60 * 1000)
  };
  
  return await setStorageItem(`cache_${key}`, cacheData);
}

/**
 * Get cached data if not expired
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if cache miss or expired
 * @returns {Promise<any>} Cached value or default value
 */
export async function getCacheItem(key, defaultValue = null) {
  try {
    const cacheData = await getStorageItem(`cache_${key}`);
    
    if (!cacheData || !cacheData.expiration) {
      return defaultValue;
    }
    
    if (Date.now() > cacheData.expiration) {
      // Cache expired, remove it
      await removeStorageItem(`cache_${key}`);
      return defaultValue;
    }
    
    return cacheData.value;
  } catch (error) {
    console.error(`Error reading cache (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Check if cached data exists and is not expired
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} True if valid cache exists
 */
export async function isCacheValid(key) {
  try {
    const cacheData = await getStorageItem(`cache_${key}`);
    return cacheData && cacheData.expiration && Date.now() <= cacheData.expiration;
  } catch (error) {
    return false;
  }
}

export default {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getMultipleStorageItems,
  setMultipleStorageItems,
  clearAllStorage,
  getStorageInfo,
  setCacheItem,
  getCacheItem,
  isCacheValid
};


