import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import TypingBox from '../components/TypingBox.jsx'
import RaceTrack from '../components/RaceTrack.jsx'
import { useAuth } from '../AuthContext.jsx'

export default function MultiPlayer() {
  const [view, setView] = useState('menu')
  const [playerName, setPlayerName] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [sentence, setSentence] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [myId, setMyId] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [myWpm, setMyWpm] = useState(0)
  const [myProgress, setMyProgress] = useState(0)

  const [selectedMode, setSelectedMode] = useState('classic')
  const [roomGameMode, setRoomGameMode] = useState('classic')
  const [copied, setCopied] = useState(false)
  const hubRef = useRef(null)
  const navigate = useNavigate()
  const { token } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const joinCode = searchParams.get('join')
    if (joinCode) setRoomInput(joinCode.toUpperCase())
  }, [])

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl('/gamehub')
      .withAutomaticReconnect()
      .build()

    conn.on('RoomCreated', (code, me, gameMode) => {
      setMyId(conn.connectionId)
      setRoomCode(code)
      setPlayers([me])
      setIsHost(true)
      setRoomGameMode(gameMode ?? 'classic')
      setView('lobby')
    })

    conn.on('RoomJoined', (code, allPlayers, gameMode) => {
      setMyId(conn.connectionId)
      setRoomCode(code)
      setPlayers(allPlayers)
      setIsHost(false)
      setRoomGameMode(gameMode ?? 'classic')
      setView('lobby')
    })

    conn.on('PlayerJoined', p => setPlayers(prev => [...prev, p]))

    conn.on('PlayerLeft', (name, remaining) => {
      setPlayers(remaining)
      if (remaining.length > 0) setIsHost(conn.connectionId === remaining[0].connectionId)
    })

    conn.on('Countdown', n => { setCountdown(n); setView('countdown') })

    conn.on('GameStarted', text => {
      setSentence(text)
      setCountdown(null)
      setMyWpm(0)
      setMyProgress(0)
      setView('playing')
    })

    conn.on('ProgressUpdated', allPlayers => setPlayers(allPlayers))
    conn.on('PlayerFinished', () => {})

    conn.on('GameEnded', allPlayers => {
      const sorted = [...allPlayers].sort((a, b) => (a.place ?? 99) - (b.place ?? 99))
      setResults(sorted)
      setPlayers(allPlayers)
      setView('finished')
    })

    conn.on('RoomReset', allPlayers => {
      setPlayers(allPlayers)
      setSentence('')
      setResults([])
      setMyWpm(0)
      setMyProgress(0)
      setView('lobby')
    })

    conn.on('Error', msg => setError(msg))

    conn.start().catch(console.error)
    hubRef.current = conn

    return () => conn.stop()
  }, [])

  async function createRoom() {
    if (!playerName.trim()) { setError('Unesite vaše ime'); return }
    setError('')
    await hubRef.current.invoke('CreateRoom', playerName.trim(), selectedMode)
  }

  async function joinRoom() {
    if (!playerName.trim()) { setError('Unesite vaše ime'); return }
    if (!roomInput.trim()) { setError('Unesite kod sobe'); return }
    setError('')
    await hubRef.current.invoke('JoinRoom', roomInput.trim().toUpperCase(), playerName.trim())
  }

  async function startGame() {
    await hubRef.current.invoke('StartGame', roomCode)
  }

  async function handleProgress(progress, wpm) {
    setMyWpm(wpm)
    setMyProgress(progress)
    await hubRef.current.invoke('UpdateProgress', roomCode, progress, wpm)
  }

  async function handleFinish(wpm, accuracy) {
    setMyWpm(wpm)
    setMyProgress(100)
    await hubRef.current.invoke('UpdateProgress', roomCode, 100, wpm)

    if (token) {
      fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wpm, accuracy: accuracy ?? 100, mode: roomGameMode === 'alphabet' ? 'alphabet' : 'multi' })
      }).catch(() => {})
    }
  }

  function copyInviteLink() {
    const url = `${window.location.origin}/multi?join=${roomCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function leaveRoom() {
    await hubRef.current.invoke('LeaveRoom', roomCode)
    setView('menu')
    setRoomCode('')
    setPlayers([])
    setIsHost(false)
    setError('')
  }

  async function restartRoom() {
    await hubRef.current.invoke('RestartRoom', roomCode)
  }

  const myPlayer = players.find(p => p.connectionId === myId)

  // ── MENU ─────────────────────────────────────────────────────────
  if (view === 'menu') return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/')}>← Nazad</button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>Više igrača</span>
      </div>

      <div className="menu-card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Unesite ime
        </h2>

        <div className="field">
          <label className="field-label">Vaše ime</label>
          <input
            className="input-field"
            placeholder="npr. Marko"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && createRoom()}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label className="field-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Tip igre</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { value: 'classic', label: '🏁 Klasični' },
              { value: 'alphabet', label: '🔤 Abeceda' },
            ].map(m => (
              <button
                key={m.value}
                className={`btn ${selectedMode === m.value ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, fontSize: '0.875rem' }}
                onClick={() => setSelectedMode(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary w-full" style={{ marginBottom: '0.75rem' }} onClick={createRoom}>
          Napravi novu sobu
        </button>

        <div className="divider">ili se pridruži</div>

        <div className="field">
          <label className="field-label">Kod sobe</label>
          <input
            className="input-field"
            placeholder="npr. AB3C9D"
            value={roomInput}
            onChange={e => setRoomInput(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ letterSpacing: '0.2em', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}
            onKeyDown={e => e.key === 'Enter' && joinRoom()}
          />
        </div>

        <button className="btn btn-ghost w-full" onClick={joinRoom}>
          Pridruži se sobi
        </button>

        {error && <div className="error-msg">⚠ {error}</div>}
      </div>
    </div>
  )

  // ── LOBBY ─────────────────────────────────────────────────────────
  if (view === 'lobby') return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={leaveRoom}>← Napusti</button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>Čekaonica</span>
      </div>

      <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div className="room-code-box">
          <div className="room-code-label">Kod sobe</div>
          <div className="room-code-value">{roomCode}</div>
          <div className="room-code-hint">Podelite ovaj kod sa prijateljima</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: 999,
            fontSize: '0.8rem',
            fontWeight: 600,
            background: roomGameMode === 'alphabet' ? 'rgba(245,158,11,.15)' : 'var(--primary-dim)',
            color: roomGameMode === 'alphabet' ? '#f59e0b' : 'var(--primary)',
            border: `1px solid ${roomGameMode === 'alphabet' ? 'rgba(245,158,11,.3)' : 'rgba(124,90,246,.3)'}`,
          }}>
            {roomGameMode === 'alphabet' ? '🔤 Abeceda trka' : '🏁 Klasični mod'}
          </span>
        </div>

        <button
          className="btn btn-ghost w-full"
          style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}
          onClick={copyInviteLink}
        >
          {copied ? '✓ Link kopiran!' : '🔗 Kopiraj pozivnicu'}
        </button>

        <div style={{ marginBottom: '0.6rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', fontWeight: 600 }}>
          Igrači ({players.length})
        </div>
        <div className="players-grid">
          {players.map((p, i) => (
            <div
              key={p.connectionId ?? i}
              className={`player-chip${i === 0 ? ' is-host' : ''}${p.connectionId === myId ? ' is-me' : ''}`}
            >
              <div className="player-dot" />
              {i === 0 ? '👑 ' : ''}{p.name}
              {p.connectionId === myId ? ' (ti)' : ''}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          {isHost ? (
            <button className="btn btn-success btn-lg" onClick={startGame}>
              ▶ Pokreni igru
            </button>
          ) : (
            <div className="waiting-msg" style={{ flex: 1 }}>
              ⏳ Čekam da domaćin pokrene igru...
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── COUNTDOWN ─────────────────────────────────────────────────────
  if (view === 'countdown') return (
    <div className="page">
      <div className="countdown-screen">
        <div className="countdown-label">Pripremi se</div>
        <div className="countdown-num" key={countdown}>{countdown}</div>
        <div style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>igra počinje uskoro...</div>
      </div>
    </div>
  )

  // ── PLAYING ───────────────────────────────────────────────────────
  if (view === 'playing') return (
    <div className="page">
      <div className="stats-row" style={{ marginBottom: '1rem' }}>
        <div className="stat-box highlight">
          <div className="stat-label">Tvoja brzina</div>
          <div className="stat-value">{myWpm}</div>
          <div className="stat-unit">reči / min</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Napredak</div>
          <div className="stat-value">{myProgress}%</div>
          <div className="stat-unit">
            <div style={{ marginTop: 6, height: 4, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${myProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #a78bfa)', transition: 'width .3s', borderRadius: 999 }} />
            </div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Igrači</div>
          <div className="stat-value">{players.filter(p => p.finished).length}/{players.length}</div>
          <div className="stat-unit">završili</div>
        </div>
      </div>

      <RaceTrack players={players} myConnectionId={myId} />

      <TypingBox
        sentence={sentence}
        onProgress={handleProgress}
        onFinish={handleFinish}
        disabled={myPlayer?.finished}
      />
    </div>
  )

  // ── FINISHED ──────────────────────────────────────────────────────
  if (view === 'finished') return (
    <div className="page">
      <h2 className="section-title text-center">Rezultati</h2>

      <div className="card" style={{ maxWidth: 480, margin: '0 auto', animation: 'pop-in .5s cubic-bezier(.22,1,.36,1) both' }}>
        <div className="results-podium">
          {results.map((p, i) => {
            const place = p.place ?? i + 1
            const rowClass = `result-row ${place === 1 ? 'first' : place === 2 ? 'second' : place === 3 ? 'third' : ''}${p.connectionId === myId ? ' is-me' : ''}`
            return (
              <div key={p.connectionId ?? i} className={rowClass} style={{ animation: 'slide-in-left .4s cubic-bezier(.22,1,.36,1) both', animationDelay: `${i * 0.08}s` }}>
                <div className="result-place">{placeEmoji(place)}</div>
                <div className="result-name">
                  {p.name}
                  {p.connectionId === myId && <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 4, fontSize: '0.85rem' }}>(ti)</span>}
                </div>
                <div className="result-wpm">
                  {p.wpm}<span className="result-wpm-unit">r/m</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          {isHost && (
            <button className="btn btn-primary" onClick={restartRoom}>
              Igraj ponovo
            </button>
          )}
          <button className="btn btn-danger" onClick={leaveRoom}>
            Napusti sobu
          </button>
        </div>
      </div>
    </div>
  )

  return null
}

function placeEmoji(place) {
  if (place === 1) return '🥇'
  if (place === 2) return '🥈'
  if (place === 3) return '🥉'
  return `#${place}`
}
