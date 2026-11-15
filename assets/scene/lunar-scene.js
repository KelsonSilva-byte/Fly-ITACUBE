/* Pixel scene rendered on a 256 × 88 logical grid. No draft assets required. */
window.LunarScene={create(canvas){
'use strict';
const earth = new Image();
earth.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEISURBVEhLnZTRDcJADEO7BR9MwgxITMEXA7AB/LMfu4CC5FP66stdiWS1jRLbybVdlkGcLs9PD6zdFSQTrvfbJnc4nveJZbIRsih5NiHix+vdCOK+eibKaUROAuWYd+hOwh2zcQaZY0UeY+VDm3FKuClX7pWkewnmvDOgms0UvQY2uhoao8DvwDMRG5VzIiRzubg2AUKEvDqyCl2BAPf6D+yKKDIr5OrKCdgoMQfWDgXoJIPkJBXab6O3knh2HyGFcj7Xtw/Nuc8idEb3AfaXAipigwPJVd/IeyIzAm6CyHd/2RQYQcQUIG+LLJDdkTgj3NqDrUJORuQUIk8ZfD0rsHdXcAV7HX8BHIf5MP+E+eMAAAAASUVORK5CYII=';

const ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const shield={value:'none'};
let state={day:1,hour:8,sun:3,dust:false,leak:false,power:true,farm:false};
let active=null,completion=null,generation=0,loopId=0,task=null,clock=0,lastNow=null,running=false;
const palettes = [
  ['#08091B', '#171B4B', '#303DB1', '#8591DC', '#F3F3FF'],
  ['#101425', '#292D49', '#565D80', '#AAAFC7', '#FFCF72'],
  ['#160E21', '#35213E', '#70425D', '#C99C9C', '#FFE1A3']
];
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const mix = (a, b, t) => '#' + [1, 3, 5].map(i => {
  const x = parseInt(a.slice(i, i + 2), 16), y = parseInt(b.slice(i, i + 2), 16);
  return Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
}).join('');
const rect = (x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};
const poly = (points, color) => {
  // Rasterização na grade lógica: diagonais também mantêm pixels inteiros.
  const top = Math.floor(Math.min(...points.map(p => p[1])));
  const bottom = Math.ceil(Math.max(...points.map(p => p[1])));
  for (let y = top; y < bottom; y++) {
    const hits = [];
    points.forEach(([ax, ay], i) => {
      const [bx, by] = points[(i + 1) % points.length];
      if ((ay <= y + .5 && by > y + .5) || (by <= y + .5 && ay > y + .5)) {
        hits.push(ax + (y + .5 - ay) * (bx - ax) / (by - ay));
      }
    });
    hits.sort((a,b) => a-b);
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const left = Math.round(hits[i]);
      rect(left, y, Math.round(hits[i+1]) - left, 1, color);
    }
  }
};
const disk = (x, y, r, color) => {
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    rect(x - dx, y + dy, dx * 2 + 1, 1, color);
  }
};
let seed = 43;
const rand = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const stars = Array.from({ length: 64 }, () => [rand() * 255, rand() * 57, rand() > .91 ? 2 : 1]);
const rocks = Array.from({ length: 54 }, () => [rand() * 252, 62 + rand() * 25, 1 + Math.floor(rand() * 4)]);
const trails = Array.from({ length: 20 }, () => [rand(), rand(), rand()]);
const shelterDoor = 184;
const cargoStation = 207;
const hoverHome = 30;
const impactStart = .61;
const between = (p, start, end) => clamp((p - start) / (end - start), 0, 1);
const lerp = (a, b, p) => a + (b - a) * p;
const dome = { center: 137, ground: 71, radiusX: 112, radiusY: 54 };
const crew = [
  { x: 93, y: 40, range: 3, phase: .05, visor: '#9dbaff' },
  { x: 151, y: 61, range: 10, phase: .37, visor: '#FFCF72' },
  { x: cargoStation, y: 61, range: 4, phase: .70, visor: '#8591DC' }
];
const durations = { intro: 6500, alert: 18000, storm: 19500, meteors: 18500, eclipse: 8000, explore: 12000, sample: 6500, clean: 3000, repair: 3000, filter:3000, oxygen: 3200, power: 2200, farm: 2200, research: 3200, observe: 3200, prepare: 2600, airlock: 2600 };
const emergencies = new Set(['alert', 'storm', 'meteors']);
// O tempo dramático é compartilhado por porta, equipe e efeitos.
function eventProgress(kind, raw) {
  if (!emergencies.has(kind)) return raw;
  const keys = [[0,0],[.08,.16],[.20,.38],[.30,.59],[.34,.61],[.52,.77],[1,1]];
  for(let i=1;i<keys.length;i++) if(raw<=keys[i][0]) {
    return lerp(keys[i-1][1],keys[i][1],between(raw,keys[i-1][0],keys[i][0]));
  }
  return 1;
}
function eventTime(kind, progress) {
  let low=0, high=1;
  for(let i=0;i<24;i++) {
    const mid=(low+high)/2;
    if(eventProgress(kind,mid)<progress) low=mid; else high=mid;
  }
  return (low+high)/2;
}

function cargoPose(index, s) {
  const home = cargoStation - 6 + index * 7;
  if (!s.emergency) return {x:home,y:65};
  const p=s.progress, landed=home+(index?17:10);
  const flight=between(p,.035+index*.008,.22+index*.008);
  if(flight<1) return {x:lerp(home,landed,flight),y:65-4*(index?23:17)*flight*(1-flight)};
  const bounce=between(p,.228,.28);
  if(p<.28) return {x:landed,y:65-2*Math.sin(bounce*Math.PI)};
  const pickup=index?.956:.915, liftEnd=index?.966:.925, drop=index?.99:.946;
  if(p<pickup) return {x:landed,y:65};
  const worker=crewPose(crew[2],2,s);
  if(p<liftEnd) return {x:landed,y:lerp(65,63,between(p,pickup,liftEnd))};
  if(p<drop) return {x:worker.x+4,y:63};
  return {x:home,y:lerp(63,65,between(p,drop,drop+.004))};
}

function routinePose(person, time) {
  const p = (time / 5200 + person.phase) % 1;
  const walk = p > .24 && p < .75;
  const motion = between(p, .24, .5) - between(p, .5, .75);
  return { x: person.x + person.range * motion, y: person.y,
    facing: walk ? (p < .5 ? 1 : -1) : (person.x === cargoStation ? 1 : -1),
    step: walk ? Math.floor(time / 125) % 2 : 0, working: !walk && (person.x !== 93 || active?.kind === 'clean') };
}

function pathPose(p, keys, time) {
  const index = keys.findIndex(key => key[0] > p);
  const a = index < 0 ? keys.at(-1) : keys[Math.max(0, index - 1)];
  const b = index < 0 ? a : keys[index];
  const amount = b[0] === a[0] ? 0 : between(p, a[0], b[0]);
  const moving = a[1] !== b[1] || a[2] !== b[2];
  return { x: lerp(a[1], b[1], amount), y: lerp(a[2], b[2], amount),
    facing: a[1] !== b[1] ? Math.sign(b[1] - a[1]) : (a[4] || 1),
    step: moving && !['inside','fallen'].includes(a[3]) ? Math.floor(time / 115) % 2 : 0,
    hidden: a[3] === 'inside', fallen: a[3] === 'fallen', working: ['knock','sample','service','carry','pickup'].includes(a[3]), action: a[3] };
}

function crewPose(person, index, s) {
  const { kind, progress: p, time, clip } = s;
  const routine = routinePose(person, time);
  if (!clip || kind === 'idle') return routine;
  const [x, y] = clip.origins[index];
  const target = routinePose(person, clip.end);
  const atDoor = [shelterDoor, 58];
  const landing = index === 0 ? [[.90, 101, 61, 'climb'], [.96,101,40]] : [];
  if (kind === 'intro') {
    const leave = .04 + index * .09;
    return pathPose(p, [[0, ...atDoor, 'inside'], [leave, ...atDoor], [leave + .1, shelterDoor, 61],
      ...landing, [1, target.x, target.y]], time);
  }
  if (emergencies.has(kind)) {
    const leave = .77 + index * .035;
    const exit = [[leave, ...atDoor], [leave + .06, shelterDoor, 61], ...landing, [1, target.x, target.y]];
    if (index === 0) {
      const fallX = lerp(x, shelterDoor, .5);
      return pathPose(p, [[0,x,y], [.07,x,Math.min(y,35)], [.16,x+15,61],
        [.26,fallX,61], [.29,fallX+4,66,'fallen'], [.34,fallX+6,66,'fallen'],
        [.38,fallX+6,61], [.49,176,61,'knock'], [.55,176,61], [.59,...atDoor,'inside'], ...exit], time);
    }
    const arrive = .26 + index * .055;
    if(index===2) return pathPose(p,[[0,x,y],[.045,x,y],[arrive-.05,184,61],
      [arrive,...atDoor,'inside'],[leave,...atDoor],[.88,184,61],
      [.915,207,61,'pickup'],[.925,207,61,'carry'],[.946,197,61],
      [.956,221,61,'pickup'],[.966,221,61,'carry'],[.99,204,61],
      [1,target.x,target.y]],time);
    return pathPose(p, [[0,x,y], [.025 + index * .01,x,y], [arrive - .05,184,61],
      [arrive,...atDoor,'inside'], ...exit], time);
  }
  if (kind === 'explore' && index === 1) {
    return pathPose(p, [[0,x,y], [.37,hoverHome+13,61], [.40,hoverHome+13,53,'inside'], [.78,hoverHome+13,53],
      [.82,hoverHome+13,61], [.96,target.x,target.y], [1,target.x,target.y]], time);
  }
  if (kind === 'sample' && index === 2) {
    return pathPose(p, [[0,x,y], [.38,235,61,'sample',1], [.64,235,61],
      [.94,target.x,target.y], [1,target.x,target.y]], time);
  }
  if (kind === 'eclipse' || kind === 'explore' || kind === 'sample') return routine;
  if (index===1 && ['repair','filter','oxygen','power','farm','research','observe','prepare','airlock'].includes(kind)) {
    const tx=kind==='airlock'?176:151;
    return pathPose(p,[[0,x,y],[.22,tx,61,'service',kind==='airlock'?1:-1],[.72,tx,61],[1,target.x,target.y]],time);
  }
  if (kind==='clean' && index===0) return {...routine,working:p>.15&&p<.85};
  return routine;
}
function astronaut(x, y, facing, step, working, visor, suit) {
  rect(x-2,y-2,4,1,'#171B4B');
  rect(x-3,y-1,7,5,'#171B4B');
  rect(x-2, y-1, 4, 1, suit);
  rect(x - 2, y, 5, 4, '#F3F3FF');
  rect(x + (facing > 0 ? 0 : -2), y + 1, 3, 2, visor);
  rect(x - 2, y + 4, 5, 4, suit);
  rect(x-1,y+4,3,1,'#F3F3FF');
  rect(x,y+5,1,1,'#FFCF72');
  rect(x - facing * 3, y + 4, 2, 3, '#303DB1');
  rect(x + facing * 3, y + (working ? 5 : 6 - step), working ? 3 : 1, 1, suit);
  rect(x - 2 - step, y + 8, 2, 2, '#F3F3FF');
  rect(x + 1 + step, y + 8 - step, 2, 2, '#F3F3FF');
}
const layers = {
  ceu: ['Céu e estrelas', s => {
    rect(0, 0, 256, 88, s.sky);
    stars.forEach(([x, y, size], index) => {
      const pulse = reduceMotion.matches ? .6 : .5 + .5*Math.sin(s.starTime/(670+index*39)+index*2.4);
      const brightness = .34 + .62 * pulse;
      rect(x, y, size, size, mix(s.sky, '#F3F3FF', brightness));
      if(size===2 && pulse>.88) {
        const glint=mix(s.sky,'#F3F3FF',(pulse-.88)*2.2);
        rect(x-1,y,1,1,glint);rect(x+2,y+1,1,1,glint);
      }
    });
  }],
  terra: ['Terra', () => { if (earth.complete && earth.naturalWidth) ctx.drawImage(earth, 198, 9); }],
  sol: ['Sol', s => {
    // Disco estável, borda em degraus e luz respirando: sem faíscas de explosão.
    const pulse=reduceMotion.matches?.5:.5+.5*Math.sin(s.time/1450);
    disk(s.sunX,s.sunY,12,mix(s.sky,'#FFCF72',.12+.08*pulse));
    disk(s.sunX,s.sunY,11,mix('#FFCF72','#FFE1A3',.25+.25*pulse));
    disk(s.sunX,s.sunY,9,'#FFE1A3');
    disk(s.sunX-1,s.sunY-1,7,mix('#FFE1A3','#F3F3FF',.40+.16*pulse));
    rect(s.sunX-5,s.sunY-6,6,1,'#F3F3FF');
    rect(s.sunX-7,s.sunY-4,1,4,'#F3F3FF');
    if (s.kind === 'eclipse') {
      const moonShadowX = s.sunX + Math.round((s.progress - .5) * 58);
      for (let dy = -14; dy < 14; dy++) {
        const dx = Math.floor(Math.sqrt(196 - dy * dy));
        const left = Math.max(s.sunX - dx, moonShadowX - dx);
        const right = Math.min(s.sunX + dx, moonShadowX + dx);
        if (right >= left) rect(left, s.sunY + dy, right - left + 1, 1, s.sky);
      }
    }
  }],
  terreno: ['Terreno e crateras', s => {
    poly([[0,64],[10,61],[31,62],[39,59],[52,59],[62,63],[102,64],[129,62],[155,62],[173,65],[198,62],[221,59],[230,59],[245,63],[256,64],[256,88],[0,88]], s.ground);
    rect(0, 71, 256, 17, s.dark);
    for (const [x,y,w] of rocks) rect(x,y,w,1, y > 71 ? s.ground : s.dark);
    poly([[27,75],[34,73],[51,73],[60,75],[57,79],[32,80]], s.ground);
    poly([[30,76],[36,74],[51,74],[56,76],[51,78],[35,78]], '#08091B');
    poly([[198,78],[206,76],[230,76],[241,79],[236,83],[205,83]], s.ground);
    rect(207, 79, 27, 2, '#08091B');

  }],
  base: ['Estrutura da base', s => {

    rect(109, 48, 72, 19, s.dark);
    rect(105, 45, 44, 22, s.base);
    rect(109, 48, 37, 18, mix(s.base,s.ground,.42));
    rect(111, 49, 33, 15, mix(s.base,s.ground,.30));
    rect(152, 53, 18, 12, s.ground);
    rect(171, 47, 26, 20, s.base);
    rect(174, 50, 23, 17, mix(s.base,s.ground,.32));
    rect(109, 42, 36, 3, s.ground);
    rect(113, 41, 28, 1, s.base);
    rect(107, 46, 40, 1, '#F3F3FF');
    rect(108, 64, 38, 3, s.ground);
    rect(111, 67, 4, 3, s.dark);
    rect(139, 67, 4, 3, s.dark);
    rect(152, 55, 18, 1, s.base);
    for (const x of [154, 159, 164]) rect(x, 56, 1, 8, s.dark);
    rect(176, 44, 17, 3, s.ground);
    rect(173, 48, 22, 1, '#F3F3FF');
    rect(178, 50, 13, 19, s.ground);
    rect(180, 52, 9, 16, '#08091B');
    rect(179, 51, 11, 1, '#FFCF72');
    rect(178, 68, 14, 2, s.base);
    rect(176, 70, 18, 1, s.ground);
    rect(145, 60, 4, 7, s.dark);
    rect(146, 61, 2, 3, s.base);
    rect(146, 65, 2, 1, '#FFCF72');
    rect(191, 37, 1, 7, s.base);
    rect(190, 38, 3, 1, s.base);
    rect(130, 33, 2, 9, s.base);
    const tilt=s.kind==='observe'?Math.round(Math.sin(s.progress*Math.PI)*3):0;
    poly([[121,32-tilt],[126,28-tilt],[139,26+tilt],[136,31+tilt],[129,35],[123,35]], s.base);
  }],
  paineis: ['Painéis solares', s => {
    // Painéis usam a mesma grade das posições de trabalho.
    for (const x of [62, 82]) {
      rect(x + 8, 57, 2, 10, s.base);
      poly([[x,57],[x+5,48],[x+19,48],[x+15,57]], s.base);
      poly([[x+2,56],[x+6,49],[x+17,49],[x+14,56]], mix(s.dark, s.ground, .55));
      rect(x+4,52,12,1,s.base);
      rect(x+9,49,1,7,s.base);
      if(state.dust) for(let n=0;n<8;n++) {
        if(s.kind==='clean' && n/8<s.progress) continue;
        rect(x+5+(n*3)%10,50+(n%3)*2,2,1,'#AAAFC7');
      }
    }
    rect(100,51,1,19,s.base);
    rect(103,51,1,19,s.base);
    for (const y of [53,57,61,65,69]) rect(100,y,4,1,s.base);
  }],
  luzes: ['Janelas, antena e porta', s => {
    const window = mix(s.ground, state.farm?'#b9d3a2':'#FFCF72', s.lit);
    for (const x of [111, 120, 129, 138, 156, 163]) {
      rect(x, 51 + (x > 150 ? 6 : 0), 5, 5, s.dark);
      rect(x+1, 52 + (x > 150 ? 6 : 0), 3, 3, window);
    }
    rect(130, 32, 2, 1, s.blink ? '#FFCF72' : s.base);
    rect(181, 56, 7, 1, window);
  }],
  rover: ['Hover lunar', s => {
    const exploring = s.kind === 'explore';
    const outward = exploring ? between(s.progress, .41, .55) : 0;
    const back = exploring ? between(s.progress, .64, .78) : 0;
    const x = hoverHome - (hoverHome + 37) * (outward - back);
    if (x + 37 < 0) return;
    const moving = (outward > 0 && outward < 1) || (back > 0 && back < 1);
    const y = 61 + (moving && s.blink ? -1 : 0);
    rect(x+4, 69, 25, 2, '#171B4B');
    poly([[x,y],[x+4,y-3],[x+26,y-3],[x+33,y+1],[x+29,y+4],[x+6,y+4]], s.base);
    poly([[x+8,y-3],[x+11,y-10],[x+21,y-10],[x+26,y-3]], s.ground);
    rect(x+12,y-8,10,5,'#08091B');
    rect(x+12,y-8,8,1,'#8591DC');
    rect(x+7,y,20,1,'#F3F3FF');
    rect(x+9,y+2,14,1,s.ground);
    if (exploring && s.progress >= .40 && s.progress < .78) {
      rect(x+13,y-8,5,4,'#F3F3FF');
      rect(x+13,y-7,2,2,crew[1].visor);
    }
    for (const pod of [x+5,x+23]) {
      rect(pod,y+2,6,3,s.dark);
      if (moving) rect(pod+1,y+5,4,s.blink ? 2 : 1,'#8591DC');
    }
    rect(x+2,y,2,1,'#FFCF72');
  }],
  tripulacao: ['Astronautas', s => {
    const positions = crew.map((person, index) => crewPose(person, index, s));
    positions.forEach((pose, index) => {
      if (pose.hidden) return;
      if (pose.fallen) {
        rect(pose.x-5, 67, 8, 3, s.base);
        rect(pose.x+3, 66, 4, 4, '#F3F3FF');
        rect(pose.x+5, 68, 2, 2, crew[index].visor);
        return;
      }
      const toolX = pose.x + pose.facing * 4;
      if (pose.working && index === 0 && !s.emergency) {
        const sweep = s.blink ? 0 : 2;
        rect(toolX, pose.y+5, 1, 4, '#FFCF72');
        rect(toolX-sweep-2, pose.y+9, 4, 1, '#FFCF72');
        if (s.blink) rect(toolX-sweep-3, pose.y+8, 1, 1, s.base);
      }
      if (pose.working && index === 1) rect(toolX, pose.y + 3, 2, 4, '#8591DC');
      if (pose.action === 'sample') {
        rect(toolX,pose.y+5,1,4,s.base);
        rect(toolX-1,pose.y+9,3,1,'#FFCF72');
      }

      const x = pose.x, y = pose.y;
      const nearDoor = Math.abs(x - shelterDoor) < 5 && y < 61;
      ctx.save();
      if (nearDoor) {
        ctx.beginPath();
        ctx.rect(180, 52, 9, 16);
        ctx.clip();
      }
      astronaut(x, y, ['carry','pickup'].includes(pose.action)?1:pose.facing, pose.step, pose.working, crew[index].visor, s.base);
      ctx.restore();
    });
  }],
  abrigo: ['Abrigo e proteção', s => {
    const height = Math.round(s.door * 16);
    if (height) {
      rect(180, 52, 9, height, s.ground);
      rect(181, 52, 1, height, s.base);
      rect(184, 52, 1, height, s.dark);
      rect(180, 51 + height, 9, 1, s.base);
    }
    if (!s.protection) return;
    const prepared = shield.value === 'ready';
    const color = prepared ? '#8591DC' : '#FFCF72';
    ctx.save();
    ctx.globalAlpha = s.protection;
    for (let dx = -dome.radiusX; dx <= dome.radiusX; dx++) {
      if (!prepared && Math.abs(dx) % 7 > 3 && !s.blink) continue;
      const y = dome.ground - Math.sqrt(1 - (dx / dome.radiusX) ** 2) * dome.radiusY;
      rect(dome.center + dx, y, 1, 2, color);
    }
    ctx.restore();
  }],
  evento: ['Partículas, alerta e poeira', s => {
    {
      for (let index = 0; index < 2; index++) {
        const {x,y}=cargoPose(index,s);
        rect(x, y, 6, 6, s.dark);
        rect(x, y, 6, 1, s.base);
        rect(x, y, 1, 6, s.base);
        rect(x+5, y, 1, 6, s.base);
        rect(x, y+5, 6, 1, s.base);
        for (let n=1;n<5;n++) rect(x+n,y+n,1,1,s.base);
      }
    }
    if(state.leak && !(s.kind==='repair'&&s.progress>.65)) {
      const phase=(s.time%900)/900;
      rect(146-phase*8,64-phase*5,2,1,s.base);
    }
    if(['oxygen','power','research','observe','prepare','farm','airlock','repair','filter'].includes(s.kind)) {
      const glow=Math.sin(s.progress*Math.PI);
      rect(146,61,2,3,mix(s.base,'#FFCF72',glow));
      if(s.kind==='oxygen') for(let i=0;i<3;i++) {
        const rise=(s.time/700+i/3)%1;
        rect(144+i*3,61-rise*9,1,1,'#F3F3FF');
      }
      if(['observe','prepare'].includes(s.kind)&&s.blink) {
        rect(129,29,1,2,'#FFCF72');rect(134,27,2,1,'#FFCF72');
      }
    }
    if (s.emergency && s.progress >= .49 && s.progress < .55 && s.blink) {
      rect(179, 60, 3, 1, '#FFCF72');
      rect(181, 58, 1, 3, '#FFCF72');
    }
    if (s.kind === 'alert' && s.progress < .72 && s.blink) {
      poly([[183,36],[188,44],[178,44]], '#FFCF72');
      rect(183,39,1,2,s.sky);
      rect(183,42,1,1,s.sky);
    }
    if (s.kind === 'storm' && s.progress >= impactStart && s.progress < .766) {
      for (const [offset, spread, strength] of trails) {
        const p = between(s.progress, impactStart + offset * .05, .765);
        const endY = 43 + spread * 18;
        const domeEdge = dome.center - dome.radiusX * Math.sqrt(1 - ((dome.ground - endY) / dome.radiusY) ** 2);
        const blocked = s.protection && (shield.value === 'ready' || strength > .48);
        const destination = blocked ? domeEdge : shelterDoor;
        const x = lerp(s.sunX, destination, p);
        const y = lerp(s.sunY + (spread - .5) * 12, endY, p);
        rect(x, y, 2, 1, '#FFCF72');
      }
    }
    if (s.kind === 'meteors' && s.progress >= impactStart && s.progress < .756) {
      for (const [offset, spread] of trails.slice(0, 8)) {
        const p = between(s.progress, impactStart + offset * .04, .745);
        const x = 35 + spread * 155 + p * 32;
        const y = 6 + p * 62;
        if (p < .89) {
          rect(x-3,y-3,2,1,'#c99c9c');
          rect(x,y,2,2,'#FFE1A3');
        } else {
          const age = between(p,.89,1);
          rect(x-4-age*4,68-age*4,2,1,s.base);
          rect(x+3+age*4,68-age*3,2,1,s.base);
          rect(x-3,69,7,1,s.ground);
        }
      }
    }
  }]
};


function draw(){
  const clip=active,kind=clip?.kind||'idle';
  const raw=clip?between(clock,clip.start,clip.end):1;
  const progress=eventProgress(kind,raw);
  const eclipse=kind==='eclipse'?Math.max(0,1-Math.abs(progress-.5)*3):0;
  const h=state.hour;
  const noon=clamp((h-3)/9,0,1)*clamp((22-h)/9,0,1);
  const illumination=noon*(state.sun/4)*(1-eclipse*.92);
  const palette=h<14?palettes[1]:palettes[2];
  const [sky,dark,ground,base,sun]=palettes[0].map((c,i)=>mix(c,palette[i],illumination));
  const emergency=emergencies.has(kind);
  const door=emergency?Math.max(Math.min(between(progress,.37,.40),1-between(progress,.53,.55)),Math.min(between(progress,.59,.61),1-between(progress,.755,.77)))
    :kind==='intro'?1-between(progress,.01,.04):0;
  const protection=emergency&&shield.value!=='none'&&kind!=='meteors'?Math.min(between(progress,.59,.61),1-between(progress,.745,.77)):0;
  const scene={sky,dark,ground,base,sun,sunX:20+Math.round(h/4),sunY:43-Math.round(noon*(5+state.sun)),door,protection,emergency,kind,clip,progress,time:clock,starTime:clock,blink:reduceMotion.matches||Math.floor(clock/420)%2===0,lit:clamp(.82-illumination/2+eclipse/4,0,1)};
  ctx.clearRect(0,0,256,88);
  for(const [,drawLayer] of Object.values(layers)) drawLayer(scene);
  canvas.dataset.animation=kind;
  canvas.dataset.progress=progress.toFixed(3);
}
function finishClip(){
  if(active?.kind==='clean') state.dust=false;
  if(active?.kind==='repair') state.leak=false;
  active=null;
  const done=completion;completion=null;if(done)done();
}
function tick(now,token){
  if(!running||token!==loopId)return;
  if(lastNow!==null&&!document.hidden&&!reduceMotion.matches) clock+=Math.min(50,now-lastNow);
  lastNow=now;
  if(active&&clock>=active.end) { clock=active.end;finishClip(); }
  draw();requestAnimationFrame(next=>tick(next,token));
}
function begin(kind,options={}){
  shield.value=options.shield||'none';
  if(kind==='farm')state.farm=options.enabled;
  active={kind,start:clock,end:clock+durations[kind],origins:crew.map(p=>{const r=routinePose(p,clock);return [r.x,r.y];})};
  if(reduceMotion.matches) { clock=active.end;finishClip();draw();return Promise.resolve(); }
  return new Promise(resolve=>completion=resolve);
}
async function play(kind,options={}){
  const token=generation;
  if(active) {const old=completion;await new Promise(resolve=>completion=()=>{old?.();resolve();});}
  if(token!==generation)return;
  if(!durations[kind])throw new Error('Unknown scene: '+kind);
  await begin(kind,options);
}
function reset(){generation++;finishClip();state={day:1,hour:8,sun:3,dust:false,leak:false,power:true,farm:false};clock=0;lastNow=null;task=null;if(!running){running=true;const token=++loopId;requestAnimationFrame(now=>tick(now,token));}void begin('intro');}
function present(card){
  task=card?.id||null;
  if(task==='dust'||/^geminids|^quadrantids/.test(task||''))state.dust=true;
  if(task==='leak')state.leak=true;
}
function sync(game){state.day=game.day+1;state.sun=game.sun;state.hour=game.card?.kind==='day'?8:Math.min(20,9+(5-game.queue.length)*2);}
function stop(){generation++;loopId++;running=false;lastNow=null;finishClip();}
reduceMotion.addEventListener?.('change',()=>{
  if(reduceMotion.matches&&active){clock=active.end;finishClip();draw();}
});
return {play,reset,present,sync,stop,get snapshot(){return {...state,kind:active?.kind||'idle',task};}};

}};

// Map outcomes, not just card titles: declining a trip must never launch the hover.
window.LunarScene.actionsFor = out => {
  const id=out.card.id, right=out.side==='R';
  if(out.storm)return [{kind:'storm',shield:out.storm.mode}];
  if(id.startsWith('eclipse_'))return [{kind:'eclipse'}];
  if(/^(geminids|quadrantids)_/.test(id))return [{kind:'meteors'},...(right?[{kind:'clean'}]:[])];
  if(out.card.quiz||out.card.kind==='day'||out.card.kind==='result')return [];
  if(id==='flare')return [{kind:right?'prepare':'research'}];
  if(id==='farm')return [{kind:'farm',enabled:right}];
  if(!right)return [];
  const kinds={rover:'explore',roverAlert:'explore',cargo:'explore',ice:'sample',
    dust:'clean',leak:'repair',filter:'filter',airlock:'airlock',o2:'oxygen',reserveAir:'oxygen',
    reservePower:'power',lab:'research',signal:'research',scope:'observe',donki_x87_2024_05:'observe'};
  return kinds[id]?[{kind:kinds[id]}]:[];
};
