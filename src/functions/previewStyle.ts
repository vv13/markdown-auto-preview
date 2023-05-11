import * as vscode from "vscode";

const themeConfigKey = "colorTheme";
const lightThemeKey = "lightTheme";
const defaultLightTheme = "light";
const darkThemeKey = "darkTheme";
const defaultDarkTheme = "dark";

const themeConfigValues = {
  auto: true,
  system: true,
  light: true,
  dark: true,
};
const defaultThemeConfiguration = "auto";
const validThemes = [
  "light",
  "light_high_contrast",
  "light_colorblind",
  "light_tritanopia",
  "dark",
  "dark_high_contrast",
  "dark_colorblind",
  "dark_tritanopia",
  "dark_dimmed",
];

export const activate = (ctx: vscode.ExtensionContext) => {
  ctx.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("markdown-auto-preview")) {
        vscode.commands.executeCommand("markdown.preview.refresh");
      }
    })
  );

  return {
    extendMarkdownIt(md: any) {
      return md.use(plugin);
    },
  };
};

function getThemeMode() {
  const settings = vscode.workspace.getConfiguration("markdown-auto-preview", null);
  return validThemeModeValue(settings.get<string>(themeConfigKey));
}

function validThemeModeValue(theme?: string) {
  if (!theme || !themeConfigValues[theme as keyof typeof themeConfigValues]) {
    return defaultThemeConfiguration;
  }
  return theme;
}

function getLightTheme() {
  const settings = vscode.workspace.getConfiguration("markdown-auto-preview", null);
  const lightTheme = settings.get<string>(lightThemeKey) || "";
  return validThemes.includes(lightTheme || "") ? lightTheme : defaultLightTheme;
}

function getDarkTheme() {
  const settings = vscode.workspace.getConfiguration("markdown-auto-preview", null);
  const darkTheme = settings.get<string>(darkThemeKey) || "";
  return validThemes.includes(darkTheme) ? darkTheme : defaultDarkTheme;
}
function plugin(md: any) {
  const render = md.renderer.render;
  md.renderer.render = function () {
    return `<div
            class="github-markdown-body"
            data-color-mode="${getThemeMode()}"
            data-light-theme="${getLightTheme()}"
            data-dark-theme="${getDarkTheme()}"
        >
            <div class="github-markdown-content">${render.apply(md.renderer, arguments)}</div>
        </div>`;
  };
  return md;
}
