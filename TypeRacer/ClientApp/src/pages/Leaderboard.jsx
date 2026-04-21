import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MODES = [
  { value: 'all',      label: 'Sve' },
  { value: 'solo',     label: 'Solo' },
  { value: 'multi',    label: 'Višeigračko' },
  { value: 'alphabet', label: 'Abeceda' },
  { value: 'daily',    label: 'Dnevni' },
]

const RANKS = [
  { min: 3000, icon: '👑' },
  { min: 1500, icon: '💎' },
  { min: 700,  icon: '🥇' },
  { min: 300,  icon: '🥈' },
  { min: 0,    icon: '🥉' },
]

function eloIcon(elo) {
  return (RANKS.find(r => (elo ?? 0) >= r.min) ?? RANKS[RANKS.length - 1]).icon
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [mode, setMode] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    const url = mode === 'daily' ? '/api/leaderboard/daily' : `/api/leaderboard?mode=${mode}`
    fetch(url)
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mode])

  const isDailyMode = mode === 'daily'

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/')}>← Nazad</button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>Leaderboard</span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {MODES.map(m => (
            <button
              key={m.value}
              className={`btn ${mode === m.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                <th style={th}>#</th>
                <th style={{ ...th, textAlign: 'left' }}>Igrač</th>
                <th style={th}>Najbolji WPM</th>
                {!isDailyMode && <th style={th}>Prosek</th>}
                <th style={th}>Tačnost</th>
                {!isDailyMode && <th style={th}>ELO</th>}
                <th style={th}>{isDailyMode ? 'Pokušaji' : 'Igara'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Učitavanje...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Nema rezultata</td></tr>
              ) : entries.map((e, i) => (
                <tr
                  key={e.username}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    animation: 'slide-in-left .4s cubic-bezier(.22,1,.36,1) both',
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <td style={{ ...td, fontWeight: 700, color: rankColor(i) }}>{rankLabel(i)}</td>
                  <td style={{ ...td, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {!isDailyMode && <span style={{ fontSize: '0.85rem' }}>{eloIcon(e.elo)}</span>}
                      <span style={{ fontWeight: 600 }}>{e.username}</span>
                    </div>
                  </td>
                  <td style={{ ...td, color: 'var(--primary)', fontWeight: 700 }}>{e.bestWpm}</td>
                  {!isDailyMode && <td style={td}>{e.avgWpm}</td>}
                  <td style={td}>{e.avgAccuracy}%</td>
                  {!isDailyMode && (
                    <td style={{ ...td, color: '#a78bfa', fontWeight: 700 }}>{e.elo ?? 0}</td>
                  )}
                  <td style={{ ...td, color: 'var(--text-3)' }}>{isDailyMode ? e.attempts : e.games}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const th = { padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', fontWeight: 600, textAlign: 'center' }
const td = { padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.95rem' }

function rankLabel(i) {
  if (i === 0) return '🥇'
  if (i === 1) return '🥈'
  if (i === 2) return '🥉'
  return `#${i + 1}`
}

function rankColor(i) {
  if (i === 0) return '#f59e0b'
  if (i === 1) return '#94a3b8'
  if (i === 2) return '#b45309'
  return 'var(--text-1)'
}
