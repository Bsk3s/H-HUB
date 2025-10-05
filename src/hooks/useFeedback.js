import { useState, useCallback } from 'react';

/**
 * Hook for managing feedback states (toasts, success animations, etc.)
 */
export const useFeedback = () => {
  const [toasts, setToasts] = useState([]);
  const [successAnimation, setSuccessAnimation] = useState({ visible: false, message: '' });

  /**
   * Show a toast notification
   */
  const showToast = useCallback((message, type = 'success', options = {}) => {
    const toast = {
      id: Date.now() + Math.random(),
      message,
      type,
      visible: true,
      duration: options.duration || 3000,
      position: options.position || 'top',
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast
    setTimeout(() => {
      hideToast(toast.id);
    }, toast.duration + 300); // Account for hide animation
  }, []);

  /**
   * Hide a specific toast
   */
  const hideToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  /**
   * Show success toast with common success messages
   */
  const showSuccess = useCallback((message = 'Success!', options = {}) => {
    showToast(message, 'success', options);
  }, [showToast]);

  /**
   * Show error toast with common error handling
   */
  const showError = useCallback((message = 'Something went wrong', options = {}) => {
    showToast(message, 'error', options);
  }, [showToast]);

  /**
   * Show info toast
   */
  const showInfo = useCallback((message, options = {}) => {
    showToast(message, 'info', options);
  }, [showToast]);

  /**
   * Show warning toast
   */
  const showWarning = useCallback((message, options = {}) => {
    showToast(message, 'warning', options);
  }, [showToast]);

  /**
   * Show success animation overlay
   */
  const showSuccessAnimation = useCallback((message = '') => {
    setSuccessAnimation({ visible: true, message });

    // Auto-hide after animation completes
    setTimeout(() => {
      setSuccessAnimation({ visible: false, message: '' });
    }, 1500);
  }, []);

  /**
   * Clear all toasts
   */
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Common feedback for operations
   */
  const feedbackForOperation = useCallback(async (operation, messages = {}) => {
    const {
      loading = 'Processing...',
      success = 'Success!',
      error = 'Something went wrong',
    } = messages;

    let loadingToastId = null;

    try {
      // Show loading toast and track its ID
      const toast = {
        id: Date.now() + Math.random(),
        message: loading,
        type: 'info',
        visible: true,
        duration: 999999, // Very long duration since we'll hide it manually
        position: 'top',
      };
      loadingToastId = toast.id;
      setToasts(prev => [...prev, toast]);

      const result = await operation();

      // Hide loading toast
      if (loadingToastId) {
        hideToast(loadingToastId);
      }

      showSuccess(success);
      return result;
    } catch (err) {
      // Hide loading toast
      if (loadingToastId) {
        hideToast(loadingToastId);
      }

      showError(error);
      throw err;
    }
  }, [showSuccess, showError, hideToast]);

  return {
    // Toast state
    toasts,

    // Toast methods
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAllToasts,

    // Success animation
    successAnimation,
    showSuccessAnimation,

    // Utility methods
    feedbackForOperation,
  };
};


