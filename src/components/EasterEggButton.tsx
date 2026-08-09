import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 真心话池（每次点击随机抽一条，避免连续重复）
const RESPONSES = [
  '皮皮早点下班！',
  '皮皮泥嚎呀！',
  '皮皮今天吃饭了嘛！',
  '皮皮好好休息！',
  '皮皮你超级优秀！',
  '( ੭ ˙ᗜ˙ )੭♡ˎˊ˗',
  '₌･֊･₌ ੭',
]

export default function EasterEggButton() {
  const [showResponse, setShowResponse] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  // 前 7 次：洗牌队列，保证 7 条全部出现且不重复
  // 第 8 次起：纯随机，无限制
  const queue = useRef<number[]>(shuffleIndices())
  const clickCount = useRef(0)

  function shuffleIndices(): number[] {
    return [...RESPONSES.keys()].sort(() => Math.random() - 0.5)
  }

  const handleClick = () => {
    clickCount.current += 1
    let idx: number
    if (clickCount.current <= RESPONSES.length) {
      // 前 7 次：从洗好的队列头取一条
      idx = queue.current.shift()!
    } else {
      // 第 8 次起：纯随机
      idx = Math.floor(Math.random() * RESPONSES.length)
    }
    setCurrentResponse(RESPONSES[idx])
    setShowResponse(true)
    setTimeout(() => setShowResponse(false), 2500)
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-5 py-2.5 rounded-full text-sm font-mono-display cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--purple) 20%, transparent), color-mix(in srgb, var(--cyan) 20%, transparent))',
          border: '1px solid color-mix(in srgb, var(--purple) 40%, transparent)',
          color: 'var(--text-primary)',
        }}
      >
        点我看看真心话
      </motion.button>

      <AnimatePresence>
        {showResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm whitespace-nowrap font-mono-display"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--bg-deep) 95%, transparent)',
              border: '1px solid color-mix(in srgb, var(--cyan) 40%, transparent)',
              color: 'var(--cyan)',
              boxShadow: '0 0 20px color-mix(in srgb, var(--cyan) 20%, transparent)',
            }}
          >
            {currentResponse}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid color-mix(in srgb, var(--cyan) 40%, transparent)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
