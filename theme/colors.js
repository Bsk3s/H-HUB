/**
 * App Color System
 * 
 * Single source of truth for all colors.
 * Based on HB1 design system for consistency.
 */

export const colors = {
  // Primary brand colors
  primary: '#2c3e50',      // Header background
  primaryText: '#ffffff',  // Text on primary background
  
  // Neutral grays (matches HB1 gray scale)
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',      // Light borders
  gray700: '#374151',      // Dark text, icons
  gray900: '#111827',      // Headings
  
  // Interactive states
  overlay: 'rgba(0, 0, 0, 0.5)',  // Modal backgrounds
  
  // Semantic colors
  destructive: '#e74c3c',  // Delete, logout actions
};

// Tab bar colors (from existing app)
export const tabColors = {
  active: '#3498db',
  inactive: 'gray',
  background: '#ffffff',
  border: '#e0e0e0',
}; 