/**
 * 🎨 useTheme Hook
 * 
 * Provides easy access to centralized color tokens.
 * 
 * Usage:
 *   import { useTheme } from '../hooks/useTheme';
 *   
 *   const MyComponent = () => {
 *     const { colors } = useTheme();
 *     
 *     return (
 *       <View style={{ backgroundColor: colors.background }}>
 *         <Text style={{ color: colors.textPrimary }}>
 *           Hello!
 *         </Text>
 *       </View>
 *     );
 *   };
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider. Did you forget to wrap your app?');
    }

    return context;
};

