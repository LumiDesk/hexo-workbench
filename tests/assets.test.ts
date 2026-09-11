import { describe, expect, it } from 'vitest'
import { createImageReference, relativeReference } from '../src/assets/references'
import { formatImageName, imageExtension, safeSlug, uniqueImageName } from '../src/assets/naming'

describe('image naming', () => {
  it('creates safe slugs', () => {
    expect(safeSlug('  Hello: Hexo / World  ')).toBe('hello-hexo-world')
    expect(safeSlug('CON')).toBe('con-post')
    expect(safeSlug('{% image %}')).toBe('image')
  })

  it('uses the mime type for clipboard images', () => {
    expect(imageExtension('image/jpeg')).toBe('.jpg')
    expect(imageExtension('application/octet-stream', 'capture.webp')).toBe('.webp')
  })

  it('formats image names with configurable date tokens', () => {
    expect(formatImageName('YYYY-MM-DD_HH-mm-ss', new Date('2026-01-02T03:04:05.006'))).toBe('2026-01-02_03-04-05')
  })

  it('does not reuse an existing image name', () => {
    const used = new Set(['Article-20260101000000.png', 'Article-20260101000000-2.png'])
    expect(uniqueImageName('Article-20260101000000', '.png', (name) => used.has(name))).toBe(
      'Article-20260101000000-3.png'
    )
  })
})

describe('image references', () => {
  const documentPath = '/site/source/_posts/hello.md'
  const imagePath = '/site/source/_posts/hello/screenshot.png'

  it('generates a portable relative Markdown reference', () => {
    expect(relativeReference(documentPath, imagePath)).toBe('./hello/screenshot.png')
    expect(createImageReference('markdown', documentPath, imagePath, 'A screenshot')).toBe(
      '![A screenshot](./hello/screenshot.png)'
    )
  })

  it('generates an asset_img tag for filenames with spaces', () => {
    expect(
      createImageReference('asset_img', documentPath, '/site/source/_posts/hello/a screenshot.png', 'Login screen')
    ).toBe('{% asset_img "a screenshot.png" "Login screen" %}')
  })
})
