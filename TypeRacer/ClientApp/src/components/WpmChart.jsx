export default function WpmChart({ values, height = 80 }) {
  if (!values || values.length < 2) return null

  const W = 500, H = height
  const PAD = { t: 6, r: 10, b: 6, l: 10 }
  const iW = W - PAD.l - PAD.r
  const iH = H - PAD.t - PAD.b

  const maxV = Math.max(...values, 20)
  const n = values.length

  const px = i => PAD.l + (i / (n - 1)) * iW
  const py = v => PAD.t + (1 - v / maxV) * iH

  const pts = values.map((v, i) => `${px(i)},${py(v)}`).join(' ')
  const last = values[n - 1]
  const areaD = `M${px(0)},${py(values[0])} ` +
    values.map((v, i) => `L${px(i)},${py(v)}`).join(' ') +
    ` L${px(n - 1)},${H - PAD.b} L${px(0)},${H - PAD.b} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#cg)" />
      <polyline
        points={pts}
        stroke="#a78bfa"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={px(n - 1)} cy={py(last)} r="4" fill="#a78bfa" />
    </svg>
  )
}
