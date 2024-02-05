// Any component within your application
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <h2>Select Theme Mode</h2>
      <label>
        <input
          type="radio"
          name="theme"
          value="light"
          checked={theme === 'light'}
          onChange={() => toggleTheme('light')}
        />
        Light Mode
      </label>
      <label>
        <input
          type="radio"
          name="theme"
          value="dark"
          checked={theme === 'dark'}
          onChange={() => toggleTheme('dark')}
        />
        Dark Mode
      </label>
    </div>
  );
};

export default ThemeSelector;

