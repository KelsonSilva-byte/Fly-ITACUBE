import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let now=0, frames=[];
const ctx=new Proxy({}, {get:(t,p)=>t[p]??(()=>{}),set:(t,p,v)=>(t[p]=v,true)});
const canvas={getContext:()=>ctx,dataset:{}};
const motion={matches:false};
const context={window:{},document:{hidden:false},Image:class {complete=true;naturalWidth=24;},matchMedia:()=>motion,
 requestAnimationFrame:fn=>frames.push(fn),console};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../assets/scene/lunar-scene.js',import.meta.url),'utf8'),context);
const api=context.window.LunarScene,scene=api.create(canvas);
async function advance(ms){for(let i=0;i<Math.ceil(ms/20);i++){now+=20;const batch=frames;frames=[];batch.forEach(fn=>fn(now));await Promise.resolve();}}
const route=(id,side='R',extra={})=>api.actionsFor({card:{id},side,...extra}).map(x=>x.kind).join(',');
assert.equal(route('cargo'),'explore');assert.equal(route('cargo','L'),'');
const sci=(task)=>api.actionsFor({card:{id:'sci',kind:'sci'},side:'L',opt:{task}}).map(x=>x.kind).join(',');
for(const task of ['research','observe','explore','sample','power'])assert.equal(sci(task),task);
assert.equal(route('dust'),'clean');assert.equal(route('dust','L'),'');
assert.equal(route('flare'),'prepare');assert.equal(route('flare','L'),'research');
assert.equal(route('eclipse_2025_03','L'),'eclipse');
assert.equal(route('geminids_2024_12'),'meteors,clean');assert.equal(route('quadrantids_2025_01','L'),'meteors');
assert.equal(route('arriveReady','R',{storm:{mode:'ready'}}),'storm');
assert.equal(route('quiz_gravity','R',{card:{id:'quiz_gravity',quiz:true}}),'');
scene.reset();await advance(6600);assert.equal(scene.snapshot.kind,'idle');
scene.present({id:'dust'});assert.equal(scene.snapshot.dust,true);
let done=false;let promise=scene.play('clean').then(()=>done=true);await advance(1000);assert.equal(done,false);await advance(2200);await promise;assert.equal(scene.snapshot.dust,false);
scene.present({id:'leak'});promise=scene.play('filter');await advance(3200);await promise;assert.equal(scene.snapshot.leak,true);
promise=scene.play('repair');await advance(3200);await promise;assert.equal(scene.snapshot.leak,false);
for(const kind of ['storm','meteors','explore','sample','oxygen','prepare','observe','research','eclipse','power','airlock']) {
 promise=scene.play(kind,{shield:'ready'});await advance(22000);await promise;assert.equal(scene.snapshot.kind,'idle',kind);
}
promise=scene.play('farm',{enabled:true});await advance(2400);await promise;assert.equal(scene.snapshot.farm,true);
scene.sync({day:3,sun:1,card:{kind:'day'},queue:[]});assert.equal(scene.snapshot.day,4);assert.equal(scene.snapshot.sun,1);
scene.stop();motion.matches=true;scene.reset();await scene.play('explore');assert.equal(scene.snapshot.kind,'idle');scene.stop();
console.log('PASS: routes, completion, persistent dust/leak, shelter events, lighting, reduced motion.');
