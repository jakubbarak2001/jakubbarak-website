/**
 * Theme initialization script
 * This script should be included inline in the <head> to prevent flash of unstyled content (FOUC)
 */

export function getThemePreference(): 'dark' | 'light' {
  // Check localStorage first
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  // Fall back to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function applyTheme(theme: 'dark' | 'light'): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function initializeTheme(): void {
  const theme = getThemePreference();
  applyTheme(theme);
}

// Listen for system theme changes
export function watchSystemTheme(): void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  mediaQuery.addEventListener('change', (e) => {
    // Only apply system preference if user hasn't set a preference
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Inline script to be placed in <head> for immediate theme application
 * This prevents flash of unstyled content (FOUC)
 */
export const themeInitScript = `
  (function() {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
`;
