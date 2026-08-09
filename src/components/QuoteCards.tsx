import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppData, useEditMode, useEditDispatch } from '../context/EditContext'
import EditableText from './edit/EditableText'

function QuoteCard({ index, visible }: { index: number; visible: boolean }) {
  const { quotes } = useAppData()
  const quote = quotes[index]
  const isEdit = useEditMode()
  const dispatch = useEditDispatch()
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, type: 'spring', bounce: 0.2 }}
      className="flex flex-col"
    >
      {/* 翻转卡片（编辑模式下禁用翻转） */}
      <div
        className="flip-card"
        data-edit-mode={isEdit ? 'true' : 'false'}
        style={{ height: '160px' }}
        onClick={() => !isEdit && setExpanded(prev => !prev)}
      >
        <div className="flip-card-inner">
          {/* 正面 */}
          <div
            className="flip-card-front glass-card flex flex-col items-center justify-center p-6 gap-3"
            style={{ border: '1px solid color-mix(in srgb, var(--purple) 20%, transparent)' }}
          >
            <EditableText
              value={quote.emoji}
              onChange={(v) => dispatch({ type: 'UPDATE_QUOTE', payload: { index, field: 'emoji', value: v } })}
              className="text-3xl"
              tag="span"
            />
            <p
              className="text-sm text-center font-mono-display leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              <EditableText
                value={quote.front}
                onChange={(v) => dispatch({ type: 'UPDATE_QUOTE', payload: { index, field: 'front', value: v } })}
              />
            </p>
          </div>

          {/* 背面（仅非编辑模式显示） */}
          {!isEdit && (
            <div
              className="flip-card-back flex flex-col items-center justify-center p-6"
              style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--purple) 12%, transparent), color-mix(in srgb, var(--cyan) 12%, transparent))',
                border: '1px solid color-mix(in srgb, var(--cyan) 30%, transparent)',
              }}
            >
              <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--cyan)' }}>
                点击查看故事
              </p>
              <span className="text-2xl mt-2">👆</span>
            </div>
          )}
        </div>
      </div>

      {/* 故事区域：编辑模式下始终展开；普通模式下点击展开 */}
      <AnimatePresence>
        {(isEdit || expanded) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 p-4 rounded-xl text-sm leading-relaxed"
              style={{
                background: 'color-mix(in srgb, var(--purple) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--purple) 20%, transparent)',
                color: 'var(--text-primary)',
                opacity: 0.85,
              }}
            >
              <EditableText
                value={quote.story}
                onChange={(v) => dispatch({ type: 'UPDATE_QUOTE', payload: { index, field: 'story', value: v } })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function QuoteCards() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const { quotes } = useAppData()
  const isEdit = useEditMode()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      {/* 区块标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-4"
      >
        <p className="text-xs font-mono-display tracking-widest uppercase mb-2" style={{ color: 'var(--orange)' }}>
          头头视角
        </p>
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          皮皮观察日记
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {isEdit ? '点击文字直接编辑，故事区域已展开' : 'hover 查看彩蛋 · 点击展开故事'}
        </p>
      </motion.div>

      {/* 卡片网格 */}
      <div className="w-full max-w-3xl mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {quotes.map((_, i) => (
          <QuoteCard key={i} index={i} visible={visible} />
        ))}
      </div>
    </section>
  )
}
