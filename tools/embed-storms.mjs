// Embute data/storms.json (versão compacta) dentro do index.html, entre os marcadores STORMS.
// Uso: node tools/embed-storms.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const html = new URL('../index.html', import.meta.url);
const storms = JSON.parse(readFileSync(new URL('../data/storms.json', import.meta.url), 'utf8'))
  .map(s => ({ d: s.d, sev: s.sev, flr: s.flr, cls: s.cls, warn: s.warnMin, cme: s.cme, link: s.link }));
const body = '[\n' + storms.map(s => '  ' + JSON.stringify(s)).join(',\n') + '\n]';
const src = readFileSync(html, 'utf8');
const out = src.replace(/\/\*STORMS\*\/[\s\S]*?\/\*END-STORMS\*\//, () => `/*STORMS*/${body}/*END-STORMS*/`);
if (out === src && !src.includes(body)) throw new Error('Marcadores STORMS não encontrados no index.html');
writeFileSync(html, out);
console.log(`${storms.length} tempestades embutidas no index.html`);
