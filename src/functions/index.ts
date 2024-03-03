import * as vscode from "vscode";
import { activate as autoTriggerActivate } from "./autoPreview";
import { activate as previewStyleActivate } from "./previewStyle";
import { activate as autoCloseActivate } from "./autoClose";
import { activate as commandsActivate } from "./commands";
import { activate as autoCloseAfterSwitchActivate } from "./autoCloseAfterSwitch";

const plugins = [
  autoTriggerActivate,
  previewStyleActivate,
  autoCloseActivate,
  commandsActivate,
  autoCloseAfterSwitchActivate,
];

export const loadFunctions = (ctx: vscode.ExtensionContext) => {
  return plugins.reduce((prev: Record<string, any>, cur) => {
    return { ...prev, ...cur(ctx) };
  }, {});
};
