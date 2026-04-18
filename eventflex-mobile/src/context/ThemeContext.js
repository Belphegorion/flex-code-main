import React, { createContext, useState, useEffect, useContext } from "react";
import { colors } from "../theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    }
    // In a real React Native app, we would use AsyncStorage instead of localStorage
    // For Expo, we can use AsyncStorage from @react-native-async-storage/async-storage
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      // Save preference
      // In a real app, we would use AsyncStorage
      // localStorage.setItem('theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  };

  // Return theme-specific colors
  const themeColors = {
    ...colors,
    // Override or add theme-specific colors if needed
    background: isDark ? colors.gray900 : colors.gray50,
    surface: isDark ? colors.gray800 : colors.white,
    textPrimary: isDark ? colors.gray100 : colors.gray900,
    textSecondary: isDark ? colors.gray300 : colors.gray600,
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
