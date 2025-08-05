/**
 * Spacing System
 * 
 * Consistent spacing values across the app.
 * Based on 4px base unit (standard mobile design).
 */

export const spacing = {
  // Base units (4px increments)
  xs: 4,    // 1 unit
  sm: 8,    // 2 units  
  md: 12,   // 3 units
  lg: 16,   // 4 units (Tailwind px-4)
  xl: 20,   // 5 units
  xxl: 24,  // 6 units
  
  // Common padding combinations
  padding: {
    screen: 20,        // Standard screen padding
    card: 16,          // Card/component padding
    button: 12,        // Button padding
  },
  
  // Safe area top padding will be handled by useSafeAreaInsets()
}; 