import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppData, useEditMode, useEditDispatch } from '../context/EditContext'
import { uploadImageToCOS } from '../hooks/useCOS'
import EditableText from './edit/EditableText'

// 数字滚动计数 hook
function useCountUp(target: number, duration = 1200, trigger: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!trigger) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setValue(target)
    }
    requestAnimationFrame(tick)
  }, [target, duration, trigger])

  return value
}

function SkillBar({ skill, index, trigger }: {
  skill: { name: string; value: number; color: string }
  index: number
  trigger: boolean
}) {
  const count = useCountUp(skill.value, 1200, trigger)
  const isEdit = useEditMode()
  const dispatch = useEditDispatch()

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm flex-1" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>
        ✦{' '}
        <EditableText
          value={skill.name}
          onChange={(v) => dispatch({ type: 'UPDATE_SKILL', payload: { index, field: 'name', value: v } })}
        />
      </span>
      <div className="flex items-center gap-2">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ width: '60px', backgroundColor: 'color-mix(in srgb, var(--text-primary) 10%, transparent)' }}
        >
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: trigger ? `${Math.min((skill.value / 999) * 100, 100)}%` : 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ backgroundColor: skill.color }}
          />
        </div>
        {isEdit ? (
          <input
            type="number"
            value={skill.value}
            min={0}
            max={9999}
            onChange={(e) => dispatch({
              type: 'UPDATE_SKILL',
              payload: { index, field: 'value', value: Number(e.target.value) },
            })}
            className="w-14 text-right bg-transparent border-b text-sm font-mono-display"
            style={{
              color: skill.color,
              borderColor: `${skill.color}80`,
              outline: 'none',
            }}
          />
        ) : (
          <span className="text-sm font-mono-display w-10 text-right" style={{ color: skill.color }}>
            +{count}
          </span>
        )}
      </div>
    </div>
  )
}

export default function CharacterCard() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { character } = useAppData()
  const isEdit = useEditMode()
  const dispatch = useEditDispatch()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImageToCOS(file, 'avatars')
      dispatch({ type: 'UPDATE_AVATAR', payload: url })
    } catch {
      alert('图片上传失败，请检查 COS 配置')
    } finally {
      setUploading(false)
    }
  }

  // 渲染头像（支持 http URL、本地路径，否则 emoji）
  const AvatarContent = () => (
    character.avatar.startsWith('http') || character.avatar.startsWith('/') ? (
      <img
        src={character.avatar}
        alt="avatar"
        className="w-full h-full object-cover rounded-2xl"
        style={{ imageRendering: 'pixelated' }}
      />
    ) : (
      <span className="text-4xl">{character.avatar}</span>
    )
  )

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      {/* 区块标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-xs font-mono-display tracking-widest uppercase mb-2" style={{ color: 'var(--cyan)' }}>
          皮皮档案
        </p>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          皮皮是谁
        </h2>
      </motion.div>

      {/* 角色卡 */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.3, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="glass-card neon-glow-purple p-8 relative overflow-hidden">
          {/* 卡片顶部装饰线 */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, var(--purple), var(--cyan))' }}
          />

          {/* 角色基础信息 */}
          <div className="flex items-center gap-5 mb-6">
            {/* 头像区域 */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--purple) 20%, transparent), color-mix(in srgb, var(--cyan) 20%, transparent))',
                border: '1px solid color-mix(in srgb, var(--purple) 30%, transparent)',
              }}
            >
              {isEdit ? (
                <label className="cursor-pointer w-full h-full flex items-center justify-center relative group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <AvatarContent />
                  {/* hover 上传提示 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity rounded-2xl">
                    {uploading ? '上传中...' : '点击换图'}
                  </div>
                </label>
              ) : (
                <AvatarContent />
              )}
            </div>

            <div>
              <EditableText
                value={character.name}
                onChange={(v) => dispatch({ type: 'UPDATE_CHARACTER', payload: { name: v } })}
                tag="h3"
                className="text-2xl font-bold font-mono-display mb-1"
                style={{ color: 'var(--text-primary)' }}
              />
              <EditableText
                value={character.title}
                onChange={(v) => dispatch({ type: 'UPDATE_CHARACTER', payload: { title: v } })}
                className="text-sm mb-1 block"
                style={{ color: 'var(--cyan)' }}
              />
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                style={{
                  background: 'color-mix(in srgb, var(--purple) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--purple) 30%, transparent)',
                  color: 'var(--purple)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <EditableText
                  value={character.personality}
                  onChange={(v) => dispatch({ type: 'UPDATE_CHARACTER', payload: { personality: v } })}
                />
              </div>
            </div>
          </div>

          {/* 分割线 */}
          <div
            className="h-px w-full mb-5"
            style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--purple) 40%, transparent), transparent)' }}
          />

          {/* 主动技能 */}
          <div className="mb-5">
            <p className="text-xs font-mono-display uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              主动技能
            </p>
            <div className="space-y-3">
              {character.skills.map((skill, i) => (
                <SkillBar key={i} skill={skill} index={i} trigger={visible} />
              ))}
            </div>
          </div>

          {/* 分割线 */}
          <div
            className="h-px w-full mb-5"
            style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--cyan) 30%, transparent), transparent)' }}
          />

          {/* 隐藏技能 */}
          <div>
            <p className="text-xs font-mono-display uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              隐藏技能
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={visible ? { opacity: 1 } : {}}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--orange)' }}
            >
              <span>◈</span>
              <EditableText
                value={character.hiddenSkill}
                onChange={(v) => dispatch({ type: 'UPDATE_CHARACTER', payload: { hiddenSkill: v } })}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
