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
  // Simula uma criança jogando por intuição: gasta energia quando tem, adora sair de jipe e só lembra do ar no aperto.
  'crianca intuitiva': (G, c) => {
    if (c.quiz) return Math.random() < .5 ? 'L' : 'R';
    switch (c.id) {
      case 'o2': case 'farm': return G.air <= 4 ? 'R' : 'L';
      case 'flare': return G.pw >= 5 ? 'R' : 'L';
      case 'arriveLate': case 'arriveSurprise': return G.pw >= 3 ? 'R' : 'L';
      case 'sci': return c.R.fx.outside && G.rad < 65 ? 'R' : 'L';
      case 'dust': case 'geminids_2024_12': case 'quadrantids_2025_01': return G.rad < 60 ? 'R' : 'L';
      case 'leak': case 'airlock': case 'filter': return G.pw >= 1 ? 'R' : 'L';
      default: return 'R';
    }
  },

  // Poupadora extrema: prioriza guardar ou gerar energia acima de tudo e só gasta se estiver sobrando.
  'economica': (G, c) => {
    switch (c.id) {
      case 'o2': return G.air <= 3 && G.pw >= 2 ? 'R' : 'L';
      case 'farm': return G.air <= 4 && G.pw >= 1 ? 'R' : 'L';
      case 'flare': case 'arriveLate': case 'arriveSurprise': return G.pw >= 6 ? 'R' : 'L';
      case 'dust': return G.rad < 70 ? 'R' : 'L';
      case 'reservePower': return G.air >= 4 ? 'R' : 'L';
      default: return 'L';
    }
  },

  // Joga como a cuidadosa, mas sempre acerta as perguntas de memória (mede o teto do bônus do quiz).
  'estudiosa': (G, c) => c.quiz ? (c.R.ok ? 'R' : 'L') : S['cuidadosa'](G, c),

  // Joga como a cuidadosa, mas sempre erra as perguntas de memória (mede se a penalidade do quiz pesa demais).
  'distraida': (G, c) => c.quiz ? (c.R.ok ? 'L' : 'R') : S['cuidadosa'](G, c),

  // Joga como a cuidadosa, mas nunca gasta 3 de energia em escudo (testa se dá para sobreviver às 1–3 tempestades sem escudo).
  'sem escudo': (G, c) => (c.id === 'flare' || c.id === 'arriveLate' || c.id === 'arriveSurprise') ? 'L' : S['cuidadosa'](G, c),

  // Reativa: nunca prepara o escudo no alerta e só age quando ar ou energia já estão baixos.
  'reativa': (G, c) => {
    switch (c.id) {
      case 'o2': return G.air <= 3 ? 'R' : 'L';
      case 'farm': return G.air <= 4 ? 'R' : 'L';
      case 'flare': return 'L';
      case 'arriveLate': case 'arriveSurprise': return G.pw >= 4 ? 'R' : 'L';
      case 'sci': return G.pw >= 3 && G.rad < 40 ? 'R' : 'L';
      case 'leak': case 'airlock': case 'filter': return G.air <= 4 && G.pw >= 1 ? 'R' : 'L';
      default: return G.pw >= 3 ? 'R' : 'L';
    }
  },
  'aleatoria': () => Math.random() < .5 ? 'L' : 'R',
  // Domina toda a matemática do motor: evita mortes silenciosas por pw=0, otimiza trocas ar/energia e garante 3★.
  'mestre 1000 anos': (G, c) => {
    if (c.single) return 'R';
    if (c.quiz) return c.R.ok ? 'R' : 'L';

    const evalSide = side => {
      const opt = c[side];
      if (!opt || locked(G, opt)) return { ok: false };
      const fx = Engine.effectFor(G, opt);
      const pw = Math.min(R.PW_MAX, G.pw + (fx.pw || 0));
      const air = Math.max(0, Math.min(R.AIR_MAX, G.air + (fx.air || 0)));
      let rad = G.rad + (fx.rad || 0);
      if (c.resolve) {
        const dose = R.STORM[c.storm.sev];
        const block = G.prepared ? R.BLOCK_READY : fx.rush ? R.BLOCK_RUSH : 0;
        rad += Math.round(dose * (1 - block)) + (G.outside ? Math.round(dose * R.OUTSIDE) : 0);
      }
      const night = G.queue.length === 0 || !!c.resolve;
      const endAir = night ? air - R.AIR_USE : air;
      const endRad = night ? rad + R.RAD_DAILY : rad;
      const alive = pw > 0 && rad < R.RAD_LIMIT && endAir > 0 && endRad < R.RAD_LIMIT;
      return { ok: true, alive, pw, air: endAir, rad: endRad, sci: G.sci + (fx.sci || 0), fx };
    };

    const L = evalSide('L'), R_ = evalSide('R');
    if (L.ok && !R_.ok) return 'L';
    if (R_.ok && !L.ok) return 'R';
    if (L.alive !== R_.alive) return L.alive ? 'L' : 'R';

    const daysLeft = R.DAYS - G.day;
    const futureAirNeeded = (daysLeft - 1) * R.AIR_USE;
    const nightRadLeft = daysLeft * R.RAD_DAILY;
    const radRoom3Star = (R.RAD_SAFE - 1) - (G.rad + nightRadLeft);
    const sciNeeded = Math.max(0, R.SCI_GOAL - G.sci);
    const storm = G.storms[G.day];
    const needShield = storm && R.STORM[storm.sev] > radRoom3Star;
    const shieldMinPw = R.SHIELD_PW + 1; // 4⚡ necessários para gastar 3⚡ sem zerar (pw <= 0 encerra o jogo)
    const pwFloor = (needShield && !G.prepared) ? shieldMinPw : 2;

    switch (c.id) {
      case 'o2':
      case 'farm': {
        if (needShield && storm.flr && G.pw < shieldMinPw + (c.id === 'o2' ? 2 : 1) && L.air >= 2) return 'L';
        if (G.air + R_.fx.air > R.AIR_MAX) return 'L';
        if (L.air >= futureAirNeeded && G.pw < R.PW_MAX) return 'L';
        const targetAir = daysLeft <= 2 ? futureAirNeeded + 3 : 7;
        return (G.air <= targetAir && R_.pw >= pwFloor) ? 'R' : 'L';
      }
      case 'flare': {
        if (R_.pw >= 1 && (needShield || (storm.sev >= 2 && G.pw >= 5))) return 'R';
        return 'L';
      }
      case 'arriveLate':
      case 'arriveSurprise': {
        if (R_.pw < 1) return 'L';
        const raw = R.STORM[c.storm.sev], half = Math.round(raw * (1 - R.BLOCK_RUSH));
        const saves3Star = (G.rad + raw + nightRadLeft >= R.RAD_SAFE) && (G.rad + half + nightRadLeft < R.RAD_SAFE);
        const savesLife = G.rad + raw + nightRadLeft >= R.RAD_LIMIT;
        return (savesLife || saves3Star || (c.storm.sev === 3 && G.pw >= 5)) ? 'R' : 'L';
      }
      case 'sci': {
        const safeOut = o => !o.fx.outside || (!storm && (o.fx.rad || 0) <= radRoom3Star);
        if (sciNeeded > 0) {
          if (c.R.key === 'ice' && safeOut(c.R)) return 'R';
          if (c.R.fx.outside && safeOut(c.R) && R_.pw >= pwFloor) return 'R';
          if (c.L.fx.sci && L.pw >= pwFloor) return 'L';
          if (c.R.fx.sci && R_.pw >= pwFloor) return 'R';
          if (!storm && c.R.fx.outside && R_.alive) return 'R';
        }
        if (c.L.key === 'rest' && L.air >= Math.min(futureAirNeeded, 3) && G.pw <= 6) return 'L';
        if (c.R.key === 'ice' && safeOut(c.R)) return 'R';
        return L.pw >= R_.pw ? 'L' : 'R';
      }
      case 'dust':
      case 'geminids_2024_12':
      case 'quadrantids_2025_01': {
        return (R_.pw <= R.PW_MAX && (L.pw < 2 || (6 <= radRoom3Star && G.pw <= 6))) ? 'R' : 'L';
      }
      case 'leak':
      case 'airlock': {
        return (R_.pw >= 2 && !(L.air >= futureAirNeeded && G.pw <= 3)) ? 'R' : 'L';
      }
      case 'filter': {
        return (G.air <= Math.min(futureAirNeeded + 2, 6) && R_.pw >= 2) ? 'R' : 'L';
      }
      case 'reserveAir': {
        return (G.air <= 3 && R_.pw >= 2) ? 'R' : 'L';
      }
      case 'reservePower': {
        return (G.pw <= 3 && R_.air >= Math.min(futureAirNeeded, 3)) ? 'R' : 'L';
      }
      case 'cargo': {
        return (G.air <= 6 && R_.pw >= 2 && 3 <= radRoom3Star) ? 'R' : 'L';
      }
      case 'signal':
      case 'donki_x87_2024_05': {
        return (sciNeeded > 0 && R_.pw >= 3) ? 'R' : 'L';
      }
      default: {
        return L.air >= Math.min(futureAirNeeded, 2) ? 'L' : 'R';
      }
    }
  },
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
