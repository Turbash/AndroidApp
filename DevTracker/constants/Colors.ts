/**
 * Clean blue-themed color system for DevTracker
 * Blue as accent, white/neutral backgrounds for modern feel
 */

const tintColorLight = '#2563eb'; // Blue-600
const tintColorDark = '#3b82f6';  // Blue-500

export const Colors = {
  light: {
    text: '#1f2937',           // Gray-800
    background: '#ffffff',     // White
    tint: tintColorLight,      // Blue-600
    icon: '#6b7280',           // Gray-500
    tabIconDefault: '#9ca3af', // Gray-400
    tabIconSelected: tintColorLight,
    card: '#ffffff',           // White
    border: '#e5e7eb',         // Gray-200
    success: '#10b981',        // Emerald-500
    warning: '#f59e0b',        // Amber-500
    error: '#ef4444',          // Red-500
    accent: '#2563eb',         // Blue-600
    secondary: '#6b7280',      // Gray-500
    muted: '#f9fafb',          // Gray-50
    surface: '#f8fafc',        // Slate-50
  },
  dark: {
    text: '#f9fafb',           // Gray-50
    background: '#111827',     // Gray-900
    tint: tintColorDark,       // Blue-500
    icon: '#9ca3af',           // Gray-400
    tabIconDefault: '#6b7280', // Gray-500
    tabIconSelected: tintColorDark,
    card: '#1f2937',           // Gray-800
    border: '#374151',         // Gray-700
    success: '#34d399',        // Emerald-400
    warning: '#fbbf24',        // Amber-400
    error: '#f87171',          // Red-400
    accent: '#3b82f6',         // Blue-500
    secondary: '#9ca3af',      // Gray-400
    muted: '#374151',          // Gray-700
    surface: '#1f2937',        // Gray-800
  },
};