import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const palettes = JSON.parse(await readFile(resolve(root, 'palettes.json'), 'utf8'));
for (const dir of ['themes', 'exports', 'preview', 'dist']) await mkdir(resolve(root, dir), { recursive: true });
const save = (path, value) => writeFile(resolve(root, path), typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');

for (const p of palettes) {
  const c = {
    focusBorder: p.accent, foreground: p.fg, descriptionForeground: p.muted,
    disabledForeground: p.comment, errorForeground: p.red,
    'widget.border': p.border, 'widget.shadow': '#00000030', 'selection.background': p.selection,
    'surface.background': p.bg, 'surface.foreground': p.fg, 'surface.border': p.border,
    'editor.border': p.border,
    'modernTab.activeBackground': p.raised, 'modernTab.activeForeground': p.accent,
    'modernTab.hoverBackground': p.hover, 'modernTab.hoverForeground': p.fg,
    'modernEditorTab.activeBackground': p.raised, 'modernEditorTab.activeActionBackground': p.raised,
    'modernEditorTab.activeForeground': p.accent, 'modernEditorTab.activeHoverBackground': p.hover,
    'modernEditorTab.activeHoverActionBackground': p.hover, 'modernEditorTab.inactiveBackground': p.bg,
    'modernEditorTab.hoverBackground': p.hover, 'modernEditorTab.hoverActionBackground': p.hover,
    'modernEditorTab.hoverForeground': p.fg, 'modernEditorTab.selectedActionBackground': p.raised,
    'modernActivityBar.background': p.bg, 'modernActivityBar.inactiveBackground': p.bg,
    // VS Code 1.135 uses these IDs; newer builds use modernActivityBarItem.*.
    'modernActivityBar.activeBackground': p.raised, 'modernActivityBar.activeForeground': p.accent,
    'modernActivityBar.hoverBackground': p.hover, 'modernActivityBar.hoverForeground': p.fg,
    'modernActivityBarItem.activeBackground': p.raised, 'modernActivityBarItem.activeForeground': p.accent,
    'modernActivityBarItem.hoverBackground': p.hover, 'modernActivityBarItem.hoverForeground': p.fg,
    'icon.foreground': p.muted, 'textLink.foreground': p.accent, 'textLink.activeForeground': p.green,
    'textBlockQuote.background': p.raised, 'textBlockQuote.border': p.accent,
    'textCodeBlock.background': p.raised, 'textPreformat.foreground': p.green,
    'textPreformat.background': p.raised, 'textSeparator.foreground': p.border,
    'activityBar.background': p.panel, 'activityBar.foreground': p.accent,
    'activityBar.inactiveForeground': p.comment, 'activityBar.border': p.border,
    'activityBar.activeBorder': p.accent, 'activityBarBadge.background': p.accent,
    'activityBarTop.background': p.bg, 'activityBarTop.foreground': p.accent,
    'activityBarTop.inactiveForeground': p.comment, 'activityBarTop.activeBorder': p.accent,
    'activityBarBadge.foreground': p.onAccent,
    'sideBar.background': p.panel, 'sideBar.foreground': p.muted, 'sideBar.border': p.border,
    'sideBarTitle.foreground': p.fg, 'sideBarSectionHeader.background': p.panel,
    'sideBarSectionHeader.foreground': p.fg, 'sideBarSectionHeader.border': p.border,
    'titleBar.activeBackground': p.panel, 'titleBar.activeForeground': p.muted,
    'titleBar.inactiveBackground': p.panel, 'titleBar.inactiveForeground': p.comment,
    'titleBar.border': p.border, 'commandCenter.background': p.raised,
    'commandCenter.foreground': p.muted, 'commandCenter.border': p.border,
    'editor.background': p.bg, 'editor.foreground': p.fg,
    'editorLineNumber.foreground': p.comment, 'editorLineNumber.activeForeground': p.accent,
    'editorCursor.foreground': p.accent, 'editorCursor.background': p.bg,
    'editor.selectionBackground': p.selection, 'editor.selectionForeground': p.fg,
    'editor.inactiveSelectionBackground': p.selection + '80',
    'editor.selectionHighlightBackground': p.accent + '20', 'editor.selectionHighlightBorder': p.accent + '60',
    'editor.wordHighlightBackground': p.accent + '18', 'editor.wordHighlightStrongBackground': p.accent + '28',
    'editor.findMatchBackground': p.selection, 'editor.findMatchBorder': p.accent,
    'editor.findMatchHighlightBackground': p.yellow + '30',
    'editor.lineHighlightBackground': p.raised, 'editor.lineHighlightBorder': '#00000000',
    'editorWhitespace.foreground': p.border, 'editorIndentGuide.background1': p.border,
    'editorIndentGuide.activeBackground1': p.comment, 'editorRuler.foreground': p.border,
    'editorBracketMatch.background': p.selection, 'editorBracketMatch.border': p.accent,
    'editorBracketHighlight.foreground1': p.yellow, 'editorBracketHighlight.foreground2': p.purple,
    'editorBracketHighlight.foreground3': p.cyan, 'editorBracketHighlight.foreground4': p.orange,
    'editorBracketHighlight.foreground5': p.green, 'editorBracketHighlight.foreground6': p.blue,
    'editorBracketHighlight.unexpectedBracket.foreground': p.red,
    'editorGutter.background': p.bg, 'editorGutter.addedBackground': p.green,
    'editorGutter.modifiedBackground': p.blue, 'editorGutter.deletedBackground': p.red,
    'editorError.foreground': p.red, 'editorWarning.foreground': p.yellow, 'editorInfo.foreground': p.blue,
    'editorHint.foreground': p.cyan, 'editorCodeLens.foreground': p.comment,
    'editorInlayHint.background': p.raised, 'editorInlayHint.foreground': p.muted,
    'editorGroup.border': p.border, 'editorGroupHeader.tabsBackground': p.panel,
    'editorGroupHeader.tabsBorder': p.border, 'editorGroupHeader.noTabsBackground': p.bg,
    'tab.activeBackground': p.bg, 'tab.activeForeground': p.fg, 'tab.activeBorderTop': p.accent,
    'tab.activeBorder': p.bg, 'tab.inactiveBackground': p.panel, 'tab.inactiveForeground': p.muted,
    'tab.unfocusedActiveForeground': p.muted, 'tab.border': p.border, 'tab.hoverBackground': p.raised,
    'breadcrumbs.background': p.bg, 'breadcrumbs.foreground': p.muted,
    'breadcrumbs.focusForeground': p.fg, 'breadcrumbs.activeSelectionForeground': p.accent,
    'panel.background': p.bg, 'panel.border': p.border, 'panelTitle.activeForeground': p.fg,
    'panelTitle.inactiveForeground': p.muted, 'panelTitle.activeBorder': p.accent,
    'statusBar.background': p.panel, 'statusBar.foreground': p.muted, 'statusBar.border': p.border,
    'statusBar.noFolderBackground': p.panel, 'statusBar.noFolderForeground': p.muted,
    'statusBar.debuggingBackground': p.selection, 'statusBar.debuggingForeground': p.fg,
    'statusBarItem.hoverBackground': p.hover, 'statusBarItem.remoteBackground': p.selection,
    'statusBarItem.remoteForeground': p.fg, 'statusBarItem.errorBackground': p.red,
    'statusBarItem.errorForeground': p.onAccent, 'statusBarItem.warningBackground': p.yellow,
    'statusBarItem.warningForeground': p.onAccent,
    'button.background': p.accent, 'button.foreground': p.onAccent, 'button.hoverBackground': p.green,
    'button.secondaryBackground': p.selection, 'button.secondaryForeground': p.fg,
    'button.secondaryHoverBackground': p.hover, 'badge.background': p.selection, 'badge.foreground': p.fg,
    'input.background': p.raised, 'input.foreground': p.fg, 'input.border': p.border,
    'input.placeholderForeground': p.muted, 'inputOption.activeBackground': p.selection,
    'inputOption.activeBorder': p.accent, 'inputOption.activeForeground': p.fg,
    'inputValidation.errorBorder': p.red, 'inputValidation.warningBorder': p.yellow,
    'inputValidation.infoBorder': p.blue, 'inputValidation.errorBackground': p.raised,
    'inputValidation.warningBackground': p.raised, 'inputValidation.infoBackground': p.raised,
    'dropdown.background': p.raised, 'dropdown.foreground': p.fg, 'dropdown.border': p.border,
    'list.activeSelectionBackground': p.selection, 'list.activeSelectionForeground': p.fg,
    'list.inactiveSelectionBackground': p.raised, 'list.inactiveSelectionForeground': p.fg,
    'list.hoverBackground': p.hover, 'list.hoverForeground': p.fg, 'list.focusBackground': p.selection,
    'list.focusForeground': p.fg, 'list.focusOutline': p.accent, 'list.highlightForeground': p.accent,
    'list.errorForeground': p.red, 'list.warningForeground': p.yellow,
    'tree.indentGuidesStroke': p.border, 'quickInput.background': p.raised,
    'quickInput.foreground': p.fg, 'quickInputList.focusBackground': p.selection,
    'quickInputList.focusForeground': p.fg, 'pickerGroup.foreground': p.accent,
    'pickerGroup.border': p.border, 'menu.background': p.raised, 'menu.foreground': p.fg,
    'menu.selectionBackground': p.selection, 'menu.selectionForeground': p.fg, 'menu.border': p.border,
    'menu.separatorBackground': p.border,
    'editorWidget.background': p.raised, 'editorWidget.foreground': p.fg, 'editorWidget.border': p.border,
    'editorSuggestWidget.background': p.raised, 'editorSuggestWidget.foreground': p.fg,
    'editorSuggestWidget.border': p.border, 'editorSuggestWidget.selectedBackground': p.selection,
    'editorSuggestWidget.highlightForeground': p.accent,
    'editorHoverWidget.background': p.raised, 'editorHoverWidget.foreground': p.fg,
    'editorHoverWidget.border': p.border, 'editorHoverWidget.statusBarBackground': p.panel,
    'peekView.border': p.accent, 'peekViewEditor.background': p.bg,
    'peekViewResult.background': p.panel, 'peekViewTitle.background': p.raised,
    'peekViewTitleLabel.foreground': p.fg, 'peekViewResult.fileForeground': p.fg,
    'peekViewResult.lineForeground': p.muted, 'peekViewResult.selectionBackground': p.selection,
    'peekViewResult.selectionForeground': p.fg,
    'notifications.background': p.raised, 'notifications.foreground': p.fg,
    'notifications.border': p.border, 'notificationCenterHeader.background': p.panel,
    'notificationCenterHeader.foreground': p.fg, 'progressBar.background': p.accent,
    'scrollbarSlider.background': p.accent + '28', 'scrollbarSlider.hoverBackground': p.accent + '45',
    'scrollbarSlider.activeBackground': p.accent + '60', 'scrollbar.shadow': '#00000000',
    'minimap.selectionHighlight': p.selection, 'minimap.findMatchHighlight': p.yellow,
    'diffEditor.insertedTextBackground': p.green + '20', 'diffEditor.removedTextBackground': p.red + '20',
    'diffEditor.insertedLineBackground': p.green + '12', 'diffEditor.removedLineBackground': p.red + '12',
    'gitDecoration.addedResourceForeground': p.green, 'gitDecoration.modifiedResourceForeground': p.yellow,
    'gitDecoration.deletedResourceForeground': p.red, 'gitDecoration.untrackedResourceForeground': p.cyan,
    'gitDecoration.ignoredResourceForeground': p.comment, 'gitDecoration.conflictingResourceForeground': p.orange,
    'terminal.background': p.bg, 'terminal.foreground': p.fg,
    'terminalCursor.foreground': p.accent, 'terminalCursor.background': p.bg,
    'terminal.selectionBackground': p.selection, 'terminal.selectionForeground': p.fg,
    'terminal.border': p.border, 'terminal.findMatchBackground': p.selection,
    'terminal.findMatchBorder': p.accent,
    'chat.requestBackground': p.raised, 'chat.requestBorder': p.border,
    'chat.slashCommandBackground': p.selection, 'chat.slashCommandForeground': p.accent,
    'chat.avatarBackground': p.selection, 'chat.avatarForeground': p.accent,
    'chat.editedFileForeground': p.yellow,
    'settings.headerForeground': p.fg, 'settings.modifiedItemIndicator': p.accent,
    'welcomePage.background': p.bg, 'welcomePage.tileBackground': p.raised,
    'welcomePage.tileHoverBackground': p.hover
  };
  const ansi = { Black: p.type === 'light' ? '#29382B' : '#202A23', Red: p.red, Green: p.green, Yellow: p.yellow,
    Blue: p.blue, Magenta: p.purple, Cyan: p.cyan, White: p.type === 'light' ? '#53644D' : '#D6DECF',
    BrightBlack: p.comment, BrightRed: p.red, BrightGreen: p.green, BrightYellow: p.yellow,
    BrightBlue: p.blue, BrightMagenta: p.purple, BrightCyan: p.cyan, BrightWhite: p.fg };
  for (const [key, value] of Object.entries(ansi)) c['terminal.ansi' + key] = value;
  const rule = (name, scope, foreground, fontStyle = '') => ({ name, scope, settings: { foreground, fontStyle } });
  const theme = {
    $schema: 'vscode://schemas/color-theme', name: 'Terminal Things ' + p.name, type: p.type,
    semanticHighlighting: true, colors: c,
    tokenColors: [
      rule('Comments', ['comment', 'punctuation.definition.comment'], p.comment, 'italic'),
      rule('Strings', ['string', 'markup.inline.raw'], p.green),
      rule('Numbers and constants', ['constant.numeric', 'constant.language', 'constant.character', 'variable.other.constant'], p.orange),
      rule('Keywords', ['keyword', 'storage.type', 'storage.modifier'], p.purple),
      rule('Operators', ['keyword.operator'], p.cyan),
      rule('Functions', ['entity.name.function', 'support.function'], p.blue),
      rule('Types', ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'], p.yellow),
      rule('Variables', ['variable', 'meta.definition.variable'], p.fg),
      rule('Parameters', ['variable.parameter'], p.fg, 'italic'),
      rule('Self', ['variable.language'], p.cyan),
      rule('Properties', ['variable.other.property', 'support.variable.property', 'entity.other.attribute-name'], p.cyan),
      rule('Tags', ['entity.name.tag'], p.purple),
      rule('Punctuation', ['punctuation', 'meta.brace'], p.muted),
      rule('Interpolation', ['punctuation.definition.template-expression', 'punctuation.section.embedded'], p.orange),
      rule('JSON keys', ['support.type.property-name.json'], p.cyan),
      rule('Headings', ['markup.heading', 'entity.name.section'], p.accent, 'bold'),
      rule('Bold', ['markup.bold'], p.fg, 'bold'), rule('Italic', ['markup.italic'], p.fg, 'italic'),
      rule('Links', ['markup.underline.link', 'string.other.link'], p.blue, 'underline'),
      rule('Inserted', ['markup.inserted'], p.green), rule('Deleted', ['markup.deleted'], p.red),
      rule('Changed', ['markup.changed'], p.yellow), rule('Invalid', ['invalid'], p.red)
    ],
    semanticTokenColors: { comment: { foreground: p.comment, italic: true }, string: p.green,
      number: p.orange, keyword: p.purple, operator: p.cyan, function: p.blue, method: p.blue,
      class: p.yellow, interface: p.yellow, type: p.yellow, typeParameter: p.yellow,
      enum: p.yellow, enumMember: p.orange, namespace: p.yellow, variable: p.fg,
      parameter: { foreground: p.fg, italic: true }, property: p.cyan, 'variable.readonly': p.orange }
  };
  await save('themes/' + p.id + '-color-theme.json', theme);
}

// App-neutral tokens for a later T3 adaptation; this does not modify T3.
await save('exports/earth.tokens.json', Object.fromEntries(palettes.map(p => [p.id, p])));
await save('exports/earth.css', '/* Shared palette; map these variables to the target app when integrating. */\n' + palettes.map(p =>
  `[data-earth-theme="${p.id}"] {\n  color-scheme: ${p.type};\n` + Object.entries(p).filter(([, v]) => v.startsWith('#')).map(([k, v]) => `  --earth-${k}: ${v};`).join('\n') + '\n}'
).join('\n\n') + '\n');

const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function preview(p, x = 0, y = 0, scale = 1) {
  const r = (x,y,w,h,fill,rx=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
  const t = (x,y,text,fill=p.fg,size=14,font='Segoe UI',extra='') => `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="${font}" ${extra}>${esc(text)}</text>`;
  let s = `<g transform="translate(${x} ${y}) scale(${scale})">`;
  s += r(0,0,1360,790,p.bg,12) + r(0,0,1360,38,p.panel,12) + r(0,27,1360,11,p.panel);
  s += t(20,25,'TERMINAL THINGS',p.accent,12,'Segoe UI','letter-spacing="2"') + r(460,7,440,25,p.raised,5) + t(580,24,`earth / ${p.name.toLowerCase()}`,p.muted,12);
  s += r(0,38,45,730,p.panel) + r(45,38,207,730,p.panel) + r(44,38,1,730,p.border) + r(252,38,1,730,p.border);
  ['▣','⌕','⑂','▦'].forEach((a,i) => { s += t(13,75+i*48,a,i===0?p.accent:p.comment,22); });
  s += r(0,49,2,34,p.accent) + t(65,65,'EXPLORER',p.fg,11) + t(66,102,'⌄  TERMINAL THINGS',p.muted,12);
  ['⌄  themes','    ⌄  earth','        demo','        exports','        preview','        themes'].forEach((a,i) => { s += t(67,132+i*28,a,p.muted,13); });
  s += r(46,285,206,29,p.raised) + t(92,304,'TS  garden.ts',p.accent,13) + t(92,333,'{}  palettes.json',p.yellow,13) + t(92,362,'M   README.md',p.blue,13);
  s += r(253,38,714,37,p.panel) + r(253,38,153,37,p.bg) + r(253,38,153,2,p.accent) + t(269,62,'TS  garden.ts    ×',p.fg,13);
  s += t(274,100,'earth  ›  demo  ›  garden.ts',p.muted,12);
  const lines = [
    [['/** A quieter place to make things. */',p.comment]],
    [['export ',p.purple],['class ',p.purple],['EarthTheme ',p.yellow],['{',p.muted]],
    [['  readonly ',p.purple],['accent ',p.cyan],['= ',p.cyan],['"'+p.accent+'"',p.green],[';',p.muted]],
    [['']],
    [['  async ',p.purple],['grow',p.blue],['(seasons = ',p.fg],['4',p.orange],[') {',p.fg]],
    [['    // Small changes, room to breathe.',p.comment]],
    [['    const ',p.purple],['plants ',p.fg],['= ',p.cyan],['12 ',p.orange],['* ',p.cyan],['seasons;',p.fg]],
    [['    const ',p.purple],['name ',p.fg],['= ',p.cyan],['"'+p.name+'"',p.green],[';',p.fg]],
    [['']],
    [['    if ',p.purple],['(plants ',p.fg],['> ',p.cyan],['0',p.orange],[') {',p.fg]],
    [['      console',p.yellow],['.',p.muted],['log',p.blue],['(name, plants);',p.fg]],
    [['    }',p.muted]],
    [['    return ',p.purple],['plants;',p.fg]],
    [['  }',p.muted]], [['}',p.muted]]
  ];
  lines.forEach((tokens,i) => { s += t(275,143+i*27,String(i+1),p.comment,13,'Consolas'); let pos=320; for(const [text,color] of tokens) { s+=t(pos,143+i*27,text,color||p.fg,15,'Consolas',color===p.comment?'font-style="italic"':'');pos+=text.length*8.25;} });
  s += r(967,38,1,503,p.border) + t(989,63,'CHAT',p.fg,11) + r(989,72,33,1,p.accent);
  s += t(990,116,'A little room to think.',p.fg,18) + t(990,150,'Pure black. Green accents.',p.muted,14) + t(990,177,'One palette across your workspace.',p.muted,14);
  s += t(990,239,'garden.ts',p.fg,14) + t(1230,239,'+12  −3',p.green,13) + r(990,257,346,1,p.border);
  s += r(989,387,349,115,p.raised,18) + t(1006,415,'Ask a follow-up…',p.muted,13) + t(1006,481,'+     Local workspace',p.muted,12) + t(1305,481,'↑',p.accent,22);
  s += r(253,541,1107,1,p.border) + t(274,569,'PROBLEMS',p.muted,11) + t(362,569,'TERMINAL',p.fg,11) + t(453,569,'OUTPUT',p.muted,11) + r(360,578,65,1,p.accent);
  s += t(276,612,'terminaltings',p.cyan,14,'Consolas') + t(390,612,' on main  via node',p.purple,14,'Consolas');
  s += t(276,639,'❯  A quieter place to make things.',p.green,14,'Consolas');
  [p.comment,p.red,p.green,p.yellow,p.blue,p.purple,p.cyan,p.fg].forEach((v,i) => {s+=r(276+i*37,657,30,16,v,2);});
  s += t(276,720,'EARTH / '+p.name.toUpperCase(),p.accent,25,'Consolas','letter-spacing="5"');
  s += r(0,766,1360,24,p.panel) + r(0,766,1360,1,p.border) + t(15,783,'⑂  main     ✓',p.muted,11) + t(1080,783,'Ln 12, Col 1     UTF-8    TypeScript',p.muted,11);
  return s+'</g>';
}
for (const p of palettes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1360" height="790" viewBox="0 0 1360 790">${preview(p)}</svg>`;
  await save(`preview/${p.id}.svg`, svg);
  await writeFile(resolve(root, `preview/${p.id}.png`), new Resvg(svg).render().asPng());
}
let board = '<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="770" viewBox="0 0 1500 770"><rect width="1500" height="770" fill="#0C0C0C"/>';
board += '<text x="48" y="65" font-family="Segoe UI" font-size="16" letter-spacing="4" fill="#AAAAAA">TERMINAL THINGS / EARTH</text><text x="48" y="119" font-family="Segoe UI" font-size="38" fill="#E5E5E5">Pure black. Three shades of green.</text>';
for (const [i,p] of palettes.entries()) {
  const x = 48+i*477;
  board += `<text x="${x}" y="184" font-family="Segoe UI" font-size="25" fill="#E5E5E5">0${i+1} / ${p.name}</text><text x="${x}" y="214" font-family="Segoe UI" font-size="15" fill="#AAAAAA">${p.description}</text>`;
  board += preview(p,x,239,0.325);
  [p.bg,p.raised,p.accent,p.selection].forEach((color,j) => { board += `<rect x="${x+j*111}" y="528" width="100" height="84" rx="6" fill="${color}"/><text x="${x+j*111}" y="639" font-family="Consolas" font-size="16" fill="#E5E5E5">${color}</text><text x="${x+j*111}" y="663" font-family="Segoe UI" font-size="13" fill="#AAAAAA">${['Canvas','Inputs','Accent','Selection'][j]}</text>`; });
}
board += '<text x="48" y="731" font-family="Segoe UI" font-size="14" fill="#AAAAAA">Illustrated previews · All main surfaces #000000 · Classic + Modern UI color tokens · Forest is the starting theme</text></svg>';
await save('preview/palette-board.svg', board);
await writeFile(resolve(root, 'preview/palette-board.png'), new Resvg(board).render().asPng());
console.log('Built 3 VS Code themes, shared tokens, and illustrated previews.');
