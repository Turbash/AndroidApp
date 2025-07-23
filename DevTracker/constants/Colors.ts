/**
 * Modern blue-themed color system for DevTracker
 * Clean, professional, and mobile-friendly design
 */

const tintColorLight = '#2563eb'; // Blue-600
const tintColorDark = '#3b82f6';  // Blue-500

export const Colors = {
  light: {
    text: '#1e293b',           // Slate-800
    background: '#ffffff',     // White
    tint: tintColorLight,      // Blue-600
    icon: '#64748b',           // Slate-500
    tabIconDefault: '#94a3b8', // Slate-400
    tabIconSelected: tintColorLight,
    card: '#f8fafc',           // Slate-50
    border: '#e2e8f0',         // Slate-200
    success: '#059669',        // Emerald-600
    warning: '#d97706',        // Amber-600
    error: '#dc2626',          // Red-600
    accent: '#7c3aed',         // Violet-600
    secondary: '#64748b',      // Slate-500
    muted: '#f1f5f9',          // Slate-100
    surface: '#ffffff',        // White
  },
  dark: {
    text: '#f1f5f9',           // Slate-100
    background: '#0f172a',     // Slate-900
    tint: tintColorDark,       // Blue-500
    icon: '#94a3b8',           // Slate-400
    tabIconDefault: '#64748b', // Slate-500
    tabIconSelected: tintColorDark,
    card: '#1e293b',           // Slate-800
    border: '#334155',         // Slate-700
    success: '#10b981',        // Emerald-500
    warning: '#f59e0b',        // Amber-500
    error: '#ef4444',          // Red-500
    accent: '#8b5cf6',         // Violet-500
    secondary: '#94a3b8',      // Slate-400
    muted: '#334155',          // Slate-700
    surface: '#1e293b',        // Slate-800
  },
};