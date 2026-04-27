import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('pink');

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await axios.get('/api/settings/theme');
      setTheme(res.data.theme);
    } catch (err) {
      console.error('Failed to fetch theme:', err);
    }
  };

  const updateTheme = async (newTheme) => {
    try {
      await axios.post('/api/settings/theme', { theme: newTheme });
      setTheme(newTheme);
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  useEffect(() => {
    // Apply theme class to html element (root)
    document.documentElement.className = theme === 'pink' ? '' : `theme-${theme}`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
