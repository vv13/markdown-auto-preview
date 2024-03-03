import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const d2 = vscode.commands.registerCommand("markdown-auto-preview.closePreview", () => {
    return vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
  context.subscriptions.push(d2);
  return {};
}
