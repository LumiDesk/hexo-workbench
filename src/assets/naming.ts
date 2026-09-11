import { extname } from 'node:path'

const INVALID_FILENAME = /[<>:"/\\|?*{}%]/g

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

export function uniqueImageName(
  title: string,
  extension: string,
  exists: (name: string) => boolean,
  now = new Date()
): string {
  const timestamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14)
  const base = `${safeSlug(title)}-${timestamp}`
  let candidate = `${base}${extension}`
  let index = 2
  while (exists(candidate)) {
    candidate = `${base}-${index}${extension}`
    index += 1
  }
  return candidate
}
