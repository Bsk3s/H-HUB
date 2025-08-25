import React, { createContext, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFeedback } from '../../hooks/useFeedback';
import Toast from './Toast';
import SuccessAnimation from './SuccessAnimation';

const FeedbackContext = createContext(null);

/**
 * Provider for feedback system (toasts, animations, etc.)
 */
export const FeedbackProvider = ({ children }) => {
  const feedback = useFeedback();

  return (
    <FeedbackContext.Provider value={feedback}>
      <View style={styles.container}>
        {children}
        
        {/* Render all active toasts */}
        {feedback.toasts.map((toast) => (
          <Toast
            key={toast.id}
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            position={toast.position}
            onHide={() => feedback.hideToast(toast.id)}
          />
        ))}

        {/* Success animation overlay */}
        <SuccessAnimation
          visible={feedback.successAnimation.visible}
          onComplete={() => {
            // Animation completed
          }}
        />
      </View>
    </FeedbackContext.Provider>
  );
};

/**
 * Hook to use feedback context
 */
export const useFeedbackContext = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedbackContext must be used within a FeedbackProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


