import * as vscode from "vscode";
import { activate as autoTriggerActivate } from "./autoTrigger";
import { activate as previewStyleActivate } from "./previewStyle";

const plugins = [autoTriggerActivate, previewStyleActivate];

export const loadFunctions = (ctx: vscode.ExtensionContext) => {
  return plugins.reduce((prev: Record<string, any>, cur) => {
    return { ...prev, ...cur(ctx) };
  }, {});
};
