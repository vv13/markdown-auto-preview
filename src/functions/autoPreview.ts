import * as vscode from "vscode";

let autoPreviewDebounce: ReturnType<typeof setTimeout> | undefined;
let lastDoc: vscode.TextDocument | undefined;

let _autoPreviewDisposable: vscode.Disposable | null = null;

export function activate(context: vscode.ExtensionContext) {
  // Register auto preview. And try showing preview on activation.
  const d1 = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("markdown-auto-preview")) {
      configEffect();
    }
  });
  configEffect();

  // Keep code tidy.
  context.subscriptions.push(d1, _autoPreviewDisposable!);
  return {};
}
function configEffect() {
  if (vscode.workspace.getConfiguration("markdown-auto-preview").get<boolean>("autoShowPreviewToSide")) {
    registerAutoPreview();
    triggerAutoPreview(vscode.window.activeTextEditor);
  } else {
    _autoPreviewDisposable?.dispose?.();
    _autoPreviewDisposable = null;
  }
}

function registerAutoPreview() {
  if (_autoPreviewDisposable) {
    return;
  }
  _autoPreviewDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => triggerAutoPreview(editor));
}

// VS Code dispatches a series of DidChangeActiveTextEditor events when moving tabs between groups, we don't want most of them.
function triggerAutoPreview(editor: vscode.TextEditor | undefined): void {
  if (!editor || editor.viewColumn !== 1) {
    return;
  }
  if (editor.document.languageId !== "markdown") {
    lastDoc = undefined;
    return;
  }

  if (autoPreviewDebounce) {
    clearTimeout(autoPreviewDebounce);
    autoPreviewDebounce = undefined;
  }

  const doc = editor.document;
  if (doc !== lastDoc) {
    lastDoc = doc;
    autoPreviewDebounce = setTimeout(() => autoPreviewToSide(editor), 100);
  }
}

/**
 * Shows preview for the editor.
 */
async function autoPreviewToSide(editor: vscode.TextEditor) {
  if (editor.document.isClosed) {
    return;
  }

  // Call `vscode.markdown-language-features`.
  await vscode.commands.executeCommand("markdown.showPreviewToSide");
  await vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");

  // Wait, as VS Code won't respond when it just opened a preview.
  await new Promise((resolve) => setTimeout(() => resolve(undefined), 100));

  // VS Code 1.62 appears to make progress in https://github.com/microsoft/vscode/issues/9526
  // Thus, we must request the text editor directly with known view column (if available).
  await vscode.window.showTextDocument(editor.document, editor.viewColumn);
}
