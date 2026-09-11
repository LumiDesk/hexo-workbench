import * as vscode from 'vscode'
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { parseHexoSiteConfig } from './site-config'
import { DEFAULT_WORKSPACE_CONFIG, WORKSPACE_CONFIG_FILENAME, parseWorkspaceConfig } from './workspace-config'
import type { ContentKind, HexoProject } from '../shared/types'

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri)
    return true
  } catch {
    return false
  }
}

async function readText(uri: vscode.Uri): Promise<string> {
  return Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf8')
}

export async function loadHexoProject(rootUri: vscode.Uri): Promise<HexoProject | undefined> {
  const configUri = vscode.Uri.joinPath(rootUri, '_config.yml')
  if (!(await exists(configUri))) return undefined

  const rootPath = rootUri.fsPath
  const sourcePath = join(rootPath, 'source')
  const project: HexoProject = {
    rootPath,
    sourcePath,
    postsPath: join(sourcePath, '_posts'),
    draftsPath: join(sourcePath, '_drafts'),
    configPath: configUri.fsPath,
    workspaceConfigPath: join(rootPath, WORKSPACE_CONFIG_FILENAME),
    workspaceConfigExists: false,
    siteConfig: parseHexoSiteConfig(await readText(configUri)),
    workspaceConfig: DEFAULT_WORKSPACE_CONFIG
  }

  const workspaceConfigUri = vscode.Uri.file(project.workspaceConfigPath)
  if (await exists(workspaceConfigUri)) {
    project.workspaceConfigExists = true
    project.workspaceConfig = parseWorkspaceConfig(await readText(workspaceConfigUri))
  }
  return project
}

export async function projectForDocument(document: vscode.TextDocument): Promise<HexoProject | undefined> {
  const folder = vscode.workspace.getWorkspaceFolder(document.uri)
  if (!folder) return undefined
  const project = await loadHexoProject(folder.uri)
  if (!project) return undefined
  return isContentDocument(project, document.uri.fsPath) ? project : undefined
}

export function isContentDocument(project: HexoProject, filePath: string): boolean {
  if (extname(filePath).toLowerCase() !== '.md') return false
  const normalized = resolve(filePath)
  return isInside(project.postsPath, normalized) || isInside(project.draftsPath, normalized)
}

function isInside(parentPath: string, childPath: string): boolean {
  const rel = relative(resolve(parentPath), childPath)
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
}

export function contentKind(project: HexoProject, filePath: string): ContentKind | undefined {
  const normalized = resolve(filePath)
  if (isInside(project.postsPath, normalized)) return 'post'
  if (isInside(project.draftsPath, normalized)) return 'draft'
  return undefined
}

export function contentAssetPath(project: HexoProject, documentPath: string): string {
  const documentDirectory = dirname(documentPath)
  const filename = documentPath.slice(documentDirectory.length + 1)
  const stem = filename.slice(0, -extname(filename).length)
  return join(documentDirectory, stem)
}
