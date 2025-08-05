/**
 * Main Theme Export
 * 
 * Central access point for all design tokens.
 * Import this file to access colors, spacing, typography.
 */

import { colors, tabColors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  tabColors,
  spacing,
  typography,
};

// Individual exports for convenience
export { colors, tabColors, spacing, typography }; 