import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppData, useEditDispatch } from '../context/EditContext'
import EditableText from './edit/EditableText'

function TimelineNode({ index, isLeft }: { index: number; isLeft: boolean }) {
  const { timeline } = useAppData()
  const event = timeline[index]
  const dispatch = useEditDispatch()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const cardContent = (align: 'left' | 'right') => {
    const accent = align === 'right' ? 'var(--purple)' : 'var(--cyan)'
    return (
      <motion.div
        initial={{ opacity: 0, x: align === 'left' ? -30 : 30 }}
        animate={visible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`glass-card p-5 ${align === 'right' ? 'text-right' : ''}`}
        style={{ border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)` }}
      >
        <p className="text-xs font-mono-display mb-1" style={{ color: accent }}>
          <EditableText
            value={event.time}
            onChange={(v) => dispatch({ type: 'UPDATE_TIMELINE', payload: { index, field: 'time', value: v } })}
          />
        </p>
        <h4 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          <EditableText
            value={event.title}
            onChange={(v) => dispatch({ type: 'UPDATE_TIMELINE', payload: { index, field: 'title', value: v } })}
            tag="span"
          />
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <EditableText
            value={event.desc}
            onChange={(v) => dispatch({ type: 'UPDATE_TIMELINE', payload: { index, field: 'desc', value: v } })}
          />
        </p>
      </motion.div>
    )
  }

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr_40px_1fr] items-center gap-0 mb-8">
      {/* 左侧 */}
      <div className={isLeft ? 'pr-6' : ''}>
        {isLeft && cardContent('right')}
      </div>

      {/* 中间节点 */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={visible ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.1, type: 'spring', bounce: 0.5 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl z-10"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--purple) 30%, transparent), color-mix(in srgb, var(--cyan) 30%, transparent))',
            border: '2px solid color-mix(in srgb, var(--purple) 50%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, var(--purple) 30%, transparent)',
          }}
        >
          {event.icon}
        </motion.div>
      </div>

      {/* 右侧 */}
      <div className={!isLeft ? 'pl-6' : ''}>
        {!isLeft && cardContent('left')}
      </div>
    </div>
  )
}

function TimelineNodeMobile({ index }: { index: number }) {
  const { timeline } = useAppData()
  const event = timeline[index]
  const dispatch = useEditDispatch()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative flex gap-4 mb-6">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={visible ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.1, type: 'spring', bounce: 0.5 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 z-10"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--purple) 30%, transparent), color-mix(in srgb, var(--cyan) 30%, transparent))',
            border: '2px solid color-mix(in srgb, var(--purple) 50%, transparent)',
            boxShadow: '0 0 16px color-mix(in srgb, var(--purple) 25%, transparent)',
          }}
        >
          {event.icon}
        </motion.div>
        {index < timeline.length - 1 && (
          <div
            className="w-px flex-1 mt-2"
            style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--purple) 40%, transparent), transparent)' }}
          />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={visible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
        className="glass-card p-4 flex-1 mb-2"
        style={{ border: '1px solid color-mix(in srgb, var(--purple) 20%, transparent)' }}
      >
        <p className="text-xs font-mono-display mb-1" style={{ color: 'var(--purple)' }}>
          <EditableText
            value={event.time}
            onChange={(v) => dispatch({ type: 'UPDATE_TIMELINE', payload: { index, field: 'time', value: v } })}
          />
        </p>
        <h4 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          <EditableText
            value={event.title}
            onChange={(v) => dispatch({ type: 'UPDATE_TIMELINE', payload: { index, field: 'title', value: v } })}
            tag="span"
          />
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <EditableText
            value={event.desc}
            onChange={(v) => dispatch({ type: 'UPDATE_TIMELINE', payload: { index, field: 'desc', value: v } })}
          />
        </p>
      </motion.div>
    </div>
  )
}

export default function Timeline() {
  const titleRef = useRef<HTMLDivElement>(null)
  const [titleVisible, setTitleVisible] = useState(false)
  const { timeline } = useAppData()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTitleVisible(true) },
      { threshold: 0.5 }
    )
    if (titleRef.current) observer.observe(titleRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 20 }}
        animate={titleVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-xs font-mono-display tracking-widest uppercase mb-2" style={{ color: 'var(--cyan)' }}>
          冒险日记
        </p>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          一起冒险的日子
        </h2>
      </motion.div>

      {/* 桌面端 */}
      <div className="w-full max-w-3xl hidden md:block relative">
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{
            background: 'linear-gradient(180deg, var(--purple), var(--cyan), transparent)',
            opacity: 0.4,
          }}
        />
        {timeline.map((_, i) => (
          <TimelineNode key={i} index={i} isLeft={i % 2 === 0} />
        ))}
      </div>

      {/* 移动端 */}
      <div className="w-full max-w-sm md:hidden">
        {timeline.map((_, i) => (
          <TimelineNodeMobile key={i} index={i} />
        ))}
      </div>
    </section>
  )
}
