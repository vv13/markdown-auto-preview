import * as vscode from "vscode";
import { loadFunctions } from "./functions";

export function activate(context: vscode.ExtensionContext) {
  return loadFunctions(context);
}
