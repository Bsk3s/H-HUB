/**
 * 🎨 Theme Context
 * 
 * Provides centralized color tokens throughout the app.
 * Light-mode only to preserve Heavenly Hub's warm, uplifting brand.
 * 
 * Usage:
 *   import { useTheme } from '../hooks/useTheme';
 *   const { colors } = useTheme();
 */

import React, { createContext } from 'react';
import { colors } from '../theme/colors';

export const ThemeContext = createContext({
    colors: {},
});

export const ThemeProvider = ({ children }) => {
    const value = {
        colors,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
