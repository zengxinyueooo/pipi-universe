import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EditProvider, useEditMode, useEditDispatch } from './context/EditContext'
import { loadFromCOS } from './hooks/useCOS'
import LoadingScreen from './components/LoadingScreen'
import HeroSection from './components/HeroSection'
import CharacterCard from './components/CharacterCard'
import QuoteCards from './components/QuoteCards'
import Timeline from './components/Timeline'
import ImageGallery from './components/ImageGallery'
import DanmakuBubbles from './components/DanmakuBubbles'
import PetBeagle from './components/PetBeagle'
import ThankYouLetter from './components/ThankYouLetter'
import RandomToast from './components/RandomToast'
import EditToolbar from './components/edit/EditToolbar'

function AppInner() {
  const [isLoading, setIsLoading] = useState(true)
  const isEditMode = useEditMode()
  const dispatch = useEditDispatch()

  // 与 LoadingScreen 并行加载 COS 数据
  useEffect(() => {
    loadFromCOS().then(remoteData => {
      if (remoteData) {
        dispatch({ type: 'LOAD_REMOTE', payload: remoteData })
      }
    })
  }, [dispatch])

  // Konami Code 监听（↑↑↓↓←→←→BA）
  useEffect(() => {
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    let seq: string[] = []

    const handleKey = (e: KeyboardEvent) => {
      seq.push(e.key)
      if (seq.length > KONAMI.length) seq.shift()
      if (seq.join(',') === KONAMI.join(',')) {
        import('canvas-confetti').then(({ default: confetti }) => {
          // confetti 颜色随主题（--confetti-* 变量）
          const cs = getComputedStyle(document.documentElement)
          const cv = (n: string) => cs.getPropertyValue(n).trim()
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: [
              cv('--confetti-1'),
              cv('--confetti-2'),
              cv('--confetti-3'),
              cv('--confetti-4'),
            ].filter(Boolean),
          })
        })
        seq = []
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="relative">
      {/* 编辑模式工具栏 */}
      {isEditMode && <EditToolbar />}

      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onDone={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* 泡泡弹幕（全屏飘过）+ 摸摸皮皮 mascot（右下）*/}
      <DanmakuBubbles />
      <PetBeagle />

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <HeroSection />
          <CharacterCard />
          <QuoteCards />
          <Timeline />
          <ImageGallery />
          <ThankYouLetter />
          <RandomToast />
        </motion.div>
      )}
    </div>
  )
}

// 用 EditProvider 包裹整个应用
export default function App() {
  return (
    <EditProvider>
      <AppInner />
    </EditProvider>
  )
}
