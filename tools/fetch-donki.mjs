// Baixa eventos do DONKI (NASA) em blocos de 30 dias e salva o JSON bruto em data/.
// Uso (PowerShell):  $env:NASA_API_KEY="sua_chave"; node tools/fetch-donki.mjs
// Sem a variável usa DEMO_KEY, que tem limite baixo.
// Pode rodar de novo: blocos já baixados são pulados.
// Obs.: o endpoint /DONKI/FLR estava retornando 404 em 14/11/2026, então a classe das
// explosões vem das notificações do tipo FLR.
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';

const KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const TYPES = ['SEP', 'CME', 'notifications'];
const YEARS = [2024, 2025];
const DIR = new URL('../data/raw/', import.meta.url);
mkdirSync(DIR, { recursive: true });

const iso = d => d.toISOString().slice(0, 10);
function chunks(year) {
  const out = [];
  let a = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  while (a <= end) {
    let b = new Date(a.getTime() + 29 * 864e5);
    if (b > end) b = end;
    out.push([iso(a), iso(b)]);
    a = new Date(b.getTime() + 864e5);
  }
  return out;
}

let stop = false;
for (const type of TYPES) {
  for (const year of YEARS) {
    for (const [s, e] of chunks(year)) {
      const file = new URL(`${type}_${s}_${e}.json`, DIR);
      if (existsSync(file) || stop) continue;
      const extra = type === 'notifications' ? '&type=FLR' : '';
      const url = `https://api.nasa.gov/DONKI/${type}?startDate=${s}&endDate=${e}${extra}&api_key=${KEY}`;
      const r = await fetch(url);
      if (r.status === 429) { console.log(`429 (limite da chave) em ${type} ${s}. Rode de novo mais tarde ou use NASA_API_KEY.`); stop = true; continue; }
      if (!r.ok) { console.log(`Erro ${r.status} em ${type} ${s}..${e}`); continue; }
      const txt = await r.text();
      const json = txt.trim() ? JSON.parse(txt) : [];
      writeFileSync(file, JSON.stringify(json));
      console.log(`${type} ${s}..${e}: ${json.length} eventos (restam ${r.headers.get('x-ratelimit-remaining')} pedidos)`);
    }
  }
}

// Junta tudo em um arquivo por tipo/ano
for (const type of TYPES) for (const year of YEARS) {
  const cs = chunks(year), all = [];
  let complete = true;
  for (const [s, e] of cs) {
    const f = new URL(`${type}_${s}_${e}.json`, DIR);
    if (!existsSync(f)) { complete = false; continue; }
    all.push(...JSON.parse(readFileSync(f, 'utf8')));
  }
  if (complete) writeFileSync(new URL(`../${type}_${year}.json`, DIR), JSON.stringify(all, null, 1));
  console.log(`${type} ${year}: ${all.length} eventos ${complete ? '(completo)' : '(INCOMPLETO)'}`);
}
