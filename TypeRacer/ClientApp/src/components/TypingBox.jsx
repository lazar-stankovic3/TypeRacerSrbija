import { useEffect, useRef, useState } from 'react'
import { sounds } from '../sounds.js'

const NORMALIZE_MAP = {
  'ć': 'c', 'Ć': 'C',
  'č': 'c', 'Č': 'C',
  'š': 's', 'Š': 'S',
  'ž': 'z', 'Ž': 'Z',
  'đ': 'd', 'Đ': 'D',
}

function normalize(str) {
  return str.split('').map(ch => NORMALIZE_MAP[ch] ?? ch).join('')
}

function charsMatch(sentenceCh, typedCh) {
  return (NORMALIZE_MAP[sentenceCh] ?? sentenceCh) === (NORMALIZE_MAP[typedCh] ?? typedCh)
}

export default function TypingBox({ sentence, onProgress, onFinish, disabled }) {
  const [typed, setTyped] = useState('')
  const [shaking, setShaking] = useState(false)
  const [flashIdx, setFlashIdx] = useState(-1)
  const inputRef = useRef(null)
  const startTimeRef = useRef(null)
  const shakeTimer = useRef(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    setTyped('')
    setFlashIdx(-1)
    setShaking(false)
    startTimeRef.current = null
    if (!disabled) inputRef.current?.focus()
  }, [sentence, disabled])

  useEffect(() => () => { clearTimeout(shakeTimer.current); clearTimeout(flashTimer.current) }, [])

  function calcWpm(typed, startTime) {
    const elapsed = (Date.now() - startTime) / 1000 / 60
    if (elapsed < 0.01) return 0
    return Math.round((typed.length / 5) / elapsed)
  }

  function handleChange(e) {
    if (disabled || !sentence) return
    const value = e.target.value
    if (value.length > sentence.length) return

    const isAdding = value.length > typed.length

    if (!startTimeRef.current && value.length > 0) startTimeRef.current = Date.now()

    if (isAdding) {
      const idx = value.length - 1
      if (charsMatch(sentence[idx], value[idx])) {
        sounds.correct()
        setFlashIdx(idx)
        clearTimeout(flashTimer.current)
        flashTimer.current = setTimeout(() => setFlashIdx(-1), 300)
      } else {
        const prevWasClean = normalize(sentence.slice(0, typed.length)) === normalize(typed)
        if (prevWasClean) {
          sounds.wrong()
          setShaking(false)
          requestAnimationFrame(() => {
            setShaking(true)
            clearTimeout(shakeTimer.current)
            shakeTimer.current = setTimeout(() => setShaking(false), 420)
          })
        }
      }
    }

    setTyped(value)

    let correctCount = 0
    for (let i = 0; i < value.length; i++) {
      if (!charsMatch(sentence[i], value[i])) break
      correctCount++
    }
    const progress = Math.round((correctCount / sentence.length) * 100)
    const wpm = startTimeRef.current ? calcWpm(value, startTimeRef.current) : 0
    onProgress?.(progress, wpm)

    const done = value.length === sentence.length && normalize(value) === normalize(sentence)
    if (done) {
      const correct = value.split('').filter((ch, i) => charsMatch(sentence[i], ch)).length
      const accuracy = Math.round((correct / sentence.length) * 100)
      onFinish?.(startTimeRef.current ? calcWpm(value, startTimeRef.current) : 0, accuracy)
    }
  }

  const hasError = typed.length > 0 &&
    normalize(sentence?.slice(0, typed.length) ?? '') !== normalize(typed)

  return (
    <div>
      <div className="sentence-wrap">
        <div className="sentence-text">
          {sentence
            ? sentence.split('').map((ch, i) => {
                let cls = 'ch ch-pending'
                if (i < typed.length) cls = `ch ${charsMatch(ch, typed[i]) ? 'ch-correct' : 'ch-wrong'}`
                if (i === flashIdx && i < typed.length) cls += ' ch-flash'
                if (i === typed.length) cls += ' ch-cursor'
                return <span key={i} className={cls}>{ch}</span>
              })
            : <span style={{ color: 'var(--text-3)' }}>Učitavanje...</span>}
        </div>
      </div>

      <input
        ref={inputRef}
        className={`typing-input${hasError ? ' error' : ''}${shaking ? ' shake' : ''}`}
        value={typed}
        onChange={handleChange}
        disabled={disabled}
        placeholder={disabled ? 'Čekaj na start...' : 'Počni da kucaš ovde...'}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  )
}
