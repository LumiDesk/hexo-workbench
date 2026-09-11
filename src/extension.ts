import * as vscode from 'vscode'
import { createContent, initializeWorkspace, pasteImage } from './commands/content'
import { registerImagePasteProvider } from './assets/paste-provider'

export function activate(context: vscode.ExtensionContext): void {
  const run = (operation: () => Promise<void>) => async (): Promise<void> => {
    try {
      await operation()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void vscode.window.showErrorMessage(`Hexo Workbench: ${message}`)
    }
  }
  const disposable = vscode.commands.registerCommand('hexoWorkbench.helloWorld', () => {
    void vscode.window.showInformationMessage('Hexo Workbench is ready.')
  })

  context.subscriptions.push(
    disposable,
    vscode.commands.registerCommand('hexoWorkbench.initializeWorkspace', run(initializeWorkspace)),
    vscode.commands.registerCommand(
      'hexoWorkbench.newPost',
      run(() => createContent('post'))
    ),
    vscode.commands.registerCommand(
      'hexoWorkbench.newDraft',
      run(() => createContent('draft'))
    ),
    vscode.commands.registerCommand('hexoWorkbench.pasteImage', run(pasteImage))
  )
  registerImagePasteProvider(context)
}

export function deactivate(): void {
  // Reserved for future cleanup when the extension gains long-lived resources.
}
