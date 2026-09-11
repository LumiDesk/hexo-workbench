import * as vscode from 'vscode'
import { basename, extname, join } from 'node:path'
import { contentAssetPath, projectForDocument } from '../hexo/project'
import { supportsHexoMarkdownAssets } from '../hexo/site-config'
import { createImageReference, relativeReference } from './references'
import { imageExtension, uniqueImageName } from './naming'
import type { HexoProject, ImageLinkFormat } from '../shared/types'

const BASE_KIND = vscode.DocumentDropOrPasteEditKind.Text.append('markdown', 'link', 'image', 'hexo')
export const MARKDOWN_KIND = BASE_KIND.append('markdown')
export const ASSET_IMG_KIND = BASE_KIND.append('asset-img')

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']

interface ClipboardImage {
  bytes: Uint8Array
  mimeType: string
  name?: string
}

async function readImage(dataTransfer: vscode.DataTransfer): Promise<ClipboardImage | undefined> {
  for (const mimeType of IMAGE_MIME_TYPES) {
    const item = dataTransfer.get(mimeType)
    const file = item?.asFile()
    if (file) return { bytes: await file.data(), mimeType, name: file.name }
  }

  const fileItem = dataTransfer.get('files')?.asFile()
  if (fileItem) {
    const mimeType = extensionMimeType(extname(fileItem.name))
    if (mimeType) return { bytes: await fileItem.data(), mimeType, name: fileItem.name }
  }

  const uriText = await dataTransfer.get('text/uri-list')?.asString()
  const firstUri = uriText?.split(/\r?\n/).find((line) => line && !line.startsWith('#'))
  if (firstUri) {
    try {
      const uri = vscode.Uri.parse(firstUri)
      const mimeType = extensionMimeType(extname(uri.path))
      if (mimeType && uri.scheme === 'file') {
        return {
          bytes: await vscode.workspace.fs.readFile(uri),
          mimeType,
          name: basename(uri.path)
        }
      }
    } catch {
      // Ignore malformed clipboard URIs and keep the default paste behavior.
    }
  }
  return undefined
}

function extensionMimeType(extension: string): string | undefined {
  const values: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp'
  }
  return values[extension.toLowerCase()]
}

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

function configuredFormat(project: HexoProject): ImageLinkFormat {
  if (project.workspaceConfigExists) return project.workspaceConfig.image.linkFormat
  const setting = vscode.workspace
    .getConfiguration('hexoWorkbench')
    .get<ImageLinkFormat>('defaultImageLinkFormat', 'markdown')
  return setting === 'asset_img' ? 'asset_img' : 'markdown'
}

function requestedFormat(context: vscode.DocumentPasteEditContext): ImageLinkFormat | undefined {
  if (!context.only) return undefined
  if (context.only.value.endsWith('.asset-img')) return 'asset_img'
  if (context.only.value.endsWith('.markdown')) return 'markdown'
  return undefined
}

function altText(document: vscode.TextDocument, ranges: readonly vscode.Range[], filename: string): string {
  const selected = ranges.map((range) => document.getText(range).trim()).find(Boolean)
  return selected || basename(filename, extname(filename))
}

function markdownAssetPath(project: HexoProject, documentPath: string, assetPath: string): string {
  return supportsHexoMarkdownAssets(project.siteConfig)
    ? basename(assetPath)
    : relativeReference(documentPath, assetPath)
}

class HexoImagePasteProvider implements vscode.DocumentPasteEditProvider, vscode.DocumentDropEditProvider {
  async provideDocumentPasteEdits(
    document: vscode.TextDocument,
    ranges: readonly vscode.Range[],
    dataTransfer: vscode.DataTransfer,
    context: vscode.DocumentPasteEditContext,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentPasteEdit[]> {
    try {
      return await this.prepareEdits(document, ranges, dataTransfer, context, token)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void vscode.window.showErrorMessage(`Hexo Workbench: ${message}`)
      return []
    }
  }

  async provideDocumentDropEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentDropEdit[]> {
    const edits = await this.provideDocumentPasteEdits(
      document,
      [new vscode.Range(position, position)],
      dataTransfer,
      { only: undefined, triggerKind: vscode.DocumentPasteTriggerKind.Automatic },
      token
    )
    return edits.map((edit) => {
      const dropEdit = new vscode.DocumentDropEdit(edit.insertText, edit.title, edit.kind)
      dropEdit.additionalEdit = edit.additionalEdit
      return dropEdit
    })
  }

  private async prepareEdits(
    document: vscode.TextDocument,
    ranges: readonly vscode.Range[],
    dataTransfer: vscode.DataTransfer,
    context: vscode.DocumentPasteEditContext,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentPasteEdit[]> {
    const project = await projectForDocument(document)
    if (!project || !project.siteConfig.postAssetFolder) return []
    const image = await readImage(dataTransfer)
    if (!image || token.isCancellationRequested) return []

    const assetDirectory = contentAssetPath(project, document.uri.fsPath)
    await ensureDirectory(vscode.Uri.file(assetDirectory))
    const usedNames = new Set<string>()
    let imageName = uniqueImageName(
      basename(document.uri.fsPath, extname(document.uri.fsPath)),
      imageExtension(image.mimeType, image.name),
      (candidate) => usedNames.has(candidate),
      new Date()
    )
    while (await fileExists(vscode.Uri.file(join(assetDirectory, imageName)))) {
      usedNames.add(imageName)
      imageName = uniqueImageName(
        basename(document.uri.fsPath, extname(document.uri.fsPath)),
        imageExtension(image.mimeType, image.name),
        (candidate) => usedNames.has(candidate),
        new Date()
      )
    }
    const assetPath = join(assetDirectory, imageName)
    const alt = altText(document, ranges, imageName)
    const formats: ImageLinkFormat[] = requestedFormat(context)
      ? [requestedFormat(context)!]
      : configuredFormat(project) === 'asset_img'
        ? ['asset_img', 'markdown']
        : ['markdown', 'asset_img']

    return formats.map((format) => {
      const edit = new vscode.DocumentPasteEdit(
        createImageReference(
          format,
          document.uri.fsPath,
          assetPath,
          alt,
          markdownAssetPath(project, document.uri.fsPath, assetPath)
        ),
        format === 'asset_img' ? 'Hexo asset_img' : 'Markdown image',
        format === 'asset_img' ? ASSET_IMG_KIND : MARKDOWN_KIND
      )
      const workspaceEdit = new vscode.WorkspaceEdit()
      workspaceEdit.createFile(vscode.Uri.file(assetPath), {
        contents: image.bytes,
        overwrite: false,
        ignoreIfExists: false
      })
      edit.additionalEdit = workspaceEdit
      return edit
    })
  }
}

export function registerImagePasteProvider(context: vscode.ExtensionContext): void {
  const provider = new HexoImagePasteProvider()
  context.subscriptions.push(
    vscode.languages.registerDocumentPasteEditProvider({ language: 'markdown', scheme: 'file' }, provider, {
      providedPasteEditKinds: [MARKDOWN_KIND, ASSET_IMG_KIND],
      pasteMimeTypes: ['image/*', 'files', 'text/uri-list']
    }),
    vscode.languages.registerDocumentDropEditProvider({ language: 'markdown', scheme: 'file' }, provider, {
      providedDropEditKinds: [MARKDOWN_KIND, ASSET_IMG_KIND],
      dropMimeTypes: ['image/*', 'files', 'text/uri-list']
    })
  )
}
