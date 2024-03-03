import * as vscode from "vscode";
import * as path from "path";
import { closePreview } from "../helpers";

let _autoCloseDisposable: vscode.Disposable | null = null;

export function activate(context: vscode.ExtensionContext) {
  const d1 = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("markdown-auto-preview")) {
      configEffect();
    }
  });
  configEffect();

  // Auto-close Preview
  const autoClosePreview = vscode.workspace
    .getConfiguration("markdown-auto-preview")
    .get<boolean>("autoClosePreviewWindow");
  if (autoClosePreview) {
    registerAutoClose();
  }

  context.subscriptions.push(d1, _autoCloseDisposable!);
  return {};
}

function configEffect() {
  if (vscode.workspace.getConfiguration("markdown-auto-preview").get<boolean>("autoClosePreviewWindow")) {
    registerAutoClose();
  } else {
    _autoCloseDisposable?.dispose?.();
    _autoCloseDisposable = null;
  }
}

function registerAutoClose() {
  if (_autoCloseDisposable) {
    return;
  }

  _autoCloseDisposable = vscode.workspace.onDidCloseTextDocument((document: vscode.TextDocument) => {
    closePreview(document?.fileName);
  });
}
