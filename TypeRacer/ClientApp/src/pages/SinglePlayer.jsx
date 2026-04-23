import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TypingBox from '../components/TypingBox.jsx'
import WpmChart from '../components/WpmChart.jsx'
import { useAuth } from '../AuthContext.jsx'
import { sounds, isMuted, toggleMute } from '../sounds.js'

const DIFFICULTIES = [
  { value: '',  label: 'Sve' },
  { value: '1', label: 'Lako' },
  { value: '2', label: 'Srednje' },
  { value: '3', label: 'Teško' },
]

export default function SinglePlayer() {
  const [sentence, setSentence] = useState(null)
  const [difficulty, setDifficulty] = useState('')
  const [phase, setPhase] = useState('ready')
  const [wpm, setWpm] = useState(0)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [finalWpm, setFinalWpm] = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const [finalAccuracy, setFinalAccuracy] = useState(0)
  const [displayWpm, setDisplayWpm] = useState(0)
  const [personalBest, setPersonalBest] = useState(null)
  const [isNewPb, setIsNewPb] = useState(false)
  const [muted, setMuted] = useState(isMuted())
  const [wpmHistory, setWpmHistory] = useState([])
  const timerRef = useRef(null)
  const startRef = useRef(null)
  const wpmRef = useRef(0)
  const samplerRef = useRef(null)
  const navigate = useNavigate()
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return
    fetch('/api/results/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const best = data.reduce((max, r) => r.wpm > max ? r.wpm : max, 0)
        if (best > 0) setPersonalBest(best)
      })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Tab') {
        e.preventDefault()
        if (phase === 'finished' || phase === 'ready') loadSentence()
      }
      if (e.key === 'Enter' && phase === 'finished') loadSentence()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, difficulty])

  async function loadSentence() {
    const url = difficulty ? `/api/sentences/random?difficulty=${difficulty}` : '/api/sentences/random'
    const res = await fetch(url)
    const data = await res.json()
    setSentence(data)
    setPhase('ready')
    setWpm(0)
    setProgress(0)
    setElapsed(0)
    setWpmHistory([])
    clearInterval(timerRef.current)
    clearInterval(samplerRef.current)
  }

  useEffect(() => { loadSentence() }, [difficulty])

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
    const t = Math.floor((Date.now() - startRef.current) / 1000)
    setFinalWpm(w)
    setFinalTime(t)
    setFinalAccuracy(accuracy)
    clearInterval(samplerRef.current)
    setWpmHistory(prev => [...prev, w])
    sounds.finish()
    const pb = personalBest ?? 0
    if (w > pb) {
      setPersonalBest(w)
      setIsNewPb(true)
    } else {
      setIsNewPb(false)
    }
    setPhase('finished')

    if (token) {
      fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wpm: w, accuracy, mode: 'solo' })
      }).catch(() => {})
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
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>Jedan igrač</span>
        <button
          className="btn btn-ghost"
          style={{ padding: '0.25rem 0.6rem', fontSize: '1rem', lineHeight: 1 }}
          title={muted ? 'Uključi zvuk' : 'Isključi zvuk'}
          onClick={() => setMuted(toggleMute())}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="diff-tabs">
        {DIFFICULTIES.map(d => (
          <button
            key={d.value}
            className={`diff-tab${difficulty === d.value ? ' active' : ''}`}
            onClick={() => setDifficulty(d.value)}
          >
            {d.label}
          </button>
        ))}
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
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #a78bfa)', transition: 'width .3s', borderRadius: 999 }} />
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
        <div className="card text-center" style={{ maxWidth: 420, margin: '0 auto', animation: 'pop-in .55s cubic-bezier(.22,1,.36,1) both' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🏆</div>
            <div className="finished-title">Završeno!</div>
          </div>

          <div className="finished-wpm wpm-appear">{displayWpm}</div>
          <div className="finished-wpm-label">reči u minuti</div>

          <div className="finished-stats">
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

          {isNewPb && (
            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              ⭐ Novi lični rekord!
            </div>
          )}
          {!isNewPb && personalBest != null && (
            <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              Lični rekord: {personalBest} rč/min
            </div>
          )}

          {token && <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginBottom: '1rem' }}>✓ Rezultat sačuvan na leaderboard-u</p>}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={loadSentence}>Nova rečenica</button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Meni</button>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '1rem' }}>
            Tab / Enter → nova rečenica
          </p>
        </div>
      )}
    </div>
  )
}
