export type ImageLinkFormat = 'markdown' | 'asset_img'
export type ContentKind = 'post' | 'draft'

export interface FrontMatterConfig {
  common: Record<string, unknown>
  post: Record<string, unknown>
  draft: Record<string, unknown>
}

export interface WorkspaceConfig {
  image: {
    linkFormat: ImageLinkFormat
  }
  frontMatter: FrontMatterConfig
}

export interface HexoSiteConfig {
  postAssetFolder: boolean
  markedPrependRoot: boolean
  markedPostAsset: boolean
}

export interface HexoProject {
  rootPath: string
  sourcePath: string
  postsPath: string
  draftsPath: string
  configPath: string
  workspaceConfigPath: string
  workspaceConfigExists: boolean
  siteConfig: HexoSiteConfig
  workspaceConfig: WorkspaceConfig
}
