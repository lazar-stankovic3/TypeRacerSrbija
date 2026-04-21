import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import WpmChart from '../components/WpmChart.jsx'

const RANKS = [
  { min: 3000, label: 'Master',   icon: '👑', cls: 'rank-master'  },
  { min: 1500, label: 'Diamond',  icon: '💎', cls: 'rank-diamond' },
  { min: 700,  label: 'Gold',     icon: '🥇', cls: 'rank-gold'    },
  { min: 300,  label: 'Silver',   icon: '🥈', cls: 'rank-silver'  },
  { min: 0,    label: 'Bronze',   icon: '🥉', cls: 'rank-bronze'  },
]

function getRank(elo) {
  return RANKS.find(r => elo >= r.min) ?? RANKS[RANKS.length - 1]
}

function getNextRank(elo) {
  const idx = RANKS.findIndex(r => elo >= r.min)
  return idx > 0 ? RANKS[idx - 1] : null
}

function EloProgress({ elo }) {
  const rank = getRank(elo)
  const next = getNextRank(elo)
  if (!next) return (
    <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}>Maksimalni rang!</div>
  )

  const progress = Math.round(((elo - rank.min) / (next.min - rank.min)) * 100)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.3rem' }}>
        <span>{rank.icon} {rank.label} ({rank.min})</span>
        <span>{next.icon} {next.label} ({next.min})</span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #a78bfa)', borderRadius: 999, transition: 'width .4s' }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>
        {next.min - elo} ELO do sledećeg ranga
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, token, logout } = useAuth()
  const [results, setResults] = useState([])
  const [elo, setElo] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetch('/api/results/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false) })
      .catch(() => setLoading(false))

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.elo != null) setElo(data.elo) })
      .catch(() => {})
  }, [token])

  // fallback: calculate elo from results if /me not available
  useEffect(() => {
    if (elo === 0 && results.length > 0) {
      const total = results.reduce((s, r) => s + (r.eloGained ?? 0), 0)
      setElo(total)
    }
  }, [results])

  const bestWpm = results.length ? Math.max(...results.map(r => r.wpm)) : 0
  const avgWpm = results.length ? Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length) : 0
  const avgAcc = results.length ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length) : 0
  const soloGames = results.filter(r => r.mode === 'solo').length
  const multiGames = results.filter(r => r.mode === 'multi').length
  const dailyGames = results.filter(r => r.mode === 'daily').length
  const trendValues = [...results].reverse().slice(-30).map(r => r.wpm)

  const rank = getRank(elo)

  function fmtDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
  }

  const modeLabel = m => ({ solo: 'Solo', multi: 'Multi', daily: 'Dnevni', alphabet: 'Abc' }[m] ?? m)
  const modeColor = m => ({ solo: 'var(--primary-dim)', multi: 'var(--accent-dim)', daily: 'rgba(52,211,153,.1)', alphabet: 'rgba(245,158,11,.1)' }[m] ?? 'var(--border)')
  const modeText  = m => ({ solo: '#c4b5fd', multi: 'var(--accent)', daily: '#34d399', alphabet: '#f59e0b' }[m] ?? 'var(--text-2)')

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/')}>← Nazad</button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>Profil</span>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem', animation: 'card-in .4s cubic-bezier(.22,1,.36,1) both' }}>
          <div className="profile-avatar profile-avatar-lg">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{user?.username}</div>
            <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{user?.email}</div>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }} onClick={() => { logout(); navigate('/') }}>
            Odjavi se
          </button>
        </div>

        {/* ELO / Rank card */}
        <div className="card" style={{ marginBottom: '1.25rem', animation: 'card-in .4s cubic-bezier(.22,1,.36,1) both', animationDelay: '0.05s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>{rank.icon}</div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', fontWeight: 600 }}>Rang</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }} className={rank.cls}>{rank.label}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', fontWeight: 600 }}>ELO</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>{elo}</div>
            </div>
          </div>
          <EloProgress elo={elo} />
        </div>

        {/* Stats */}
        <div className="stats-row" style={{ marginBottom: '1.25rem', animation: 'card-in .4s cubic-bezier(.22,1,.36,1) both', animationDelay: '0.07s' }}>
          <div className="stat-box highlight">
            <div className="stat-label">Rekord</div>
            <div className="stat-value">{bestWpm}</div>
            <div className="stat-unit">r/min</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Prosek</div>
            <div className="stat-value">{avgWpm}</div>
            <div className="stat-unit">r/min</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Tačnost</div>
            <div className="stat-value">{avgAcc}%</div>
            <div className="stat-unit">prosečno</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem', animation: 'card-in .4s cubic-bezier(.22,1,.36,1) both', animationDelay: '0.12s' }}>
          <div className="stat-box">
            <div className="stat-label">Solo</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{soloGames}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Multi</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{multiGames}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Dnevni</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{dailyGames}</div>
          </div>
        </div>

        {/* WPM trend */}
        {trendValues.length >= 2 && (
          <div className="card" style={{ marginBottom: '1.25rem', animation: 'card-in .4s cubic-bezier(.22,1,.36,1) both', animationDelay: '0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', fontWeight: 600 }}>
                Trend brzine
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                poslednje {trendValues.length} igara
              </div>
            </div>
            <WpmChart values={trendValues} height={80} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>min {Math.min(...trendValues)} r/m</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>max {Math.max(...trendValues)} r/m</div>
            </div>
          </div>
        )}

        {/* History */}
        <div style={{ animation: 'card-in .4s cubic-bezier(.22,1,.36,1) both', animationDelay: '0.18s' }}>
          <div className="section-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
            Istorija igara
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', padding: '2rem' }}>Učitavanje...</div>
          ) : results.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', padding: '2rem' }}>
              Još nema odigranih igara.
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={th}>WPM</th>
                    <th style={th}>Tačnost</th>
                    <th style={th}>Mod</th>
                    <th style={th}>ELO</th>
                    <th style={th}>Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        animation: 'slide-in-left .35s cubic-bezier(.22,1,.36,1) both',
                        animationDelay: `${i * 0.04}s`
                      }}
                    >
                      <td style={{ ...td, color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem' }}>{r.wpm}</td>
                      <td style={td}>{r.accuracy}%</td>
                      <td style={td}>
                        <span style={{
                          background: modeColor(r.mode),
                          color: modeText(r.mode),
                          padding: '0.2rem 0.6rem',
                          borderRadius: 999,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          {modeLabel(r.mode)}
                        </span>
                      </td>
                      <td style={{ ...td, color: '#a78bfa', fontWeight: 700 }}>
                        {r.eloGained > 0 ? `+${r.eloGained}` : '—'}
                      </td>
                      <td style={{ ...td, color: 'var(--text-3)', fontSize: '0.8rem' }}>{fmtDate(r.playedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const th = { padding: '0.6rem 1rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600, textAlign: 'center' }
const td = { padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.9rem' }
