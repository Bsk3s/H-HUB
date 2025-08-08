/**
 * Typography System
 * 
 * Consistent text styles across the app.
 * Based on HB1 design with React Native font weights.
 */

export const typography = {
  // Font sizes (matches Tailwind scale)
  fontSize: {
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,    // Header titles (Tailwind text-2xl)
    '3xl': 30,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',    // Tailwind font-medium
    semibold: '600',  // Tailwind font-semibold  
    bold: '700',
  },
  
  // Line heights (for readable text)
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Pre-composed text styles (virus-proof, no external dependencies)
  heading: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
}; 