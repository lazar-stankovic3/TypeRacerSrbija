import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useTheme } from '../ThemeContext'

const MODES = [
  { to: '/solo',        label: 'Solo' },
  { to: '/multi',       label: 'Multiplayer' },
  { to: '/alphabet',    label: 'Abeceda' },
  { to: '/daily',       label: 'Dnevni izazov' },
  { to: '/leaderboard', label: 'Rang lista' },
]

const FEATURES = [
  'Srpski jezik',
  'Bez dijakritika',
  '3 nivoa težine',
  'Real-time trke',
  'ELO rang sistem',
]

export default function Home() {
  const { user, logout } = useAuth()
  const { theme, cycleTheme, THEME_ICONS } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="home-nav-inner">
          <Link to="/" className="home-logo">
            <span className="home-logo-icon">⌨</span>
            <span>TypeRacer</span>
          </Link>

          <div className="home-nav-actions">
            <button
              className="btn btn-ghost btn-icon"
              onClick={cycleTheme}
              title={`Tema: ${theme}`}
            >
              {THEME_ICONS[theme]}
            </button>

            {user ? (
              <>
                <button className="profile-avatar-btn" onClick={() => navigate('/profile')}>
                  <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
                  <span className="nav-username" style={{ color: 'var(--text-2)', fontSize: '0.82rem', fontWeight: 500 }}>
                    {user.username}
                  </span>
                </button>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Odjava</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Prijava</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Registracija</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="home-main">
        <div className="home-hero">
          <h1 className="home-hero-title">
            kucaj brže.<br />
            <span className="home-hero-accent">pobedi sve.</span>
          </h1>
          <p className="home-hero-sub">
            Testiraj brzinu kucanja — sam ili protiv prijatelja u realnom vremenu.
          </p>
          <div className="home-hero-ctas">
            <Link to="/solo" className="btn btn-primary btn-lg">▶ Počni odmah</Link>
            <Link to="/multi" className="btn btn-ghost btn-lg">Više igrača</Link>
          </div>
        </div>

        <nav className="home-mode-tabs">
          {MODES.map(({ to, label }) => (
            <Link key={to} to={to} className="home-mode-tab">
              {label}
            </Link>
          ))}
        </nav>

        <div className="home-features">
          {FEATURES.map((f, i) => (
            <span key={f} className="home-feature">
              {i > 0 && '· '}{f}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
