// Any component within your application
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="themeSelector">
      <h2>Select Theme</h2>
      <label>
        <input
					className="radioButton"
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
					className="radioButton"
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

