import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TypingBox from '../components/TypingBox.jsx'
import WpmChart from '../components/WpmChart.jsx'
import { useAuth } from '../AuthContext.jsx'
import { sounds, isMuted, toggleMute } from '../sounds.js'

export default function DailyChallenge() {
  const [sentence, setSentence] = useState(null)
  const [phase, setPhase] = useState('ready')
  const [wpm, setWpm] = useState(0)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [finalWpm, setFinalWpm] = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const [finalAccuracy, setFinalAccuracy] = useState(0)
  const [displayWpm, setDisplayWpm] = useState(0)
  const [eloGained, setEloGained] = useState(0)
  const [muted, setMuted] = useState(isMuted())
  const [wpmHistory, setWpmHistory] = useState([])
  const [dailyBoard, setDailyBoard] = useState([])
  const [loadingBoard, setLoadingBoard] = useState(false)
  const timerRef = useRef(null)
  const startRef = useRef(null)
  const wpmRef = useRef(0)
  const samplerRef = useRef(null)
  const navigate = useNavigate()
  const { token } = useAuth()

  const todayStr = new Date().toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })

  useEffect(() => {
    fetch('/api/sentences/daily')
      .then(r => r.json())
      .then(data => setSentence(data))
      .catch(() => {})
  }, [])

  function loadBoard() {
    setLoadingBoard(true)
    fetch('/api/leaderboard/daily')
      .then(r => r.json())
      .then(data => { setDailyBoard(data); setLoadingBoard(false) })
      .catch(() => setLoadingBoard(false))
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Tab' && phase === 'finished') {
        e.preventDefault()
        restart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  function restart() {
    setPhase('ready')
    setWpm(0)
    setProgress(0)
    setElapsed(0)
    setWpmHistory([])
    clearInterval(timerRef.current)
    clearInterval(samplerRef.current)
  }

  function handleStart() {
    if (phase !== 'ready') return
    startRef.current = Date.now()
    wpmRef.current = 0
    setWpmHistory([])
    setPhase('playing')
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 500)
    samplerRef.current = setInterval(() => {
      setWpmHistory(prev => [...prev, wpmRef.current])
    }, 1000)
  }

  async function handleFinish(w, accuracy) {
    clearInterval(timerRef.current)
    clearInterval(samplerRef.current)
    const t = Math.floor((Date.now() - startRef.current) / 1000)
    setFinalWpm(w)
    setFinalTime(t)
    setFinalAccuracy(accuracy)
    setWpmHistory(prev => [...prev, w])
    sounds.finish()
    setPhase('finished')

    if (token) {
      try {
        const res = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ wpm: w, accuracy, mode: 'daily', sentenceDifficulty: 4 })
        })
        const data = await res.json()
        setEloGained(data.eloGained ?? 0)
      } catch {}
      loadBoard()
    }
  }

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(samplerRef.current) }, [])

  useEffect(() => {
    if (phase !== 'finished') return
    setDisplayWpm(0)
    const steps = 45
    const delay = 900 / steps
    let step = 0
    const id = setInterval(() => {
      step++
      setDisplayWpm(Math.round(finalWpm * (step / steps)))
      if (step >= steps) clearInterval(id)
    }, delay)
    return () => clearInterval(id)
  }, [phase, finalWpm])

  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/')}>← Nazad</button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>
          📅 Dnevni izazov — {todayStr}
        </span>
        <button
          className="btn btn-ghost"
          style={{ padding: '0.25rem 0.6rem', fontSize: '1rem', lineHeight: 1 }}
          onClick={() => setMuted(toggleMute())}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 10, color: '#34d399', fontSize: '0.85rem' }}>
        Svi igrači danas dobijaju istu rečenicu · ELO bonus <strong>1.5×</strong>
      </div>

      {phase !== 'finished' ? (
        <>
          <div className="stats-row">
            <div className={`stat-box${phase === 'playing' ? ' highlight' : ''}`}>
              <div className="stat-label">Brzina</div>
              <div className="stat-value">{wpm}</div>
              <div className="stat-unit">reči / min</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Napredak</div>
              <div className="stat-value">{progress}%</div>
              <div className="stat-unit">
                <div style={{ marginTop: 6, height: 4, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #34d399, #6ee7b7)', transition: 'width .3s', borderRadius: 999 }} />
                </div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Vreme</div>
              <div className="stat-value">{fmtTime(elapsed)}</div>
              <div className="stat-unit">{phase === 'ready' ? 'kucaj da počneš' : 'u toku'}</div>
            </div>
          </div>

          <TypingBox
            sentence={sentence?.text}
            onProgress={(p, w) => { setProgress(p); setWpm(w); wpmRef.current = w }}
            onFinish={handleFinish}
            disabled={phase === 'ready'}
          />

          {phase === 'playing' && wpmHistory.length >= 2 && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Brzina</div>
              <WpmChart values={wpmHistory} height={60} />
            </div>
          )}

          {phase === 'ready' && (
            <div className="text-center mt-lg">
              <button className="btn btn-primary btn-lg" onClick={handleStart}>
                ▶ Pokreni
              </button>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                ili jednostavno počni da kucaš
              </p>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 520, margin: '0 auto' }}>
          <div className="card text-center" style={{ animation: 'pop-in .55s cubic-bezier(.22,1,.36,1) both' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>📅</div>
              <div className="finished-title">Izazov završen!</div>
            </div>

            <div className="finished-wpm wpm-appear">{displayWpm}</div>
            <div className="finished-wpm-label">reči u minuti</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.5rem 0' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vreme</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{fmtTime(finalTime)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tačnost</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{finalAccuracy}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Znakova</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{sentence?.text.length}</div>
              </div>
            </div>

            {wpmHistory.length >= 2 && (
              <div style={{ margin: '0 0 1.25rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Kriva brzine</div>
                <WpmChart values={wpmHistory} height={64} />
              </div>
            )}

            {eloGained > 0 && (
              <div style={{ background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.25)', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', color: '#34d399', fontWeight: 700 }}>
                +{eloGained} ELO 🏅
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={restart}>Pokušaj ponovo</button>
              <button className="btn btn-ghost" onClick={() => navigate('/')}>Meni</button>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '1rem' }}>Tab → pokušaj ponovo</p>
          </div>

          {/* Dnevni leaderboard */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', animation: 'card-in .5s cubic-bezier(.22,1,.36,1) both', animationDelay: '.15s' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
              🏅 Dnevna rang lista — {todayStr}
            </div>
            {loadingBoard ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)' }}>Učitavanje...</div>
            ) : dailyBoard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)' }}>Još nema rezultata za danas.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Igrač', 'WPM', 'Tačnost'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 1rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600, textAlign: h === 'Igrač' ? 'left' : 'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dailyBoard.map((e, i) => (
                    <tr key={e.username} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'center', fontWeight: 700, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-3)' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{e.username}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700 }}>{e.bestWpm}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'center', color: 'var(--text-2)' }}>{e.avgAccuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
