// Theme utility functions
import { useTheme } from '../context/ThemeContext';

export const useThemeClasses = () => {
  const { theme } = useTheme();
  
  return {
    // Background classes
    bgPrimary: 'theme-bg-primary',
    bgSecondary: 'theme-bg-secondary', 
    bgCard: 'theme-bg-card',
    
    // Text classes
    textPrimary: 'theme-text-primary',
    textSecondary: 'theme-text-secondary',
    textMuted: 'theme-text-muted',
    
    // Border classes
    border: 'theme-border',
    
    // Combined common patterns
    card: 'theme-bg-card theme-text-primary theme-border',
    page: 'theme-bg-primary theme-text-primary',
    
    // Direct theme access
    isDark: theme === 'dark',
    theme,
  };
};

// Static theme classes (for components that don't need the hook)
export const themeClasses = {
  bgPrimary: 'theme-bg-primary',
  bgSecondary: 'theme-bg-secondary', 
  bgCard: 'theme-bg-card',
  textPrimary: 'theme-text-primary',
  textSecondary: 'theme-text-secondary',
  textMuted: 'theme-text-muted',
  border: 'theme-border',
  card: 'theme-bg-card theme-text-primary border theme-border',
  page: 'theme-bg-primary theme-text-primary',
};
