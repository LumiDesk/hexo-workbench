import * as vscode from 'vscode'
import { extname, join } from 'node:path'
import { safeSlug } from '../assets/naming'
import { loadHexoProject, projectForDocument } from '../hexo/project'
import { supportsHexoMarkdownAssets } from '../hexo/site-config'
import {
  createFrontMatter,
  renderFrontMatter,
  serializeDefaultWorkspaceConfig,
  WORKSPACE_CONFIG_FILENAME
} from '../hexo/workspace-config'
import type { ContentKind, HexoProject } from '../shared/types'

async function ensureDirectory(uri: vscode.Uri): Promise<void> {
  try {
    await vscode.workspace.fs.createDirectory(uri)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.toLowerCase().includes('exist')) throw error
  }
}

async function fileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri)
    return true
  } catch {
    return false
  }
}

function localDateTime(date = new Date()): string {
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

async function currentProject(): Promise<HexoProject | undefined> {
  const folder = vscode.workspace.workspaceFolders?.[0]
  if (!folder) {
    void vscode.window.showErrorMessage('Hexo Workbench: open a Hexo workspace first.')
    return undefined
  }
  const project = await loadHexoProject(folder.uri)
  if (!project) {
    void vscode.window.showErrorMessage('Hexo Workbench: the workspace does not contain _config.yml.')
  }
  return project
}

export async function initializeWorkspace(): Promise<void> {
  const project = await currentProject()
  if (!project) return
  const uri = vscode.Uri.file(join(project.rootPath, WORKSPACE_CONFIG_FILENAME))
  if (await fileExists(uri)) {
    const choice = await vscode.window.showWarningMessage(`${WORKSPACE_CONFIG_FILENAME} already exists.`, 'Open File')
    if (choice === 'Open File') await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri))
    return
  }
  await vscode.workspace.fs.writeFile(uri, Buffer.from(serializeDefaultWorkspaceConfig(), 'utf8'))
  await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri))
}

export async function pasteImage(): Promise<void> {
  const document = vscode.window.activeTextEditor?.document
  if (!document || document.isUntitled) {
    void vscode.window.showErrorMessage('Hexo Workbench: save a Hexo Markdown article before pasting an image.')
    return
  }
  const project = await projectForDocument(document)
  if (!project) {
    void vscode.window.showErrorMessage('Hexo Workbench: open an article in source/_posts or source/_drafts.')
    return
  }
  if (!project.siteConfig.postAssetFolder) {
    void vscode.window.showErrorMessage('Hexo Workbench: set post_asset_folder: true in the site _config.yml first.')
    return
  }
  if (!supportsHexoMarkdownAssets(project.siteConfig)) {
    void vscode.window.showWarningMessage(
      'Hexo Workbench: Markdown assets need marked.prependRoot and marked.postAsset. Choose asset_img or update the site config.'
    )
  }
  await vscode.commands.executeCommand('editor.action.pasteAs')
}

async function nextPostPath(directory: string, title: string): Promise<string> {
  const base = safeSlug(title)
  let index = 1
  while (true) {
    const suffix = index === 1 ? '' : `-${index}`
    const candidate = vscode.Uri.file(join(directory, `${base}${suffix}.md`))
    if (!(await fileExists(candidate))) return candidate.fsPath
    index += 1
  }
}

export async function createContent(kind: ContentKind): Promise<void> {
  const project = await currentProject()
  if (!project) return
  const title = await vscode.window.showInputBox({
    prompt: kind === 'draft' ? 'Draft title' : 'Post title',
    placeHolder: 'My new Hexo article',
    validateInput: (value) => (value.trim() ? undefined : 'A title is required.')
  })
  if (!title) return

  const directory = kind === 'draft' ? project.draftsPath : project.postsPath
  await ensureDirectory(vscode.Uri.file(directory))
  const filePath = await nextPostPath(directory, title)
  const now = localDateTime()
  const content = renderFrontMatter(createFrontMatter(project.workspaceConfig, kind, title, now))
  const uri = vscode.Uri.file(filePath)
  await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'))
  if (project.siteConfig.postAssetFolder)
    await ensureDirectory(vscode.Uri.file(filePath.slice(0, -extname(filePath).length)))
  await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri))
}
