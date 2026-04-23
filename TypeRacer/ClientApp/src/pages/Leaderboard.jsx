import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MODES = [
  { value: 'all', label: 'Sve' },
  { value: 'solo', label: 'Solo' },
  { value: 'multi', label: 'Višeigračko' },
]

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [mode, setMode] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?mode=${mode}`)
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mode])

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/')}>← Nazad</button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>Leaderboard</span>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
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
          <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                <th style={th}>#</th>
                <th style={{ ...th, textAlign: 'left' }}>Igrač</th>
                <th style={th}>Najbolji WPM</th>
                <th style={th}>Prosek</th>
                <th style={th}>Tačnost</th>
                <th style={th}>Igara</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Učitavanje...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Nema rezultata</td></tr>
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
                  <td style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{e.username}</td>
                  <td style={{ ...td, color: 'var(--primary)', fontWeight: 700 }}>{e.bestWpm}</td>
                  <td style={td}>{e.avgWpm}</td>
                  <td style={td}>{e.avgAccuracy}%</td>
                  <td style={{ ...td, color: 'var(--text-3)' }}>{e.games}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
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
