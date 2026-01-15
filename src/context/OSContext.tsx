import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type GlassStyle = 'frosted' | 'liquid';
export type IconStyle = 'colorful' | 'monochrome';
export type Language = 'en' | 'de';

interface OSContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  glassStyle: GlassStyle;
  setGlassStyle: (style: GlassStyle) => void;
  iconStyle: IconStyle;
  setIconStyle: (style: IconStyle) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('os_theme') as Theme) || 'dark');
  const [glassStyle, setGlassStyle] = useState<GlassStyle>(() => (localStorage.getItem('os_glass_style') as GlassStyle) || 'liquid');
  const [iconStyle, setIconStyle] = useState<IconStyle>(() => (localStorage.getItem('os_icon_style') as IconStyle) || 'colorful');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('os_language') as Language) || 'en');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('os_gemini_api_key') || '');
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    localStorage.setItem('os_theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('os_glass_style', glassStyle);
  }, [glassStyle]);

  useEffect(() => {
    localStorage.setItem('os_icon_style', iconStyle);
  }, [iconStyle]);

  useEffect(() => {
    localStorage.setItem('os_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('os_gemini_api_key', apiKey);
  }, [apiKey]);

  return (
    <OSContext.Provider
      value={{
        theme,
        setTheme,
        glassStyle,
        setGlassStyle,
        iconStyle,
        setIconStyle,
        language,
        setLanguage,
        apiKey,
        setApiKey,
        isLocked,
        setIsLocked,
      }}
    >
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const context = useContext(OSContext);
  if (context === undefined) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
}
