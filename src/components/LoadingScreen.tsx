import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps { onDone: () => void }

const TOTAL_DURATION = 5800

const PIXEL_LINES = [
  { text: '皮皮正在蹦跶…', delay: 300 },
  { text: '快乐值加载中…', delay: 1500 },
  { text: '尾巴摇到 99%…', delay: 3000 },
  { text: '快乐小窝，开门！🦴', delay: 4500 },
]

// 装饰数据（模块级一次随机，固定位置）
const STARS = Array.from({ length: 40 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 60,
  size: Math.random() * 3 + 1.5,
  dur: Math.random() * 1 + 0.8,
  delay: Math.random() * 2,
}))

const CLOUDS = [
  { left: '5%', top: '6%', scale: 1.6, dur: 7, delay: 0 },
  { left: '48%', top: '12%', scale: 1.3, dur: 9, delay: -3 },
  { left: '70%', top: '5%', scale: 1.8, dur: 6, delay: -1 },
  { left: '20%', top: '22%', scale: 1.2, dur: 8, delay: -5 },
  { left: '62%', top: '24%', scale: 1.5, dur: 7.5, delay: -2 },
  { left: '85%', top: '16%', scale: 1.1, dur: 10, delay: -6 },
]

const BALLOONS = [
  { color: '#e8a33d', left: '4%', top: '20%', dur: 2.2, delay: 0 },
  { color: '#6ab04c', right: '6%', top: '28%', dur: 2.4, delay: 0.4 },
  { color: '#5fa8d3', left: '14%', top: '10%', dur: 2, delay: 0.8 },
  { color: '#e8743a', right: '12%', top: '12%', dur: 2.3, delay: 0.2 },
  { color: '#d68bb0', left: '2%', top: '40%', dur: 2.6, delay: 1.2 },
  { color: '#c084fc', right: '3%', top: '44%', dur: 2.1, delay: 0.6 },
  { color: '#ffd23f', left: '24%', top: '34%', dur: 2.5, delay: 1 },
  { color: '#7cc05c', right: '22%', top: '38%', dur: 2.2, delay: 1.4 },
] as { color: string; left?: string; right?: string; top: string; dur: number; delay: number }[]

// 飘浮的彩色小元素（替代难看清的泡泡：实色星星/爱心向上飘+转）
const FLOATERS = [
  { color: '#e8a33d', shape: 'star', left: 8, dur: 4.5, delay: 0 },
  { color: '#d68bb0', shape: 'heart', left: 18, dur: 5, delay: 1 },
  { color: '#5fa8d3', shape: 'star', left: 28, dur: 4, delay: 2 },
  { color: '#7cc05c', shape: 'heart', left: 38, dur: 5.5, delay: 0.5 },
  { color: '#c084fc', shape: 'star', left: 48, dur: 4.2, delay: 1.5 },
  { color: '#e8743a', shape: 'heart', left: 58, dur: 4.8, delay: 2.5 },
  { color: '#ffd23f', shape: 'star', left: 68, dur: 5.2, delay: 0.8 },
  { color: '#6ab04c', shape: 'heart', left: 78, dur: 4.6, delay: 1.8 },
  { color: '#5fa8d3', shape: 'star', left: 88, dur: 4.4, delay: 2.2 },
  { color: '#d68bb0', shape: 'heart', left: 13, dur: 5.1, delay: 3 },
  { color: '#ffd23f', shape: 'star', left: 43, dur: 4.7, delay: 3.2 },
  { color: '#c084fc', shape: 'heart', left: 73, dur: 5.3, delay: 2.8 },
] as { color: string; shape: 'star' | 'heart'; left: number; dur: number; delay: number }[]

const FLOWERS = [
  { left: '5%', color: '#e8743a' },
  { left: '15%', color: '#d68bb0' },
  { left: '25%', color: '#e8a33d' },
  { left: '35%', color: '#c084fc' },
  { left: '45%', color: '#d68bb0' },
  { left: '55%', color: '#e8743a' },
  { left: '65%', color: '#e8a33d' },
  { left: '75%', color: '#c084fc' },
  { left: '85%', color: '#d68bb0' },
  { left: '95%', color: '#e8743a' },
]

const BUTTERFLIES = [
  { left: '12%', top: '35%', color: '#e8743a', dur: 3, delay: 0 },
  { left: '50%', top: '42%', color: '#c084fc', dur: 3.4, delay: 1 },
  { left: '78%', top: '38%', color: '#7cc05c', dur: 3.2, delay: 2 },
  { left: '35%', top: '48%', color: '#5fa8d3', dur: 3.6, delay: 1.5 },
]

const SHOOTING = [
  { top: '8%', right: '-5%', dur: 5, delay: 0.5 },
  { top: '18%', right: '10%', dur: 6, delay: 2.5 },
  { top: '4%', right: '25%', dur: 5.5, delay: 4 },
]

function Sun() {
  return (
    <svg width="110" height="110" viewBox="0 0 80 80">
      <g style={{ transformOrigin: '40px 40px', transformBox: 'fill-box', animation: 'sun-rotate 10s linear infinite' }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <rect key={a} x="36" y="2" width="8" height="16" fill="#ffd23f" transform={`rotate(${a} 40 40)`} />
        ))}
        <circle cx="40" cy="40" r="18" fill="#ffd23f" />
        <circle cx="40" cy="40" r="11" fill="#fff8e7" />
        <circle cx="40" cy="40" r="5" fill="#ffd23f" />
      </g>
    </svg>
  )
}

function Balloon({ color }: { color: string }) {
  return (
    <svg width="52" height="86" viewBox="0 0 40 70">
      <ellipse cx="20" cy="20" rx="15" ry="17" fill={color} />
      <rect x="19" y="37" width="2" height="32" fill="#8b6f47" />
      <polygon points="16,36 24,36 20,41" fill={color} />
      <ellipse cx="14" cy="13" rx="4" ry="5" fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}

function Cloud({ scale }: { scale: number }) {
  return (
    <svg width="130" height="50" viewBox="0 0 90 36" style={{ transform: `scale(${scale})` }}>
      <rect x="8" y="14" width="22" height="14" fill="#ffffff" />
      <rect x="20" y="6" width="26" height="22" fill="#ffffff" />
      <rect x="40" y="10" width="24" height="18" fill="#ffffff" />
      <rect x="58" y="16" width="20" height="12" fill="#ffffff" />
      <rect x="8" y="26" width="70" height="5" fill="#eef2ff" />
    </svg>
  )
}

function Floater({ color, shape }: { color: string; shape: 'star' | 'heart' }) {
  if (shape === 'star') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22">
        <rect x="9" y="2" width="4" height="18" fill={color} />
        <rect x="2" y="9" width="18" height="4" fill={color} />
        <rect x="4" y="4" width="4" height="4" fill={color} />
        <rect x="14" y="4" width="4" height="4" fill={color} />
        <rect x="4" y="14" width="4" height="4" fill={color} />
        <rect x="14" y="14" width="4" height="4" fill={color} />
      </svg>
    )
  }
  return (
    <svg width="22" height="20" viewBox="0 0 22 20">
      <rect x="2" y="2" width="7" height="9" fill={color} />
      <rect x="13" y="2" width="7" height="9" fill={color} />
      <rect x="4" y="9" width="14" height="6" fill={color} />
      <polygon points="9,15 13,15 11,20" fill={color} />
    </svg>
  )
}

function Flower({ color }: { color: string }) {
  return (
    <svg width="30" height="34" viewBox="0 0 22 26">
      <g style={{ transformOrigin: '11px 22px', transformBox: 'fill-box', animation: 'flower-sway 1.4s ease-in-out infinite' }}>
        <rect x="10" y="14" width="2" height="10" fill="#4a8c35" />
        <rect x="5" y="18" width="4" height="3" fill="#4a8c35" />
        <rect x="7" y="6" width="8" height="8" fill={color} />
        <rect x="2" y="8" width="7" height="7" fill={color} />
        <rect x="13" y="8" width="7" height="7" fill={color} />
        <rect x="7" y="1" width="8" height="8" fill={color} />
        <rect x="8" y="9" width="6" height="6" fill="#ffd23f" />
      </g>
    </svg>
  )
}

function Butterfly({ color }: { color: string }) {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24">
      <g>
        <rect x="13" y="6" width="2" height="14" fill="#3d2817" />
        <ellipse cx="8" cy="8" rx="6" ry="7" fill={color} />
        <ellipse cx="20" cy="8" rx="6" ry="7" fill={color} />
        <ellipse cx="9" cy="16" rx="5" ry="5" fill={color} opacity="0.85" />
        <ellipse cx="19" cy="16" rx="5" ry="5" fill={color} opacity="0.85" />
        <rect x="12" y="2" width="1" height="4" fill="#3d2817" />
        <rect x="15" y="2" width="1" height="4" fill="#3d2817" />
      </g>
    </svg>
  )
}

function ShootingStar() {
  return (
    <svg width="60" height="20" viewBox="0 0 60 20">
      <rect x="40" y="8" width="14" height="4" fill="#fff8e7" />
      <rect x="30" y="9" width="10" height="2" fill="rgba(255,248,231,0.6)" />
      <rect x="22" y="9" width="8" height="2" fill="rgba(255,248,231,0.3)" />
      <circle cx="54" cy="10" r="4" fill="#fff8e7" />
    </svg>
  )
}

// 像素方块进度条
function PixelProgressBar({ progress }: { progress: number }) {
  const total = 20
  const filled = Math.floor((progress / 100) * total)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1 p-2" style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid #b8743a', boxShadow: '3px 3px 0 rgba(184,116,58,0.3)' }}>
        {Array.from({ length: total }).map((_, i) => {
          const isFilled = i < filled
          const isActive = i === filled - 1
          return (
            <div key={i} className={isActive ? 'animate-pulse' : ''} style={{
              width: '14px', height: '14px',
              backgroundColor: isFilled ? (isActive ? '#e8743a' : '#e8a33d') : 'rgba(232,163,61,0.18)',
              boxShadow: isFilled ? 'inset -2px -2px 0 rgba(0,0,0,0.12), inset 2px 2px 0 rgba(255,255,255,0.6)' : 'inset 1px 1px 0 rgba(255,255,255,0.5)',
              transition: 'background-color 0.15s steps(1)',
            }} />
          )
        })}
      </div>
      <p className="font-mono-display" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#3d2817' }}>
        {Math.floor(progress)}%
      </p>
    </div>
  )
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timers = PIXEL_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(prev => [...prev, i]), line.delay))
    const progressTimer = setInterval(() => {
      setProgress(prev => Math.min(prev + 1.5, 100))
    }, TOTAL_DURATION / 100)
    const doneTimer = setTimeout(() => {
      setExiting(true)
      setTimeout(onDone, 800)
    }, TOTAL_DURATION)
    return () => { timers.forEach(clearTimeout); clearInterval(progressTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{ background: 'linear-gradient(to bottom, #d4e8ff 0%, #f0e0f0 28%, #fdf6e3 66%, #7cc05c 100%)' }}
        >
          {/* 闪烁星点 */}
          {STARS.map((s, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: `${s.left}%`, top: `${s.top}%`,
              width: s.size, height: s.size, backgroundColor: '#fff8e7',
              boxShadow: '0 0 6px #fff8e7, 0 0 14px rgba(255,248,231,0.7)',
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }} />
          ))}

          {/* 流星 */}
          {SHOOTING.map((s, i) => (
            <div key={i} className="absolute" style={{
              top: s.top, right: s.right,
              animation: `shooting ${s.dur}s ease-in ${s.delay}s infinite`,
            }}>
              <ShootingStar />
            </div>
          ))}

          {/* 彩虹（放大）*/}
          <svg className="absolute" style={{ top: '0%', left: '50%', transform: 'translateX(-50%)' }} width="640" height="200" viewBox="0 0 640 200">
            <path d="M 60 190 A 260 260 0 0 1 580 190" stroke="#e8a33d" strokeWidth="14" fill="none" />
            <path d="M 78 190 A 242 242 0 0 1 562 190" stroke="#e8743a" strokeWidth="14" fill="none" />
            <path d="M 96 190 A 224 224 0 0 1 544 190" stroke="#d68bb0" strokeWidth="14" fill="none" />
            <path d="M 114 190 A 206 206 0 0 1 526 190" stroke="#6ab04c" strokeWidth="14" fill="none" />
            <path d="M 132 190 A 188 188 0 0 1 508 190" stroke="#5fa8d3" strokeWidth="14" fill="none" />
            <path d="M 150 190 A 170 170 0 0 1 490 190" stroke="#c084fc" strokeWidth="14" fill="none" />
          </svg>

          {/* 太阳（放大，左上）*/}
          <div className="absolute" style={{ top: '3%', left: '4%' }}><Sun /></div>

          {/* 云朵（6 朵，大且快飘）*/}
          {CLOUDS.map((c, i) => (
            <div key={i} className="absolute" style={{
              left: c.left, top: c.top,
              animation: `cloud-drift ${c.dur}s ease-in-out ${c.delay}s infinite alternate`,
            }}>
              <Cloud scale={c.scale} />
            </div>
          ))}

          {/* 气球（8 个，大且快浮）*/}
          {BALLOONS.map((b, i) => (
            <div key={i} className="absolute" style={{
              left: b.left, right: b.right, top: b.top,
              animation: `balloon-float ${b.dur}s ease-in-out ${b.delay}s infinite`,
            }}>
              <Balloon color={b.color} />
            </div>
          ))}

          {/* 飘浮彩星/爱心（12 个，向上飘+转，实色明显）*/}
          {FLOATERS.map((f, i) => (
            <div key={i} className="absolute" style={{
              left: `${f.left}%`, bottom: '22%',
              animation: `float-up ${f.dur}s ease-in ${f.delay}s infinite`,
            }}>
              <Floater color={f.color} shape={f.shape} />
            </div>
          ))}

          {/* 蝴蝶（4 只，飞舞）*/}
          {BUTTERFLIES.map((b, i) => (
            <div key={i} className="absolute" style={{
              left: b.left, top: b.top,
              animation: `butterfly-flutter ${b.dur}s ease-in-out ${b.delay}s infinite`,
            }}>
              <Butterfly color={b.color} />
            </div>
          ))}

          {/* 朦胧暖光蒙版（背景柔化，温馨治愈）*/}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,248,231,0.38) 0%, rgba(255,240,230,0.16) 50%, transparent 82%)' }} />

          {/* 比格犬（居中放大，整体蹦跳）—— Loading 专用透明版 beagle-loading.png */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '4%' }}>
            <img
              src="/beagle-loading.webp"
              alt="皮皮比格犬"
              style={{
                maxHeight: '42vh',
                maxWidth: '70vw',
                width: 'auto',
                height: 'auto',
                animation: 'beagle-bounce 0.9s ease-in-out infinite',
                filter: 'drop-shadow(4px 6px 0 rgba(60,40,23,0.18))',
              }}
            />
          </div>

          {/* 草地（底部全宽快摇）*/}
          <svg className="absolute bottom-0 left-0" width="100%" height="26%" viewBox="0 0 100 26" preserveAspectRatio="none" style={{ animation: 'grass-sway 1.6s ease-in-out infinite', transformOrigin: 'center bottom' }}>
            <path d="M 0 8 Q 12 4 25 8 T 50 8 T 75 8 T 100 8 L 100 26 L 0 26 Z" fill="#6ab04c" />
            <path d="M 0 12 Q 12 8 25 12 T 50 12 T 75 12 T 100 12 L 100 26 L 0 26 Z" fill="#5fa83c" opacity="0.6" />
          </svg>

          {/* 草地小花（10 朵）*/}
          {FLOWERS.map((f, i) => (
            <div key={i} className="absolute" style={{ left: f.left, bottom: '5%' }}>
              <Flower color={f.color} />
            </div>
          ))}

          {/* 文案 + 进度条 */}
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-sm px-8" style={{ bottom: '3%' }}>
            <div className="space-y-1 mb-3 min-h-[36px]">
              {PIXEL_LINES.map((line, i) => (
                <AnimatePresence key={i}>
                  {visibleLines.includes(i) && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-mono-display text-sm text-center"
                      style={{ color: '#3d2817' }}
                    >
                      {line.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              ))}
            </div>
            <div className="flex justify-center">
              <PixelProgressBar progress={progress} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
