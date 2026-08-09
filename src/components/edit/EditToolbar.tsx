import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppData } from '../../context/EditContext'
import { saveToCOS } from '../../hooks/useCOS'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function EditToolbar() {
  const data = useAppData()
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const handleSave = async () => {
    setSaveState('saving')
    try {
      await saveToCOS(data)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 3000)
    } catch (e) {
      console.error('保存失败', e)
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  const buttonLabel = {
    idle: '保存到云端',
    saving: '保存中...',
    saved: '已保存 ✓',
    error: '保存失败，重试',
  }[saveState]

  const buttonColor = {
    idle: 'var(--purple)',
    saving: 'var(--text-muted)',
    saved: 'var(--cyan)',
    error: 'var(--orange)',
  }[saveState]

  // 按钮背景色：随主题色透明（替代原动态 rgba 拼接）
  const buttonBg = {
    idle: 'color-mix(in srgb, var(--purple) 15%, transparent)',
    saving: 'color-mix(in srgb, var(--text-muted) 15%, transparent)',
    saved: 'color-mix(in srgb, var(--cyan) 15%, transparent)',
    error: 'color-mix(in srgb, var(--orange) 15%, transparent)',
  }[saveState]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full"
      style={{
        background: 'color-mix(in srgb, var(--bg-deep) 92%, transparent)',
        border: '1px solid color-mix(in srgb, var(--purple) 40%, transparent)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 24px color-mix(in srgb, var(--purple) 15%, transparent)',
        whiteSpace: 'nowrap',
      }}
    >
      {/* 编辑模式标签 */}
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--purple)' }}
        />
        <span
          className="text-xs font-mono-display"
          style={{ color: 'var(--purple)' }}
        >
          编辑模式
        </span>
      </div>

      {/* 分割线 */}
      <div className="w-px h-4" style={{ backgroundColor: 'color-mix(in srgb, var(--text-primary) 15%, transparent)' }} />

      {/* 提示文字 */}
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        点击文字直接修改
      </span>

      {/* 分割线 */}
      <div className="w-px h-4" style={{ backgroundColor: 'color-mix(in srgb, var(--text-primary) 15%, transparent)' }} />

      {/* 保存按钮 */}
      <button
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="text-xs font-mono-display px-3 py-1 rounded-full transition-all cursor-pointer"
        style={{
          background: buttonBg,
          border: `1px solid ${buttonColor}`,
          color: buttonColor,
          opacity: saveState === 'saving' ? 0.6 : 1,
        }}
      >
        {buttonLabel}
      </button>
    </motion.div>
  )
}
