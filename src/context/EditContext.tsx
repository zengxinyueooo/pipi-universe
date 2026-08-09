import { createContext, useContext, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import {
  characterData as defaultCharacter,
  quotes as defaultQuotes,
  timelineEvents as defaultTimeline,
  letterText as defaultLetter,
  galleryImages as defaultGallery,
} from '../data/content'

// ── 数据类型 ──────────────────────────────────────────────────────────────

export interface SkillItem {
  name: string
  value: number
  color: string
}

export interface CharacterData {
  name: string
  title: string
  personality: string
  avatar: string
  skills: SkillItem[]
  hiddenSkill: string
}

export interface QuoteItem {
  id: number
  front: string
  emoji: string
  story: string
}

export interface TimelineItem {
  id: number
  time: string
  title: string
  desc: string
  icon: string
}

export interface AppData {
  character: CharacterData
  quotes: QuoteItem[]
  timeline: TimelineItem[]
  letter: string
  gallery: string[]
}

// ── Action 类型 ───────────────────────────────────────────────────────────

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

// ── Reducer ───────────────────────────────────────────────────────────────

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'LOAD_REMOTE':
      return action.payload

    case 'UPDATE_CHARACTER':
      return { ...state, character: { ...state.character, ...action.payload } }

    case 'UPDATE_AVATAR':
      return { ...state, character: { ...state.character, avatar: action.payload } }

    case 'UPDATE_SKILL': {
      const skills = state.character.skills.map((s, i) =>
        i === action.payload.index ? { ...s, [action.payload.field]: action.payload.value } : s
      )
      return { ...state, character: { ...state.character, skills } }
    }

    case 'UPDATE_QUOTE': {
      const quotes = state.quotes.map((q, i) =>
        i === action.payload.index ? { ...q, [action.payload.field]: action.payload.value } : q
      )
      return { ...state, quotes }
    }

    case 'UPDATE_TIMELINE': {
      const timeline = state.timeline.map((t, i) =>
        i === action.payload.index ? { ...t, [action.payload.field]: action.payload.value } : t
      )
      return { ...state, timeline }
    }

    case 'UPDATE_LETTER':
      return { ...state, letter: action.payload }

    case 'ADD_IMAGE':
      return { ...state, gallery: [...state.gallery, action.payload] }

    case 'REMOVE_IMAGE':
      return { ...state, gallery: state.gallery.filter((_, i) => i !== action.payload) }

    default:
      return state
  }
}

// ── 初始值（来自 content.ts 默认内容）────────────────────────────────────

const initialData: AppData = {
  character: defaultCharacter,
  quotes: defaultQuotes,
  timeline: defaultTimeline,
  letter: defaultLetter,
  gallery: defaultGallery,
}

// ── Context ───────────────────────────────────────────────────────────────

interface EditContextValue {
  data: AppData
  dispatch: Dispatch<Action>
  isEditMode: boolean
}

const EditContext = createContext<EditContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────

export function EditProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, initialData)
  const isEditMode = new URLSearchParams(window.location.search).get('edit') === 'true'

  return (
    <EditContext.Provider value={{ data, dispatch, isEditMode }}>
      {children}
    </EditContext.Provider>
  )
}

// ── Hooks ─────────────────────────────────────────────────────────────────

function useEditContext(): EditContextValue {
  const ctx = useContext(EditContext)
  if (!ctx) throw new Error('useEditContext 必须在 EditProvider 内部使用')
  return ctx
}

export function useAppData(): AppData {
  return useEditContext().data
}

export function useEditMode(): boolean {
  return useEditContext().isEditMode
}

export function useEditDispatch(): Dispatch<Action> {
  return useEditContext().dispatch
}
