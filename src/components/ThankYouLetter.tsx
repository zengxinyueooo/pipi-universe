import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppData, useEditMode, useEditDispatch } from '../context/EditContext'

export default function ThankYouLetter() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [done, setDone] = useState(false)
  const { letter } = useAppData()
  const isEdit = useEditMode()
  const dispatch = useEditDispatch()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  // 非编辑模式下才启用打字机效果
  useEffect(() => {
    if (!started || isEdit) return
    let i = 0
    setDisplayedText('')
    setDone(false)
    const timer = setInterval(() => {
      if (i < letter.length) {
        setDisplayedText(letter.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        setDone(true)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [started, isEdit, letter])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* 背景光晕 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 60%, color-mix(in srgb, var(--purple) 5%, transparent) 0%, transparent 70%)',
        }}
      />

      {/* 微弱星星 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${(i * 37 + 5) % 100}%`,
            top: `${(i * 53 + 10) % 100}%`,
            width: `${(i % 2) + 1}px`,
            height: `${(i % 2) + 1}px`,
            backgroundColor: 'var(--text-primary)',
            opacity: 0.15,
            animation: `twinkle ${(i % 3) + 2}s ease-in-out ${(i % 4)}s infinite`,
          }}
        />
      ))}

      <div ref={ref} className="relative z-10 w-full max-w-xl">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-mono-display tracking-widest uppercase mb-2" style={{ color: 'var(--orange)' }}>
            写给你
          </p>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            悄悄话
          </h2>
        </motion.div>

        {/* 信件主体 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={started ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8 md:p-10"
          style={{
            border: '1px solid color-mix(in srgb, var(--purple) 20%, transparent)',
            boxShadow: '0 0 40px color-mix(in srgb, var(--purple) 8%, transparent)',
          }}
        >
          {isEdit ? (
            // 编辑模式：textarea 直接编辑
            <textarea
              value={letter}
              onChange={(e) => dispatch({ type: 'UPDATE_LETTER', payload: e.target.value })}
              rows={8}
              className="w-full bg-transparent resize-none font-mono-display text-base leading-loose"
              style={{
                color: 'var(--text-primary)',
                outline: '1px dashed color-mix(in srgb, var(--purple) 50%, transparent)',
                borderRadius: '4px',
                padding: '4px',
                minHeight: '160px',
              }}
            />
          ) : (
            // 非编辑模式：打字机效果
            <pre
              className={`font-mono-display text-base leading-loose whitespace-pre-wrap ${!done ? 'cursor-blink' : 'cursor-blink-done'}`}
              style={{ color: 'var(--text-primary)' }}
            >
              {displayedText}
            </pre>
          )}
        </motion.div>

        {/* 署名 */}
        {(isEdit || done) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: isEdit ? 0 : 0.5 }}
            className="text-right mt-6 mr-2"
          >
            <p className="text-sm font-mono-display" style={{ color: 'var(--text-muted)' }}>
              — 你的头头
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
              {new Date().getFullYear()}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
