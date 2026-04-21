import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TypingBox from '../components/TypingBox.jsx'
import { useAuth } from '../AuthContext.jsx'
import { sounds, isMuted, toggleMute } from '../sounds.js'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

export default function AlphabetRace() {
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
  const timerRef = useRef(null)
  const startRef = useRef(null)
  const navigate = useNavigate()
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return
    fetch('/api/results/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const alphabetResults = data.filter(r => r.mode === 'alphabet')
        const best = alphabetResults.reduce((max, r) => r.wpm > max ? r.wpm : max, 0)
        if (best > 0) setPersonalBest(best)
      })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    function onKey(e) {
      if ((e.key === 'Tab' || e.key === 'Enter') && phase === 'finished') {
        e.preventDefault()
        resetRace()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  function resetRace() {
    setPhase('ready')
    setWpm(0)
    setProgress(0)
    setElapsed(0)
    clearInterval(timerRef.current)
  }

  function handleTypingStart() {
    if (phase !== 'ready') return
    startRef.current = Date.now()
    setPhase('playing')
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 100)
  }

  async function handleFinish(w, accuracy) {
    clearInterval(timerRef.current)
    const t = parseFloat(((Date.now() - startRef.current) / 1000).toFixed(2))
    setFinalWpm(w)
    setFinalTime(t)
    setFinalAccuracy(accuracy)
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
        body: JSON.stringify({ wpm: w, accuracy, mode: 'alphabet' })
      }).catch(() => {})
    }
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  useEffect(() => {
    if (phase !== 'finished') return
    setDisplayWpm(0)
    const steps = 45
    let step = 0
    const id = setInterval(() => {
      step++
      setDisplayWpm(Math.round(finalWpm * (step / steps)))
      if (step >= steps) clearInterval(id)
    }, 900 / steps)
    return () => clearInterval(id)
  }, [phase, finalWpm])

  const elapsedDisplay = elapsed < 60
    ? `${elapsed}s`
    : `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/')}>← Nazad</button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>Abeceda trka</span>
        <button
          className="btn btn-ghost"
          style={{ padding: '0.25rem 0.6rem', fontSize: '1rem', lineHeight: 1 }}
          title={muted ? 'Uključi zvuk' : 'Isključi zvuk'}
          onClick={() => setMuted(toggleMute())}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-3)', fontSize: '0.85rem' }}>
        Iskucaj celu abecedu što brže možeš
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
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #f97316)', transition: 'width .1s', borderRadius: 999 }} />
                </div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Vreme</div>
              <div className="stat-value">{elapsedDisplay}</div>
              <div className="stat-unit">{phase === 'ready' ? 'kucaj da počneš' : 'u toku'}</div>
            </div>
          </div>

          <TypingBox
            sentence={ALPHABET}
            onProgress={(p, w) => { handleTypingStart(); setProgress(p); setWpm(w) }}
            onFinish={handleFinish}
            disabled={false}
          />

          {phase === 'ready' && (
            <div className="text-center mt-lg">
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                Počni da kucaš da startaš tajmer
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center" style={{ maxWidth: 420, margin: '0 auto', animation: 'pop-in .55s cubic-bezier(.22,1,.36,1) both' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🔤</div>
            <div className="finished-title">Završeno!</div>
          </div>

          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1, marginBottom: '0.25rem' }}>
            {finalTime}s
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>
            vreme
          </div>

          <div className="finished-wpm wpm-appear">{displayWpm}</div>
          <div className="finished-wpm-label">reči u minuti</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.5rem 0' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tačnost</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{finalAccuracy}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Znakova</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>26</div>
            </div>
          </div>

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
            <button className="btn btn-primary" onClick={resetRace}>Pokušaj ponovo</button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Meni</button>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '1rem' }}>
            Tab / Enter → pokušaj ponovo
          </p>
        </div>
      )}
    </div>
  )
}
