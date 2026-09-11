import YAML from 'yaml'
import type { ContentKind, FrontMatterConfig, ImageLinkFormat, WorkspaceConfig } from '../shared/types'

export const WORKSPACE_CONFIG_FILENAME = '.hexo-workbench.yml'

const DEFAULT_FRONT_MATTER: FrontMatterConfig = {
  common: {
    title: '{{title}}',
    date: '{{date}}',
    tags: [],
    categories: []
  },
  post: {
    layout: 'post'
  },
  draft: {
    layout: 'post'
  }
}

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  image: {
    linkFormat: 'markdown'
  },
  frontMatter: DEFAULT_FRONT_MATTER
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function record(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

function linkFormat(value: unknown): ImageLinkFormat {
  if (value === undefined) return 'markdown'
  if (value === 'markdown' || value === 'asset_img') return value
  throw new Error('image.linkFormat must be markdown or asset_img in .hexo-workbench.yml.')
}

export function parseWorkspaceConfig(text: string): WorkspaceConfig {
  const value: unknown = YAML.parse(text)
  if (value !== null && value !== undefined && !isRecord(value)) {
    throw new Error('.hexo-workbench.yml must contain a YAML object.')
  }
  const parsed = record(value)
  const image = record(parsed.image)
  const frontMatter = record(parsed.frontMatter)

  return {
    image: {
      linkFormat: linkFormat(image.linkFormat)
    },
    frontMatter: {
      common: { ...DEFAULT_FRONT_MATTER.common, ...record(frontMatter.common) },
      post: { ...DEFAULT_FRONT_MATTER.post, ...record(frontMatter.post) },
      draft: { ...DEFAULT_FRONT_MATTER.draft, ...record(frontMatter.draft) }
    }
  }
}

export function serializeDefaultWorkspaceConfig(): string {
  return YAML.stringify({
    image: {
      linkFormat: DEFAULT_WORKSPACE_CONFIG.image.linkFormat
    },
    frontMatter: DEFAULT_WORKSPACE_CONFIG.frontMatter
  })
}

function replacePlaceholders(value: unknown, values: Record<string, string>): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{(title|date)\}\}/g, (_, key: string) => values[key] ?? '')
  }
  if (Array.isArray(value)) {
    return value.map((item) => replacePlaceholders(item, values))
  }
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replacePlaceholders(item, values)]))
  }
  return value
}

export function createFrontMatter(
  config: WorkspaceConfig,
  kind: ContentKind,
  title: string,
  date: string
): Record<string, unknown> {
  const template = {
    ...config.frontMatter.common,
    ...config.frontMatter[kind]
  }
  return replacePlaceholders(template, { title, date }) as Record<string, unknown>
}

export function renderFrontMatter(data: Record<string, unknown>): string {
  return `---\n${YAML.stringify(data)}---\n\n`
}
