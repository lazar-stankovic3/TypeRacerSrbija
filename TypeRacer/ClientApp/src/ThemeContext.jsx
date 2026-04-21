import { createContext, useContext, useEffect, useState } from 'react'

const THEMES = ['dark', 'light', 'retro']
const THEME_ICONS = { dark: '🌙', light: '☀️', retro: '💻' }
const THEME_LABELS = { dark: 'Tamna', light: 'Svetla', retro: 'Retro' }

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'dark' ? '' : theme
    localStorage.setItem('theme', theme)
  }, [theme])

  function cycleTheme() {
    const idx = THEMES.indexOf(theme)
    setTheme(THEMES[(idx + 1) % THEMES.length])
  }

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme, THEME_ICONS, THEME_LABELS }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
