/**
 * 🎨 Semantic Color System
 * 
 * Centralized color tokens for Heavenly Hub.
 * Light-mode only to preserve the app's warm, uplifting aesthetic.
 * 
 * Usage:
 *   import { colors } from './colors';
 *   backgroundColor: colors.background
 */

export const colors = {
    // Background System
    background: '#FFFFFF',           // Main screen background
    backgroundSecondary: '#F8F9FA',  // Cards, sections
    backgroundTertiary: '#F1F3F5',   // Subtle backgrounds
    surface: '#FFFFFF',              // Elevated surfaces (modals)
    overlay: 'rgba(0, 0, 0, 0.5)',   // Modal backdrop

    // Text System
    textPrimary: '#111827',          // Main text (not pure black for readability)
    textSecondary: '#6B7280',        // Subtitles, descriptions
    textTertiary: '#9CA3AF',         // Placeholders, disabled text
    textInverse: '#FFFFFF',          // Text on colored backgrounds

    // UI Elements
    primary: '#007AFF',              // Brand blue (iOS standard)
    primaryDark: '#0051D5',          // Pressed state
    border: '#E5E7EB',               // Borders
    borderLight: '#F3F4F6',          // Subtle dividers
    separator: '#E5E7EB',            // Line separators
    shadow: 'rgba(0, 0, 0, 0.1)',    // Shadows

    // Semantic Colors
    success: '#10B981',              // Green
    warning: '#F59E0B',              // Orange
    error: '#EF4444',                // Red
    info: '#3B82F6',                 // Blue

    // Bible-Specific
    bibleText: '#1F2937',            // Optimized for long reading
    bibleVerse: '#6B7280',           // Verse numbers
    bibleHighlight: '#FEF3C7',       // Yellow highlight

    // Tab Bar
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabBarActive: '#007AFF',
    tabBarInactive: '#8E8E93',

    // Cards & Sections
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E7EB',
    sectionBackground: '#F8F9FA',

    // Special Surfaces
    pillarFaith: '#3B82F6',          // Blue
    pillarHope: '#8B5CF6',           // Purple
    pillarPrayer: '#EC4899',         // Pink
    pillarLove: '#EF4444',           // Red
};

