import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toastMessages } from '../data/content'

export default function RandomToast() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 首次在5秒后显示，之后每30秒一次
    const show = () => {
      const msg = toastMessages[Math.floor(Math.random() * toastMessages.length)]
      setMessage(msg)
      setVisible(true)
      setTimeout(() => setVisible(false), 3000)
    }

    const firstTimer = setTimeout(show, 5000)
    const interval = setInterval(show, 30000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      className="fixed bottom-6 left-6 z-40 pointer-events-none"
      style={{ maxWidth: '280px' }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.35, type: 'spring', bounce: 0.3 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'color-mix(in srgb, var(--bg-deep) 92%, transparent)',
              border: '1px solid color-mix(in srgb, var(--purple) 30%, transparent)',
              boxShadow: '0 0 24px color-mix(in srgb, var(--purple) 15%, transparent)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* 状态指示器 */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
              style={{ backgroundColor: 'var(--purple)' }}
            />
            <p className="text-sm font-mono-display" style={{ color: 'var(--text-primary)' }}>
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
