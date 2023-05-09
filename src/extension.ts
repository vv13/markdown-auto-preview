import * as vscode from "vscode";
import * as path from "path";

let debounceHandle: ReturnType<typeof setTimeout> | undefined;
let lastDoc: vscode.TextDocument | undefined;

const autoPreviewDisposable = Object.freeze<
  vscode.Disposable & { _disposables: vscode.Disposable[]; add: (param: vscode.Disposable) => void }
>({
  _disposables: [],
  add: function (item: vscode.Disposable) {
    this._disposables.push(item);
  },
  dispose: function () {
    for (const item of this._disposables) {
      item.dispose();
    }
    this._disposables.length = 0;

    if (debounceHandle) {
      clearTimeout(debounceHandle);
      debounceHandle = undefined;
    }

    lastDoc = undefined;
  },
});

const autoCloseDisposable = Object.freeze<
  vscode.Disposable & { _disposables: vscode.Disposable[]; add: (param: vscode.Disposable) => void }
>({
  _disposables: [],
  add: function (item: vscode.Disposable) {
    this._disposables.push(item);
  },
  dispose: function () {
    for (const item of this._disposables) {
      item.dispose();
    }
    this._disposables.length = 0;
  },
});

export function activate(context: vscode.ExtensionContext) {
  // Register auto preview. And try showing preview on activation.
  const d1 = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("markdown-auto-preview")) {
      if (vscode.workspace.getConfiguration("markdown-auto-preview").get<boolean>("autoShowPreviewToSide")) {
        registerAutoPreview();
      } else {
        autoPreviewDisposable.dispose();
      }
      if (vscode.workspace.getConfiguration("markdown-auto-preview").get<boolean>("autoClosePreviewWindow")) {
        registerAutoClose();
      } else {
        autoCloseDisposable.dispose();
      }
    }
  });

  if (vscode.workspace.getConfiguration("markdown-auto-preview").get<boolean>("autoShowPreviewToSide")) {
    registerAutoPreview();
    triggerAutoPreview(vscode.window.activeTextEditor);
  }

  const d2 = vscode.commands.registerCommand("markdown-auto-preview.closePreview", () => {
    return vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  // Auto-close Preview
  const autoClosePreview = vscode.workspace
    .getConfiguration("markdown-auto-preview")
    .get<boolean>("autoClosePreviewWindow");
  if (autoClosePreview) {
    registerAutoClose();
  }
  // Keep code tidy.
  context.subscriptions.push(d1, d2, autoPreviewDisposable, autoCloseDisposable);
}

function registerAutoPreview() {
  if (autoPreviewDisposable._disposables.length) {
    return;
  }
  autoPreviewDisposable._disposables.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => triggerAutoPreview(editor))
  );
}

function registerAutoClose() {
  if (autoCloseDisposable._disposables.length) {
    return;
  }
  autoCloseDisposable._disposables.push(
    vscode.workspace.onDidCloseTextDocument((document: vscode.TextDocument) => {
      const filename = document.fileName.split(path.sep).pop();
      if (!filename || !filename?.endsWith(".md")) {
        return;
      }

      vscode.window.tabGroups.all.forEach((item) => {
        const searchReg = new RegExp(`\\[?Preview\\]?\\s${filename.slice(0, filename.length - 3)}\\.md`);
        const target = item.tabs.find((tab) => searchReg.test(tab.label));
        if (target) {
          vscode.window.tabGroups.close(target);
        }
      });
    })
  );
}

// VS Code dispatches a series of DidChangeActiveTextEditor events when moving tabs between groups, we don't want most of them.
function triggerAutoPreview(editor: vscode.TextEditor | undefined): void {
  // Diff View: viewColumn = undefined
  if (!editor || editor.document.languageId !== "markdown" || editor.viewColumn !== 1) {
    return;
  }

  if (debounceHandle) {
    clearTimeout(debounceHandle);
    debounceHandle = undefined;
  }

  // Usually, a user only wants to trigger preview when the currently and last viewed documents are not the same.
  const doc = editor.document;
  if (doc !== lastDoc) {
    lastDoc = doc;
    debounceHandle = setTimeout(() => autoPreviewToSide(editor), 100);
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
