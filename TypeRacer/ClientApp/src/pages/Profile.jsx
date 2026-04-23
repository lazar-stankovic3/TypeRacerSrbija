import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import WpmChart from '../components/WpmChart.jsx'

export default function Profile() {
  const { user, token, logout } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetch('/api/results/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const bestWpm = results.length ? Math.max(...results.map(r => r.wpm)) : 0
  const avgWpm = results.length ? Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length) : 0
  const avgAcc = results.length ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length) : 0
  const soloGames = results.filter(r => r.mode === 'solo').length
  const multiGames = results.filter(r => r.mode === 'multi').length
  const trendValues = [...results].reverse().slice(-30).map(r => r.wpm)

  function fmtDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
  }

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

        <div className="stats-2col" style={{ animation: 'card-in .4s cubic-bezier(.22,1,.36,1) both', animationDelay: '0.12s' }}>
          <div className="stat-box">
            <div className="stat-label">Solo igre</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{soloGames}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Multi igre</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{multiGames}</div>
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
              <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={th}>WPM</th>
                    <th style={th}>Tačnost</th>
                    <th style={th}>Mod</th>
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
                          background: r.mode === 'solo' ? 'var(--primary-dim)' : 'var(--accent-dim)',
                          color: r.mode === 'solo' ? '#c4b5fd' : 'var(--accent)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 999,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          {r.mode === 'solo' ? 'Solo' : 'Multi'}
                        </span>
                      </td>
                      <td style={{ ...td, color: 'var(--text-3)', fontSize: '0.8rem' }}>{fmtDate(r.playedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const th = { padding: '0.6rem 1rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600, textAlign: 'center' }
const td = { padding: '0.7rem 1rem', textAlign: 'center', fontSize: '0.9rem' }
