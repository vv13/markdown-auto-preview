# markdown-auto-preview README

[![version](https://img.shields.io/visual-studio-marketplace/v/vv13.markdown-auto-preview?label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=vv13.markdown-auto-preview)
![demo](./markdown-auto-preview.gif)

The smarter markdown preview extensions.

## Features

### Auto Open&Close Preview

Automatically open or close preview window, and focus cursor to editor.

### Markdown Preview Theme

Providing various github theme styles in preview.

### Snippets

Current support snippet prefix:

- Title: `/h1`, `/h2`, `/h3`, `/h4`, `/h5`
- Code: `/code`
- Table: `/table`
- Divider: `/divide`
- Image: `/image`
- Link: `/url`

## Settings

This extension provides the following settings:

- `markdown-auto-preview.autoClosePreviewAfterSwitch`: Auto close preview window when switch to another tab.
- `markdown-auto-preview.autoShowPreviewToSide`: Auto show preview to side.
- `markdown-auto-preview.autoClosePreviewWindow`: Auto close preview window when close source markdown file.
- `markdown-auto-preview.colorTheme`: Color theme mode for the styling of the Markdown preview.
- `markdown-auto-preview.lightTheme`: Theme to use when displaying in Light mode. Ignored if **markdown-auto-preview.colorTheme** is set to `Dark`.
- `markdown-auto-preview.darkTheme`: Theme to use when displaying in Dark mode. Ignored if **markdown-auto-preview.colorTheme** is set to `Light`..

## Release Notes
### 0.3.4
- Add auto-close-preview feature when switch tabs.

### 0.3.3
- Fix reopen window problem in issue#1.

### 0.3.0

- Add some markdown snippets.
- Improve documentation.

### 0.2.0

Add Github styles theme in preview.

### 0.1.1

Fix DiffView trigger auto preview case layout problem.

### 0.1.0

Initial release of Auto Preview Markdown.
