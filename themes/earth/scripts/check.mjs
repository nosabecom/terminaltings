import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const manifest = await read('package.json');
const palettes = await read('palettes.json');
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(n => parseInt(n, 16) / 255).map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((a,b) => b-a);
  return (values[0]+0.05)/(values[1]+0.05);
}
for (const [i, contribution] of manifest.contributes.themes.entries()) {
  const theme = await read(contribution.path);
  const p = palettes[i];
  assert.equal(theme.name, contribution.label);
  assert.equal(contribution.uiTheme, 'vs-dark');
  assert.equal(theme.type, 'dark');
  assert.equal(theme.semanticHighlighting, true);
  for (const [key,value] of Object.entries(theme.colors)) assert.match(value, /^#[\da-f]{6}([\da-f]{2})?$/i, key);
  for (const key of ['editor.background','sideBar.background','activityBar.background','panel.background','terminal.background','titleBar.activeBackground','titleBar.inactiveBackground','statusBar.background','surface.background','modernActivityBar.background']) {
    assert.equal(theme.colors[key], '#000000', `${theme.name}: ${key} must be true black`);
  }
  for (const key of ['tab.activeBorderTop','panelTitle.activeBorder','focusBorder','editorCursor.foreground','modernEditorTab.activeForeground','modernActivityBar.activeForeground','modernActivityBarItem.activeForeground']) assert.equal(theme.colors[key], p.accent, key);
  assert.equal(Object.keys(theme.colors).filter(k => k.startsWith('terminal.ansi')).length, 16);
  for (const rule of theme.tokenColors) assert.ok(contrast(rule.settings.foreground, p.bg) >= 4.5, `${rule.name} contrast`);
  for (const fg of [p.fg,p.muted,p.comment]) assert.ok(contrast(fg, p.raised) >= 4.5, `${theme.name}: text contrast`);
  assert.ok(contrast(p.accent, p.raised) >= 4.5, `${theme.name}: accent text contrast`);
  assert.ok(contrast(p.onAccent, p.accent) >= 4.5, `${theme.name}: button contrast`);
  console.log(`${theme.name}: ${Object.keys(theme.colors).length} UI colors; AMOLED, ANSI, syntax and text contrast checks passed.`);
}
