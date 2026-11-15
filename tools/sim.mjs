// Teste de equilíbrio: joga milhares de partidas com estratégias diferentes usando o motor do index.html.
// Uso: node tools/sim.mjs [partidas]
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const code = html.match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//)[1];
const Engine = new Function(code + '; return Engine;')();
const { R, newGame, choose, locked, stars } = Engine;
const N = +process.argv[2] || 30000;

// Cada estratégia recebe (G, carta) e devolve 'L' ou 'R'.
const can = (G, c) => !locked(G, c.R);
const S = {
  // Mantém o ar, guarda 3 de energia para o escudo, pesquisa com a sobra, pouca saída.
  'cuidadosa': (G, c) => {
    const spare = G.pw - R.SHIELD_PW;
    switch (c.id) {
      case 'o2': return G.air <= 5 ? 'R' : 'L';
      case 'farm': return G.air <= 6 ? 'R' : 'L';
      case 'flare': return 'R';
      case 'arriveLate': case 'arriveSurprise': return 'R';
      case 'lab': return spare >= 2 ? 'R' : 'L';
      case 'rover': return spare >= 1 && G.rad < 22 ? 'R' : 'L';
      case 'roverAlert': return 'L';
      case 'scope': return spare >= 1 ? 'R' : 'L';
      case 'ice': return G.rad < 15 ? 'R' : 'L';
      case 'dust': return G.pw < 4 && G.rad < 25 ? 'R' : 'L';
      case 'leak': return G.pw >= 1 ? 'R' : 'L';
      default: return 'R';
    }
  },
  // Só quer descobertas: nunca usa o escudo, sempre sai de jipe.
  'so ciencia': (G, c) => {
    switch (c.id) {
      case 'o2': return G.air <= 4 ? 'R' : 'L';
      case 'farm': return G.air <= 4 ? 'R' : 'L';
      case 'flare': case 'arriveLate': case 'arriveSurprise': return 'L';
      default: return 'R';
    }
  },
  // Sempre o escudo e nunca arrisca: não pesquisa nada que custe.
  'so seguranca': (G, c) => {
    switch (c.id) {
      case 'o2': return G.air <= 6 ? 'R' : 'L';
      case 'farm': return 'R';
      case 'flare': case 'arriveLate': case 'arriveSurprise': return 'R';
      case 'leak': return 'R';
      default: return 'L';
    }
  },
  'esquece o ar': (G, c) => (c.id === 'o2' || c.id === 'farm') ? 'L' : S['cuidadosa'](G, c),
  'sempre direita': () => 'R',
  'sempre esquerda': () => 'L',
  'aleatoria': () => Math.random() < .5 ? 'L' : 'R',
};

console.log(`${N} partidas por estratégia · meta de ciência ${R.SCI_GOAL}\n`);
console.log('estratégia'.padEnd(18), 'vitórias', ' 3★ ', ' 2★ ', ' 1★ ', 'ar✗ ', 'rad✗','en✗', ' ciência', ' radiação');
for (const [name, f] of Object.entries(S)) {
  const r = { win: 0, air: 0, pw:0, rad: 0, s: [0, 0, 0, 0], sci: 0, radSum: 0 };
  for (let i = 0; i < N; i++) {
    const G = newGame();
    let guard = 0;
    while (!G.over && guard++ < 500) {
      const c = G.card;
      let side = c.single ? 'R' : f(G, c);
      if (!c.single && locked(G, c[side])) side = side === 'R' ? 'L' : 'R';
      choose(G, side);
    }
    r[G.over]++; r.s[stars(G)]++; r.sci += G.sci; r.radSum += G.rad;
  }
  const p = v => (v / N * 100).toFixed(0).padStart(3) + '%';
  console.log(name.padEnd(18), p(r.win).padStart(8), p(r.s[3]), p(r.s[2]), p(r.s[1]), p(r.air), p(r.rad), p(r.pw), (r.sci / N).toFixed(1).padStart(8), (r.radSum / N).toFixed(0).padStart(9));
}
