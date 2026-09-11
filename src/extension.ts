import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand('hexoWorkbench.helloWorld', () => {
    void vscode.window.showInformationMessage('Hexo Workbench is ready.')
  })

  context.subscriptions.push(disposable)
}

export function deactivate(): void {
  // Reserved for future cleanup when the extension gains long-lived resources.
}
