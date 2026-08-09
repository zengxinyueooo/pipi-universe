import { useState } from 'react'
import { motion } from 'framer-motion'
import { danmakuMessages } from '../data/content'

// 马卡龙淡色（再淡一档）
const COLORS = ['#fbe0e8', '#d9eed9', '#d6e6f5', '#e3d9ee', '#f3ebbf', '#fcdcc4']
const DARK_TEXT = '#3d2817'

// 缓动函数池：让每个泡泡飘动节奏不同
const EASES = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(0.4, 0, 0.6, 1)']

// 模块级生成弹幕实例（固定位置/参数，避免每帧跳）；内容循环用
const BUBBLES = Array.from({ length: 22 }, (_, i) => ({
  text: danmakuMessages[i % danmakuMessages.length],
  color: COLORS[i % COLORS.length],
  top: Math.random() * 80 + 5,
  size: Math.random() * 32 + 80,    // 80–112px 正圆
  dur: Math.random() * 14 + 6,      // 6–20s 速度变化大
  delay: Math.random() * -20,
  ease: EASES[i % EASES.length],
}))

function Bubble({ text, color, size }: { text: string; color: string; size: number }) {
  return (
    <div style={{
      position: 'relative',
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.7) 0%, ${color}55 45%, ${color}22 100%)`,
      boxShadow: `0 0 16px ${color}33, inset 0 0 14px rgba(255,255,255,0.35)`,
      border: `1.5px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6px', textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute', top: '14%', left: '22%',
        width: size * 0.32, height: size * 0.22, borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)', filter: 'blur(1.5px)',
        pointerEvents: 'none',
      }} />
      <span className="font-mono-display" style={{
        fontSize: Math.max(9, Math.round(size * 0.14)),
        color: DARK_TEXT, lineHeight: 1.25, wordBreak: 'keep-all',
        position: 'relative',
      }}>
        {text}
      </span>
    </div>
  )
}

export default function DanmakuBubbles() {
  const [show, setShow] = useState(true)

  return (
    <>
      {show && (
        <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
          {BUBBLES.map((b, i) => (
            <div key={i} className="absolute" style={{
              top: `${b.top}%`, left: 0,
              animation: `bubble-danmaku ${b.dur}s ${b.ease} ${b.delay}s infinite`,
            }}>
              <Bubble text={b.text} color={b.color} size={b.size} />
            </div>
          ))}
        </div>
      )}

      {/* 弹幕开关（左上角）*/}
      <motion.button
        onClick={() => setShow(s => !s)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed top-4 left-4 z-40 font-mono-display text-xs cursor-pointer select-none"
        style={{
          background: 'color-mix(in srgb, var(--bg-deep) 92%, transparent)',
          border: '2px solid var(--border-glow)',
          color: show ? 'var(--purple)' : 'var(--text-muted)',
          boxShadow: '2px 2px 0 color-mix(in srgb, var(--border-glow) 70%, transparent)',
          borderRadius: '4px',
          padding: '5px 10px',
          backdropFilter: 'blur(8px)',
        }}
        title={show ? '关闭弹幕' : '开启弹幕'}
      >
        {show ? '💬 弹幕开' : '弹幕关'}
      </motion.button>
    </>
  )
}
