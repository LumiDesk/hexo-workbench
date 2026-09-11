import { extname } from 'node:path'

const INVALID_FILENAME = /[<>:"/\\|?*{}%]/g

const DATE_TOKENS: Record<string, (date: Date) => string> = {
  YYYY: (date) => String(date.getFullYear()),
  MM: (date) => String(date.getMonth() + 1).padStart(2, '0'),
  DD: (date) => String(date.getDate()).padStart(2, '0'),
  HH: (date) => String(date.getHours()).padStart(2, '0'),
  hh: (date) => String(date.getHours()).padStart(2, '0'),
  mm: (date) => String(date.getMinutes()).padStart(2, '0'),
  ss: (date) => String(date.getSeconds()).padStart(2, '0'),
  SSS: (date) => String(date.getMilliseconds()).padStart(3, '0')
}

export function safeSlug(value: string): string {
  const slug = value
    .trim()
    .replace(INVALID_FILENAME, '-')
    .split('')
    .filter((character) => character.charCodeAt(0) >= 32)
    .join('')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .toLowerCase()

  if (!slug) return 'untitled'
  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(slug) ? `${slug}-post` : slug
}

export function formatImageName(format: string, date = new Date()): string {
  return format.replace(/YYYY|SSS|MM|DD|HH|hh|mm|ss/g, (token) => DATE_TOKENS[token](date))
}

function safeFileStem(value: string): string {
  const stem = value
    .trim()
    .replace(INVALID_FILENAME, '-')
    .replace(/\s+/g, '-')
    .split('')
    .filter((character) => character.charCodeAt(0) >= 32)
    .join('')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
  return stem || 'image'
}

export function imageExtension(mimeType: string, originalName?: string): string {
  const known = new Map([
    ['image/png', '.png'],
    ['image/jpeg', '.jpg'],
    ['image/jpg', '.jpg'],
    ['image/gif', '.gif'],
    ['image/webp', '.webp'],
    ['image/svg+xml', '.svg'],
    ['image/bmp', '.bmp']
  ])
  const fromMime = known.get(mimeType.toLowerCase())
  if (fromMime) return fromMime
  const fromName = originalName ? extname(originalName).toLowerCase() : ''
  return fromName || '.png'
}

export function uniqueImageName(baseName: string, extension: string, exists: (name: string) => boolean): string {
  const base = safeFileStem(baseName)
  let candidate = `${base}${extension}`
  let index = 2
  while (exists(candidate)) {
    candidate = `${base}-${index}${extension}`
    index += 1
  }
  return candidate
}
