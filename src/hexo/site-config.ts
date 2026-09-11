import YAML from 'yaml'
import type { HexoSiteConfig } from '../shared/types'

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function bool(value: unknown): boolean {
  return value === true
}

export function parseHexoSiteConfig(text: string): HexoSiteConfig {
  const parsed = record(YAML.parse(text))
  const marked = record(parsed.marked)
  return {
    postAssetFolder: bool(parsed.post_asset_folder),
    markedPrependRoot: bool(marked.prependRoot),
    markedPostAsset: bool(marked.postAsset)
  }
}

export function supportsHexoMarkdownAssets(config: HexoSiteConfig): boolean {
  return config.postAssetFolder && config.markedPrependRoot && config.markedPostAsset
}
