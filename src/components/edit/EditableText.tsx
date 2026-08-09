import { useRef, useEffect } from 'react'
import { useEditMode } from '../../context/EditContext'

interface EditableTextProps {
  value: string
  onChange: (v: string) => void
  className?: string
  style?: React.CSSProperties
  // 用于多行内容（如感谢信），改用 EditableArea 替代
  tag?: 'span' | 'p' | 'h3' | 'h4'
}

// 单行/短文本原位编辑组件
export default function EditableText({
  value,
  onChange,
  className,
  style,
  tag: Tag = 'span',
}: EditableTextProps) {
  const isEdit = useEditMode()
  const ref = useRef<HTMLSpanElement>(null)

  // 当 value 从外部更新时，同步 contentEditable 内容
  // （避免 React 与 contentEditable 内容冲突）
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value
    }
  }, [value])

  if (!isEdit) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    )
  }

  // 编辑模式下统一用 span（contentEditable 不依赖具体 tag 的 ref 类型）
  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const text = e.currentTarget.textContent ?? ''
        if (text !== value) onChange(text)
      }}
      className={className}
      style={{
        ...style,
        outline: '1px dashed color-mix(in srgb, var(--purple) 50%, transparent)',
        borderRadius: '4px',
        cursor: 'text',
        minWidth: '20px',
        display: 'inline-block',
        padding: '0 2px',
      }}
    >
      {value}
    </span>
  )
}
