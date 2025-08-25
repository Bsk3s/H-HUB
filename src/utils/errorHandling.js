// src/utils/errorHandling.js
// Centralized error handling utilities

import { Alert } from 'react-native';

/**
 * Maps technical errors to user-friendly messages
 */
const ERROR_MESSAGES = {
  // Network errors
  'Network request failed': 'Unable to connect to the server. Please check your internet connection and try again.',
  'TypeError: Network request failed': 'Unable to connect to the server. Please check your internet connection and try again.',
  'Failed to fetch': 'Unable to connect to the server. Please check your internet connection and try again.',
  
  // Authentication errors
  'Invalid login credentials': 'The email or password you entered is incorrect. Please try again.',
  'User not found': 'No account found with this email address.',
  'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
  'Password too weak': 'Your password must be at least 8 characters long.',
  'Email already registered': 'An account with this email already exists. Try signing in instead.',
  
  // Supabase errors
  'JWT expired': 'Your session has expired. Please sign in again.',
  'Invalid JWT': 'Your session is invalid. Please sign in again.',
  'Permission denied': 'You don\'t have permission to access this content.',
  'Row Level Security': 'Access denied. Please ensure you\'re signed in.',
  
  // Bible API errors
  'API rate limit exceeded': 'Too many requests. Please wait a moment and try again.',
  'Bible version not found': 'The requested Bible version is not available.',
  'Chapter not found': 'The requested chapter could not be found.',
  
  // General errors
  'timeout': 'The request took too long. Please try again.',
  'TIMEOUT': 'The request took too long. Please try again.',
  'Parse error': 'There was a problem processing the data. Please try again.',
  'JSON Parse error': 'There was a problem processing the data. Please try again.',
};

/**
 * Get a user-friendly error message from a technical error
 * @param {Error|string} error - The error object or message
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyErrorMessage(error) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';
  
  // Check for exact matches first
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Special cases for common error patterns
  if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('DNS')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
    return 'The request took too long. Please try again.';
  }
  
  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return 'You need to sign in to access this feature.';
  }
  
  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return 'You don\'t have permission to access this content.';
  }
  
  if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
    return 'The requested content could not be found.';
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
    return 'There\'s a temporary problem with our servers. Please try again later.';
  }
  
  // Fallback to a generic message
  return 'Something went wrong. Please try again, and if the problem persists, contact support.';
}

/**
 * Show a user-friendly error alert
 * @param {Error|string} error - The error object or message
 * @param {string} title - Optional title for the alert
 * @param {function} onPress - Optional callback when user presses OK
 */
export function showErrorAlert(error, title = 'Oops!', onPress = null) {
  const message = getUserFriendlyErrorMessage(error);
  
  Alert.alert(
    title,
    message,
    [
      {
        text: 'OK',
        onPress: onPress || (() => {}),
        style: 'default'
      }
    ]
  );
}

/**
 * Show a retry error alert with both Retry and Cancel options
 * @param {Error|string} error - The error object or message
 * @param {function} onRetry - Function to call when user presses Retry
 * @param {function} onCancel - Optional function to call when user presses Cancel
 * @param {string} title - Optional title for the alert
 */
export function showRetryErrorAlert(error, onRetry, onCancel = null, title = 'Connection Problem') {
  const message = getUserFriendlyErrorMessage(error);
  
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel || (() => {})
      },
      {
        text: 'Retry',
        style: 'default',
        onPress: onRetry
      }
    ]
  );
}

/**
 * Wraps an async function with error handling
 * @param {function} asyncFunction - The async function to wrap
 * @param {object} options - Configuration options
 * @param {string} options.defaultMessage - Default error message if no specific match found
 * @param {boolean} options.showAlert - Whether to show an alert on error (default: false)
 * @param {function} options.onError - Custom error handler function
 * @returns {function} Wrapped function that handles errors gracefully
 */
export function withErrorHandling(asyncFunction, options = {}) {
  const {
    defaultMessage = 'Something went wrong. Please try again.',
    showAlert = false,
    onError = null
  } = options;
  
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      console.error('Error in wrapped function:', error);
      
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      const errorToThrow = new Error(friendlyMessage);
      
      if (onError) {
        onError(errorToThrow);
      }
      
      if (showAlert) {
        showErrorAlert(errorToThrow);
      }
      
      throw errorToThrow;
    }
  };
}

/**
 * Validates internet connectivity and throws appropriate error
 * @returns {Promise<boolean>} True if connected
 */
export async function checkConnectivity() {
  try {
    // Simple connectivity check - try to fetch a small resource
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    throw new Error('No internet connection. Please check your network and try again.');
  }
}

export default {
  getUserFriendlyErrorMessage,
  showErrorAlert,
  showRetryErrorAlert,
  withErrorHandling,
  checkConnectivity
};


