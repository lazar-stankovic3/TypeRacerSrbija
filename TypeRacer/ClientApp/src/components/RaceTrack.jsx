const CARS = ['🚗', '🚕', '🏎', '🚙', '🚓', '🚑']

export default function RaceTrack({ players, myConnectionId }) {
  if (!players || players.length === 0) return null

  return (
    <div className="race-track">
      <div className="race-track-title">Trka uživo</div>

      {players.map((p, i) => {
        const pct = Math.min(p.progress ?? 0, 100)
        const isMe = p.connectionId === myConnectionId
        const isFast = p.wpm > 60
        const finished = pct >= 100

        return (
          <div key={p.connectionId ?? i} className={`race-lane${isMe ? ' is-me' : ''}`}>
            <div className="race-lane-header">
              <span className={`race-lane-name${isMe ? ' is-me' : ''}`}>
                {isMe ? '▶ ' : ''}{p.name}
                {p.place && <span className="race-place">{placeEmoji(p.place)}</span>}
              </span>
              <span className="race-lane-wpm" style={{ color: isFast ? 'var(--primary)' : undefined, fontWeight: isFast ? 700 : undefined }}>
                {p.wpm > 0 ? `${p.wpm} r/m` : '—'}
              </span>
            </div>
            <div className="race-lane-track">
              <div
                className="race-lane-fill"
                style={{
                  width: `${pct}%`,
                  background: finished
                    ? 'linear-gradient(90deg, var(--success), #6ee7b7)'
                    : isMe
                      ? 'linear-gradient(90deg, var(--primary), #a78bfa)'
                      : 'linear-gradient(90deg, #5b21b6, var(--primary))',
                }}
              />
              {/* Finish flag */}
              <div className="race-finish-flag">🏁</div>
              <div
                className={`race-car${isFast ? ' race-car-boost' : ''}${isMe ? ' race-car-me' : ''}`}
                style={{ left: `clamp(14px, calc(${pct}% - 2px), calc(100% - 18px))` }}
              >
                {CARS[i % CARS.length]}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function placeEmoji(place) {
  return place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : ` #${place}`
}
