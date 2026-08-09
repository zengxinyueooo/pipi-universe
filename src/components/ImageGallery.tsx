import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppData, useEditMode, useEditDispatch } from '../context/EditContext'
import { uploadImageToCOS } from '../hooks/useCOS'

export default function ImageGallery() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
  // 当前打开的大图索引，null 表示关闭
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { gallery } = useAppData()
  const isEdit = useEditMode()
  const dispatch = useEditDispatch()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImageToCOS(file, 'gallery')
      dispatch({ type: 'ADD_IMAGE', payload: url })
    } catch (err) {
      console.error('图片上传失败', err)
      alert('图片上传失败，请检查 COS 配置')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Lightbox 键盘控制：←/→ 切换，Esc 关闭
  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      else if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1)
      else if (e.key === 'ArrowRight' && lightboxIndex < gallery.length - 1) setLightboxIndex(lightboxIndex + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, gallery.length])

  // 切换到指定索引（边界保护）
  const goTo = (i: number) => {
    if (i >= 0 && i < gallery.length) setLightboxIndex(i)
  }

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      {/* 区块标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-xs font-mono-display tracking-widest uppercase mb-2" style={{ color: 'var(--orange)' }}>
          相册
        </p>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          皮皮的相册
        </h2>
      </motion.div>

      {/* 瀑布流图片网格（保留原比例，不裁剪）*/}
      <div className="w-full max-w-3xl columns-2 md:columns-3 gap-4">
        {gallery.map((url, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={visible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass-card relative overflow-hidden mb-4 break-inside-avoid group cursor-pointer"
            onClick={() => setLightboxIndex(i)}
          >
            <img
              src={url}
              alt={`皮皮相册 ${i + 1}`}
              loading="lazy"
              className="w-full h-auto block"
            />
            {/* hover 提示：点击查看大图 */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ background: 'color-mix(in srgb, var(--text-primary) 25%, transparent)' }}
            >
              <span className="text-xs font-mono-display px-3 py-1 rounded-full" style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border-glow)' }}>
                点击查看大图
              </span>
            </div>
            {isEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_IMAGE', payload: i }) }}
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-xs rounded-full z-10"
                style={{
                  background: 'color-mix(in srgb, var(--orange) 90%, transparent)',
                  color: '#fff',
                  border: '1px solid var(--border-glow)',
                }}
              >
                ✕
              </button>
            )}
          </motion.div>
        ))}

        {/* 添加图片卡（编辑模式）*/}
        {isEdit && (
          <label
            className="glass-card flex items-center justify-center cursor-pointer mb-4 break-inside-avoid"
            style={{ borderStyle: 'dashed', height: '8rem' }}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAdd}
              disabled={uploading}
            />
            <span className="text-3xl" style={{ color: 'var(--text-muted)' }}>
              {uploading ? '…' : '+'}
            </span>
          </label>
        )}
      </div>

      {!isEdit && gallery.length === 0 && (
        <p className="text-sm mt-8" style={{ color: 'var(--text-muted)' }}>相册还是空的～</p>
      )}

      {/* 大图查看 Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && gallery[lightboxIndex] && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(40, 28, 17, 0.92)' }}
            onClick={() => setLightboxIndex(null)}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-xl rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-glow)',
              }}
            >
              ✕
            </button>

            {/* 左切换 */}
            <button
              onClick={(e) => { e.stopPropagation(); goTo(lightboxIndex - 1) }}
              disabled={lightboxIndex <= 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-2xl rounded-full disabled:opacity-0"
              style={{
                background: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-glow)',
              }}
            >
              ‹
            </button>

            {/* 右切换 */}
            <button
              onClick={(e) => { e.stopPropagation(); goTo(lightboxIndex + 1) }}
              disabled={lightboxIndex >= gallery.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-2xl rounded-full disabled:opacity-0"
              style={{
                background: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-glow)',
              }}
            >
              ›
            </button>

            {/* 大图 + 索引，阻止点击穿透到遮罩 */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={gallery[lightboxIndex]}
                alt={`皮皮相册 ${lightboxIndex + 1}`}
                className="max-w-[90vw] max-h-[78vh] object-contain"
                style={{ border: '2px solid var(--border-glow)', boxShadow: '6px 6px 0 rgba(0,0,0,0.4)' }}
              />
              <p className="mt-3 text-xs font-mono-display" style={{ color: 'var(--bg-deep)' }}>
                {lightboxIndex + 1} / {gallery.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
