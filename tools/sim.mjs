// Teste de equilíbrio: joga milhares de partidas com estratégias diferentes usando o motor do index.html.
// Uso: node tools/sim.mjs [partidas]
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const code = html.match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//)[1];
const Engine = new Function(code + '; return Engine;')();
const { R, newGame, choose, locked, stars } = Engine;
const N = +process.argv[2] || 100000;

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
      case 'sci': {
        // L = pesquisa dentro da base (ou recarregar), R = fora (ou a outra de dentro em dia de tempestade sem aviso)
        const cost = o => -(o.fx.pw || 0), keep = G.storms[G.day]?.flr ? R.SHIELD_PW : 1;
        const ok = o => G.pw - cost(o) >= keep && (!o.fx.outside || (G.rad < 30 && !G.storms[G.day]));
        if (ok(c.L) && ok(c.R)) return c.R.fx.outside && G.rad < 15 ? 'R' : 'L';
        return ok(c.R) ? 'R' : ok(c.L) ? 'L' : (cost(c.L) <= cost(c.R) ? 'L' : 'R');
      }
      case 'dust': return G.pw < 4 && G.rad < 25 ? 'R' : 'L';
      case 'leak': return G.pw >= 1 ? 'R' : 'L';
      case 'airlock': return G.pw >= 2 ? 'R' : 'L';
      case 'filter': return G.air <= 6 && G.pw >= 2 ? 'R' : 'L';
      case 'reserveAir': return G.air <= 6 && G.pw >= 4 ? 'R' : 'L';
      case 'reservePower': return G.air >= 5 ? 'R' : 'L';
      case 'cargo': return G.rad < 30 ? 'R' : 'L';
      case 'signal': return G.pw >= 4 ? 'R' : 'L';
      default: return 'R';
    }
  },
  // Só quer descobertas: nunca usa o escudo, sempre escolhe a pesquisa de fora da base.
  'so ciencia': (G, c) => {
    switch (c.id) {
      case 'o2': return G.air <= 4 ? 'R' : 'L';
      case 'farm': return G.air <= 4 ? 'R' : 'L';
      case 'flare': case 'arriveLate': case 'arriveSurprise': return 'L';
      default: return 'R';
    }
  },
  // Sempre o escudo e nunca arrisca: só pesquisa dentro da base (ou recarrega).
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
  'alternada': (G, c) => c.single ? 'R' : ((G._alt = (G._alt || 0) + 1) % 2 ? 'L' : 'R'),
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
