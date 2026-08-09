import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 小号像素比格犬 mascot（闭眼/睁眼两态）
function MiniBeagle({ sleeping }: { sleeping: boolean }) {
  return (
    <svg width="66" height="58" viewBox="0 0 64 56">
      {/* 尾巴（醒着摇）*/}
      <rect x="44" y="34" width="5" height="14" fill="#b8743a" style={{
        transformOrigin: '46px 48px', transformBox: 'fill-box',
        animation: sleeping ? 'none' : 'beagle-tail 0.45s ease-in-out infinite',
      }} />
      {/* 身体 */}
      <rect x="20" y="30" width="28" height="18" fill="#fff8e7" stroke="#b8743a" strokeWidth="1.5" />
      <rect x="22" y="34" width="11" height="14" fill="#b8743a" />
      <rect x="22" y="46" width="6" height="8" fill="#b8743a" />
      <rect x="40" y="46" width="6" height="8" fill="#b8743a" />
      {/* 头 */}
      <rect x="16" y="20" width="24" height="18" fill="#b8743a" />
      {/* 耳 */}
      <rect x="14" y="24" width="6" height="14" fill="#9c5a28" />
      <rect x="38" y="24" width="6" height="14" fill="#9c5a28" />
      {/* 脸白 */}
      <rect x="20" y="26" width="16" height="12" fill="#fff8e7" />
      {sleeping ? (
        <>
          <rect x="23" y="31" width="5" height="1.5" fill="#3d2817" />
          <rect x="31" y="31" width="5" height="1.5" fill="#3d2817" />
          <rect x="26" y="35" width="6" height="2" fill="#3d2817" />
        </>
      ) : (
        <>
          <rect x="24" y="31" width="4" height="4" fill="#3d2817" />
          <rect x="32" y="31" width="4" height="4" fill="#3d2817" />
          <rect x="26" y="36" width="6" height="2.5" fill="#3d2817" />
          <rect x="27" y="38" width="4" height="1.5" fill="#e8a33d" />
        </>
      )}
    </svg>
  )
}

function Heart() {
  return (
    <svg width="20" height="18" viewBox="0 0 22 20">
      <rect x="2" y="2" width="7" height="9" fill="#e8743a" />
      <rect x="13" y="2" width="7" height="9" fill="#e8743a" />
      <rect x="4" y="9" width="14" height="6" fill="#e8743a" />
      <polygon points="9,15 13,15 11,20" fill="#e8743a" />
    </svg>
  )
}

export default function PetBeagle() {
  const [clickCount, setClickCount] = useState(0)
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([])
  const [bubble, setBubble] = useState<{ text: string; key: number } | null>(null)
  const [sleeping, setSleeping] = useState(false)

  const handleClick = useCallback(() => {
    if (sleeping) return
    const next = clickCount + 1
    setClickCount(next)

    // 第 5 次起：打盹 3s 后重置
    if (next >= 5) {
      setSleeping(true)
      setBubble({ text: 'zzz...', key: Date.now() })
      window.setTimeout(() => {
        setSleeping(false)
        setClickCount(0)
        setBubble(null)
      }, 3000)
      return
    }

    // 冒爱心：1-2 次冒 1 个，3-4 次冒 3 个
    const heartCount = next <= 2 ? 1 : 3
    const newHearts = Array.from({ length: heartCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 30 - 15,
    }))
    setHearts(prev => [...prev, ...newHearts])
    window.setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)))
    }, 1500)

    // 气泡文字
    setBubble({ text: next <= 2 ? '汪！' : '汪汪！', key: Date.now() })
    window.setTimeout(() => setBubble(null), 1500)
  }, [clickCount, sleeping])

  const snuggling = clickCount >= 3 && clickCount <= 4 && !sleeping

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed right-6 bottom-6 z-40 cursor-pointer select-none"
      style={{ background: 'transparent', border: 'none', padding: 0 }}
      title="摸摸皮皮"
    >
      {/* 冒爱心 */}
      <AnimatePresence>
        {hearts.map(h => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, y: 0, x: h.x, scale: 0.5 }}
            animate={{ opacity: 0, y: -52, x: h.x, scale: 1.2 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute"
            style={{ left: '20px', top: '-8px' }}
          >
            <Heart />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 文字气泡 */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.key}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            className="absolute font-mono-display text-xs whitespace-nowrap"
            style={{
              bottom: '100%', marginBottom: '8px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.94)', color: '#3d2817',
              border: '2px solid #b8743a', borderRadius: '8px',
              padding: '3px 8px', boxShadow: '2px 2px 0 rgba(184,116,58,0.3)',
            }}
          >
            {bubble.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* mascot（蹭动 / 打盹倒下）*/}
      <motion.div
        animate={sleeping ? { rotate: 75, x: 6 } : (snuggling ? { x: [0, -5, 5, 0] } : { x: 0 })}
        transition={sleeping ? { duration: 0.4 } : (snuggling ? { duration: 0.4, repeat: Infinity } : {})}
        style={{ transformOrigin: 'center bottom' }}
      >
        <MiniBeagle sleeping={sleeping} />
      </motion.div>
    </motion.button>
  )
}
