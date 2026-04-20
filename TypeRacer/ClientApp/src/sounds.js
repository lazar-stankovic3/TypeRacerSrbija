let _ctx = null
let _muted = localStorage.getItem('tr_sound') === 'off'

function ctx() {
  if (_muted) return null
  if (!_ctx) {
    try { _ctx = new (window.AudioContext || window.webkitAudioContext)() }
    catch { return null }
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function tone(freq, type, duration, gainVal, delay = 0) {
  const c = ctx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g)
  g.connect(c.destination)
  osc.type = type
  osc.frequency.value = freq
  const t = c.currentTime + delay
  g.gain.setValueAtTime(gainVal, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.start(t)
  osc.stop(t + duration + 0.01)
}

export function isMuted() { return _muted }

export function toggleMute() {
  _muted = !_muted
  localStorage.setItem('tr_sound', _muted ? 'off' : 'on')
  return _muted
}

export const sounds = {
  correct() { tone(900, 'sine',     0.065, 0.10) },
  wrong()   { tone(160, 'sawtooth', 0.11,  0.16) },
  finish()  {
    [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.32]].forEach(([f, d]) =>
      tone(f, 'sine', 0.22, 0.18, d)
    )
  },
  beep()    { tone(660, 'sine',     0.13,  0.14) },
  go()      { tone(880, 'triangle', 0.28,  0.18) },
}
