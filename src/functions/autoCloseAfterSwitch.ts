import * as vscode from "vscode";
import { closePreview } from "../helpers";

let autoCloseDebounce: ReturnType<typeof setTimeout> | undefined;
let lastDoc: vscode.TextDocument | undefined;

let _autoCloseDisposable: vscode.Disposable | null = null;

export function activate(context: vscode.ExtensionContext) {
  const d1 = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("markdown-auto-preview")) {
      configEffect();
    }
  });
  configEffect();

  context.subscriptions.push(d1, _autoCloseDisposable!);
  return {};
}

function configEffect() {
  if (vscode.workspace.getConfiguration("markdown-auto-preview").get<boolean>("autoClosePreviewAfterSwitch")) {
    registerAutoCloseAfterSwitch();
  } else {
    _autoCloseDisposable?.dispose?.();
    _autoCloseDisposable = null;
  }
}

function registerAutoCloseAfterSwitch() {
  if (_autoCloseDisposable) {
    return;
  }

  _autoCloseDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => triggerAutoClosePreview(editor));
}
// VS Code dispatches a series of DidChangeActiveTextEditor events when moving tabs between groups, we don't want most of them.
function triggerAutoClosePreview(editor: vscode.TextEditor | undefined): void {
  if (!editor || editor.viewColumn !== 1) {
    return;
  }

  const doc = editor?.document;
  if (editor.document.languageId !== "markdown" && lastDoc?.languageId === "markdown") {
    if (autoCloseDebounce) {
      clearTimeout(autoCloseDebounce);
      autoCloseDebounce = undefined;
    }

    if (lastDoc && doc !== lastDoc) {
      const filename = lastDoc.fileName;
      autoCloseDebounce = setTimeout(() => closePreview(filename), 100);
    }
  }
  if (doc !== lastDoc) {
    lastDoc = doc;
  }
}
