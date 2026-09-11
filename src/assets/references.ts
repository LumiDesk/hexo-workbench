import { basename, dirname, relative, sep } from 'node:path'
import type { ImageLinkFormat } from '../shared/types'

function markdownEscape(value: string): string {
  return value
    .replace(/\r?\n/g, ' ')
    .replace(/[\\[\]]/g, '\\$&')
    .replace(/\)/g, '\\)')
}

function hexoArgument(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return /\s/.test(value) ? `"${escaped}"` : escaped
}

export function relativeReference(fromPath: string, toPath: string): string {
  const value = relative(dirname(fromPath), toPath).split(sep).join('/')
  return value.startsWith('.') ? value : `./${value}`
}

export function createImageReference(
  format: ImageLinkFormat,
  documentPath: string,
  assetPath: string,
  altText: string,
  markdownPath = relativeReference(documentPath, assetPath)
): string {
  const filename = basename(assetPath)
  if (format === 'asset_img') {
    const title = altText ? ` ${hexoArgument(altText)}` : ''
    return `{% asset_img ${hexoArgument(filename)}${title} %}`
  }

  return `![${markdownEscape(altText)}](${markdownPath})`
}
