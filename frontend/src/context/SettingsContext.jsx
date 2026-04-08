import React, { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

const defaultSettings = {
  defaultGradeMode: 'suggested',
  strictAIPenalty: false,
  emailNotifs: true,
};

export const SettingsProvider = ({ children }) => {
  // Load initial state from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('eduscore_settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to parse settings from localStorage");
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('eduscore_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};
