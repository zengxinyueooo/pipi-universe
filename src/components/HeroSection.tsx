import { motion } from 'framer-motion'
import EasterEggButton from './EasterEggButton'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* 比格犬主图（铺满背景，略淡）*/}
      <img
        src="/beagle-hero.webp"
        alt="皮皮比格犬"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ opacity: 0.3 }}
      />
      {/* 底部渐变遮罩，让文字区背景更实、字更清晰 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--bg-deep) 45%, transparent) 100%)' }}
      />

      {/* 主内容 */}
      <div className="relative z-10 text-center max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, type: 'spring', bounce: 0.3 }}
          className="font-mono-display font-bold mb-4"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1.1 }}
        >
          <span className="text-pixel-stroke" style={{ color: 'var(--text-primary)' }}>皮皮的快乐小窝！</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          一个表面不正经，其实很用心的网站
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm mb-12 font-mono-display"
          style={{ color: 'var(--text-primary)' }}
        >
          ↑↑↓↓←→←→BA 解锁隐藏彩蛋
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="flex justify-center"
        >
          <EasterEggButton />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="text-xs font-mono-display">向下探索</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'var(--purple)' }}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  )
}
