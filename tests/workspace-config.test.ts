import { describe, expect, it } from 'vitest'
import {
  createFrontMatter,
  DEFAULT_WORKSPACE_CONFIG,
  parseWorkspaceConfig,
  renderFrontMatter,
  serializeDefaultWorkspaceConfig
} from '../src/hexo/workspace-config'
import { parseHexoSiteConfig, supportsHexoMarkdownAssets } from '../src/hexo/site-config'

describe('workspace configuration', () => {
  it('rejects unsupported link formats instead of silently switching them', () => {
    expect(() => parseWorkspaceConfig('image:\n  linkFormat: html')).toThrow('image.linkFormat')
  })
  it('provides a valid default configuration file', () => {
    const parsed = parseWorkspaceConfig(serializeDefaultWorkspaceConfig())
    expect(parsed.image.linkFormat).toBe('markdown')
    expect(parsed.frontMatter.post.layout).toBe('post')
  })

  it('allows custom fields and image format', () => {
    const parsed = parseWorkspaceConfig(`
image:
  linkFormat: asset_img
frontMatter:
  common:
    author: Talyra42
  post:
    comments: false
`)
    const frontMatter = createFrontMatter(parsed, 'post', 'Hello', '2026-01-01 00:00:00')
    expect(parsed.image.linkFormat).toBe('asset_img')
    expect(frontMatter).toMatchObject({ title: 'Hello', author: 'Talyra42', comments: false })
  })

  it('renders YAML front matter with a blank line after the fence', () => {
    expect(renderFrontMatter({ title: 'Hello', tags: [] })).toContain('---\ntitle: Hello\ntags: []\n---\n\n')
    expect(DEFAULT_WORKSPACE_CONFIG.frontMatter.common.tags).toEqual([])
  })
})

describe('Hexo site configuration', () => {
  it('recognizes the official post asset Markdown settings', () => {
    const config = parseHexoSiteConfig(`
post_asset_folder: true
marked:
  prependRoot: true
  postAsset: true
`)
    expect(supportsHexoMarkdownAssets(config)).toBe(true)
  })
})
