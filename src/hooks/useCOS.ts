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
