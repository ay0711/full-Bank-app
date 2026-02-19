import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  
  // Settings state with localStorage persistence
  const [settings, setSettings] = useState({
    language: 'English',
    currency: 'NGN',  // Default to Nigerian Naira (base currency)
    displayDensity: 'Comfortable',
    themePreference: 'Auto',
    sessionTimeout: '30 minutes',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    twoFactorAuth: false,
    biometricLogin: false
  });

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedSettings = localStorage.getItem('appSettings');
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      if (parsedSettings.themePreference === 'Dark') {
        setIsDarkMode(true);
        document.body.classList.add('dark-mode');
      } else if (parsedSettings.themePreference === 'Auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        if (prefersDark) document.body.classList.add('dark-mode');
      }
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const updateSettings = (newSettings) => {
    const prevThemePreference = settings.themePreference;
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));

    // Apply theme changes only when the preference changes
    if (newSettings.themePreference !== prevThemePreference) {
      if (newSettings.themePreference === 'Dark') {
        setIsDarkMode(true);
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else if (newSettings.themePreference === 'Light') {
        setIsDarkMode(false);
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      } else if (newSettings.themePreference === 'Auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        if (prefersDark) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      }
    }
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    setUser: updateUser,
    isDarkMode,
    toggleTheme,
    isBalanceVisible,
    toggleBalanceVisibility,
    settings,
    updateSettings,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
