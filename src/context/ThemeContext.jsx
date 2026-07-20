import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const ACCENT_PALETTES = {
  terracotta: { main: '#a13d2d', hover: '#8a3123' },
  sage: { main: '#4a5d4e', hover: '#3d4d40' },
  teal: { main: '#1e6b65', hover: '#154d49' },
  ochre: { main: '#b57c1e', hover: '#966617' },
  cobalt: { main: '#2b5a84', hover: '#1f4363' },
  plum: { main: '#884a62', hover: '#6f3b50' }
}

export const ThemeProvider = ({ children }) => {
  const [hasOverride, setHasOverride] = useState(() => {
    return localStorage.getItem('pinny-theme-overridden') === 'true'
  })

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('pinny-theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('pinny-accent') || 'terracotta'
  })

  useEffect(() => {
    if (hasOverride) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e) => {
      setDarkMode(e.matches)
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [hasOverride])

  useEffect(() => {
    const root = window.document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    if (hasOverride) {
      localStorage.setItem('pinny-theme', darkMode ? 'dark' : 'light')
      localStorage.setItem('pinny-theme-overridden', 'true')
    }
  }, [darkMode, hasOverride])

  useEffect(() => {
    const root = window.document.documentElement
    const palette = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.terracotta
    
    root.style.setProperty('--accent-color', palette.main)
    root.style.setProperty('--accent-hover-color', palette.hover)
    localStorage.setItem('pinny-accent', accentColor)
  }, [accentColor])

  const toggleTheme = () => {
    setHasOverride(true)
    setDarkMode(prev => !prev)
  }

  const resetToSystemTheme = () => {
    localStorage.removeItem('pinny-theme')
    localStorage.removeItem('pinny-theme-overridden')
    setHasOverride(false)
    setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        darkMode, 
        toggleTheme, 
        accentColor, 
        setAccentColor, 
        hasOverride, 
        resetToSystemTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}