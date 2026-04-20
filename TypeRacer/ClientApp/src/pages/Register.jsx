import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveAuth } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message); return }
      saveAuth(data.token)
      navigate('/')
    } catch {
      setError('Greška pri konekciji.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/')}>← Nazad</button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>Registracija</span>
      </div>

      <div className="menu-card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Napravite nalog</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Korisničko ime</label>
            <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} required maxLength={20} autoComplete="username" />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="field">
            <label className="field-label">Lozinka</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}

          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginBottom: '0.75rem' }}>
            {loading ? 'Učitavanje...' : 'Registruj se'}
          </button>
        </form>

        <div className="divider">ili</div>

        <a href="/api/auth/google" className="btn btn-ghost w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <GoogleIcon /> Nastavi sa Google-om
        </a>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-3)', fontSize: '0.85rem' }}>
          Već imate nalog? <Link to="/login" style={{ color: 'var(--primary)' }}>Prijavite se</Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.9 6.2C12.8 13.2 17.9 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 6.9-10 6.9-17z"/>
      <path fill="#FBBC05" d="M10.9 28.5A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5L2.4 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.4 10.7l8.5-6.2z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.3-7.7 2.3-6.1 0-11.2-3.7-13.1-9l-7.9 6.2C6.9 42.6 14.8 48 24 48z"/>
    </svg>
  )
}
