# 皮皮的快乐小窝 · 像素比格犬单一风改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把「皮皮的快乐宇宙」从双主题改成单一的像素比格犬欢快风「皮皮的快乐小窝」——删赛博宇宙风、重做 Loading 像素场景、新增可增删改图片区、区块标签改欢快、avatar 用比格图、useCOS 规范化。

**Architecture:** 像素主题变量值搬进 `:root` 成为唯一主题，删 `[data-theme]` 切换/ThemeToggle/useTheme；LoadingScreen 重做为像素场景 SVG+keyframes（保留进度条+淡出骨架）；新增 ImageGallery 组件 + gallery 数据 + COS 压缩上传；各区块标签改欢快。

**Tech Stack:** React 19 + TypeScript + Vite 8 + Tailwind 4 + framer-motion + cos-js-sdk-v5 + 方舟像素字体。

**测试与提交说明:** 项目无测试框架（package.json 无 test script，spec 无测试要求），用 `tsc 类型检查` + `vite build` + 浏览器手动验证替代单元测试。未要求 commit、项目 git 状态未确认，故省略 commit 步骤；需要 commit 时单独说。

**Spec:** `docs/superpowers/specs/2026-07-23-pipi-happy-home-design.md`

---

## File Structure

修改：
- `src/index.css` — 像素变量入 `:root`、删 `[data-theme]`、删 `float-star`、新 Loading keyframes
- `src/App.tsx` — 删 ThemeToggle、接入 ImageGallery
- `src/components/HeroSection.tsx` — 删星空层、比格默认显示、标签
- `src/components/LoadingScreen.tsx` — 重做像素场景
- `src/components/CharacterCard.tsx` — 标签、avatar 渲染逻辑
- `src/components/QuoteCards.tsx` — 标签
- `src/components/Timeline.tsx` — 标签
- `src/components/ThankYouLetter.tsx` — 标签
- `src/context/EditContext.tsx` — gallery 字段 + ADD/REMOVE action
- `src/hooks/useCOS.ts` — 压缩 + pipi 前缀 + gallery 容错
- `src/data/content.ts` — avatar + galleryImages
- `index.html` — title

新建：
- `src/components/ImageGallery.tsx` — 图片展示区

删除：
- `src/components/ThemeToggle.tsx`
- `src/hooks/useTheme.ts`

---

## Task 1: useCOS 规范化（压缩 + pipi 前缀 + gallery 容错）

**Files:** Modify `src/hooks/useCOS.ts`

- [ ] **Step 1: 重写 useCOS.ts**

整体替换为：

```typescript
import COS from 'cos-js-sdk-v5'
import type { AppData } from '../context/EditContext'

const SECRET_ID = import.meta.env.VITE_COS_SECRET_ID as string
const SECRET_KEY = import.meta.env.VITE_COS_SECRET_KEY as string
const BUCKET = import.meta.env.VITE_COS_BUCKET as string
const REGION = import.meta.env.VITE_COS_REGION as string

const DATA_KEY = 'pipi/data.json'

let _cos: COS | null = null
function getCOS(): COS {
  if (!_cos) {
    _cos = new COS({ SecretId: SECRET_ID, SecretKey: SECRET_KEY })
  }
  return _cos
}

// 图片压缩到最大 800px、jpeg 0.8（按静态网站部署方案规范）
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 800
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else { width = Math.round(width * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('压缩失败'))
      }, 'image/jpeg', 0.8)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片加载失败')) }
    img.src = url
  })
}

// 通用图片上传：压缩 + pipi/ 路径前缀（避免与 rilakkuma 项目冲突）
export async function uploadImageToCOS(file: File, subDir: 'avatars' | 'gallery' = 'avatars'): Promise<string> {
  if (!SECRET_ID || !SECRET_KEY || !BUCKET || !REGION || SECRET_ID.startsWith('请填入')) {
    throw new Error('COS 未配置')
  }
  const blob = await compressImage(file)
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const key = `pipi/${subDir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  await getCOS().putObject({
    Bucket: BUCKET,
    Region: REGION,
    Key: key,
    Body: blob,
    ContentType: 'image/jpeg',
  })

  return `https://${BUCKET}.cos.${REGION}.myqcloud.com/${key}`
}

// 从 COS 读取 data.json
export async function loadFromCOS(): Promise<AppData | null> {
  if (!SECRET_ID || !SECRET_KEY || !BUCKET || !REGION || SECRET_ID.startsWith('请填入')) {
    return null
  }
  try {
    const result = await getCOS().getObject({ Bucket: BUCKET, Region: REGION, Key: DATA_KEY })
    const text = result.Body as string
    const parsed = JSON.parse(text) as Partial<AppData>
    // 校验结构完整性
    if (!parsed?.character?.name || !Array.isArray(parsed?.quotes) || !Array.isArray(parsed?.timeline)) {
      return null
    }
    return {
      character: parsed.character!,
      quotes: parsed.quotes!,
      timeline: parsed.timeline!,
      letter: parsed.letter ?? '',
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery! : [],
    }
  } catch {
    return null
  }
}

// 保存 AppData 到 COS 的 data.json
export async function saveToCOS(data: AppData): Promise<void> {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  await getCOS().putObject({
    Bucket: BUCKET, Region: REGION, Key: DATA_KEY, Body: blob, ContentType: 'application/json',
  })
}
```

- [ ] **Step 2: 类型检查**

Run: `cd /Users/zengxinyue/pipi-universe && npx tsc -b --noEmit`
Expected: 无错误（`AppData.gallery` 尚未加，会报错——这是预期，Task 3 加字段后通过。可先跳过，Task 3 后统一检查）。

---

## Task 2: content.ts 数据（avatar + galleryImages）

**Files:** Modify `src/data/content.ts`

- [ ] **Step 1: 改 avatar 默认值**

把 `avatar: '🧑‍💻',` 改为 `avatar: '/beagle-hero.png',`

- [ ] **Step 2: 末尾加 galleryImages 导出**

在 `export const toastMessages = [...]` 之后追加：

```typescript
export const galleryImages: string[] = []
```

- [ ] **Step 3: 类型检查**

Run: `npx tsc -b --noEmit`
Expected: content.ts 无错（EditContext 还没用 gallery，无影响）。

---

## Task 3: EditContext 加 gallery 字段 + actions

**Files:** Modify `src/context/EditContext.tsx`

- [ ] **Step 1: 重写 EditContext.tsx**

整体替换为：

```typescript
import { createContext, useContext, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import {
  characterData as defaultCharacter,
  quotes as defaultQuotes,
  timelineEvents as defaultTimeline,
  letterText as defaultLetter,
  galleryImages as defaultGallery,
} from '../data/content'

// ── 数据类型 ──
export interface SkillItem { name: string; value: number; color: string }
export interface CharacterData {
  name: string; title: string; personality: string; avatar: string
  skills: SkillItem[]; hiddenSkill: string
}
export interface QuoteItem { id: number; front: string; emoji: string; story: string }
export interface TimelineItem { id: number; time: string; title: string; desc: string; icon: string }
export interface AppData {
  character: CharacterData
  quotes: QuoteItem[]
  timeline: TimelineItem[]
  letter: string
  gallery: string[]
}

// ── Action 类型 ──
type Action =
  | { type: 'LOAD_REMOTE'; payload: AppData }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<CharacterData> }
  | { type: 'UPDATE_SKILL'; payload: { index: number; field: keyof SkillItem; value: string | number } }
  | { type: 'UPDATE_QUOTE'; payload: { index: number; field: keyof QuoteItem; value: string } }
  | { type: 'UPDATE_TIMELINE'; payload: { index: number; field: keyof TimelineItem; value: string } }
  | { type: 'UPDATE_LETTER'; payload: string }
  | { type: 'UPDATE_AVATAR'; payload: string }
  | { type: 'ADD_IMAGE'; payload: string }
  | { type: 'REMOVE_IMAGE'; payload: number }

// ── Reducer ──
function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'LOAD_REMOTE': return action.payload
    case 'UPDATE_CHARACTER': return { ...state, character: { ...state.character, ...action.payload } }
    case 'UPDATE_AVATAR': return { ...state, character: { ...state.character, avatar: action.payload } }
    case 'UPDATE_SKILL': {
      const skills = state.character.skills.map((s, i) =>
        i === action.payload.index ? { ...s, [action.payload.field]: action.payload.value } : s)
      return { ...state, character: { ...state.character, skills } }
    }
    case 'UPDATE_QUOTE': {
      const quotes = state.quotes.map((q, i) =>
        i === action.payload.index ? { ...q, [action.payload.field]: action.payload.value } : q)
      return { ...state, quotes }
    }
    case 'UPDATE_TIMELINE': {
      const timeline = state.timeline.map((t, i) =>
        i === action.payload.index ? { ...t, [action.payload.field]: action.payload.value } : t)
      return { ...state, timeline }
    }
    case 'UPDATE_LETTER': return { ...state, letter: action.payload }
    case 'ADD_IMAGE': return { ...state, gallery: [...state.gallery, action.payload] }
    case 'REMOVE_IMAGE':
      return { ...state, gallery: state.gallery.filter((_, i) => i !== action.payload) }
    default: return state
  }
}

const initialData: AppData = {
  character: defaultCharacter,
  quotes: defaultQuotes,
  timeline: defaultTimeline,
  letter: defaultLetter,
  gallery: defaultGallery,
}

interface EditContextValue { data: AppData; dispatch: Dispatch<Action>; isEditMode: boolean }
const EditContext = createContext<EditContextValue | null>(null)

export function EditProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, initialData)
  const isEditMode = new URLSearchParams(window.location.search).get('edit') === 'true'
  return <EditContext.Provider value={{ data, dispatch, isEditMode }}>{children}</EditContext.Provider>
}

function useEditContext(): EditContextValue {
  const ctx = useContext(EditContext)
  if (!ctx) throw new Error('useEditContext 必须在 EditProvider 内部使用')
  return ctx
}
export function useAppData(): AppData { return useEditContext().data }
export function useEditMode(): boolean { return useEditContext().isEditMode }
export function useEditDispatch(): Dispatch<Action> { return useEditContext().dispatch }
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc -b --noEmit`
Expected: 无错误（Task 1 的 `AppData.gallery` 引用现在成立）。

---

## Task 4: index.css 像素风成为唯一主题

**Files:** Modify `src/index.css`

- [ ] **Step 1: 把像素变量值搬进 `:root`**

把 `:root { ... }` 整块替换为（像素值成为默认）：

```css
:root {
  --bg-deep: #fdf6e3;
  --bg-card: #fff8e7;
  --border-glow: #b8743a;
  --purple: #b8743a;
  --cyan: #6ab04c;
  --orange: #e8a33d;
  --text-primary: #3d2817;
  --text-muted: #8b6f47;
  --font-display: 'ark-pixel-12px', 'JetBrains Mono', 'Courier New', monospace;
  --confetti-1: #b8743a;
  --confetti-2: #6ab04c;
  --confetti-3: #e8a33d;
  --confetti-4: #fff8e7;
}
```

- [ ] **Step 2: 删除 `[data-theme="pixel-beagle"]` 整块**

删除从 `/* CSS 变量 —— 像素比格犬主题 */` 注释到其闭合 `}` 的整段（变量定义那段）。再删除底部「像素比格犬主题：质感覆盖」整段（从注释到所有 `[data-theme="pixel-beagle"] ...` 规则），把其中的工具类规则改为无前缀全局：

```css
/* 像素网格背景 */
body {
  background-image:
    linear-gradient(color-mix(in srgb, var(--border-glow) 9%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--border-glow) 9%, transparent) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -1px -1px;
}
/* 像素卡：实色方块 + 硬边框 + 硬阴影 */
.glass-card {
  background: var(--bg-card);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 2px solid var(--border-glow);
  border-radius: 4px;
  box-shadow: 4px 4px 0 color-mix(in srgb, var(--border-glow) 80%, transparent);
}
::-webkit-scrollbar { width: 12px; }
::-webkit-scrollbar-track { background: var(--bg-deep); }
::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 0; border: 2px solid var(--bg-deep); }
.neon-glow-purple, .neon-glow-cyan {
  box-shadow: 4px 4px 0 color-mix(in srgb, var(--border-glow) 60%, transparent);
}
.flip-card-front, .flip-card-back { border-radius: 4px; }
img.pixel-art, img.beagle-mascot { image-rendering: pixelated; }
```

注意：原 `.glass-card`（毛玻璃版）被上面覆盖；保留 `@font-face`、`.text-gradient-*`、`.font-mono-display`、`twinkle`/`blink` keyframes、`.flip-card*`、`[data-edit-mode]`、`prefers-reduced-motion`、`beagle-bounce`/`beagle-tail`/`beagle-blink` keyframes。

- [ ] **Step 3: 删除 `float-star` keyframes**

删除整段 `@keyframes float-star { ... }`（星空专用，不再用）。

- [ ] **Step 4: 删除 hero 主视觉切换规则**

删除 `.hero-star-layer` / `.hero-beagle-layer` 那几条规则（Hero 改为默认显示比格图，不再切换）。

- [ ] **Step 5: 验证**

Run: `npx tsc -b --noEmit && npm run build`
Expected: 构建通过。浏览器打开 dev，整站默认就是像素风（米黄/棕/绿）。

---

## Task 5: 删 ThemeToggle/useTheme + App.tsx + HeroSection 删星空

**Files:** Delete `src/components/ThemeToggle.tsx`, `src/hooks/useTheme.ts`; Modify `src/App.tsx`, `src/components/HeroSection.tsx`

- [ ] **Step 1: 删除两个文件**

Run: `rm /Users/zengxinyue/pipi-universe/src/components/ThemeToggle.tsx /Users/zengxinyue/pipi-universe/src/hooks/useTheme.ts`

- [ ] **Step 2: App.tsx 删 ThemeToggle**

删掉 `import ThemeToggle from './components/ThemeToggle'` 这行。
删掉 `{/* 主题切换（右下浮动，与 ?edit=true 正交）*/}` 注释 + `<ThemeToggle />` 这两行。

- [ ] **Step 3: HeroSection 重写（删星空 + 比格默认显示 + 新标签）**

整体替换为：

```tsx
import { motion } from 'framer-motion'
import EasterEggButton from './EasterEggButton'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* 比格犬主图（默认显示）*/}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <img
          src="/beagle-hero.png"
          alt="皮皮比格犬"
          className="beagle-mascot"
          style={{
            maxWidth: '56%',
            maxHeight: '68%',
            objectFit: 'contain',
            filter: 'drop-shadow(6px 6px 0 color-mix(in srgb, var(--border-glow) 70%, transparent))',
          }}
        />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono-display mb-8"
          style={{
            background: 'color-mix(in srgb, var(--purple) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--purple) 30%, transparent)',
            color: 'var(--purple)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          快乐小窝 v1.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, type: 'spring', bounce: 0.3 }}
          className="font-mono-display font-bold mb-4"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1.1 }}
        >
          <span className="text-gradient-purple">皮皮的快乐小窝</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          一个表面不正经，其实很用心的网站
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm mb-12 font-mono-display"
          style={{ color: 'var(--text-muted)', opacity: 0.6 }}
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
```

- [ ] **Step 4: 验证**

Run: `npx tsc -b --noEmit`
Expected: 无 ThemeToggle/useTheme 残留引用错误。

---

## Task 6: 区块标签改欢快

**Files:** Modify `index.html`, `src/components/CharacterCard.tsx`, `src/components/QuoteCards.tsx`, `src/components/Timeline.tsx`, `src/components/ThankYouLetter.tsx`

> HeroSection 标签已在 Task 5 改过；LoadingScreen 标签在 Task 8 改。

- [ ] **Step 1: index.html title**

old: `<title>皮皮的快乐宇宙 (Beta)</title>`
new: `<title>皮皮的快乐小窝</title>`

- [ ] **Step 2: CharacterCard 标签**

old: `          CHARACTER DATA`
new: `          皮皮档案`

old: `          他的设定卡`
new: `          皮皮是谁`

- [ ] **Step 3: QuoteCards 标签**

old: `          CLASSIC QUOTES`
new: `          快乐语录`

old: `          经典语录`
new: `          皮皮金句`

- [ ] **Step 4: Timeline 标签**

old: `          SURVIVAL LOG`
new: `          冒险日记`

old: `          《我们差点挂掉的几个瞬间》`
new: `          一起冒险的日子`

- [ ] **Step 5: ThankYouLetter 标签**

old: `            FINAL SCREEN`
new: `            写给你`

old: `            说点正经的`
new: `            悄悄话`

- [ ] **Step 6: 验证**

Run: `npx tsc -b --noEmit && npm run build`
Expected: 通过。浏览器看各区块标签为欢快版。

---

## Task 7: CharacterCard avatar 渲染逻辑（支持本地路径）

**Files:** Modify `src/components/CharacterCard.tsx`

- [ ] **Step 1: AvatarContent 支持本地路径 img**

把 `const AvatarContent = () => (` 这段里的判断：

old:
```
    character.avatar.startsWith('http') ? (
      <img
        src={character.avatar}
        alt="avatar"
        className="w-full h-full object-cover rounded-2xl"
      />
    ) : (
      <span className="text-4xl">{character.avatar}</span>
    )
```

new:
```
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
```

- [ ] **Step 2: 验证**

Run: `npx tsc -b --noEmit`
Expected: 通过。浏览器看 CharacterCard 头像显示 /beagle-hero.png。

---

## Task 8: LoadingScreen 重做像素场景 + index.css keyframes

**Files:** Modify `src/index.css`, `src/components/LoadingScreen.tsx`

- [ ] **Step 1: index.css 加 Loading keyframes**

在已有 `beagle-*` keyframes 后追加：

```css
/* Loading 像素场景动画 */
@keyframes sun-rotate {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}
@keyframes balloon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes grass-sway {
  0%, 100% { transform: skewX(0deg); }
  50% { transform: skewX(3deg); }
}
```

- [ ] **Step 2: LoadingScreen.tsx 重写（像素场景）**

整体替换为：

```tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps { onDone: () => void }

const TOTAL_DURATION = 5800

// 欢快文案轮播
const PIXEL_LINES = [
  { text: '皮皮正在蹦跶…', delay: 300 },
  { text: '快乐值加载中…', delay: 1500 },
  { text: '尾巴摇到 99%…', delay: 3000 },
  { text: '快乐小窝，开门！🦴', delay: 4500 },
]

function LoadingScene() {
  return (
    <svg width="320" height="240" viewBox="0 0 320 240" style={{ maxWidth: '90vw', maxHeight: '50vh' }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe3ff" />
          <stop offset="100%" stopColor="#fdf6e3" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="240" fill="url(#sky)" />

      {/* 太阳（右上，旋转）*/}
      <g style={{ transformOrigin: '270px 40px', transformBox: 'fill-box', animation: 'sun-rotate 12s linear infinite' }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <rect key={a} x="266" y="6" width="8" height="14" fill="#ffd23f" transform={`rotate(${a} 270 40)`} />
        ))}
        <circle cx="270" cy="40" r="13" fill="#ffd23f" />
        <circle cx="270" cy="40" r="8" fill="#fff8e7" />
      </g>

      {/* 彩虹弧 */}
      <path d="M 60 115 A 100 100 0 0 1 260 115" stroke="#e8a33d" strokeWidth="8" fill="none" />
      <path d="M 68 115 A 92 92 0 0 1 252 115" stroke="#e8743a" strokeWidth="8" fill="none" />
      <path d="M 76 115 A 84 84 0 0 1 244 115" stroke="#b8743a" strokeWidth="8" fill="none" />
      <path d="M 84 115 A 76 76 0 0 1 236 115" stroke="#6ab04c" strokeWidth="8" fill="none" />
      <path d="M 92 115 A 68 68 0 0 1 228 115" stroke="#5fa8d3" strokeWidth="8" fill="none" />

      {/* 气球（左）*/}
      <g style={{ transformOrigin: 'center', transformBox: 'fill-box', animation: 'balloon-float 2.5s ease-in-out infinite' }}>
        <ellipse cx="50" cy="70" rx="12" ry="14" fill="#e8a33d" />
        <rect x="49" y="84" width="2" height="46" fill="#8b6f47" />
      </g>
      {/* 气球（右）*/}
      <g style={{ transformOrigin: 'center', transformBox: 'fill-box', animation: 'balloon-float 3s ease-in-out infinite 0.5s' }}>
        <ellipse cx="280" cy="80" rx="12" ry="14" fill="#6ab04c" />
        <rect x="279" y="94" width="2" height="46" fill="#8b6f47" />
      </g>

      {/* 比格犬（中央，蹦跳+摇尾+笑）*/}
      <g style={{ transformOrigin: 'center', transformBox: 'fill-box', animation: 'beagle-bounce 1.2s ease-in-out infinite' }}>
        {/* 尾巴（摇）*/}
        <rect x="176" y="148" width="6" height="16" fill="#b8743a" style={{ transformOrigin: '179px 164px', transformBox: 'fill-box', animation: 'beagle-tail 0.6s ease-in-out infinite' }} />
        {/* 身体（白底棕斑）*/}
        <rect x="118" y="150" width="60" height="40" fill="#fff8e7" stroke="#b8743a" strokeWidth="2" />
        <rect x="123" y="155" width="22" height="30" fill="#b8743a" />
        {/* 腿 */}
        <rect x="124" y="186" width="10" height="14" fill="#b8743a" />
        <rect x="164" y="186" width="10" height="14" fill="#b8743a" />
        {/* 头（棕）*/}
        <rect x="92" y="128" width="42" height="36" fill="#b8743a" />
        {/* 耳（垂）*/}
        <rect x="89" y="134" width="10" height="24" fill="#9c5a28" />
        <rect x="128" y="134" width="10" height="24" fill="#9c5a28" />
        {/* 脸白 */}
        <rect x="98" y="138" width="32" height="24" fill="#fff8e7" />
        {/* 笑眼（眯眼弧）*/}
        <rect x="104" y="146" width="8" height="2" fill="#3d2817" />
        <rect x="120" y="146" width="8" height="2" fill="#3d2817" />
        {/* 嘴（笑张）*/}
        <rect x="110" y="154" width="10" height="4" fill="#3d2817" />
        <rect x="112" y="158" width="6" height="2" fill="#e8a33d" />
      </g>

      {/* 草地（底部，摇曳）*/}
      <g style={{ transformOrigin: 'center bottom', transformBox: 'fill-box', animation: 'grass-sway 2s ease-in-out infinite' }}>
        <path d="M 0 200 Q 40 190 80 200 T 160 200 T 240 200 T 320 200 L 320 240 L 0 240 Z" fill="#6ab04c" />
        <rect x="30" y="195" width="4" height="10" fill="#4a8c35" />
        <rect x="90" y="192" width="4" height="13" fill="#4a8c35" />
        <rect x="200" y="194" width="4" height="11" fill="#4a8c35" />
        <rect x="270" y="190" width="4" height="15" fill="#4a8c35" />
      </g>
    </svg>
  )
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timers = PIXEL_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(prev => [...prev, i]), line.delay))

    const progressTimer = setInterval(() => {
      setProgress(prev => Math.min(prev + 1.5, 100))
    }, TOTAL_DURATION / 100)

    const doneTimer = setTimeout(() => {
      setExiting(true)
      setTimeout(onDone, 800)
    }, TOTAL_DURATION)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(progressTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'var(--bg-deep)' }}
        >
          <div className="flex justify-center mb-6">
            <LoadingScene />
          </div>

          <div className="relative w-full max-w-sm px-8">
            {/* 文案轮播 */}
            <div className="space-y-2 mb-6 min-h-[60px]">
              {PIXEL_LINES.map((line, i) => (
                <AnimatePresence key={i}>
                  {visibleLines.includes(i) && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-mono-display text-sm text-center"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {line.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              ))}
            </div>

            {/* 进度条 */}
            <div className="flex justify-between text-xs mb-2 font-mono-display" style={{ color: 'var(--text-muted)' }}>
              <span>快乐加载</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--text-primary) 12%, transparent)', border: '2px solid var(--border-glow)' }}>
              <motion.div
                className="h-full"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--purple), var(--cyan))' }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          <p className="mt-8 text-xs font-mono-display" style={{ color: 'var(--text-muted)' }}>快乐启动</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: 验证**

Run: `npx tsc -b --noEmit && npm run build`
Expected: 通过。刷新页面看 Loading 像素场景（太阳旋转/气球浮动/比格犬蹦跳笑摇尾/草地摇曳/彩虹）+ 进度条 + 完成淡出进主站。

---

## Task 9: ImageGallery 新组件 + App.tsx 接入

**Files:** Create `src/components/ImageGallery.tsx`; Modify `src/App.tsx`

- [ ] **Step 1: 新建 ImageGallery.tsx**

```tsx
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppData, useEditMode, useEditDispatch } from '../context/EditContext'
import { uploadImageToCOS } from '../hooks/useCOS'

export default function ImageGallery() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
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

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
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

      <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-3 gap-4">
        {gallery.map((url, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={visible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass-card relative overflow-hidden aspect-square group"
          >
            <img src={url} alt={`皮皮相册 ${i + 1}`} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
            {isEdit && (
              <button
                onClick={() => dispatch({ type: 'REMOVE_IMAGE', payload: i })}
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-xs rounded-full"
                style={{ background: 'color-mix(in srgb, var(--orange) 90%, transparent)', color: '#fff', border: '1px solid var(--border-glow)' }}
              >✕</button>
            )}
          </motion.div>
        ))}

        {/* 添加图片卡（编辑模式）*/}
        {isEdit && (
          <label className="glass-card aspect-square flex items-center justify-center cursor-pointer" style={{ borderStyle: 'dashed' }}>
            <input type="file" accept="image/*" className="hidden" onChange={handleAdd} disabled={uploading} />
            <span className="text-3xl" style={{ color: 'var(--text-muted)' }}>{uploading ? '…' : '+'}</span>
          </label>
        )}
      </div>

      {!isEdit && gallery.length === 0 && (
        <p className="text-sm mt-8" style={{ color: 'var(--text-muted)' }}>相册还是空的～</p>
      )}
    </section>
  )
}
```

- [ ] **Step 2: App.tsx 接入 ImageGallery**

加 import：
old: `import Timeline from './components/Timeline'`
new:
```
import Timeline from './components/Timeline'
import ImageGallery from './components/ImageGallery'
```

render 加在 Timeline 后：
old: `          <Timeline />`
new:
```
          <Timeline />
          <ImageGallery />
```

- [ ] **Step 3: 验证**

Run: `npx tsc -b --noEmit && npm run build`
Expected: 通过。浏览器滚动到 Timeline 后看到「皮皮的相册」；`?edit=true` 下有「+」添加卡、上传图片（压缩存 pipi/gallery/）、删除；刷新仍存在（云端）。

---

## Task 10: 最终验证

- [ ] **Step 1: 启动 dev**

Run: `cd /Users/zengxinyue/pipi-universe && npm run dev`

- [ ] **Step 2: 逐项检查**

- 首页标题「皮皮的快乐小窝」（index.html title + Hero 主标题）
- Loading 像素场景：太阳旋转 / 气球浮动 / 比格犬蹦跳笑摇尾 / 草地摇曳 / 彩虹 + 进度条推进 + 完成淡出进主站
- 各区块标签欢快：皮皮档案 / 快乐语录 / 冒险日记 / 写给你
- 各区块动态与改造前一致：入场动画、翻转卡、打字机、计数滚动、RandomToast、Konami 彩蛋
- 图片区域：展示网格；`?edit=true` 下添加/删除；刷新云端仍在
- avatar 显示 /beagle-hero.png；编辑模式可上传替换
- 无赛博残留：无星空、无 ThemeToggle、无 ?theme= 切换、无赛博日志
- Konami 彩蛋 confetti 是像素色（棕绿橙）
- 移动端响应式不破版

- [ ] **Step 3: 浏览器实测彩蛋**

键盘按 ↑↑↓↓←→←→BA，confetti 颜色为棕绿橙。

---

## Self-Review

**Spec 覆盖：**
- 删赛博宇宙风 → Task 4（index.css）+ Task 5（删 ThemeToggle/useTheme、App、HeroSection 删星空）
- 新 Loading → Task 8
- 区块标签 → Task 6（+ Task 5 Hero 标签 + Task 8 Loading 标签）
- 图片区域 → Task 9 + Task 1（COS）+ Task 2（content）+ Task 3（EditContext）
- useCOS 规范化 → Task 1
- avatar → Task 2（content）+ Task 7（渲染逻辑）
- 动态感不变 → Task 5/6/8 保留所有 motion/IntersectionObserver；Loading 保留进度+淡出
- 验证 → Task 10

**类型一致：** `gallery: string[]` 在 Task 2（content）→ Task 3（AppData）→ Task 1（loadFromCOS 返回含 gallery）→ Task 9（ImageGallery 用 useAppData().gallery）一致。`uploadImageToCOS(file, subDir)` 签名 Task 1 定义，Task 9 调用 `'gallery'`，一致。`ADD_IMAGE`/`REMOVE_IMAGE` Task 3 定义，Task 9 调用，一致。

**占位符：** 无 TBD/TODO。

无遗漏。

