import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const DEMO_SENTENCES = [
  "Programiranje zahteva strpljenje, logičko razmišljanje i kreativnost.",
  "Beograd leži na ušću Save u Dunav i predstavlja srce srpske kulture.",
  "Muzika ima moć da promeni raspoloženje i poveže ljude iz raznih kultura.",
]

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [demoIdx, setDemoIdx]     = useState(0)
  const [demoTyped, setDemoTyped] = useState(0)
  const [demoPhase, setDemoPhase] = useState('typing')

  const sentence = DEMO_SENTENCES[demoIdx]

  useEffect(() => {
    let t
    if (demoPhase === 'typing') {
      if (demoTyped < sentence.length) {
        t = setTimeout(() => setDemoTyped(n => n + 1), 72)
      } else {
        t = setTimeout(() => setDemoPhase('pause'), 2400)
      }
    } else if (demoPhase === 'pause') {
      t = setTimeout(() => setDemoPhase('deleting'), 400)
    } else {
      if (demoTyped > 0) {
        t = setTimeout(() => setDemoTyped(n => n - 1), 16)
      } else {
        setDemoIdx(i => (i + 1) % DEMO_SENTENCES.length)
        setDemoPhase('typing')
      }
    }
    return () => clearTimeout(t)
  }, [demoPhase, demoTyped, sentence.length])

  const demoPct = Math.round((demoTyped / sentence.length) * 100)
  const demoWpm = demoPhase === 'typing' && demoTyped > 10
    ? Math.round((demoTyped / 5) / ((demoTyped * 72) / 60000))
    : 0

  return (
    <div className="home-page">
      {/* ── Navbar ── */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <div className="home-nav-logo">
            <div className="logo-icon" style={{ width: 36, height: 36, fontSize: '1.1rem', borderRadius: 10 }}>⌨</div>
            <span className="logo-text" style={{ fontSize: '1.25rem' }}>TypeRacer</span>
          </div>
          <div className="home-nav-actions">
            {user ? (
              <>
                <button className="profile-avatar-btn" onClick={() => navigate('/profile')}>
                  <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
                  <span style={{ color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 500 }}>{user.username}</span>
                </button>
                <button className="btn btn-ghost" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }} onClick={logout}>
                  Odjavi se
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
                  Prijava
                </button>
                <button className="btn btn-primary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }} onClick={() => navigate('/register')}>
                  Registracija
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="home-content">
        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />

          <div className="hero-badge">🇷🇸 Srpski jezik · Besplatno</div>

          <h1 className="hero-title">
            Kucaj brže.
            <br />
            <span className="hero-title-accent">Pobedi sve.</span>
          </h1>

          <p className="hero-subtitle">
            Testiraj brzinu kucanja na srpskom jeziku —
            sam ili protiv prijatelja u realnom vremenu.
          </p>

          <div className="hero-ctas">
            <Link to="/solo" className="btn btn-primary btn-lg hero-cta-primary">
              ▶&nbsp; Počni odmah
            </Link>
            <Link to="/multi" className="btn btn-ghost btn-lg">
              👥&nbsp; Višeigračko
            </Link>
          </div>

          {/* Typing demo */}
          <div className="hero-demo">
            <div className="hero-demo-topbar">
              <span className="hero-demo-label">DEMO</span>
              {demoWpm > 0 && (
                <span className="hero-demo-wpm">{demoWpm} <span style={{ fontSize: '0.7rem', opacity: .6 }}>r/min</span></span>
              )}
              <span className="hero-demo-pct">{demoPct}%</span>
            </div>
            <div className="hero-demo-sentence">
              {sentence.split('').map((ch, i) => {
                let cls = 'ch ch-pending'
                if (i < demoTyped) cls = 'ch ch-correct'
                if (i === demoTyped && demoPhase === 'typing') cls = 'ch ch-cursor ch-pending'
                return <span key={i} className={cls}>{ch}</span>
              })}
            </div>
            <div className="hero-demo-track">
              <div className="hero-demo-fill" style={{ width: `${demoPct}%` }} />
            </div>
          </div>
        </section>

        {/* ── Mode cards ── */}
        <section className="home-modes-section">
          <div className="home-modes">
            <Link to="/solo" className="mode-card solo" style={{ animation: 'card-in .5s cubic-bezier(.22,1,.36,1) both', animationDelay: '.05s' }}>
              <div className="mode-icon">🏃</div>
              <div className="mode-title">Jedan igrač</div>
              <div className="mode-desc">Vežbaj sam, biraj težinu rečenica i prati napredak u brzini kucanja.</div>
              <div className="mode-arrow">Pokreni →</div>
            </Link>

            <Link to="/multi" className="mode-card multi" style={{ animation: 'card-in .5s cubic-bezier(.22,1,.36,1) both', animationDelay: '.13s' }}>
              <div className="mode-icon">🏁</div>
              <div className="mode-title">Više igrača</div>
              <div className="mode-desc">Napravi sobu, pozovi prijatelje i takmiči se u kucanju u realnom vremenu.</div>
              <div className="mode-arrow">Igraj →</div>
            </Link>

            <Link to="/leaderboard" className="mode-card leaderboard-card" style={{ animation: 'card-in .5s cubic-bezier(.22,1,.36,1) both', animationDelay: '.21s' }}>
              <div className="mode-icon">🏆</div>
              <div className="mode-title">Leaderboard</div>
              <div className="mode-desc">Pogledaj najbrže igrače i uporedi svoje rezultate sa ostatkom zajednice.</div>
              <div className="mode-arrow">Pogledaj →</div>
            </Link>
          </div>
        </section>

        {/* ── Features strip ── */}
        <div className="home-features">
          {[
            ['📝', '25+ rečenica'],
            ['🎯', '3 nivoa težine'],
            ['⚡', 'Bez dijakritika'],
            ['🔴', 'Realtime trka'],
            ['🏆', 'Rang lista'],
          ].map(([icon, label], i) => (
            <div key={i} className="home-feature">
              <span className="home-feature-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
