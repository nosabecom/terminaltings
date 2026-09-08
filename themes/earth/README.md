# Terminal Things — Earth

True AMOLED black with earthy green **accents**. The editor, Explorer, activity bar, terminal, title bar, status bar, and Modern UI container surfaces are all `#000000`. Inputs and hover states use neutral near-black so controls remain visible. Syntax keeps the reference's soft multicolor feel.

![Three accent palettes on black](preview/palette-board.png)

| Theme | Accent | Character |
| --- | --- | --- |
| Terminal Things Forest | `#628F69` | Deep, subdued forest green; starting choice |
| Terminal Things Moss | `#95A96B` | Warmer, earthy olive green |
| Terminal Things Sage | `#C2D5B0` | Lighter, softer sage green |

All three use the same black backgrounds and syntax colors. Green changes active indicators, focused controls, cursor, buttons, and selections. The previews above are illustrations generated from the actual palette, not VS Code screenshots.

## Install

Download [`terminal-things-earth-0.1.0.vsix`](https://github.com/nosabecom/terminaltings/releases/download/earth-v0.1.0/terminal-things-earth-0.1.0.vsix) from the repository's **Earth v0.1.0** release, then run:

```powershell
code --install-extension .\terminal-things-earth-0.1.0.vsix
```

Open **Preferences: Color Theme** (`Ctrl+K Ctrl+T`) and choose **Terminal Things Forest**, **Terminal Things Moss**, or **Terminal Things Sage**. You can also use **Extensions: Install from VSIX…**.

## New VS Code UI

The theme includes the registered `surface.*`, `editor.border`, `modernTab.*`, `modernEditorTab.*`, and `modernActivityBar*` colors for modern floating panels, tabs, activity items, and window gutters. Classic UI colors are included too. No injected CSS or workbench patches are required.

Packaged and installation-checked with VS Code 1.135.0. Both that version's `modernActivityBar.active*` names and newer `modernActivityBarItem.active*` names are supplied. Main backgrounds, syntax contrast, and palette completeness pass automated checks; live UI screenshot verification was unavailable in the build session.

To enable the new layout in VS Code versions that expose it, add:

```json
{
  "workbench.colorTheme": "Terminal Things Forest",
  "workbench.experimental.modernUI": true,
  "editor.minimap.enabled": false
}
```

Layout is controlled by VS Code. A theme changes colors, not panel placement, fonts, file icons, or the desktop wallpaper. Third-party chat webviews must consume VS Code theme variables to follow these colors. Existing user `workbench.colorCustomizations` can override the theme.

References: [Microsoft's Modern UI theming documentation](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/modernUI/README.md), [layout settings](https://code.visualstudio.com/docs/configure/custom-layout), and [color theme API](https://code.visualstudio.com/api/extension-guides/color-theme).

## Develop

Requires Node.js 22 or newer. Open this folder directly in VS Code and press F5 to inspect the theme in an Extension Development Host.

```powershell
npm ci
npm run package
```

Edit `palettes.json` for colors or `scripts/build.mjs` for UI mappings. Build generates the theme JSON, preview images, and reusable JSON/CSS tokens. Checks verify true-black main surfaces, accent mapping, terminal palette completeness, and at least 4.5:1 contrast for syntax, ordinary text, and button labels on their tested backgrounds.

The `exports/` folder holds app-neutral tokens for the planned T3 adaptation. T3 integration is a separate step; these files do not install a T3 theme.
