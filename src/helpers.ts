import * as vscode from "vscode";
import * as path from "path";

export function closePreview(filePath?: string) {
  if (!filePath || !filePath?.endsWith(".md")) {
    return;
  }
  const filename = filePath.split(path.sep).pop() || '';
  vscode.window.tabGroups.all.forEach((item) => {
    const searchReg = new RegExp(`\\[?Preview\\]?\\s${filename.slice(0, filename.length - 3)}\\.md`);
    const target = item.tabs.find((tab) => searchReg.test(tab.label));
    if (target) {
      vscode.window.tabGroups.close(target);
    }
  });
}
