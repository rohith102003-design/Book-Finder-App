import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'theme_preference';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'dark';
    }
    return true; // Default to dark mode as originally designed
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return { darkMode, toggleDarkMode };
}
