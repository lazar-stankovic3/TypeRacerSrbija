import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const googleToken = params.get('token')
    if (googleToken) {
      saveAuth(googleToken)
      window.history.replaceState({}, '', '/')
      return
    }
    const stored = localStorage.getItem('token')
    if (stored) {
      const payload = parseJwt(stored)
      if (payload && payload.exp * 1000 > Date.now()) {
        setToken(stored)
        setUser({ id: payload.sub, username: payload.username, email: payload.email })
      } else {
        localStorage.removeItem('token')
      }
    }
  }, [])

  function saveAuth(t) {
    const payload = parseJwt(t)
    localStorage.setItem('token', t)
    setToken(t)
    setUser({ id: payload.sub, username: payload.username, email: payload.email })
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

function parseJwt(t) {
  try {
    return JSON.parse(atob(t.split('.')[1]))
  } catch {
    return null
  }
}
