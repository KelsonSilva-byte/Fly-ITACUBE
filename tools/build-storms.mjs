// Cruza os dados brutos do DONKI (data/*.json) e gera data/storms.json:
// uma entrada por tempestade de partículas (SEP), com a explosão (flare) e a ejeção (CME) ligadas.
// Uso: node tools/build-storms.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const load = n => JSON.parse(readFileSync(new URL(`../data/${n}.json`, import.meta.url), 'utf8'));
const YEARS = [2024, 2025];
const sep = YEARS.flatMap(y => load(`SEP_${y}`));
const cme = YEARS.flatMap(y => load(`CME_${y}`));
const notif = YEARS.flatMap(y => load(`notifications_${y}`));
const H = 36e5;

// Classe de cada explosão, tirada do texto das notificações FLR
const flares = {};
for (const n of notif) {
  const b = n.messageBody;
  const id = b.match(/Activity ID:\s*(\S+FLR-\d+)/)?.[1];
  const cls = b.match(/Flare intensity:\s*([A-Z]\d+(?:\.\d+)?)/)?.[1];
  if (!id || !cls) continue;
  flares[id] = {
    cls,
    start: b.match(/Flare start time:\s*(\S+Z)/)?.[1] ?? null,
    peak: b.match(/Flare peak time:\s*(\S+Z)/)?.[1] ?? null,
    region: b.match(/Active Region (\d+)/)?.[1] ?? null,
    alert: n.messageURL,
  };
}
const cmeById = Object.fromEntries(cme.map(c => [c.activityID, c]));

// Só detecções reais (ignora previsões "MODEL: ...")
const obs = sep
  .map(e => ({ ...e, inst: (e.instruments || []).map(i => i.displayName).filter(n => !n.startsWith('MODEL')) }))
  .filter(e => e.inst.length)
  .sort((a, b) => Date.parse(a.eventTime) - Date.parse(b.eventTime));

// Agrupa registros com menos de 48 h de diferença do anterior em uma tempestade
const clusters = [];
for (const e of obs) {
  const last = clusters.at(-1);
  if (last && Date.parse(e.eventTime) - Date.parse(last.at(-1).eventTime) < 48 * H) last.push(e);
  else clusters.push([e]);
}

const storms = clusters.map(c => {
  const has = re => c.filter(e => e.inst.some(n => re.test(n)));
  const g100 = has(/GOES.*>100 MeV/), g10 = has(/GOES.*>10 MeV/);
  const sev = g100.length ? 3 : g10.length ? 2 : 1;
  // Hora de chegada: a primeira detecção do GOES (perto da Terra e da Lua) se houver; senão a primeira de todas
  const first = (g10[0] || g100[0] || c[0]);
  const t = Date.parse(first.eventTime);
  const linked = [...new Set(c.flatMap(e => (e.linkedEvents || []).map(l => l.activityID)))];
  // Explosão: a ligada mais recente que começou ANTES da chegada (até 48 h antes)
  const flr = linked.filter(id => id.includes('-FLR-'))
    .map(id => ({ id, t: Date.parse(id.slice(0, 19) + 'Z') }))
    .filter(f => f.t < t && t - f.t <= 48 * H).sort((a, b) => b.t - a.t)[0];
  const f = flr && flares[flr.id];
  const speeds = linked.filter(id => id.includes('-CME-')).map(id => {
    const a = cmeById[id]?.cmeAnalyses; if (!a?.length) return null;
    return (a.find(x => x.isMostAccurate) || a[0]).speed;
  }).filter(Boolean);
  return {
    d: first.eventTime,                        // chegada das partículas (UTC)
    sev,                                       // 3 = GOES >100 MeV · 2 = GOES >10 MeV · 1 = só outras sondas
    inst: [...new Set(c.flatMap(e => e.inst))],
    link: first.link,
    flr: flr ? flr.id.slice(0, 16) + 'Z' : null, // início da explosão ligada (UTC)
    cls: f?.cls ?? null,                       // classe da explosão (só há notificação para M5 ou mais)
    warnMin: flr ? Math.round((t - flr.t) / 6e4) : null, // minutos entre a explosão e a chegada
    cme: speeds.length ? Math.max(...speeds) : null,     // velocidade da ejeção ligada (km/s)
    flrAlert: f?.alert ?? null,
  };
});

writeFileSync(new URL('../data/storms.json', import.meta.url), JSON.stringify(storms, null, 1));
console.log(`${storms.length} tempestades`);
for (const s of storms) console.log(s.d, 'sev', s.sev, 'flr', s.flr ?? '-', s.cls ?? '-', 'aviso', s.warnMin ?? '-', 'min', 'cme', s.cme ?? '-');
