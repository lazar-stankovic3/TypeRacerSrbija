import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const CHARS = 'asdfghjklqwertyuiopzxcvbnm{}[]()<>|/\\;:'.split('')

function useFloatingChars(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W, H, particles, raf

    function resize() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    function make() {
      return {
        x:    Math.random() * W,
        y:    Math.random() * H,
        ch:   CHARS[Math.floor(Math.random() * CHARS.length)],
        size: 10 + Math.random() * 10,
        vx:   (Math.random() - 0.5) * 0.35,
        vy:   -0.2 - Math.random() * 0.4,
        alpha: 0.04 + Math.random() * 0.13,
        life:  0,
        maxLife: 180 + Math.random() * 220,
      }
    }

    function init() {
      resize()
      particles = Array.from({ length: 55 }, make)
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.font = `500 {size}px 'JetBrains Mono', monospace`

      for (const p of particles) {
        p.life++
        p.x += p.vx
        p.y += p.vy

        const progress = p.life / p.maxLife
        const fade = progress < 0.1
          ? progress / 0.1
          : progress > 0.8
          ? 1 - (progress - 0.8) / 0.2
          : 1

        ctx.globalAlpha = p.alpha * fade
        ctx.fillStyle = Math.random() > 0.97 ? '#f0b429' : '#7c5af6'
        ctx.font = `500 ${p.size}px 'JetBrains Mono', monospace`
        ctx.fillText(p.ch, p.x, p.y)

        if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > W + 20) {
          Object.assign(p, make(), { y: H + 10 })
        }
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    init()
    draw()

    const ro = new ResizeObserver(() => { resize() })
    ro.observe(canvas)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
}

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  useFloatingChars(canvasRef)

  return (
    <div className="home-page" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

      {/* Canvas pozadina */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      />

      {/* Navbar */}
      <nav className="home-nav" style={{ position: 'relative', zIndex: 10 }}>
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

      {/* Sadržaj */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', gap: '3rem', padding: '2rem' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', animation: 'card-in .6s cubic-bezier(.22,1,.36,1) both' }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-dim)', border: '1px solid rgba(124,90,246,.3)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
            🇷🇸 Srpski jezik
          </div>
          <h1 className="hero-title" style={{ marginBottom: '1rem' }}>
            Kucaj brže.
            <br />
            <span className="hero-title-accent">Pobedi sve.</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', maxWidth: 400, margin: '0 auto' }}>
            Testiraj brzinu kucanja — sam ili protiv prijatelja u realnom vremenu.
          </p>
        </div>

        {/* CTA dugmad */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', animation: 'card-in .6s cubic-bezier(.22,1,.36,1) both', animationDelay: '.1s' }}>
          <Link to="/solo" className="btn btn-primary btn-lg">▶ Počni odmah</Link>
          <Link to="/multi" className="btn btn-ghost btn-lg">👥 Višeigračko</Link>
        </div>

        {/* Mode kartice */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: 640, width: '100%', animation: 'card-in .6s cubic-bezier(.22,1,.36,1) both', animationDelay: '.2s' }}>
          {[
            { to: '/solo',        icon: '🏃', label: 'Jedan igrač',  color: 'var(--primary)', dim: 'var(--primary-dim)' },
            { to: '/multi',       icon: '🏁', label: 'Više igrača',  color: 'var(--accent)',  dim: 'var(--accent-dim)'  },
            { to: '/leaderboard', icon: '🏆', label: 'Rang lista',   color: '#34d399',        dim: 'rgba(52,211,153,.1)' },
          ].map(({ to, icon, label, color, dim }) => (
            <Link key={to} to={to} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14,
              padding: '1.25rem 1rem', textDecoration: 'none', color: 'var(--text)',
              transition: 'border-color .2s, transform .2s, box-shadow .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${color}30` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: '2.5rem', color: 'var(--text-3)', fontSize: '0.8rem', animation: 'card-in .6s cubic-bezier(.22,1,.36,1) both', animationDelay: '.3s' }}>
          {[['⚡', 'Bez dijakritika'], ['🎯', '3 nivoa težine'], ['🔴', 'Realtime']].map(([icon, label]) => (
            <span key={label}>{icon} {label}</span>
          ))}
        </div>

      </div>
    </div>
  )
}
