(() => {
let TEXT = null;
const C = CONFIG, T = C.TILE;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
cv.width = C.VIEW_W; cv.height = C.VIEW_H; ctx.imageSmoothingEnabled = false;
const RES_OF = { pohon: 'kayu', batu: 'batu', semak: 'makanan' };
const SKILL_OF = { kayu: 'menebang', batu: 'menambang', makanan: 'meramu', bangun: 'membangun', bertani: 'bertani', air: 'meramu', riset: 'meneliti' };
const JOB_LABEL = { bangun: 'Membangun', makanan: 'Makanan', bertani: 'Bertani', air: 'Air', kayu: 'Kayu', batu: 'Batu', riset: 'Riset', jaga: 'Jaga', padam: 'Padam', rawat: 'Rawat', makam: 'Makam' };
const RES_LABEL = { kayu: 'Kayu', batu: 'Batu', makanan: 'Makanan', gandum: 'Gandum', air: 'Air', alat: 'Alat', kulit: 'Kulit', papan: 'Papan', batu_bata: 'Batu bata' };
const CAMP = C.CAMP;
let menuOpen = true;
let S, speed = 1, placing = null, mouse = { x: 0, y: 0 };

// ---------- RNG (seedable for map) ----------
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

function newGame() {
  const r = rng(12345);
  S = { t: 0, day: 1, res: { ...C.START_RES }, tiles: [], nodes: [], buildings: [], villagers: [], log: [],
        prio: { ...C.DEFAULT_PRIO }, nextId: 1, moodGoodDays: 0, lastSpawnDay: -99, nameIdx: 0 };
  // 0 = rumput, 1 = air, 2 = jembatan
  for (let y = 0; y < C.MAP_H; y++) { const row = []; const rx = C.RIVER_X + Math.round(Math.sin(y / 3) * 1.5);
    for (let x = 0; x < C.MAP_W; x++) row.push(x === rx || x === rx + 1 ? (C.BRIDGE_ROWS.includes(y) ? 2 : 1) : 0); S.tiles.push(row); }
  S.grassVar = Array.from({ length: C.MAP_H }, () => Array.from({ length: C.MAP_W }, () => r() < 0.12 ? 1 : 0));
  const cx = CAMP.x, cy = CAMP.y;
  const occ = (x, y) => S.tiles[y][x] !== 0 || Math.abs(x - cx) < 5 && Math.abs(y - cy) < 4 || S.nodes.some(n => n.x === x && n.y === y);
  const place = (type, n) => { for (let i = 0; i < n; i++) { let x, y, k = 0;
      do { x = Math.floor(r() * C.MAP_W); y = Math.floor(r() * C.MAP_H); } while (occ(x, y) && ++k < 200);
      if (k < 200) S.nodes.push({ type, x, y, amount: C.NODE_AMOUNT[RES_OF[type]], regrow: 0 }); } };
  place('pohon', 110); place('batu', 32); place('semak', 30);
  computeBanks(); marketInit();
  (C.START_BUILDINGS || []).forEach(([t, x, y]) => addBuilding(t, x, y, true));
  S.gathered = {}; S.era = 0; S.techDone = []; S.research = null; S.questIdx = 0; S.tutorialStep = 0; S.restUntil = 0; S.event = null;
  for (let i = 0; i < C.START_VILLAGERS; i++) spawnVillager(cx - 1 + i, cy + 1, true);
  log('Dua penduduk mendirikan perkemahan. Desa Mandiri dimulai!');
}
function addBuilding(type, x, y, done) {
  const b = { id: S.nextId++, type, x, y, done: !!done, progress: done ? C.BUILDINGS[type].work : 0, hp: 100 };
  if (type === 'ladang') { const crops = Object.keys(C.FIELD.crops); b.crop = crops[S.buildings.filter(o => o.type === 'ladang').length % crops.length]; b.stage = 'kosong'; b.grow = 0; }
  S.buildings.push(b);
}
// nama baru yang belum dipakai penduduk yang masih hidup (dari TEKS-GAME.json, fallback C.NAMES)
function freshName() { const names = TEXT && TEXT.penduduk ? TEXT.penduduk.map(p => p.nama) : C.NAMES, used = new Set(S.villagers.map(v => v.name));
  for (let i = 0; i < names.length; i++) { const n = names[(S.nameIdx + i) % names.length]; if (!used.has(n)) { S.nameIdx += i + 1; return n; } }
  return names[S.nameIdx++ % names.length] + ' ' + (S.villagers.length + 1); }
function spawnVillager(x, y, initial, forcedName) {
  const name = forcedName || freshName();
  S.villagers.push({ id: S.nextId++, name, age: 16 + Math.floor(Math.random() * 25), x, y, hunger: 80, energy: 90, mood: 70,
    health: 100, joined: S.day, skills: { menebang: 0, menambang: 0, meramu: 0, membangun: 0, bertani: 0, meneliti: 0 }, task: null, carry: null, color: S.villagers.length });
  if (!initial) log(`${name} bergabung dengan desa!`);
}
function log(msg) { S.log.unshift(`Hari ${S.day}: ${msg}`); S.log.length = Math.min(S.log.length, C.MAX_LOG); }

// ---------- helpers ----------
const dayFrac = () => (S.t % C.DAY_LENGTH_SEC) / C.DAY_LENGTH_SEC;
const isNight = () => { const f = dayFrac(); return f >= C.NIGHT_START || f < C.NIGHT_END; };
const center = b => { const d = C.BUILDINGS[b.type]; return { x: b.x + d.w / 2 - 0.5, y: b.y + d.h / 2 - 0.5 }; };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const done = t => S.buildings.filter(b => b.done && b.type === t);
function nearest(list, v, posf = o => o) { let best = null, bd = 1e9; for (const o of list) { const d = dist(posf(o), v); if (d < bd) { bd = d; best = o; } } return best; }
function storage(v) { const st = S.buildings.filter(b => b.done && C.BUILDINGS[b.type].storage); const l = st.length ? st : done('apiunggun'); return l.length ? nearest(l, v, center) : { camp: true }; }
const stPos = st => st.camp ? CAMP : center(st);
const capacity = () => done('gubuk').filter(b => (b.hp ?? 100) >= C.BUILDING_DAMAGE.noCapacityBelow).length * C.BUILDINGS.gubuk.kapasitas;
const foodTotal = () => S.res.makanan + (S.res.gandum || 0);
const season = () => C.SEASONS[Math.floor((S.day - 1) / C.SEASON_DAYS) % C.SEASONS.length];
const isWinter = () => season() === 'dingin';
const eraIndex = id => C.ERAS.findIndex(e => e.id === id);
const unlocked = type => eraIndex(C.BUILDINGS[type].era || 'perkemahan') <= (S.era | 0) &&
  techNodes().every(n => !n.efek.some(e => e.kunci === 'buka_bangunan' && e.nilai === type) || (S.techDone || []).includes(n.id));
// ---------- teknologi (data dari tech.js) ----------
let _techCache = null;
function techNodes() { if (_techCache) return _techCache; const T = window.TECH || { nodes: [] }, over = (TEXT && TEXT.teknologi) || [];
  _techCache = T.nodes.map(n => { const o = over.find(x => x.id === n.id) || {};
    return { ...n, nama: o.nama || n.nama, deskripsi: o.deskripsi || n.deskripsi, efek_ringkas: o.efek_ringkas, teks_selesai: o.teks_selesai, angka: n.deskripsi, efek: n.efek || [], prasyarat: n.prasyarat || [] }; });
  _techCache.forEach(n => n.efek.forEach(e => { if (!(e.kunci in (T.kunci || {}))) console.info(`[tech] kunci efek "${e.kunci}" (${n.id}) belum didukung, diabaikan.`); }));
  return _techCache; }
// nilai setelah efek tech selesai; ctx.b = bangunan (untuk kondisi seperti sumurDalam)
function techVal(kunci, base, ctx = {}) { let v = base;
  for (const n of techNodes()) { if (!(S.techDone || []).includes(n.id)) continue;
    for (const e of n.efek) { if (e.kunci !== kunci) continue;
      if (e.kondisi && e.kondisi.sumurDalam && !(ctx.b && done('sumur').some(w => dist(w, ctx.b) <= e.kondisi.sumurDalam))) continue;
      v = e.op === 'mult' ? v * e.nilai : e.op === 'set' ? e.nilai : v + e.nilai; } }
  return v; }
function techStatus(n) { const D = S.techDone || [];
  if (D.includes(n.id)) return { st: 'done' }; if (S.research && S.research.id === n.id) return { st: 'active' };
  const why = []; if (eraIndex(n.era || 'perkemahan') > (S.era | 0)) why.push(`Era ${C.ERAS[eraIndex(n.era)].nama}`);
  n.prasyarat.filter(id => !D.includes(id)).forEach(id => why.push(`Riset ${(techNodes().find(x => x.id === id) || {}).nama || id}`));
  const sy = n.syarat || {}; for (const [k, q] of Object.entries(sy.res || {})) if ((S.res[k] || 0) < q) why.push(`${RES_LABEL[k]} ≥ ${q}`);
  for (const [b, q] of Object.entries(sy.bangunan || {})) if (done(b).length < q) why.push(`${C.BUILDINGS[b].nama} ×${q}`);
  if (sy.pop && S.villagers.length < sy.pop) why.push(`Penduduk ≥ ${sy.pop}`);
  if (why.length) return { st: 'locked', why }; if (S.research) return { st: 'busy' };
  return { st: canAfford(n.biaya || {}) ? 'available' : 'poor' }; }
function startResearch(id) { const n = techNodes().find(x => x.id === id); if (!n || techStatus(n).st !== 'available') return false;
  for (const [k, q] of Object.entries(n.biaya || {})) S.res[k] -= q; S.research = { id, progress: 0 };
  log(`🔬 Riset dimulai: ${n.nama}. Penduduk berprioritas Riset akan mengerjakannya.`); techPanelUI(); return true; }
function researchTask(v) { if (!S.research) return null; const st = storage(v); return { kind: 'riset', target: stPos(st), techName: (techNodes().find(n => n.id === S.research.id) || {}).nama }; }
const foodPerDay = () => Math.max(1, S.villagers.length * C.SPAWN.foodPerDayPerPop * (isWinter() ? C.WINTER_HUNGER_MULT : 1));
const workMult = (v, sk) => (1 + (v.skills[sk] || 0) * 0.5 + (S.res.alat >= 1 ? C.TOOLS.bonus : 0)) * (v.sick ? C.SICKNESS.workMult : 1);
function computeBanks() { S.banks = [];
  for (let y = 0; y < C.MAP_H; y++) for (let x = 0; x < C.MAP_W; x++) if (S.tiles[y][x] === 0 &&
    [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => S.tiles[y + b] && S.tiles[y + b][x + a] === 1)) S.banks.push({ x, y }); }
const canAfford = cost => Object.entries(cost).every(([k, n]) => S.res[k] >= n);

// ---------- AI ----------
function chooseTask(v) {
  const st = storage(v);
  // 1. Lapar kritis
  if (v.hunger <= C.HUNGER_CRIT && foodTotal() > 0 && st) return { kind: 'makan', target: stPos(st) };
  // 2. Tidur kritis, sakit parah (istirahat), lalu tugas darurat (padam/rawat/jaga/makam), baru tidur malam biasa
  const bedTask = () => { const bed = nearest(done('gubuk'), v, center) || nearest(done('apiunggun'), v, center); return { kind: 'tidur', target: bed ? center(bed) : { x: v.x, y: v.y } }; };
  if (v.energy <= C.ENERGY_CRIT || v.sick && v.sick.lvl === 'parah') return bedTask();
  { const em = emergencyTask(v); if (em) return em; }
  if (v.goHome && isNight() && done('gubuk').length) return bedTask();
  if (v.energy <= C.ENERGY_CRIT || (isNight() && v.energy < C.SLEEP_AT_NIGHT_BELOW)) {
    const bed = nearest(done('gubuk'), v, center) || nearest(done('apiunggun'), v, center);
    return { kind: 'tidur', target: bed ? center(bed) : { x: v.x, y: v.y } };
  }
  if (S.t < S.restUntil) return { kind: 'diam', target: { ...CAMP }, timer: 5 };
  // 3. Darurat desa: makanan menipis
  const pop = S.villagers.length;
  if (foodTotal() < pop * 3) { const t = farmTask(v, true) || gatherTask(v, 'makanan'); if (t) return t; }
  if (S.res.air < pop * C.WATER.perDayPerPop) { const t = waterTask(v); if (t) return t; }
  // 4. Prioritas kerja (utility: prioritas, jarak, skill)
  let best = null, bs = -1e9;
  for (const job of Object.keys(S.prio)) { const p = S.prio[job]; if (!p || EMERG.includes(job)) continue;
    const t = job === 'bangun' ? buildTask(v) : job === 'bertani' ? farmTask(v) : job === 'air' ? waterTask(v) : job === 'riset' ? researchTask(v) : gatherTask(v, job); if (!t) continue;
    const full = job === 'air' ? S.res.air >= S.villagers.length * C.WATER.perDayPerPop * C.WATER_SURPLUS_DAYS : job === 'makanan' && foodTotal() >= S.villagers.length * C.SPAWN.foodDaysPerPop * C.SPAWN.foodPerDayPerPop * (C.FOOD_SURPLUS_FACTOR + techVal('surplus_makanan', 0));
    const capped = C.RES_SOFT_CAP[job] && S.res[job] >= C.RES_SOFT_CAP[job] * Math.max(1, S.villagers.length / 2);
    const sc = (v.fav === job ? C.FAV_TASK_BONUS : 0) + p * 10 - (full || capped ? C.FOOD_SURPLUS_PENALTY : 0) + (S.villagers.filter(o => o.task && o.task.res === job).length ? -4 : 0) - dist(v, t.target) * 0.3 + v.skills[SKILL_OF[job]] * 5;
    if (sc > bs) { bs = sc; best = t; } }
  if (best) return best;
  // 5. Fallback: meramu
  return gatherTask(v, 'makanan') || { kind: 'diam', target: { x: v.x + (Math.random() * 4 - 2), y: v.y + (Math.random() * 4 - 2) }, timer: 3 };
}
function gatherTask(v, res) {
  const taken = new Set(S.villagers.filter(o => o !== v && o.task && o.task.node).map(o => o.task.node));
  const nodes = S.nodes.filter(n => RES_OF[n.type] === res && n.amount > 0 && !taken.has(n) && !(n.unreachable > S.t));
  const n = nearest(nodes, v); return n ? { kind: 'kumpul', res, node: n, target: { x: n.x, y: n.y }, work: 0 } : null;
}
function buildTask(v) { const b = nearest(S.buildings.filter(b => !b.done || (b.hp ?? 100) < C.BUILDING_DAMAGE.repairBelow), v, center); return b ? { kind: 'bangun', b, target: center(b) } : null; }
function farmTask(v, harvestOnly) {
  const taken = new Set(S.villagers.filter(o => o !== v && o.task && o.task.kind === 'tani').map(o => o.task.b));
  const f = nearest(done('ladang').filter(b => !taken.has(b) && (b.stage === 'siap' || !harvestOnly && b.stage === 'kosong' && !isWinter() && !isFlooded(b.x, b.y))), v, center);
  return f ? { kind: 'tani', b: f, harvest: f.stage === 'siap', target: center(f), work: 0, res: 'bertani' } : null; }
function waterTask(v) {
  const w = nearest(done('sumur'), v, center);
  if (w) return { kind: 'air', src: 'sumur', target: { x: w.x, y: w.y + 0.6 }, work: 0, res: 'air' };
  const b = nearest(S.banks || [], v); return b ? { kind: 'air', src: 'sungai', target: { x: b.x, y: b.y }, work: 0, res: 'air' } : null; }

// ---------- A* pathfinding (8 arah, tanpa memotong sudut; air tidak bisa dilewati, jembatan bisa) ----------
const walkable = (x, y) => x >= 0 && y >= 0 && x < C.MAP_W && y < C.MAP_H && S.tiles[y][x] !== 1;
function nearestWalkable(x, y) { if (walkable(x, y)) return { x, y };
  for (let r = 1; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (walkable(x + dx, y + dy)) return { x: x + dx, y: y + dy };
  return null; }
function findPath(sx, sy, gx, gy, costFn) {
  const W = C.MAP_W, s0 = nearestWalkable(sx, sy), g0 = nearestWalkable(gx, gy); if (!s0 || !g0) return null;
  const start = s0.y * W + s0.x, goal = g0.y * W + g0.x;
  const g = new Map([[start, 0]]), came = new Map(), open = [[0, start]], closed = new Set();
  const h = i => { const dx = Math.abs(i % W - g0.x), dy = Math.abs((i / W | 0) - g0.y); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
  while (open.length) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
    const [, cur] = open.splice(bi, 1)[0]; if (cur === goal) break; if (closed.has(cur)) continue; closed.add(cur);
    const cx = cur % W, cy = cur / W | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy; if (!walkable(nx, ny)) continue;
      if (dx && dy && (!walkable(cx + dx, cy) || !walkable(cx, cy + dy))) continue;
      const n = ny * W + nx, ng = g.get(cur) + (dx && dy ? 1.414 : 1) * (costFn ? costFn(nx, ny) : 1);
      if (ng < (g.get(n) ?? 1e9)) { g.set(n, ng); came.set(n, cur); open.push([ng + h(n), n]); } }
    if (closed.size > 4000) return null;
  }
  if (!came.has(goal) && start !== goal) return null;
  const path = []; for (let c = goal; c !== start; c = came.get(c)) path.push({ x: c % W, y: c / W | 0 });
  return path.reverse();
}
// return true = sampai; false = masih jalan; null = tak terjangkau
function moveTo(v, tg, dt) {
  const key = Math.round(tg.x) + ',' + Math.round(tg.y);
  if (v.pathKey !== key) { v.pathKey = key; v.path = findPath(Math.round(v.x), Math.round(v.y), Math.round(tg.x), Math.round(tg.y));
    if (v.path) v.path.push({ x: tg.x, y: tg.y }); }
  if (!v.path) { v.moving = false; return null; }
  let step = (v.speed || C.VILLAGER_SPEED) * dt * (isFlooded(v.x, v.y) ? C.FLOOD.speedMult : 1);
  while (step > 0 && v.path.length) { const wp = v.path[0], d = dist(v, wp);
    if (d > 0.001) { const dx = wp.x - v.x, dy = wp.y - v.y; v.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); }
    if (d <= step) { v.x = wp.x; v.y = wp.y; step -= d; v.path.shift(); }
    else { v.x += (wp.x - v.x) / d * step; v.y += (wp.y - v.y) / d * step; step = 0; } }
  v.moving = v.path.length > 0;
  if (!v.moving) { v.pathKey = null; return true; } return false;
}

function updateVillager(v, dt) {
  const perSec = 1 / C.DAY_LENGTH_SEC;
  const hm = isWinter() ? Math.max(1, hungerMultNow() + techVal('lapar_dingin', 0)) : 1;
  v.hunger = Math.max(0, v.hunger - C.HUNGER_PER_DAY * hm * perSec * dt);
  if (v.health == null) v.health = 100;
  if (v.hunger <= 0) v.health -= C.HEALTH.starvePerDay * perSec * dt; else if (v.hunger > 50) v.health = Math.min(100, v.health + C.HEALTH.regenPerDay * perSec * dt);
  if (!(v.task && v.task.kind === 'tidur' && v.task.asleep)) v.energy = Math.max(0, v.energy - C.ENERGY_PER_DAY * perSec * dt);
  const fire = nearest(done('apiunggun'), v, center);
  if (fire && campfireLit() && dist(center(fire), v) < 4 * techVal('api_radius', 1)) v.mood = Math.min(100, v.mood + C.MOOD_CAMPFIRE_BONUS * dt); else if (inHut(v)) v.mood = Math.min(100, v.mood + C.MOOD_HOME_BONUS * dt); else v.mood -= C.MOOD_DECAY * dt * (isWinter() && S.res.kulit < S.villagers.length ? C.WINTER_MOOD_DECAY_MULT_NO_HIDE : 1);
  if (v.hunger < C.HUNGER_CRIT || v.energy < C.ENERGY_CRIT) v.mood -= C.MOOD_HUNGRY_PENALTY * dt;
  v.mood = Math.max(0, Math.min(v.traumaUntil >= S.day ? C.THREAT.wolf.traumaMoodCap : 100, v.mood));
  // interupsi kebutuhan kritis
  if (v.task && !['makan', 'tidur'].includes(v.task.kind) && (v.hunger <= C.HUNGER_CRIT && foodTotal() > 0 || v.energy <= C.ENERGY_CRIT)) { deposit(v, true); v.task = null; }
  if (!v.task) { v.task = chooseTask(v); const k = v.task.kind;
    if (k !== 'diam' && k !== 'setor' && (v._lastKind !== k || k === 'kumpul' && v._lastRes !== v.task.res)) vhist(v, TASK_TEXT(v.task));
    v._lastKind = k; v._lastRes = v.task.res; }
  const t = v.task;
  if (t.kind === 'setor') { const m = moveTo(v, t.target, dt); if (m) { deposit(v); v.task = null; } else if (m === null) { deposit(v, true); v.task = null; } return; }
  const mv = moveTo(v, t.target, dt);
  if (mv === null) { if (t.node) t.node.unreachable = S.t + 60; v.task = null; v.pathKey = null; return; }
  if (!mv) { v.working = false; return; }
  switch (t.kind) {
    case 'makan': { const per = C.EAT_RESTORE_PER_FOOD * (done('dapur').length ? 1 + techVal('dapur_bonus', C.KITCHEN_EAT_BONUS) : 1);
      let need = Math.ceil((100 - v.hunger) / per); const a = Math.min(need, S.res.makanan); S.res.makanan -= a; need -= a;
      const g = Math.min(need, S.res.gandum || 0); S.res.gandum -= g;
      v.hunger = Math.min(100, v.hunger + (a + g) * per); if (a) dstat('eaten', 'makanan', a); if (g) dstat('eaten', 'gandum', g); v.task = null; break; }
    case 'tidur': t.asleep = true; v.energy = Math.min(100, v.energy + C.SLEEP_REGEN_PER_SEC * dt * (v.sick ? C.SICKNESS.energyRegenMult : 1));
      if (v.energy >= 100 && !isNight() && !(v.sick && v.sick.lvl === 'parah') || v.hunger <= C.HUNGER_CRIT && foodTotal() > 0) v.task = null; if (v.sick && v.sick.lvl === 'parah' && v.energy >= 100 && t.asleep) { t.timerS = (t.timerS || 0) + dt; if (t.timerS > 20) v.task = null; } break;
    case 'kumpul': { const n = t.node; if (n.amount <= 0) { v.task = null; break; }
      v.dir = 2; v.working = true; t.work += dt * workMult(v, SKILL_OF[t.res]);
      if (t.work >= C.GATHER_TIME[t.res] * (t.res === 'kayu' && isRaining() ? FX().chopTimeMultRain : 1) / (t.res === 'makanan' && season() === 'gugur' ? FX().forageMult : 1)) { v.working = false; if (S.res.alat > 0) S.res.alat = Math.max(0, S.res.alat - C.TOOLS.wearPerHaul); const amt = Math.min(C.CARRY[t.res] + Math.round(techVal('carry_' + t.res, 0)), n.amount); n.amount -= amt;
        if (n.amount <= 0) n.regrow = n.type === 'semak' ? C.BUSH_REGROW_SEC : 0;
        v.skills[SKILL_OF[t.res]] += C.SKILL_GAIN; v.carry = { res: t.res, n: amt }; sfx(t.res === 'kayu' ? 'tebang' : t.res === 'batu' ? 'tambang' : 'klik');
        const st = storage(v); v.task = st ? { kind: 'setor', target: stPos(st) } : null; } break; }
    case 'bangun': { const b = t.b; if (b.done || !S.buildings.includes(b)) { v.task = null; break; }
      if (b.done) { b.hp = Math.min(100, (b.hp ?? 100) + C.BUILDING_DAMAGE.repairPerSec * dt * workMult(v, 'membangun')); v.working = true;
        if (b.hp >= 100) { log(`${v.name} selesai memperbaiki ${C.BUILDINGS[b.type].nama}.`); v.working = false; v.task = null; } break; }
      v.working = true; b.progress += dt * workMult(v, 'membangun');
      if (b.progress >= C.BUILDINGS[b.type].work) { b.done = true; v.skills.membangun += C.SKILL_GAIN * 5;
        log(`${v.name} selesai membangun ${C.BUILDINGS[b.type].nama}.`); vhist(v, `Selesai membangun ${C.BUILDINGS[b.type].nama}`); sfx('bangun'); dstat('built', C.BUILDINGS[b.type].nama, 1); v.working = false; v.task = null; } break; }
    case 'tani': { const b = t.b; if (!S.buildings.includes(b) || (t.harvest ? b.stage !== 'siap' : b.stage !== 'kosong')) { v.task = null; break; }
      v.working = true; t.work += dt * workMult(v, 'bertani');
      if (t.work >= (t.harvest ? C.FIELD.harvestTime : C.FIELD.plantTime * (season() === 'semi' ? FX().plantTimeMult : 1)) * techVal('tani_waktu', 1)) { v.working = false; v.skills.bertani += C.SKILL_GAIN;
        if (t.harvest) { const F = C.FIELD, res = F.crops[b.crop].res, n = Math.round((F.yieldMin + Math.random() * (F.yieldMax - F.yieldMin) + techVal('ladang_hasil', 0)) * (season() === 'panas' ? FX().yieldMult : 1));
          b.stage = 'kosong'; b.grow = 0; b.harvested = true; S.harvests = (S.harvests || 0) + 1; v.carry = { res, n }; vhist(v, `Memanen ${n} ${RES_LABEL[res].toLowerCase()}`); sfx('panen'); log(`${v.name} memanen ${n} ${RES_LABEL[res].toLowerCase()} dari ladang ${b.crop}.`);
          const st = storage(v); v.task = { kind: 'setor', target: stPos(st) }; }
        else { b.stage = 'tumbuh'; b.grow = 0; b.harvested = false; v.task = null; } } break; }
    case 'air': { v.working = true; t.work += dt * workMult(v, 'meramu');
      if (t.work >= (t.src === 'sumur' ? C.WATER.wellTime : C.WATER.riverTime)) { v.working = false;
        v.carry = { res: 'air', n: t.src === 'sumur' ? C.WATER.wellYield : C.WATER.riverYield }; v.task = { kind: 'setor', target: stPos(storage(v)) }; } break; }
    case 'diam': t.timer -= dt; if (t.timer <= 0) v.task = null; break;
    case 'padam': { if (!t.b.burning || !S.buildings.includes(t.b)) { v.working = false; v.task = null; break; } v.working = true; t.work += dt;
      if (t.work >= C.FIRE.actionSec) { doFireAction(v, t); v.working = false; v.task = null; } break; }
    case 'rawat': { const pt = vById(t.pid); if (!pt || !pt.sick || pt.sick.lvl !== 'parah') { v.task = null; break; } if (dist(v, pt) > 1.5) { t.target = { x: pt.x, y: pt.y }; break; }
      v.working = true; t.work += dt; if (t.work >= C.SICKNESS.careSeconds) { finishCare(v, t); v.working = false; v.task = null; } break; }
    case 'makam': { if (!S.buildings.includes(t.b)) { v.task = null; break; } v.working = true; t.work += dt * workMult(v, 'membangun');
      if (t.work >= (t.b.done ? 5 : C.BUILDINGS.makam.work)) { finishGrave(v, t); v.working = false; v.task = null; } break; }
    case 'jaga': { t.arrived = true; v.working = false; const w = S.wolf; if (!w || w.phase === 'usai' || !w.phase) { v.task = null; } break; }
    case 'riset': { const R = S.research; if (!R) { v.working = false; v.task = null; break; } const n = techNodes().find(x => x.id === R.id);
      v.working = true; R.progress += dt * workMult(v, 'meneliti');
      if (!t.t0) t.t0 = S.t; if (S.t - t.t0 > 20) { v.working = false; v.task = null; } // pilih ulang tiap 20 dtk
      if (R.progress >= n.work) { S.techDone.push(n.id); S.research = null; v.skills.meneliti = (v.skills.meneliti || 0) + C.SKILL_GAIN * 5;
        log(n.teks_selesai ? '🎓 ' + fill(n.teks_selesai, { nama: v.name }) : `🎓 ${v.name} menyelesaikan riset ${n.nama}!`); sfx('panen'); vhist(v, `Menyelesaikan riset ${n.nama}`); v.working = false; v.task = null; techPanelUI(); } break; }
  }
}
function deposit(v, drop) { if (v.carry) { if (!drop) { S.res[v.carry.res] += v.carry.n; S.gathered[v.carry.res] = (S.gathered[v.carry.res] || 0) + v.carry.n; dstat('gathered', v.carry.res, v.carry.n); notify(v.carry.res, v.carry.n, v); } v.carry = null; } }

const notes = [];
// notifikasi melayang: digabung per jenis sumber daya di dekatnya, maksimal C.MAX_NOTES
function notify(res, n, v) { const near = notes.find(o => o.res === res && Math.abs(o.x - v.x) < 3 && Math.abs(o.y - v.y) < 3 && o.life > 1);
  if (near) { near.n += n; near.life = 2; return; }
  if (notes.length >= (C.MAX_NOTES || 6)) notes.shift(); notes.push({ res, n, x: v.x, y: v.y, life: 2 }); }
const ROLE = { menebang: 'Penebang', menambang: 'Penambang', meramu: 'Peramu', membangun: 'Tukang', bertani: 'Petani', meneliti: 'Peneliti' };
function role(v) { const [k, n] = Object.entries(v.skills).sort((a, b) => b[1] - a[1])[0]; return n > 0 ? ROLE[k] : 'Pendatang'; }
const sfx = n => { if (window.AUDIO) window.AUDIO.sfx(n); };
// ---------- pasar & pedagang keliling ----------
const M = () => C.MARKET;
const FOODS = ['makanan', 'gandum'];
function marketInit() { S.priceMod = S.priceMod || Object.fromEntries(Object.keys(M().harga).map(k => [k, 1]));
  S.priceEvents = S.priceEvents || []; S.quotaUsed = S.quotaUsed || { jual: 0, beli: 0 }; S.trades = S.trades || 0;
  if (S.nextMerchantDay == null) S.nextMerchantDay = C.MERCHANT.firstDay; }
function addPriceEvent(side, items, pct, days) { S.priceEvents.push({ side, items, pct, until: S.day + days }); }
const merchantHere = () => !!(S.merchant && S.merchant.state === 'berdagang');
const marketOpen = () => merchantHere() || done('pasar').length > 0;
function quota() { const q = M().quota[C.ERAS[S.era | 0].id] || [25, 20]; return { jual: q[0], beli: q[1], sisaJual: Math.max(0, q[0] - S.quotaUsed.jual), sisaBeli: Math.max(0, q[1] - S.quotaUsed.beli) }; }
function foodSellMult() { const d = foodTotal() / foodPerDay(), m = M(); if (d <= m.foodSellSoftCapDays) return 1;
  return Math.max(m.foodSellMinMult, 1 - (1 - m.foodSellMinMult) * (d - m.foodSellSoftCapDays) / (m.foodSellFloorDays - m.foodSellSoftCapDays)); }
function priceOf(res, side) { const base = M().harga[res]; if (!base) return null; let p = base[side === 'jual' ? 0 : 1] * (S.priceMod[res] || 1);
  const sm = (M().musim[season()] || {})[side]; if (sm && sm[res]) p *= sm[res];
  let pct = 0; for (const e of S.priceEvents) if (e.side === side && e.items.includes(res)) pct += e.pct; p *= 1 + pct;
  if (side === 'beli' && merchantHere()) p *= 1 - M().merchantBuyDiscount;
  if (side === 'jual' && FOODS.includes(res)) p *= foodSellMult();
  return Math.max(0.1, p); }
// barter: berikan qty `give`, dapatkan `get` senilai (dibulatkan ke bawah)
function tradeQuote(give, qty, get) { qty = Math.max(0, Math.floor(qty)); const ps = priceOf(give, 'jual'), pb = priceOf(get, 'beli');
  if (!ps || !pb || give === get || !qty) return { ok: false, why: 'Pilih barang yang berbeda.' };
  const value = qty * ps, n = Math.floor(value / pb), q = quota(), P = (TEXT && TEXT.pasar && TEXT.pasar.transaksi) || {};
  const r = { ok: false, give, qty, get, n, value, cost: n * pb };
  if ((S.res[give] || 0) < qty) r.why = fill(P.kurang_stok || 'Stok {sumber_daya} tidak cukup.', { sumber_daya: RES_LABEL[give].toLowerCase(), jumlah: qty - Math.floor(S.res[give] || 0) });
  else if (n < 1) r.why = fill(P.nilai_kurang || 'Nilai belum cukup.', { sumber_daya: RES_LABEL[get].toLowerCase() });
  else if (value > q.sisaJual + 1e-9 || r.cost > q.sisaBeli + 1e-9) r.why = P.kuota_tidak_cukup || 'Melebihi kuota hari ini.';
  else r.ok = true;
  return r; }
function doTrade(give, qty, get) { const r = tradeQuote(give, qty, get); if (!marketOpen()) r.ok = false, r.why = (TEXT && TEXT.pasar && TEXT.pasar.belum_dibuka) || 'Pasar belum buka.';
  if (!r.ok) { log('🛒 ' + r.why); return r; }
  S.res[give] -= r.qty; S.res[get] = (S.res[get] || 0) + r.n; S.quotaUsed.jual += r.value; S.quotaUsed.beli += r.cost; S.trades++;
  const P = (TEXT && TEXT.pasar && TEXT.pasar.transaksi) || {};
  log('🛒 ' + fill(P.jual_berhasil || 'Terjual {jumlah} {sumber_daya}. Desa mendapat {jumlah2} {sumber_daya2}.', { jumlah: r.qty, sumber_daya: RES_LABEL[give].toLowerCase(), jumlah2: r.n, sumber_daya2: RES_LABEL[get].toLowerCase() }));
  sfx('koin'); return r; }
function marketNewDay() { const m = M();
  for (const k of Object.keys(S.priceMod)) S.priceMod[k] = Math.min(m.clamp[1], Math.max(m.clamp[0], S.priceMod[k] * (m.drift[0] + Math.random() * (m.drift[1] - m.drift[0]))));
  S.priceEvents = S.priceEvents.filter(e => e.until > S.day); S.quotaUsed = { jual: 0, beli: 0 };
  if (!S.merchant && S.day >= S.nextMerchantDay) spawnMerchant(); }
const DP = () => (TEXT && TEXT.dialog_pedagang) || {};
function spawnMerchant() { const row = C.BRIDGE_ROWS[C.MERCHANT.spawn.row] ?? CAMP.y, names = DP().nama_pedagang || ['Pak Darto'];
  S.merchant = { x: C.MERCHANT.spawn.x, y: row, home: { x: C.MERCHANT.spawn.x, y: row }, state: 'datang', name: pick(names), dir: 1, moving: true, id: 9999 };
  const ev = C.MERCHANT.everyDays; S.nextMerchantDay = S.day + ev[0] + Math.floor(Math.random() * (ev[1] - ev[0] + 1));
  log(`🔔 Pedagang keliling ${S.merchant.name} terlihat di seberang sungai.`); sfx('lonceng'); }
function updateMerchant(dt) { const m = S.merchant; if (!m) return; const k = C.MERCHANT.speed / C.VILLAGER_SPEED;
  if (m.state === 'datang') { const r = moveTo(m, { x: CAMP.x + 2, y: CAMP.y + 1 }, dt * k);
    if (r || r === null) { m.state = 'berdagang'; m.moving = false; m.leaveAt = S.t + C.MERCHANT.stayFrac * C.DAY_LENGTH_SEC; m.dir = 0;
      log('🧺 ' + fill(pick(DP().sapaan || ['{pedagang} datang!']), { pedagang: m.name })); sfx('lonceng'); } }
  else if (m.state === 'berdagang') { if (S.t >= m.leaveAt) { m.state = 'pergi'; log('👋 ' + fill(pick(DP().perpisahan || ['{pedagang} pamit.']), { pedagang: m.name })); } }
  else if (m.state === 'pergi') { const r = moveTo(m, m.home, dt * k); if (r || r === null) S.merchant = null; } }
// ---------- konten (TEKS-GAME.json) ----------
const BID = { api_unggun: 'apiunggun', gubuk: 'gubuk', gudang: 'gudang', ladang: 'ladang', sumur: 'sumur', dapur: 'dapur', bengkel_alat: 'bengkel', lumbung: 'lumbung', pasar: 'pasar', balai_desa: 'balai' }; // id JSON -> id internal
const pick = a => a[Math.floor(Math.random() * a.length)];
function fill(tpl, extra = {}) {
  const vs = S.villagers.length ? S.villagers : [{ name: 'Penduduk', age: 30 }], a = pick(vs), b = vs.find(v => v !== a) || a, m = TEXT.meta || {};
  const map = { hari: S.day, nama: a.name, nama2: b.name, umur: a.age, jumlah: 3 + Math.floor(Math.random() * 6),
    sumber_daya: pick(['kayu', 'batu', 'makanan']), bangunan: pick(Object.values(m.bangunan || { x: 'Gubuk' })),
    skill: pick(Object.values(m.skill || { x: 'menebang' })), musim: C.SEASON_NAMES[season()].toLowerCase(), pesan_musim: '', era: C.ERAS[S.era | 0].nama,
    jumlah2: 2 + Math.floor(Math.random() * 6), sumber_daya2: pick(['makanan', 'gandum', 'alat']), persen: 10, nilai: 1, kuota: 0, hari_sisa: 5,
    teknologi: S.research ? (techNodes().find(n => n.id === S.research.id) || {}).nama : 'ilmu baru', pencapaian: '', pedagang: (S.merchant && S.merchant.name) || 'Pedagang', hewan: 'serigala', sifat: 'yang baik hati', lama_tinggal: S.day - (a.joined ?? 1), tahun: Math.floor((S.day - 1) / C.YEAR_SCALE.daysPerYear) + 1, ...extra };
  return tpl.replace(/^Hari \{hari\}:\s*/, '').replace(/\{(\w+)\}/g, (_, k) => map[k] ?? k);
}
function flavorLog() { if (!TEXT || !TEXT.log_harian) return; const cats = ['kerja', 'sosial', 'temuan'].filter(c => TEXT.log_harian[c]);
  for (let i = 0; i < C.FLAVOR_LOG_PER_DAY && cats.length; i++) log(fill(pick(TEXT.log_harian[pick(cats)]))); }
const resKeyOf = k => ['buah', 'ikan', 'daging'].includes(k) ? 'makanan' : k;
// pilihan event bisa dipilih jika semua biaya sumber daya (efek negatif) tersedia
const affordable = ef => Object.entries(ef || {}).every(([k, n]) => n >= 0 || !(resKeyOf(k) in S.res) || S.res[resKeyOf(k)] >= -n);
function applyEffects(ef, src) {
  for (const [k, n] of Object.entries(ef || {})) {
    const resKey = resKeyOf(k);
    if (resKey in S.res) S.res[resKey] = Math.max(0, S.res[resKey] + n);
    else if (k === 'suasana_hati' || k === 'energi') S.villagers.forEach(v => v[k === 'energi' ? 'energy' : 'mood'] = Math.max(0, Math.min(100, v[k === 'energi' ? 'energy' : 'mood'] + n)));
    else if (k === 'penduduk') { if (n > 0) for (let i = 0; i < n; i++) spawnVillager(CAMP.x, CAMP.y + 1, false, i === 0 ? S.eventName : null);
      else for (let i = 0; i < -n && S.villagers.length > 1; i++) log(`${S.villagers.pop().name} meninggalkan desa.`); }
    else if (k === 'hari_kerja_hilang') S.restUntil = S.t + n * C.DAY_LENGTH_SEC;
    else if (k === 'progres_riset') { if (S.research) { const nd = techNodes().find(x => x.id === S.research.id); if (nd) S.research.progress = Math.min(nd.work - 0.01, S.research.progress + nd.work * n / 100); } }
    else if (k === 'harga_jual_pangan' || k === 'harga_beli_pangan') addPriceEvent(k === 'harga_jual_pangan' ? 'jual' : 'beli', ['makanan', 'gandum'], n / 100, C.MARKET.eventDays);
    else if (k === 'kesehatan') S.villagers.forEach(v => v.health = Math.max(1, Math.min(100, (v.health ?? 100) + n)));
    else if (k === 'kesehatan_satu') { const v = S.eventVictim && vById(S.eventVictim) || pick(S.villagers); if (v) { v.health = Math.max(1, Math.min(100, (v.health ?? 100) + n)); if (n < 0) v.injured = S.day; } }
    else if (k === 'pertumbuhan_ladang') S.buildings.filter(b => b.type === 'ladang' && b.stage === 'tumbuh').forEach(b => b.grow += n);
    else if (k === 'kesehatan_bangunan') { S.buildings.filter(b => b.done).forEach(b => b.hp = Math.max(0, Math.min(100, (b.hp ?? 100) + n)));
      if (n < 0) log(`Bangunan rusak ${-n}%. Tukang akan memperbaikinya.`); }
    else console.info(`[efek] kunci "${k}" belum didukung (${src}), diabaikan.`);
  }
}
// pilih event berbobot sesuai C.EVENT_RULES (musim, maks per tahun, cooldown)
function eventAllowed(e) { const r = (C.EVENT_RULES || {})[e.id] || {}, year = Math.floor((S.day - 1) / (C.SEASON_DAYS * C.SEASONS.length));
  if (r.musim && !r.musim.includes(season())) return false;
  if (e.musim && ![].concat(e.musim).includes(season())) return false;
  if (r.maksPerTahun && ((S.eventYearCount || {})[e.id + '@' + year] || 0) >= r.maksPerTahun) return false;
  if (r.cooldownHari && S.day - ((S.eventLastDay || {})[e.id] ?? -999) < r.cooldownHari) return false;
  return true; }
const eventWeight = e => { const r = (C.EVENT_RULES || {})[e.id]; return (r && r.bobot != null ? r.bobot : e.bobot ?? 1) * (e.id === 'panen_raya' && season() === 'gugur' ? C.SEASON_FX.gugur.panenRayaWeightMult : 1); };
const allEvents = () => !TEXT ? [] : [...(TEXT.event_acak || []), ...(TEXT.event_era_lanjut || []), ...(TEXT.event_musiman || [])];
const eventEraOk = e => !e.era || eraIndex(e.era) <= (S.era | 0);
function maybeEvent() { if (!TEXT || !TEXT.event_acak || S.day < C.EVENT_MIN_DAY || Math.random() > ((S.era | 0) >= 1 ? C.EVENT_CHANCE_PER_DAY_DUSUN : C.EVENT_CHANCE_PER_DAY)) return;
  const pool = allEvents().filter(e => eventEraOk(e) && eventAllowed(e)), total = pool.reduce((a, e) => a + eventWeight(e), 0); if (!total) return;
  let r = Math.random() * total, ev = pool[pool.length - 1]; for (const e of pool) { r -= eventWeight(e); if (r <= 0) { ev = e; break; } }
  const year = Math.floor((S.day - 1) / (C.SEASON_DAYS * C.SEASONS.length));
  S.eventLastDay = S.eventLastDay || {}; S.eventYearCount = S.eventYearCount || {}; S.eventCount = S.eventCount || {};
  S.eventLastDay[ev.id] = S.day; S.eventYearCount[ev.id + '@' + year] = (S.eventYearCount[ev.id + '@' + year] || 0) + 1; S.eventCount[ev.id] = (S.eventCount[ev.id] || 0) + 1;
  const em = M().eventMods[ev.id]; if (em) for (const [side, items] of Object.entries(em)) for (const [res, pct] of Object.entries(items)) addPriceEvent(side, [res], pct, M().eventDays);
  S.event = ev.id; showEvent(); }
const addsPop = ef => (ef && ef.penduduk) > 0;
const housingOk = ef => !addsPop(ef) || capacity() >= S.villagers.length + ef.penduduk;
function showEvent() { const e = allEvents().find(x => x.id === S.event); if (!e) { S.event = null; return; }
  // event pendatang: siapkan nama baru yang belum dipakai untuk {nama}
  if (e.pilihan.some(p => addsPop(p.efek)) && !S.eventName) { const keep = S.nameIdx; S.eventName = freshName(); S.nameIdx = keep; }
  const box = $('modal'); box.style.display = 'block'; sfx('event'); const nm = S.eventName ? { nama: S.eventName } : {};
  const noHouse = e.pilihan.some(p => addsPop(p.efek) && !housingOk(p.efek)) ? '<p style="color:#ffb36b">🏠 Tidak ada tempat kosong di gubuk — bangun Gubuk untuk menerima pendatang.</p>' : '';
  box.innerHTML = `<h3>${e.judul}</h3><p>${fill(e.deskripsi, nm)}</p>${noHouse}` + e.pilihan.map((p, i) => { const can = q => affordable(q.efek) && housingOk(q.efek), ok = can(p) || !e.pilihan.some(can) && i === e.pilihan.length - 1 && !addsPop(p.efek);
    const cost = Object.entries(p.efek || {}).map(([k, n]) => `${n > 0 ? '+' : ''}${n} ${RES_LABEL[resKeyOf(k)] || k.replace(/_/g, ' ')}`).join(', ');
    return `<button data-ev="${i}" ${ok ? '' : `disabled title="${housingOk(p.efek) ? 'Sumber daya tidak cukup' : 'Tidak ada tempat kosong di gubuk'}" style="opacity:.45"`}>${p.teks}</button> <small>(${cost})</small>`; }).join('<br>'); }
function chooseEvent(i) { const e = allEvents().find(x => x.id === S.event), p = e.pilihan[i];
  if (addsPop(p.efek) && !housingOk(p.efek)) { log(`${e.judul} — Tidak ada tempat untuk ${S.eventName || 'pendatang'}; ia melanjutkan perjalanan.`); }
  else { const nm = S.eventName ? { nama: S.eventName } : {}; applyEffects(p.efek, 'event ' + e.id); log(`${e.judul} — ${fill(p.teks_hasil || '', nm)}`); }
  dstat('events', e.judul, 1); S.eventChoices = S.eventChoices || {}; (S.eventChoices[e.id] = S.eventChoices[e.id] || [])[i] = ((S.eventChoices[e.id] || [])[i] || 0) + 1;
  S.event = null; S.eventName = null; $('modal').style.display = 'none'; checkAch(); }
const allQuests = () => !TEXT ? [] : [...(TEXT.quest_awal || []), ...(TEXT.quest_lanjutan || [])];
function quest() { return allQuests()[S.questIdx]; }
function questProgress(q) { const g = q.tujuan;
  switch (g.tipe) {
    case 'bangun': { const id = BID[g.target]; return id ? done(id).length : null; }
    case 'kumpulkan': return g.target in S.res ? (S.gathered[g.target] || 0) : null;
    case 'simpan': return g.target in S.res ? Math.floor(S.res[g.target]) : null;
    case 'capai_penduduk': return S.villagers.length;
    case 'riset': return g.target === 'semua' ? (S.techDone || []).length : ((S.techDone || []).includes(g.target) ? 1 : 0);
    case 'transaksi_pasar': return S.trades || 0;
    case 'panen': return S.harvests || 0;
    case 'simpan_pangan': return Math.floor(foodTotal());
    case 'hari_pangan': return Math.floor(foodTotal() / foodPerDay());
    case 'capai_hari': return S.day;
    case 'alami_event': return (S.eventCount || {})[g.target] || 0;
    case 'capai_era': { const i = eraIndex(g.target); return i < 0 ? null : ((S.era | 0) >= i ? g.jumlah || 1 : 0); }
    default: return null; } }
function checkQuest() { const q = quest(); if (!q) return; const pr = questProgress(q);
  if (pr === null) { console.info(`[quest] tujuan "${q.tujuan.tipe}:${q.tujuan.target}" belum didukung, dilewati.`); log(`Misi "${q.judul}" belum tersedia di versi ini, dilewati.`); S.questIdx++; return; }
  if (pr >= q.tujuan.jumlah) { applyEffects(q.hadiah, 'quest ' + q.id); log(`✅ Misi selesai: ${q.judul}. ${q.teks_selesai || ''}`); S.questIdx++; } }
function questUI() { const q = quest(); if (!q) return TEXT ? 'Semua misi selesai!' : '-'; const pr = questProgress(q) ?? 0;
  return `<b>${q.judul}</b><br>${q.deskripsi}<br>Progres: ${Math.min(pr, q.tujuan.jumlah)}/${q.tujuan.jumlah}`; }
// tutorial interaktif: sorot elemen target, lanjut saat pemain melakukan aksi atau klik Lanjut
const tutHook = i => { const t = TEXT && TEXT.tutorial && TEXT.tutorial[i]; const h = (C.TUTORIAL_HOOKS || [])[i] || {};
  return { target: (t && t.target) || h.target, aksi: (t && t.aksi) || h.aksi }; };
const AKSI_LABEL = { klik_penduduk: 'Klik salah satu penduduk', ubah_prioritas: 'Ubah salah satu prioritas kerja', taruh_bangunan: 'Taruh satu rencana bangunan', buka_riset: 'Buka panel Riset', ubah_kecepatan: 'Ubah kecepatan' };
function tutorialUI() { const t = TEXT && TEXT.tutorial && TEXT.tutorial[S.tutorialStep], el = $('tut');
  document.querySelectorAll('.tut-hl').forEach(x => x.classList.remove('tut-hl'));
  if (!t || menuOpen) { el.style.display = 'none'; return; } el.style.display = 'block';
  const h = tutHook(S.tutorialStep), tgt = h.target && document.querySelector(h.target); if (tgt) tgt.classList.add('tut-hl');
  el.innerHTML = `<small>Tutorial ${S.tutorialStep + 1}/${TEXT.tutorial.length}</small><br><b>${t.judul}</b><br>${t.teks}` +
    (h.aksi ? `<br><i>👉 ${AKSI_LABEL[h.aksi] || h.aksi}</i>` : '') + `<br><button id="tutNext">Lanjut</button> <button id="tutSkip">Lewati</button>`; }
// ---------- musim & ancaman (docs/RISET-MUSIM-ANCAMAN.md) ----------
// Teks dari TEKS-GAME v1.2 bila ada; selalu ada fallback bawaan.
function TX(path, extra = {}, fb = '') { let o = TEXT; for (const k of path.split('.')) o = o && o[k];
  if (o && !Array.isArray(o) && typeof o === 'object' && o.variasi) o = o.variasi;
  if (o && !Array.isArray(o) && typeof o === 'object' && o.teks) o = o.teks;
  if (Array.isArray(o)) o = o.length ? pick(o) : null;
  const s = typeof o === 'string' ? o : fb; return s && S.villagers.length ? fill(s, extra) : s.replace(/^Hari \{hari\}:\s*/, ''); }
const FX = () => C.SEASON_FX[season()] || {};
const year = () => Math.floor((S.day - 1) / C.YEAR_SCALE.daysPerYear) + 1;
const isY2 = () => year() >= 2;
const threatMult = () => isY2() ? C.YEAR_SCALE.threatChanceMult : 1;
const winterBuffer = () => isY2() ? C.YEAR_SCALE.winterBufferDays : C.WINTER_BUFFER_DAYS;
const rnd = (a, b) => a + Math.random() * (b - a), rndInt = (a, b) => Math.floor(rnd(a, b + 1));
const EMERG = ['jaga', 'padam', 'rawat', 'makam'];
const foodDays = () => foodTotal() / foodPerDay();
const isRaining = () => season() === 'semi' && S.rainDay === S.day;
const isExtreme = () => isWinter() && S.extremeDay === S.day;
const hungerMultNow = () => !isWinter() ? 1 : isExtreme() ? FX().extremeHungerMult : (done('lumbung').length ? C.GRANARY_WINTER_HUNGER_MULT : C.WINTER_HUNGER_MULT);
const inHut = v => v.task && v.task.kind === 'tidur' && v.task.asleep && done('gubuk').some(h => dist(center(h), v) < 1.6);
const campfireLit = () => !S.fireOut;
const torchLit = b => b.type === 'obor' && b.done && !b.unlit && (b.hp ?? 100) > 0;
const near = (type, p, r, f = b => b.done) => S.buildings.some(b => b.type === type && f(b) && dist(center(b), p) <= r);
const vById = id => S.villagers.find(v => v.id === id);
// ---- jenjang kelaparan ----
function famineLevel() { const F = C.FAMINE, d = foodDays();
  if (S.day <= F.graceDays) return foodTotal() <= 0 ? 'bahaya' : d < F.waspada ? 'waspada' : 'aman';
  if (foodTotal() <= 0 && d < F.kolaps) return 'kolaps'; if (d < F.kritis) return 'kritis'; if (d < F.bahaya) return 'bahaya'; if (d < F.waspada) return 'waspada'; return 'aman'; }
const FAMINE_COLOR = { aman: null, waspada: 'yellow', bahaya: 'orange', kritis: 'red', kolaps: 'red' };
function famineDaily() { const lv = famineLevel(), prev = S.famineLv || 'aman', ord = ['aman', 'waspada', 'bahaya', 'kritis', 'kolaps'];
  if (lv !== prev) { const worse = ord.indexOf(lv) > ord.indexOf(prev), d = Math.floor(foodDays());
    if (worse && lv !== 'aman') log('⚠️ ' + TX(`peringatan_dini.ancaman_kelaparan.tingkat.${lv === 'waspada' ? 'waspada' : 'bahaya'}.teks`, { hari_sisa: d },
      lv === 'waspada' ? `Stok pangan tinggal untuk ${d} hari. Saatnya mengutamakan makanan.` : 'Makanan hampir habis! Penduduk mulai lemas dan murung.'));
    if (!worse && lv === 'aman') log('😊 ' + TX('peringatan_dini.ancaman_kelaparan.tingkat.reda.teks', {}, 'Stok pangan kembali aman.')); }
  S.famineLv = lv;
  if (lv === 'bahaya' || lv === 'kritis' || lv === 'kolaps') S.villagers.forEach(v => v.mood = Math.max(0, v.mood + C.FAMINE.bahayaMoodPerDay));
  if (lv === 'kolaps' && !S.collapseShown) { S.collapseShown = true; showCollapse(); } if (lv === 'aman') S.collapseShown = false; }
function showCollapse() { const m = (TEXT && TEXT.jenjang_kelaparan && TEXT.jenjang_kelaparan.tingkat.kolaps.modal) || {};
  const box = $('modal'); box.style.display = 'block'; sfx('event');
  box.innerHTML = `<h3>${m.judul || 'Desa Kelaparan'}</h3><p>${m.teks || 'Lumbung kosong! Kumpulkan makanan sekarang.'}</p><button id="collapseOk">${m.tombol || 'Kumpulkan makanan sekarang'}</button>`; }
// ---- peringatan di layar ----
function warnings() { const W = [], J = (TEXT && TEXT.jenjang_kelaparan && TEXT.jenjang_kelaparan.tingkat) || {}, lv = famineLevel(), d = Math.floor(foodDays());
  if (FAMINE_COLOR[lv]) W.push({ k: 'hunger', c: FAMINE_COLOR[lv], t: fillSafe((J[lv] && J[lv].banner) || { waspada: 'Stok pangan tinggal {jumlah} hari.', bahaya: 'Stok pangan hanya {jumlah} hari!', kritis: 'Pangan kritis: {jumlah} hari lagi!', kolaps: 'Lumbung kosong! Desa kelaparan.' }[lv], { jumlah: d }),
    tip: J[lv] && J[lv].tooltip, lv });
  else if (season() === 'gugur' && foodDays() < winterBuffer() && (S.day - 1) % C.SEASON_DAYS + 1 >= FX().winterWarnFromDayInSeason) W.push({ k: 'hunger', c: 'yellow', t: `Stok dingin ${d}/${winterBuffer()} hari` });
  const wf = S.wolf; if (wf && wf.phase && wf.phase !== 'usai') W.push({ k: 'howl', c: { jejak: 'yellow', mendekat: 'orange', serang: 'red' }[wf.phase], t: { jejak: 'Jejak serigala', mendekat: 'Auman mendekat!', serang: 'Serigala menyerang!' }[wf.phase] });
  if (S.buildings.some(b => b.burning)) W.push({ k: 'fire', c: 'red', t: 'Kebakaran! Padamkan dengan air' });
  else if (S.fireRisk && S.fireRisk.phase === 'asap') W.push({ k: 'fire', c: 'yellow', t: 'Bau asap dari ' + C.BUILDINGS[(S.buildings.find(b => b.id === S.fireRisk.b) || { type: 'dapur' }).type].nama });
  if (S.flood) W.push({ k: 'flood', c: S.t >= S.flood.start ? 'orange' : 'yellow', t: S.t >= S.flood.start ? 'Air meluap di tepi sungai' : 'Sungai naik' });
  if (S.extremeDay === S.day + 1 && isWinter() || isExtreme()) W.push({ k: 'cold', c: isExtreme() ? 'orange' : 'yellow', t: isExtreme() ? 'Dingin ekstrem hari ini' : 'Angin membeku malam ini…' });
  if (S.fireOut && isWinter()) W.push({ k: 'cold', c: 'orange', t: 'Api unggun padam: kayu bakar habis' });
  if (S.drought && S.day <= S.drought.until) W.push({ k: 'flood', c: 'yellow', t: 'Kekeringan', ic: 'thermometer_hot' });
  return W; }
const fillSafe = (s, x) => S.villagers.length ? fill(s, x) : s.replace(/\{(\w+)\}/g, (_, k) => x[k] ?? k);
function warnUI() { const W = warnings();
  setHTML('warnbar', W.map(w => { const ic = w.k === 'cold' ? `${ASSETS.STATUS_DIR}status_thermometer_cold_16.png` : w.ic ? `${ASSETS.STATUS_DIR}status_${w.ic}_16.png` : `${ASSETS.WARN_DIR}warn_${w.k}_${w.c}.png`;
    return `<div class="warn w-${w.c}" title="${w.tip || ''}" data-warn="${w.k}"><img src="${ic}" alt="">${w.t}${w.lv === 'kritis' ? ' <small>(jeda & atur prioritas)</small>' : ''}</div>`; }).join('')); }
// ---- cuaca harian & musim ----
function seasonDaily() { const se = season(), dis = (S.day - 1) % C.SEASON_DAYS + 1, F = FX(), pop = S.villagers.length;
  if (dis === 1) { if (se === 'semi' && S.day > 1) log('🌱 ' + TX('musim_pembuka.musim_tahun_baru', { tahun: year() }, `Tahun ke-${year()} dimulai.`));
    log({ semi: '🌱', panas: '☀️', gugur: '🍂', dingin: '❄️' }[se] + ' ' + TX('musim_pembuka.musim_' + se, { tahun: year() }, { semi: 'Musim semi — saatnya menanam sebelum hujan deras.', panas: 'Musim panas datang. Jaga stok air!', gugur: 'Musim gugur tiba. Waktunya panen dan menyimpan bekal.', dingin: 'Musim dingin datang. Api unggun butuh kayu bakar.' }[se]));
    if (se === 'semi') { S.floodDone = false; S.droughtDone = false; } }
  // semi: hujan ringan & banjir kecil
  if (se === 'semi') { if (Math.random() < F.rainChance) { S.rainDay = S.day; S.villagers.forEach(v => v.mood = Math.min(100, v.mood + F.rainMoodPerDay)); log('🌧️ ' + TX('musim_pembuka.musim_semi_hujan', {}, 'Hujan rintik turun.')); }
    if (!S.floodDone && Math.random() < F.floodChance * threatMult()) startFlood(); }
  // panas: kekeringan & risiko api
  if (se === 'panas') {
    if (!S.droughtDone && Math.random() < F.droughtChance * threatMult()) { S.droughtDone = true; S.drought = { until: S.day + F.droughtDays - 1 };
      const safe = S.res.air >= pop * C.WATER.perDayPerPop * F.waterMult * F.droughtWaterSafeDays;
      log('☀️ ' + TX('peringatan_dini.ancaman_kekeringan.tingkat.' + (safe ? 'waspada' : 'bahaya') + '.teks', { hari_sisa: Math.floor(S.res.air / Math.max(1, pop)) }, 'Kekeringan! Stok air menipis.'));
      if (!safe) { const fs = S.buildings.filter(b => b.type === 'ladang' && b.stage === 'tumbuh'); fs.forEach(b => b.grow -= F.droughtGrowDelay);
        if (fs.length) log(TX('log_ancaman.kekeringan_ladang', {}, 'Ladang kehausan. Tanaman tumbuh lebih lambat.')); } }
    const risky = S.buildings.filter(b => b.done && (b.type === 'dapur' || b.type === 'bengkel') && !b.burning && (b.hp ?? 100) > 0);
    if (risky.length && !S.fireRisk && Math.random() < F.fireNightChance * threatMult()) S.fireRisk = { day: S.day, b: pick(risky).id, phase: 'menunggu' }; }
  // gugur: hitung mundur ke dingin & syukur
  if (se === 'gugur') { const d = Math.floor(foodDays()), buf = winterBuffer();
    if (dis >= F.winterWarnFromDayInSeason) log((d >= buf ? '🍂 ' : '⚠️ ') + TX('musim_pembuka.musim_gugur_menuju_dingin', { hari_sisa: C.SEASON_DAYS - dis + 1, jumlah: d, jumlah2: buf }, `Sisa ${C.SEASON_DAYS - dis + 1} hari sebelum dingin. Stok ${d}/${buf} hari.`) + (d < buf ? ' ' + TX('musim_pembuka.musim_gugur_stok_kurang', {}, '') : ''));
    if (dis === C.SEASON_DAYS && d >= F.thanksFoodDays) { S.villagers.forEach(v => v.mood = Math.min(100, v.mood + F.thanksMood)); log('🙏 ' + TX('musim_pembuka.musim_gugur_syukur', {}, 'Lumbung penuh sebelum salju. Syukuran kecil!')); } }
  // dingin: kayu bakar & pakaian
  if (se === 'dingin') { const fires = done('apiunggun').length, need = Math.ceil(fires * F.campfireWoodPerDay * techVal('api_kayu_bakar', 1) * 10) / 10;
    if (fires) { if (S.res.kayu >= need) { S.res.kayu -= need; if (S.fireOut) log('🔥 Api unggun menyala lagi.'); S.fireOut = false; if (dis === 1) log('🪵 ' + TX('musim_pembuka.musim_dingin_kayu_bakar', {}, `Api unggun memakai ${need} kayu bakar per hari di musim dingin.`)); }
      else { S.res.kayu = 0; if (!S.fireOut) log('⚠️ ' + TX('log_ancaman.kayu_bakar_habis', {}, 'Kayu bakar habis! Api unggun meredup.')); S.fireOut = true; } }
    if (S.extremeDay === S.day - 1) log('🌤️ ' + TX('peringatan_dini.ancaman_dingin_ekstrem.tingkat.reda.teks', {}, 'Angin beku sudah reda.')); }
  else S.fireOut = false;
  // obor: 1 kayu tiap 2 malam per obor
  if (S.day % C.THREAT.wolf.torchWoodPerNights === 0) for (const b of S.buildings.filter(b => b.type === 'obor' && b.done)) {
    if (S.res.kayu >= 1) { S.res.kayu -= 1; if (b.unlit) log(TX('bangunan_ancaman.bangunan_obor.diisi', {}, 'Obor diisi kayu dan menyala lagi.')); b.unlit = false; }
    else if (!b.unlit) { b.unlit = true; log('🕯️ ' + TX('bangunan_ancaman.bangunan_obor.padam', { bangunan: 'desa' }, 'Sebuah obor padam. Tambahkan kayu.')); } } }
// dipanggil tiap step: transisi dalam hari (sore/malam)
function seasonStep(dt) { const f = dayFrac();
  // dingin ekstrem: diumumkan sore sebelumnya
  if (isWinter() && f >= 0.7 && S.extremeRolled !== S.day) { S.extremeRolled = S.day;
    if (Math.random() < FX().extremeChance + (isY2() ? C.YEAR_SCALE.extremeChanceAdd : 0) && (S.day % C.SEASON_DAYS) !== 0) { S.extremeDay = S.day + 1;
      log('🥶 ' + TX('peringatan_dini.ancaman_dingin_ekstrem.tingkat.waspada.teks', {}, 'Angin membeku malam ini… Besok akan sangat dingin.')); } }
  // dingin ekstrem: mood turun lebih cepat jauh dari api/rumah
  // dingin: pakaian (kulit >= penduduk atau T13) — mood turun saat di luar & jauh dari api
  if (isWinter()) { const clothed = S.res.kulit >= S.villagers.length || (S.techDone || []).includes('T13'), r = FX().clothesMoodPerDay[clothed ? 'dengan' : 'tanpa'] / C.DAY_LENGTH_SEC;
    for (const v of S.villagers) if (!inHut(v) && !(campfireLit() && done('apiunggun').some(b => dist(center(b), v) < 4))) v.mood = Math.max(0, v.mood + r * dt); }
  if (isExtreme()) for (const v of S.villagers) { const warm = inHut(v) || done('apiunggun').some(b => dist(center(b), v) < 4) && campfireLit();
    if (!warm) v.mood = Math.max(0, v.mood - C.MOOD_DECAY * (FX().extremeMoodDecayMult - 1) * dt); }
  if (S.flood && S.t >= S.flood.end) endFlood();
  if (S.flood && S.t >= S.flood.start && !S.flood.applied) applyFlood();
  fireStep(dt); wolfStep(dt); }
// ---- banjir kecil (semi) ----
function floodTiles() { if (S._floodSet) return S._floodSet; const set = new Set(), N = C.FLOOD.cols;
  for (let y = 0; y < C.MAP_H; y++) for (let x = 0; x < C.MAP_W; x++) if (S.tiles[y][x] === 0) for (let d = 1; d <= N; d++)
    if ((S.tiles[y][x - d] === 1) || (S.tiles[y][x + d] === 1)) { set.add(y * C.MAP_W + x); break; }
  return S._floodSet = set; }
const isFlooded = (x, y) => S.flood && S.t >= S.flood.start && floodTiles().has(Math.round(y) * C.MAP_W + Math.round(x));
function startFlood() { S.floodDone = true; const dur = C.FLOOD.durationDays * techVal('banjir_durasi', 1) * C.DAY_LENGTH_SEC;
  S.flood = { start: S.t + 0.1 * C.DAY_LENGTH_SEC, end: S.t + 0.1 * C.DAY_LENGTH_SEC + dur };
  log('🌊 ' + TX('peringatan_dini.ancaman_banjir.tingkat.waspada.teks', {}, 'Sungai naik. Air mungkin meluap ke tepian.')); sfx('event'); }
function applyFlood() { S.flood.applied = true; const fs = S.buildings.filter(b => b.type === 'ladang' && floodTiles().has(b.y * C.MAP_W + b.x));
  if (techVal('banjir_ladang', 1) > 0) fs.forEach(b => { if (b.stage === 'tumbuh') b.grow -= C.FLOOD.growDelayDays; });
  log('🌊 ' + TX('peringatan_dini.ancaman_banjir.tingkat.bahaya.teks', {}, 'Sungai meluap ke tepian. Jalan di dekat air jadi becek.'));
  if (fs.length) log(TX('log_ancaman.banjir_ladang', {}, 'Air menggenangi ladang di tepi sungai.')); }
function endFlood() { S.flood = null; log('🌤️ ' + TX('peringatan_dini.ancaman_banjir.tingkat.reda.teks', {}, 'Air sungai kembali tenang.')); }
// ---- kebakaran (panas) ----
const bname = b => C.BUILDINGS[b.type].nama;
function ignite(b) { const F = C.FIRE; b.burning = { target: rnd(F.hpLoss[0], F.hpLoss[1]), lost: 0, actions: 0, need: rndInt(F.actionsToPut[0], F.actionsToPut[1]), nextSpread: S.t + F.spreadSec };
  log('🔥 ' + TX('log_ancaman.kebakaran_menyala', { bangunan: bname(b) }, `Api menyala di ${bname(b)}!`)); sfx('event');
  if (C.BUILDINGS[b.type].storage && Math.random() < F.stockLossChance) { const n = Math.floor(S.res.makanan * F.stockLossFrac); S.res.makanan -= n;
    if (n) log(TX('log_ancaman.kebakaran_rugi', { bangunan: bname(b), jumlah: n, sumber_daya: 'makanan' }, `Sebagian isi ${bname(b)} terbakar: ${n} makanan hilang.`)); }
  // bangunkan penduduk yang tidur (kecuali sangat lelah) untuk memadamkan
  S.villagers.forEach(v => { if (v.task && v.task.kind === 'tidur' && v.energy > C.ENERGY_CRIT) v.task = null; }); }
function fireStep(dt) { const F = C.FIRE, f = dayFrac(), R = S.fireRisk;
  if (R && R.day === S.day) { const b = S.buildings.find(x => x.id === R.b);
    if (!b) S.fireRisk = null;
    else if (R.phase === 'menunggu' && f >= F.smokeStartFrac) { R.phase = 'asap'; log('💨 ' + TX('peringatan_dini.ancaman_kebakaran.tingkat.waspada.teks', { bangunan: bname(b) }, `Bau asap aneh dari ${bname(b)}…`)); }
    else if (R.phase === 'asap' && f >= F.smokeStartFrac + F.smokeFrac) { R.phase = 'api'; ignite(b); } }
  else if (R && R.day !== S.day && R.phase !== 'api') S.fireRisk = null;
  let any = false;
  for (const b of S.buildings) { const B = b.burning; if (!B) continue; any = true;
    const d = Math.min(F.hpLossPerSec * dt, B.target - B.lost); B.lost += d; b.hp = Math.max(0, (b.hp ?? 100) - d);
    if (B.lost >= B.target || b.hp <= 0) { b.burning = null; log(`${bname(b)} habis terbakar sebagian. Tukang akan memperbaikinya.`); continue; }
    if (!b.firebreak && S.t >= B.nextSpread) { B.nextSpread = S.t + F.spreadSec;
      const nb = S.buildings.find(o => o !== b && o.done && !o.burning && (o.hp ?? 100) > 0 && o.type !== 'ladang' && boxDist(o, b) <= F.spreadRadius);
      if (nb) ignite(nb); } }
  if (R && R.phase === 'api' && !any) { S.fireRisk = null; } }
function boxDist(a, b) { const A = C.BUILDINGS[a.type], B = C.BUILDINGS[b.type];
  const dx = Math.max(0, a.x - (b.x + B.w - 1), b.x - (a.x + A.w - 1)), dy = Math.max(0, a.y - (b.y + B.h - 1), b.y - (a.y + A.h - 1)); return Math.max(dx, dy); }
function fireTask(v) { const bs = S.buildings.filter(b => b.burning); if (!bs.length) return null; const b = nearest(bs, v, center);
  if (S.res.air >= C.FIRE.waterPerAction) return { kind: 'padam', b, target: center(b), work: 0 };
  if (!b.firebreak && S.res.kayu >= C.FIRE.firebreakKayu) return { kind: 'padam', b, target: center(b), work: 0, sekat: true };
  return null; }
function doFireAction(v, t) { const b = t.b, F = C.FIRE; if (!b.burning) return;
  if (t.sekat) { if (S.res.kayu < F.firebreakKayu) return; S.res.kayu -= F.firebreakKayu; b.firebreak = true; log(TX('log_ancaman.kebakaran_sekat', { bangunan: bname(b), nama: v.name }, `Air habis! Penduduk membuat sekat (−${F.firebreakKayu} kayu) agar api tidak merembet.`)); return; }
  if (S.res.air < F.waterPerAction) return; S.res.air -= F.waterPerAction; b.burning.actions++;
  if (b.burning.actions >= b.burning.need) { b.burning = null; const o = S.villagers.find(x => x !== v) || v;
    log('💧 ' + TX('log_ancaman.kebakaran_padam', { bangunan: bname(b), nama: v.name, nama2: o.name }, `${v.name} berhasil memadamkan api di ${bname(b)}.`)); } }
// ---- serigala malam ----
function wolfDaily() { const W = C.THREAT.wolf; if (S.wolf && ['mendekat', 'serang'].includes(S.wolf.phase)) return;
  S.wolf = null; let ch = W.baseNightChance * threatMult() * (isWinter() ? W.winterMult : 1);
  if (Math.random() < ch) S.wolf = { day: S.day, phase: null, tracksOnly: (S.era | 0) < eraIndex(W.minEra), spawned: false, scared: {} }; }
function wolfStep(dt) { const W = C.THREAT.wolf, w = S.wolf; S.wolves = S.wolves || [];
  if (w) { const f = dayFrac(), eve = w.day === S.day, morn = S.day === w.day + 1;
    if (eve && !w.phase && f >= C.NIGHT_START - W.warnHoursBefore) { w.phase = 'jejak'; placeTracks();
      log('🐾 ' + TX('log_ancaman.serigala_jejak', {}, 'Ada jejak serigala di tepi hutan. Auman jauh terdengar…')); }
    if (eve && w.phase === 'jejak' && f >= C.NIGHT_START) { w.phase = 'mendekat'; sfx('lolong');
      log('🐺 ' + TX('log_ancaman.serigala_mendekat', {}, 'Lolongan serigala makin dekat. Penduduk bergegas pulang.'));
      // penduduk di luar cenderung pulang (60%)
      if (done('gubuk').length) S.villagers.forEach(v => { if (!(v.task && v.task.kind === 'tidur') && !EMERG.includes(v.task && v.task.kind) && Math.random() < 0.6) { deposit(v, false); v.goHome = true; v.task = null; } }); }
    if (eve && w.phase === 'mendekat' && f >= W.attackFrac[0] && f < W.attackFrac[1] && !w.spawned) { w.spawned = true;
      if (w.tracksOnly) { log('🐾 Serigala hanya mengintai dari jauh malam ini.'); }
      else { w.phase = 'serang'; const n = rndInt(W.count[0], W.count[1]); for (let i = 0; i < n; i++) spawnWolf(); } }
    if (morn && f >= C.NIGHT_END && w.phase !== 'usai') { w.phase = 'usai'; S.wolves.forEach(o => o.mode = 'pergi'); S.villagers.forEach(v => v.goHome = false);
      log('🌅 ' + TX('log_ancaman.serigala_usai', {}, 'Fajar menyingsing. Serigala sudah kembali ke hutan.')); }
    if (S.day > w.day + 1) S.wolf = null; }
  for (const o of S.wolves) updateWolf(o, dt);
  S.wolves = S.wolves.filter(o => !o.gone);
  if (S.tracks) S.tracks = S.tracks.filter(t => S.t - t.t < C.DAY_LENGTH_SEC); }
function placeTracks() { S.tracks = S.tracks || []; const side = rndInt(0, 3), n = 4 + rndInt(0, 3);
  for (let i = 0; i < n; i++) { const a = rnd(5, side % 2 ? C.MAP_H - 5 : C.MAP_W - 5);
    const p = [{ x: a, y: 1 + i }, { x: C.MAP_W - 2 - i, y: a }, { x: a, y: C.MAP_H - 2 - i }, { x: 1 + i, y: a }][side]; S.tracks.push({ x: Math.round(p.x), y: Math.round(p.y), t: S.t, dir: side }); } }
const outside = v => !inHut(v);
function spawnWolf() { const tg = S.villagers.filter(outside); const t0 = tg.length ? pick(tg) : pick(S.villagers); if (!t0) return;
  const edges = [{ x: t0.x, y: 0 }, { x: C.MAP_W - 1, y: t0.y }, { x: t0.x, y: C.MAP_H - 1 }, { x: 0, y: t0.y }];
  let e = edges.reduce((a, b) => dist(a, t0) < dist(b, t0) ? a : b); const s = nearestWalkable(Math.round(e.x), Math.round(e.y)) || { x: 0, y: 0 };
  S.wolves.push({ id: S.nextId++, x: s.x, y: s.y, mode: 'jalan', target: null, dir: 0, variant: rndInt(0, 1), repath: 0, path: null, home: { ...s } }); }
const fenceAt = (x, y) => S.buildings.some(b => b.type === 'pagar' && b.done && b.x === x && b.y === y);
const wolfCost = (x, y) => fenceAt(x, y) ? C.THREAT.wolf.fencePathMult : 1;
function updateWolf(o, dt) { const W = C.THREAT.wolf;
  if (o.mode === 'serang') { o.t += dt; if (o.t >= 0.5 && !o.bit) { o.bit = true; biteVillager(o, vById(o.target)); } if (o.t >= 0.9) o.mode = 'pergi'; return; }
  let goal;
  if (o.mode === 'pergi') goal = o.home;
  else { const cands = S.villagers.filter(outside); if (!cands.length) { o.mode = 'pergi'; goal = o.home; }
    else { const v = nearest(cands, o); o.target = v.id; goal = v;
      // menara jaga yang dijaga mengusir serigala dalam radius
      for (const tw of done('menara_jaga')) { const c = center(tw); if (dist(c, o) > W.towerRadius || (S.wolf && (S.wolf.scared[tw.id] || 0) >= W.towerScarePerNight)) continue;
        const guard = S.villagers.find(g => g.task && g.task.kind === 'jaga' && g.task.b === tw && g.task.arrived); if (!guard) continue;
        if (S.wolf) S.wolf.scared[tw.id] = (S.wolf.scared[tw.id] || 0) + 1; o.mode = 'pergi';
        log('📯 ' + TX('bangunan_ancaman.bangunan_menara_jaga.usir', { nama: guard.name }, `Dari Menara jaga, ${guard.name} meniup terompet. Serigala lari ke hutan.`)); return; }
      if (dist(o, v) <= W.hitRange) { o.mode = 'serang'; o.t = 0; o.bit = false; const dx = v.x - o.x, dy = v.y - o.y; o.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); return; } } }
  o.repath -= dt; const key = Math.round(goal.x) + ',' + Math.round(goal.y);
  if (!o.path || o.repath <= 0 || o.pathKey !== key) { o.repath = 1; o.pathKey = key; o.path = findPath(Math.round(o.x), Math.round(o.y), Math.round(goal.x), Math.round(goal.y), wolfCost) || [];
    o.path.push({ x: goal.x, y: goal.y }); }
  let step = W.speed * dt * (fenceAt(Math.round(o.x), Math.round(o.y)) ? W.fenceSpeedMult : 1); o.moving = false;
  while (step > 0 && o.path.length) { const wp = o.path[0], d = dist(o, wp); o.moving = true;
    if (d > 0.001) { const dx = wp.x - o.x, dy = wp.y - o.y; o.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); }
    if (d <= step) { o.x = wp.x; o.y = wp.y; step -= d; o.path.shift(); } else { o.x += (wp.x - o.x) / d * step; o.y += (wp.y - o.y) / d * step; step = 0; } }
  if (o.mode === 'pergi' && dist(o, o.home) < 0.6) o.gone = true; }
function biteVillager(o, v) { const W = C.THREAT.wolf; if (!v || !S.villagers.includes(v) || !outside(v)) return;
  let hit = 1; const torch = S.buildings.some(b => torchLit(b) && dist(center(b), v) <= W.torchSafeRadius); if (torch) hit *= W.torchHitMult;
  if (Math.random() >= hit) { log('🔥 ' + TX('log_ancaman.diusir', { nama: v.name }, 'Cahaya obor membuat serigala ragu. Mereka berbalik ke hutan.')); return; }
  const dmg = Math.round(rnd(W.damage[0], W.damage[1])); v.health = Math.max(isY2() ? 0.5 : 1, (v.health ?? 100) - dmg); v.mood = Math.max(0, v.mood - W.moodHit); v.lastHurt = 'serangan'; v.injured = S.day;
  S.wolfBites = (S.wolfBites || 0) + 1; sfx('event');
  log('🐺 ' + TX('log_ancaman.serangan_serigala', { nama: v.name }, `Seekor serigala menerkam ${v.name}! Kesehatannya turun ${dmg}.`));
  if (Math.random() < W.traumaChance) { v.traumaUntil = S.day + W.traumaDays; log(TX('log_ancaman.trauma', { nama: v.name }, `${v.name} masih teringat malam serangan itu.`)); }
  const guarded = near('menara_jaga', v, W.killSafeRadius) || near('pagar', v, W.killSafeRadius);
  if (isY2() && v.health < W.killHpBelow && !guarded && Math.random() < W.killChanceIfLowHp) { killVillager(v, 'serangan'); return; }
  if (v.health < C.SICKNESS.severeFromHpBelow) makeSick(v, 'parah', 'serangan'); else log(TX('log_ancaman.luka', { nama: v.name }, `${v.name} terluka dan harus beristirahat.`));
  v.task = null; }
// ---- sakit ----
function makeSick(v, lvl, cause) { const K = C.SICKNESS; if (v.sick && v.sick.lvl === 'parah' && lvl === 'ringan') return;
  v.sick = { lvl, until: S.day + rndInt(K.lightDays[0], K.lightDays[1]), cause, cared: false };
  const pc = cause && TEXT && TEXT.penduduk_sakit && TEXT.penduduk_sakit.per_penyebab && TEXT.penduduk_sakit.per_penyebab[cause];
  log('🤒 ' + (pc ? TX('penduduk_sakit.per_penyebab.' + cause, { nama: v.name }) : TX(`penduduk_sakit.${lvl}.mulai`, { nama: v.name }, `${v.name} jatuh sakit${lvl === 'parah' ? ' parah' : ''}.`)));
  if (lvl === 'parah') { log('🩺 ' + TX('penduduk_sakit.parah.butuh_rawat', { nama: v.name }, `${v.name} sakit parah dan perlu dirawat.`)); v.task = null; } }
function sicknessDaily() { const K = C.SICKNESS, F = FX();
  for (const v of S.villagers.slice()) {
    if (v.sick) { const s = v.sick;
      if (s.lvl === 'parah') { if (!s.cared && Math.random() < K.severeDeathPerDay) { killVillager(v, s.cause === 'serangan' ? 'serangan' : 'sakit'); continue; }
        if (!s.cared) log(TX('penduduk_sakit.parah.memburuk', { nama: v.name }, `Kondisi ${v.name} memburuk. Ia butuh perawatan.`)); s.cared = false; }
      else if (S.day >= s.until) { if (foodTotal() > 0) { v.sick = null; log('😊 ' + TX('penduduk_sakit.ringan.sembuh', { nama: v.name }, `${v.name} sudah sehat kembali!`)); } else s.until++; }
      continue; }
    let ch = 0;
    if (isWinter()) { if (v.mood < 50 || v.hunger <= C.HUNGER_CRIT) ch = F.sickChancePerLowMood; }
    else if (v.mood < K.lowMoodBelow) ch = K.baseLowMoodChance;
    if (ch && Math.random() < ch) makeSick(v, isExtreme() && Math.random() < K.severeFromExtremeChance ? 'parah' : 'ringan', isWinter() ? 'dingin' : v.hunger <= C.HUNGER_CRIT ? 'kelaparan' : null); }
  for (const v of S.villagers) if (v.injured && v.health >= 80 && !v.sick) { v.injured = null; log(TX('log_ancaman.sembuh', { nama: v.name }, `Luka ${v.name} sudah sembuh.`)); } }
function careTask(v) { if (v.sick && v.sick.lvl === 'parah') return null;
  const p = S.villagers.find(o => o !== v && o.sick && o.sick.lvl === 'parah' && !o.sick.cared && !S.villagers.some(c => c.task && c.task.kind === 'rawat' && c.task.pid === o.id));
  if (!p || !canAfford(C.SICKNESS.careCost)) return null; return { kind: 'rawat', pid: p.id, target: { x: p.x, y: p.y }, work: 0 }; }
function finishCare(v, t) { const p = vById(t.pid); if (!p || !p.sick) return; for (const [k, n] of Object.entries(C.SICKNESS.careCost)) S.res[k] = Math.max(0, S.res[k] - n);
  p.sick = { lvl: 'ringan', until: S.day + 2, cause: p.sick.cause, cared: true };
  log('🩺 ' + TX('penduduk_sakit.parah.dirawat', { nama: p.name, nama2: v.name }, `${v.name} merawat ${p.name} seharian. Ia mulai pulih.`)); }
// ---- pergi ----
function leaveDaily() { const L = C.LEAVE;
  for (const v of S.villagers.slice()) {
    v.lowMoodDays = v.mood < L.moodBelow ? (v.lowMoodDays || 0) + 1 : 0; v.starveDays = v.hunger <= 0 ? (v.starveDays || 0) + 1 : 0;
    if (v.lowMoodDays === 2) log('😟 ' + TX('penduduk_pergi.peringatan.waspada', { nama: v.name }, `${v.name} terlihat murung beberapa hari ini.`));
    if (v.lowMoodDays === L.days - 1 || v.starveDays === L.starveDays) log('⚠️ ' + TX('penduduk_pergi.peringatan.bahaya', { nama: v.name, hari_sisa: 1 }, `${v.name} mulai mengemasi barang-barangnya.`));
    if (v.wasLeaving && v.lowMoodDays === 0 && v.starveDays === 0) { v.wasLeaving = false; log('😊 ' + TX('penduduk_pergi.tercegah', { nama: v.name }, `${v.name} memutuskan untuk tetap tinggal.`)); }
    if (v.lowMoodDays >= L.days - 1) v.wasLeaving = true;
    if ((v.lowMoodDays >= L.days || v.starveDays > L.starveDays) && S.villagers.length > C.LEAVE.minPop && !(S.lastLeaveDay && S.day - S.lastLeaveDay < L.cooldownDays)) leaveVillager(v, v.starveDays > L.starveDays ? 'lapar' : 'mood'); } }
function leaveVillager(v, why) { S.villagers.splice(S.villagers.indexOf(v), 1); S.leavers = (S.leavers || 0) + 1; S.lastLeaveDay = S.day; if (selVid === v.id) closeVillager();
  S.villagers.forEach(o => o.mood = Math.max(0, o.mood - C.LEAVE.villageMoodHit));
  log('🚶 ' + TX('penduduk_pergi.kepergian', { nama: v.name }, `${v.name} meninggalkan desa.`) + ' ' + TX('penduduk_pergi.penyebab.' + why, { nama: v.name }, ''));
  if (S.villagers.length) log(TX('penduduk_pergi.dampak_desa', { nama: v.name }, '')); dstat('leavers', v.name, 1); }
// ---- kematian, pemakaman & duka ----
function killVillager(v, cause) { const D = C.DEATH; if (!S.villagers.includes(v)) return;
  S.villagers.splice(S.villagers.indexOf(v), 1); if (selVid === v.id) closeVillager();
  S.deaths = (S.deaths || 0) + 1; S.lastDeathDay = S.day; dstat('deaths', v.name, 1);
  const ex = { nama: v.name, umur: v.age, hewan: 'serigala', nama2: (S.villagers[0] || v).name };
  log('💀 ' + TX('penduduk_meninggal.per_penyebab.' + cause, ex, `${v.name} meninggal (${cause}).`));
  (S.memorials = S.memorials || []).push({ name: v.name, age: v.age, day: S.day, cause, since: v.joined ?? 1 });
  (S.bodies = S.bodies || []).push({ id: v.id, name: v.name, x: v.x, y: v.y, cause, day: S.day });
  S.villagers.forEach(o => o.mood = Math.max(0, o.mood + D.griefMoodInstant));
  S.grief = { name: v.name, until: S.day + D.griefDays }; S.mourningUntil = S.t + C.DAY_LENGTH_SEC;
  if (S.villagers.length) log('🕯️ ' + TX('duka.duka_mulai', ex, `Desa berduka atas kepergian ${v.name}.`));
  const N = (TEXT && TEXT.penduduk_meninggal && TEXT.penduduk_meninggal.notifikasi) || {};
  toast(ASSETS.STATUS_DIR + 'status_mourning.png', fillSafe(N.judul || 'Selamat Jalan, {nama}', { nama: v.name }), TX('penduduk_meninggal.kenangan_panel', { ...ex, sifat: 'penduduk yang baik', lama_tinggal: S.day - (v.joined ?? 1) }, '')); }
function griefDaily() { const G = S.grief; if (!G) return;
  if (S.day > G.until) { log('🌅 ' + TX('duka.duka_berakhir', { nama: G.name }, `Masa berkabung untuk ${G.name} usai.`)); S.grief = null; return; }
  S.villagers.forEach(o => o.mood = Math.max(0, o.mood + C.DEATH.griefPerDay)); log(TX('duka.duka_harian', { nama: G.name }, `Desa masih merindukan ${G.name}.`)); }
function graveTask(v) { const body = (S.bodies || []).find(b => !S.villagers.some(o => o.task && o.task.kind === 'makam' && o.task.body === b.id)); if (!body) return null;
  let g = S.buildings.find(b => b.type === 'makam' && b.done && !b.occupant && !b.reserved);
  if (!g) { g = S.buildings.find(b => b.type === 'makam' && !b.done && b.forBody === body.id);
    if (!g) { if (!canAfford(C.DEATH.graveCost)) return null; const sp = graveSpot(); if (!sp) return null;
      for (const [k, n] of Object.entries(C.DEATH.graveCost)) S.res[k] -= n; addBuilding('makam', sp.x, sp.y, false); g = S.buildings[S.buildings.length - 1]; g.forBody = body.id; } }
  g.reserved = body.id; return { kind: 'makam', body: body.id, b: g, target: center(g), work: 0 }; }
function graveSpot() { const gs = S.buildings.filter(b => b.type === 'makam'), base = gs.length ? gs[gs.length - 1] : { x: CAMP.x + 7, y: CAMP.y - 5 };
  for (let r = 0; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = base.x + dx, y = base.y + dy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) === r && validSpot('makam', x, y) && !floodTiles().has(y * C.MAP_W + x)) return { x, y }; } return null; }
function finishGrave(v, t) { const g = t.b, body = (S.bodies || []).find(b => b.id === t.body); if (!body) { g.reserved = null; return; }
  g.done = true; g.progress = C.BUILDINGS.makam.work; g.occupant = body.name; g.variant = rndInt(0, 4); g.reserved = null; S.bodies = S.bodies.filter(b => b !== body);
  const ex = { nama: body.name, nama2: v.name };
  log('⚱️ ' + TX('pemakaman.tugas_makam', ex, `${v.name} membuat makam untuk ${body.name}.`)); log('🕯️ ' + TX('pemakaman.upacara', ex, `Desa berkumpul di makam ${body.name}.`)); }
// ---- menara jaga ----
function guardTask(v) { const w = S.wolf; if (!w || !['jejak', 'mendekat', 'serang'].includes(w.phase) || w.tracksOnly && w.phase === 'jejak') return null;
  const tw = done('menara_jaga').find(t => !S.villagers.some(o => o !== v && o.task && o.task.kind === 'jaga' && o.task.b === t)); if (!tw) return null;
  if (v.sick || v.energy < C.ENERGY_CRIT * 1.5) return null; return { kind: 'jaga', b: tw, target: { x: tw.x + 0.5, y: tw.y + 1 } }; }
// ---- tugas darurat (dipanggil di chooseTask setelah kebutuhan kritis) ----
function emergencyTask(v) { const P = S.prio;
  if (P.padam) { const t = fireTask(v); if (t) return t; }
  if (P.rawat) { const t = careTask(v); if (t) return t; }
  if (P.jaga) { const t = guardTask(v); if (t) return t; }
  if (P.makam) { const t = graveTask(v); if (t) return t; }
  return null; }
function threatDaily() { spoilDaily(); famineDaily(); seasonDaily(); wolfDaily(); sicknessDaily(); leaveDaily(); griefDaily(); }
// ---- render: cuaca, bahaya, serigala ----
const WOLF_ROW = { diam: 0, jalan: 1, serang: 2, pergi: 1 };
function drawWolf(o) { const a = ASSETS.serigala, im = a.images && (a.images[o.variant] || a.image), t = performance.now() / 1000;
  const mode = o.mode === 'serang' ? 'serang' : o.moving ? 'jalan' : 'diam', fr = mode === 'serang' ? Math.min(3, Math.floor(o.t / 0.25)) : Math.floor(t * (mode === 'jalan' ? 8 : 3)) % 4;
  if (im) ctx.drawImage(im, fr * 32, (WOLF_ROW[mode] * 4 + o.dir) * 32, 32, 32, Math.round(o.x * T), Math.round(o.y * T), 32, 32);
  else { ctx.fillStyle = a.color; ctx.fillRect(o.x * T + 6, o.y * T + 14, 20, 10); ctx.fillRect(o.x * T + (o.dir === 1 ? 2 : 22), o.y * T + 10, 8, 8); } }
function drawTracks() { const a = ASSETS.jejak_serigala; for (const tr of S.tracks || []) { const al = 1 - (S.t - tr.t) / C.DAY_LENGTH_SEC; ctx.globalAlpha = Math.max(0, al);
  if (a.image) { ctx.save(); ctx.translate(tr.x * T + 16, tr.y * T + 16); ctx.rotate([Math.PI, -Math.PI / 2, 0, Math.PI / 2][tr.dir]); ctx.drawImage(a.image, -16, -16); ctx.restore(); }
  else { ctx.fillStyle = a.color; ctx.fillRect(tr.x * T + 10, tr.y * T + 10, 4, 4); ctx.fillRect(tr.x * T + 18, tr.y * T + 18, 4, 4); } } ctx.globalAlpha = 1; }
const frameAt = (a, n) => Math.floor(performance.now() / (a.ms || 100)) % (n || a.frames || 1);
function drawHazardOnBuilding(b) { const d = C.BUILDINGS[b.type];
  const R = S.fireRisk; if (R && R.phase === 'asap' && R.b === b.id) { const a = ASSETS.asap; if (a.image) ctx.drawImage(a.image, frameAt(a) * 32, 0, 32, 32, b.x * T + (d.w - 1) * 16, (b.y - 1) * T + 8, 32, 32);
    else { ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(b.x * T + d.w * 16, b.y * T - 6 - (performance.now() / 40 % 12), 6, 0, 7); ctx.fill(); } }
  if (b.burning) { const big = d.w >= 2, a = big ? ASSETS.api_besar : ASSETS.api_kecil, s = big ? 64 : 32;
    for (let i = 0; i < Math.max(1, Math.round(d.w / (big ? 2 : 1))); i++) { const x = b.x * T + i * s, y = (b.y + d.h) * T - s - (big ? 8 : 4);
      if (a.image) ctx.drawImage(a.image, frameAt(a) * s, 0, s, s, x, y, s, s); else { ctx.fillStyle = a.color; ctx.fillRect(x + 6, y + 8, s - 12, s - 12); } } } }
function drawFloodLayer(x0, y0, x1, y1) { if (!(S.flood && S.t >= S.flood.start)) return; const set = floodTiles(), a = ASSETS.banjir_auto, W = C.MAP_W;
  const fl = (x, y) => x < 0 || y < 0 || x >= W || y >= C.MAP_H || set.has(y * W + x) || S.tiles[y][x] === 1;
  const prog = Math.min(1, (S.t - S.flood.start) / (0.15 * C.DAY_LENGTH_SEC)); ctx.globalAlpha = 0.35 + 0.65 * prog;
  for (const i of set) { const x = i % W, y = i / W | 0; if (x < x0 - 1 || x > x1 + 1 || y < y0 - 1 || y > y1 + 1) continue;
    if (a.image && ASSETS.blob47.map) { let m = 0; [[0, -1, 1], [1, -1, 2], [1, 0, 4], [1, 1, 8], [0, 1, 16], [-1, 1, 32], [-1, 0, 64], [-1, -1, 128]].forEach(([dx, dy, bit]) => { if (fl(x + dx, y + dy)) m |= bit; });
      const k = blobIndex(m); if (k !== undefined) { const kk = k + (frameAt({ ms: 500 }, 2) ? 47 : 0); ctx.drawImage(a.image, (kk % 8) * T, Math.floor(kk / 8) * T, T, T, x * T, y * T, T, T); continue; } }
    ctx.fillStyle = a.color; ctx.fillRect(x * T, y * T, T, T); }
  ctx.globalAlpha = 1; }
function drawWeather() { // ruang layar, setelah overlay malam
  ctx.setTransform(1, 0, 0, 1, 0, 0); const z = cam.zoom, W = cv.width, H = cv.height, now = performance.now();
  const tile = (key, alpha = 1, scrollX = 0, scrollY = 0) => { const a = ASSETS[key]; if (!a) return; ctx.globalAlpha = alpha;
    if (a.image) { const fw = a.fw || a.image.width, fh = a.fh || a.image.height, fr = a.frames ? frameAt(a) : 0, s = fw * z;
      const ox = ((-cam.x * z + scrollX * now / 1000) % s + s) % s - s, oy = ((-cam.y * z + scrollY * now / 1000) % s + s) % s - s;
      for (let y = oy; y < H; y += fh * z) for (let x = ox; x < W; x += s) ctx.drawImage(a.image, fr * fw, 0, fw, fh, Math.round(x), Math.round(y), s, fh * z); }
    else if (a.color && key.startsWith('tint')) { ctx.fillStyle = a.color; ctx.fillRect(0, 0, W, H); }
    else if (a.color) { ctx.fillStyle = a.color; for (let i = 0; i < 80; i++) { const px = (i * 97 + now * (key === 'cuaca_hujan' ? 0.05 : 0.01) * (1 + i % 3)) % W, py = (i * 53 + now * (key === 'cuaca_hujan' ? 0.4 : 0.05) * (1 + i % 2)) % H;
      key === 'cuaca_hujan' ? ctx.fillRect(px, py, 1, 6) : ctx.fillRect(px, py, 2, 2); } }
    ctx.globalAlpha = 1; };
  const stretch = (key, alpha) => { const a = ASSETS[key]; if (!a || !a.image) return; ctx.globalAlpha = alpha; ctx.drawImage(a.image, 0, 0, W, H); ctx.globalAlpha = 1; };
  const se = season();
  if (isRaining()) { tile('tint_hujan', 1); tile('cuaca_hujan', 0.9, -20, 40); }
  else if (se === 'panas' && !isNight()) { tile('tint_panas', 1); tile('cuaca_panas', 0.6, 4, -6); }
  else if (se === 'gugur') tile('cuaca_daun', 0.85, 10, 14);
  if (se === 'dingin') { tile('cuaca_salju', isExtreme() ? 1 : 0.75, 6, 18); if (isExtreme()) { tile('tint_beku', 0.9); stretch('vignette_beku', 0.9); } }
  if (S.mourningUntil > S.t) { tile('duka_overlay', 1); stretch('duka_vignette', 0.8); }
  ctx.globalAlpha = 1; }
// status penduduk (ikon 16px di atas kepala)
const _stImg = {}; const statusImg = n => { if (!_stImg[n]) { _stImg[n] = new Image(); _stImg[n].src = ASSETS.STATUS_DIR + 'status_' + n + '_16.png'; } return _stImg[n]; };
function villagerStatus(v) { const s = [];
  if (v.sick) s.push('sick'); if (v.injured) s.push('injured');
  if (isWinter() && (isExtreme() || S.fireOut) && !inHut(v)) s.push('cold'); if (v.lowMoodDays >= 2 || v.mood < 30) s.push('sad'); if (S.grief) s.push('mourning'); return s; }
function drawVillagerStatus(v, px, py) { villagerStatus(v).slice(0, 2).forEach((n, i) => { const im = statusImg(n); if (im.complete && im.naturalWidth) ctx.drawImage(im, Math.round(px - 8 + (i - 0.5) * 14 + 7), Math.round(py - 36), 16, 16); }); }
// ---- pembusukan stok & penguapan air ----
function spoilDaily() { const P = C.SPOILAGE, pop = Math.max(1, S.villagers.length), fpd = foodPerDay(), free = P.foodFreeDays * fpd;
  if (foodTotal() > free) { const rate = P.foodPerDay * (season() === 'panas' ? P.summerMult : 1) * (done('lumbung').length ? P.granaryMult : 1);
    const lost = (foodTotal() - free) * rate, fm = S.res.makanan / foodTotal(); S.res.makanan -= lost * fm; S.res.gandum -= lost * (1 - fm);
    S.spoiled = (S.spoiled || 0) + lost; if (lost >= 1) dstat('spoiled', 'makanan', lost); }
  const wpd = pop * C.WATER.perDayPerPop, wf = P.waterFreeDays * wpd;
  if (S.res.air > wf) S.res.air -= (S.res.air - wf) * P.waterEvapPerDay; S.res.air = Math.min(S.res.air, P.waterCapDays * wpd); }

// ---------- statistik harian ----------
function dstat(cat, key, n) { const d = S.dayStats = S.dayStats || {}; (d[cat] = d[cat] || {})[key] = (d[cat][key] || 0) + n; }
function endOfDaySummary() { const d = S.dayStats || {}, day = S.day - 1; S.dayStats = {};
  const fmt = o => Object.entries(o || {}).map(([k, n]) => `${RES_LABEL[k] ? RES_LABEL[k].toLowerCase() : k}${n > 1 || RES_LABEL[k] ? ' ' + Math.floor(n) : ''}`).join(', ');
  const r = { day, gathered: d.gathered || {}, eaten: d.eaten || {}, built: d.built || {}, events: d.events || {}, deaths: d.deaths || {} };
  S.lastSummary = r; if (day < 1) return r;
  const parts = [];
  if (Object.keys(r.gathered).length) parts.push('dikumpulkan ' + fmt(r.gathered));
  if (Object.keys(r.eaten).length) parts.push('dimakan ' + fmt(r.eaten));
  if (Object.keys(r.built).length) parts.push('dibangun ' + Object.entries(r.built).map(([k, n]) => n > 1 ? `${k} ×${n}` : k).join(', '));
  if (Object.keys(r.events).length) parts.push('kejadian: ' + Object.keys(r.events).join(', '));
  if (Object.keys(r.deaths).length) parts.push('berpulang: ' + Object.keys(r.deaths).join(', '));
  log(`📊 Ringkasan hari ${day}: ${parts.length ? parts.join('; ') : 'hari yang tenang'}.`); return r; }
function summaryUI() { const r = S.lastSummary; if (!r || r.day < 1) return '<i>Belum ada hari yang lewat.</i>';
  const row = (lbl, o) => { const e = Object.entries(o); return `<div><b>${lbl}:</b> ${e.length ? e.map(([k, n]) => `${RES_LABEL[k] || k} ${Math.floor(n)}`).join(', ') : '-'}</div>`; };
  return `<div style="opacity:.8">Hari ${r.day}</div>` + row('Dikumpulkan', r.gathered) + row('Dimakan', r.eaten) + row('Dibangun', r.built) + `<div><b>Kejadian:</b> ${Object.keys(r.events).join(', ') || '-'}</div>`; }
// ---------- pencapaian (A01-A24, disimpan terpisah dari save game) ----------
const ACH_KEY = 'desaMandiriPencapaian';
let ACH = (() => { try { return JSON.parse(localStorage.getItem(ACH_KEY)) || {}; } catch (e) { return {}; } })(); ACH.unlocked = ACH.unlocked || {};
const achList = () => (TEXT && TEXT.pencapaian) || [];
const achText = () => (TEXT && TEXT.ui_progres && TEXT.ui_progres.pencapaian) || {};
const achUnsupported = new Set();
function achProgress(sy) { // -> angka progres, atau null jika tipe belum didukung
  switch (sy.tipe) {
    case 'bangun': case 'kumpulkan': case 'capai_penduduk': case 'riset': case 'transaksi_pasar': case 'panen': case 'simpan_pangan': case 'hari_pangan': case 'capai_hari': case 'alami_event': case 'capai_era':
      return questProgress({ tujuan: sy });
    case 'lewati_musim': return sy.target === 'dingin' ? (S.wintersOk || 0) : null;
    case 'beruntun_hari_pangan': return S.foodStreakMax || 0;
    case 'adakan_festival': return S.festivals || 0;     // belum ada mekanik festival -> tetap 0
    case 'kontrak_selesai': return S.contracts || 0;     // belum ada kontrak pedagang -> tetap 0
    case 'tanpa_kematian': return S.day - (S.lastDeathDay || 0);
    case 'pilih_event': return ((S.eventChoices || {})[sy.target] || [])[sy.pilihan || 0] || 0;
    case 'gabungan': return (sy.semua || []).every(x => (achProgress(x) ?? -1) >= x.jumlah) ? 1 : 0;
    default: return null; } }
function checkAch() { if (!S) return;
  for (const a of achList()) { if (ACH.unlocked[a.id]) continue; const pr = achProgress(a.syarat);
    if (pr === null) { if (!achUnsupported.has(a.id)) { achUnsupported.add(a.id); console.info(`[pencapaian] tipe "${a.syarat.tipe}" belum didukung (${a.id}).`); } continue; }
    if (pr >= a.syarat.jumlah) unlockAch(a); } }
function unlockAch(a) { ACH.unlocked[a.id] = { day: S.day, at: Date.now() }; localStorage.setItem(ACH_KEY, JSON.stringify(ACH));
  if (a.hadiah && Object.keys(a.hadiah).length) applyEffects(a.hadiah, 'pencapaian ' + a.id);
  const msg = fill(achText().notifikasi || '🏅 Pencapaian terbuka: {pencapaian}!', { pencapaian: a.nama }); log(msg + (a.teks_terbuka ? ' ' + a.teks_terbuka : ''));
  toast(achIcon(a.id, true), msg, a.teks_terbuka || a.deskripsi); sfx('lonceng'); if ($('achpanel').style.display === 'block') achUI(); }
const achIcon = (id, open) => { const m = ASSETS.ACH_ICON || {}; return (m._dir || '') + (open ? (m[id] || m._locked) : m._locked) + '.png'; };
function toast(icon, title, body) { const el = document.createElement('div'); el.className = 'toast panel';
  el.innerHTML = `<img src="${icon}" alt=""><div><b>${title}</b><br><small>${body || ''}</small></div>`; $('toasts').appendChild(el);
  setTimeout(() => el.classList.add('out'), 4500); setTimeout(() => el.remove(), 5200); }
function achUI() { const L = achList(), T_ = achText(), n = L.filter(a => ACH.unlocked[a.id]).length;
  $('achpanel').innerHTML = `<button id="achClose" style="float:right">×</button><h3>${T_.judul_panel || 'Pencapaian'}</h3><small>${T_.subjudul || ''}</small>
  <div style="margin:6px 0"><b>${fill(T_.progres || '{jumlah} dari {jumlah2} pencapaian', { jumlah: n, jumlah2: L.length })}</b>${n ? '' : `<br><i>${T_.kosong || ''}</i>`}</div>
  <div class="achgrid">${L.map(a => { const u = ACH.unlocked[a.id], secret = a.rahasia && !u, pr = achProgress(a.syarat);
    const prog = u ? `✅ Terbuka hari ${u.day}` : pr === null ? '<i>Belum tersedia di versi ini</i>' : a.syarat.tipe === 'gabungan' ? 'Syarat gabungan' : `${Math.min(pr, a.syarat.jumlah)}/${a.syarat.jumlah}`;
    return `<div class="ach ${u ? 'open' : 'locked'}" data-ach="${a.id}"><img src="${achIcon(a.id, !!u)}" alt=""><div><b>${secret ? T_.rahasia_nama || '???' : a.nama}</b><br><small>${secret ? T_.rahasia_deskripsi || '' : a.deskripsi}</small><br><small>${secret ? '' : prog}</small></div></div>`; }).join('')}</div>`; }
function openAch() { const p = $('achpanel'); if (p.style.display === 'block') { p.style.display = 'none'; return; } checkAch(); achUI(); p.style.display = 'block'; }
// ---------- panel detail penduduk ----------
let selVid = null;
function vhist(v, msg) { const f = dayFrac(), hh = String(Math.floor(f * 24)).padStart(2, '0');
  (v.history = v.history || []).unshift(`H${S.day} ${hh}:00 — ${msg}`); v.history.length = Math.min(v.history.length, C.VILLAGER_HISTORY); }
function TASK_TEXT(t) { if (!t) return 'Menunggu';
  switch (t.kind) {
    case 'makan': return 'Makan'; case 'tidur': return 'Tidur'; case 'diam': return 'Santai'; case 'setor': return 'Menyetor ke gudang';
    case 'kumpul': return 'Mengumpulkan ' + String(RES_LABEL[t.res] || t.res).toLowerCase();
    case 'bangun': return (t.b && t.b.done ? 'Memperbaiki ' : 'Membangun ') + (t.b ? C.BUILDINGS[t.b.type].nama : '');
    case 'tani': return t.harvest ? 'Memanen ladang' : 'Menanam ladang';
    case 'air': return 'Mengambil air dari ' + (t.src === 'sumur' ? 'sumur' : 'sungai');
    case 'riset': return 'Meneliti ' + (t.techName || '');
    case 'padam': return t.sekat ? 'Membuat sekat api' : 'Memadamkan api'; case 'rawat': return 'Merawat yang sakit'; case 'makam': return 'Menyiapkan makam'; case 'jaga': return 'Berjaga di menara';
    default: return t.kind; } }
function openVillager(id) { const v = S.villagers.find(x => x.id === id); if (!v) return; selVid = id; tutAction('klik_penduduk');
  const el = $('vpanel'); el.style.display = 'block';
  el.innerHTML = `<button class="close" id="vpClose">✕</button><h3 style="margin-top:0">${v.name}</h3>
    <label>Tugas favorit: <select id="favSel"><option value="">— Tidak ada —</option>${Object.entries(JOB_LABEL).filter(([k]) => !EMERG.includes(k)).map(([k, l]) => `<option value="${k}" ${v.fav === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <div style="font-size:11px;opacity:.75">Favorit memberi bonus saat memilih kerja, tapi makan/tidur/darurat tetap didahulukan.</div><div id="vpDyn"></div>`;
  delete _html.vpDyn; villagerPanelUI(); }
function closeVillager() { selVid = null; $('vpanel').style.display = 'none'; }
function villagerPanelUI() { if (selVid == null) return; const v = S.villagers.find(x => x.id === selVid); if (!v) { closeVillager(); return; }
  const uiIco = k => ASSETS[k] && ASSETS[k].ui ? `<img class="ico" src="${ASSETS[k].ui}">` : '';
  const bar = (label, val, col, fill, ik) => `${uiIco(ik)}${label} <b>${val | 0}</b><div class="bar"><i class="${fill}" style="width:${Math.max(0, Math.min(100, val))}%;--c:var(${col})"></i></div>`;
  const SK = { menebang: 'Menebang', menambang: 'Menambang', meramu: 'Meramu', membangun: 'Membangun', bertani: 'Bertani', meneliti: 'Meneliti' };
  setHTML('vpDyn', `<div style="font-size:12px;margin:6px 0">${v.age} th · ${role(v)}<br>Sedang: <b>${TASK_TEXT(v.task)}</b>${v.sick ? ` · <span style="color:#a63e34">Sakit ${v.sick.lvl}</span>` : ''}${v.injured ? ' · Terluka' : ''}${v.traumaUntil >= S.day ? ' · Trauma' : ''}${v.lowMoodDays >= 2 ? ` · Murung ${v.lowMoodDays} hari` : ''}${v.carry ? ` (membawa ${v.carry.n} ${RES_LABEL[v.carry.res].toLowerCase()})` : ''}</div>
    ${bar('Kenyang', v.hunger, '--bar-hunger', 'f-red', 'ikon_need_hunger')}${bar('Energi', v.energy, '--bar-energy', 'f-blue', 'ikon_need_energy')}${bar('Suasana hati', v.mood, '--bar-mood', 'f-yellow', 'ikon_need_mood')}${bar('Kesehatan', v.health ?? 100, '--bar-health', 'f-green', 'ikon_need_health')}
    <h3>Keahlian</h3>${Object.entries(SK).map(([k, l]) => `<div class="row"><span>${uiIco('ikon_skill_' + k)}${l}</span><span>${'★'.repeat(Math.min(5, Math.floor((v.skills[k] || 0) * 2)))}${'☆'.repeat(5 - Math.min(5, Math.floor((v.skills[k] || 0) * 2)))} ${(v.skills[k] || 0).toFixed(2)}</span></div>`).join('')}
    <h3>Riwayat</h3><ul>${(v.history || []).map(h => `<li>${h}</li>`).join('') || '<li>Belum ada catatan.</li>'}</ul>`); }
document.addEventListener('change', e => { if (e.target.id === 'favSel' && selVid != null) { const v = S.villagers.find(x => x.id === selVid); if (!v) return;
  v.fav = e.target.value || null; vhist(v, v.fav ? `Tugas favorit diatur: ${JOB_LABEL[v.fav]}` : 'Tugas favorit dihapus'); } });
function tutAction(name) { if (tutHook(S.tutorialStep).aksi === name) { S.tutorialStep++; tutorialUI(); } }
// ---------- dunia ----------
let lastDay = 1;
function step(dt) {
  S.t += dt; S.day = Math.floor(S.t / C.DAY_LENGTH_SEC) + 1;
  if (S.event) return;
  for (const v of S.villagers) updateVillager(v, dt);
  checkQuest();
  updateMerchant(dt);
  for (const v of S.villagers.slice()) if (v.health <= 0) killVillager(v, v.lastHurt === 'serangan' && v.injured ? 'serangan' : v.hunger <= 0 ? (isWinter() ? 'dingin' : 'kelaparan') : 'sakit');
  seasonStep(dt);
  const winter = isWinter();
  for (const b of S.buildings) if (b.type === 'ladang' && b.done && b.stage === 'tumbuh' && !winter && (b.grow += dt / C.DAY_LENGTH_SEC) >= C.FIELD.growDays + techVal('ladang_tumbuh', 0, { b }) + (season() === 'semi' ? FX().growDaysAdd : 0)) b.stage = 'siap';
  if (!winter) for (const n of S.nodes) if (n.type === 'semak' && n.amount <= 0 && (n.regrow -= dt / (isRaining() ? FX().rainBushRegrowMult : 1)) <= 0) n.amount = C.NODE_AMOUNT.makanan;
  S.nodes = S.nodes.filter(n => n.amount > 0 || n.type === 'semak');
  if (S.day !== lastDay) { lastDay = S.day; newDay(); }
  if (isWinter() && S.villagers.some(v => v.hunger <= 5)) S.winterStarve = true;
}
function newDay() {
  endOfDaySummary();
  const pop = S.villagers.length; if (!pop) { log('Desa telah kosong... Mulai permainan baru.'); return; }
  // musim
  if ((S.day - 1) % C.SEASON_DAYS === 0) { const se = season();
    const pf = TEXT && TEXT.pasar && TEXT.pasar.pesan_fluktuasi, fid = { dingin: 'musim_dingin_pangan', semi: 'semi_kayu', panas: 'panas_makanan' }[se];
    if (pf && fid && marketOpen()) { const x = pf.find(o => o.id === fid); if (x) log('📈 ' + fill(x.teks)); } }
  // air
  const wNeed = pop * C.WATER.perDayPerPop * (season() === 'panas' ? FX().waterMult : 1);
  if (S.res.air >= wNeed) S.res.air -= wNeed; else { S.res.air = 0; S.villagers.forEach(v => { v.mood -= C.WATER.shortageMood; v.health -= C.WATER.shortageHealth; });
    log('⚠️ Persediaan air habis! Penduduk kehausan. Naikkan prioritas Air atau bangun Sumur.'); }
  if (done('sumur').length) S.villagers.forEach(v => v.mood = Math.min(100, v.mood + C.WATER.wellMoodPerDay));
  // produksi bangunan
  const trade = (cfg, label) => { if (Object.entries(cfg.in).every(([k, n]) => S.res[k] >= n)) {
    Object.entries(cfg.in).forEach(([k, n]) => S.res[k] -= n); Object.entries(cfg.out).forEach(([k, n]) => S.res[k] = (S.res[k] || 0) + n); return true; } };
  done('bengkel').forEach(() => trade(C.WORKSHOP_DAILY));
  done('pasar').forEach(() => S.res.kayu >= C.MARKET_DAILY.minKayu && trade(C.MARKET_DAILY));
  // stok musim dingin
  const se = season(), buffer = foodPerDay() * C.WINTER_BUFFER_DAYS;

  marketNewDay();
  checkEra();
  const mood = S.villagers.reduce((a, v) => a + v.mood, 0) / pop;
  S.moodGoodDays = mood >= C.SPAWN.minMood ? S.moodGoodDays + 1 : 0;
  const sp = C.SPAWN, foodOk = foodTotal() >= pop * sp.foodDaysPerPop * sp.foodPerDayPerPop;
  if (foodOk && capacity() > pop && S.moodGoodDays >= sp.moodDays && S.day - S.lastSpawnDay >= sp.cooldownDays - (done('balai').length ? C.TOWN_HALL_SPAWN_COOLDOWN_CUT : 0)) {
    const h = done('gubuk').find(Boolean), c = center(h); spawnVillager(c.x, c.y + 1.5); S.lastSpawnDay = S.day;
  }
  const need = pop * C.SPAWN.foodPerDayPerPop;
  if (S.villagers.some(v => v.hunger <= 5)) log('⚠️ Ada penduduk kelaparan parah!');
  threatDaily(); if (!S.villagers.length) return;
  // pelacak pencapaian: beruntun hari pangan & musim dingin yang terlewati
  const fdays = foodTotal() / foodPerDay(); S.foodStreak = fdays >= 5 ? (S.foodStreak || 0) + 1 : 0; S.foodStreakMax = Math.max(S.foodStreakMax || 0, S.foodStreak);
  if (S.prevSeason === 'dingin' && se !== 'dingin') { if (!S.winterStarve) S.wintersOk = (S.wintersOk || 0) + 1; S.winterStarve = false; } S.prevSeason = se;
  checkAch();
  flavorLog(); maybeEvent();
  log(`Fajar menyingsing. Penduduk: ${S.villagers.length}, makanan: ${Math.floor(foodTotal())}, air: ${Math.floor(S.res.air)}.`);
}
function eraReqStatus(e) { const r = e.req || {}, out = [];
  if (r.pop) out.push([`Penduduk ${S.villagers.length}/${r.pop}`, S.villagers.length >= r.pop]);
  for (const [b, n] of Object.entries(r.bangunan || {})) out.push([`${C.BUILDINGS[b].nama} ${done(b).length}/${n}`, done(b).length >= n]);
  if (r.foodDays) { const d = foodTotal() / foodPerDay(); out.push([`Stok makanan ${d.toFixed(1)}/${r.foodDays} hari`, d >= r.foodDays]); }
  for (const [k, n] of Object.entries(r.res || {})) out.push([`${RES_LABEL[k]} ${Math.floor(S.res[k] || 0)}/${n}`, (S.res[k] || 0) >= n]);
  return out; }
function checkEra() { const next = C.ERAS[(S.era | 0) + 1]; if (!next) return;
  if (eraReqStatus(next).every(x => x[1])) { S.era = (S.era | 0) + 1; const nb = Object.entries(C.BUILDINGS).filter(([, d]) => d.era === next.id).map(([, d]) => d.nama);
    log(`🎉 Desa naik ke era ${next.nama}!${nb.length ? ' Bangunan baru: ' + nb.join(', ') + '.' : ''}`); buildBuildBar(); } }

// ---------- render ----------
// Kamera: posisi dunia (px) di pojok kiri-atas layar + zoom bulat agar pixel tetap tajam.
const cam = { x: 0, y: 0, zoom: C.START_ZOOM };
function clampCam() { const vw = cv.width / cam.zoom, vh = cv.height / cam.zoom;
  cam.x = Math.max(0, Math.min(C.MAP_W * T - vw, cam.x)); cam.y = Math.max(0, Math.min(C.MAP_H * T - vh, cam.y));
  if (C.MAP_W * T < vw) cam.x = (C.MAP_W * T - vw) / 2; if (C.MAP_H * T < vh) cam.y = (C.MAP_H * T - vh) / 2; }
function centerCam(tx, ty) { cam.x = tx * T + 16 - cv.width / cam.zoom / 2; cam.y = ty * T + 16 - cv.height / cam.zoom / 2; clampCam(); }
function setZoom(z, sx = cv.width / 2, sy = cv.height / 2) { const wx = cam.x + sx / cam.zoom, wy = cam.y + sy / cam.zoom;
  cam.zoom = z; cam.x = wx - sx / z; cam.y = wy - sy / z; clampCam(); }
const screenToTile = (sx, sy) => ({ x: Math.floor((cam.x + sx / cam.zoom) / T), y: Math.floor((cam.y + sy / cam.zoom) / T) });

// Gambar sprite dengan anchor kiri-bawah pada (tx, tyBottom) dalam tile; fallback ke placeholder.
function sprite(key, tx, ty, w = 1, h = 1, frame = 0, row = 0, variant = 0) {
  const a = ASSETS[key], im = (a.images && a.images[variant]) || a.image;
  if (im) { const fw = a.fw || 32, fh = a.fh || 32;
    // objek tinggi: alas di tile bawah, ditengahkan horizontal pada area w tile
    const dx = Math.round(tx * T + (w * T - fw) / 2), dy = Math.round((ty + h) * T - fh);
    ctx.drawImage(im, frame * fw, row * fh, fw, fh, dx, dy, fw, fh); return true; }
  return placeholder(a, tx, ty, w, h);
}
function placeholder(a, x, y, w, h) {
  if (!a.color) return false;
  ctx.fillStyle = a.color; const px = x * T, py = y * T;
  if (a.shape === 'circle') { ctx.beginPath(); ctx.arc(px + T / 2, py + T / 2, T * 0.42, 0, 7); ctx.fill();
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(px + 13, py + 22, 6, 9); }
  else if (a.shape === 'rock') { ctx.beginPath(); ctx.moveTo(px + 4, py + 26); ctx.lineTo(px + 10, py + 8); ctx.lineTo(px + 24, py + 6); ctx.lineTo(px + 29, py + 26); ctx.fill(); }
  else if (a.shape === 'bush') { ctx.beginPath(); ctx.arc(px + 16, py + 18, 11, 0, 7); ctx.fill();
    if (a.dot) { ctx.fillStyle = a.dot; [[10, 14], [20, 12], [16, 22]].forEach(([i, j]) => ctx.fillRect(px + i, py + j, 4, 4)); } }
  else ctx.fillRect(px, py, w * T, h * T);
  return false;
}
const animFrame = (a, fps) => Math.floor(performance.now() / 1000 * (fps || 1)) % (a.frames || 1);
// varian musim/malam: pakai key_dingin / key_malam jika asetnya ada (gambar atau warna)
const SEASON_SUFFIX = { semi: '_semi', panas: '_panas', gugur: '_gugur', dingin: '_dingin' };
const winterKey = k => { const se = season(), kk = k + SEASON_SUFFIX[se], a = ASSETS[kk]; return a && (se === 'dingin' || a.image) ? kk : k; };
let darkness = 0;
function blobIndex(m) { if (!(m & 1 && m & 4)) m &= ~2; if (!(m & 16 && m & 4)) m &= ~8; if (!(m & 16 && m & 64)) m &= ~32; if (!(m & 1 && m & 64)) m &= ~128;
  return ASSETS.blob47.map ? ASSETS.blob47.map[m] : undefined; }
const isWaterish = (x, y) => x < 0 || y < 0 || x >= C.MAP_W || y >= C.MAP_H || S.tiles[y][x] !== 0;
function drawWater(x, y) {
  const a = ASSETS[winterKey('auto_air')];
  if (a && a.image && ASSETS.blob47.map) {
    let m = 0; [[0, -1, 1], [1, -1, 2], [1, 0, 4], [1, 1, 8], [0, 1, 16], [-1, 1, 32], [-1, 0, 64], [-1, -1, 128]].forEach(([dx, dy, bit]) => { if (isWaterish(x + dx, y + dy)) m |= bit; });
    const i = blobIndex(m); if (i !== undefined) { const fr = (a.animFrames || 1) > 1 ? Math.floor(performance.now() / 1000 * a.fps) % a.animFrames : 0;
      ctx.drawImage(a.image, (i % 8) * T, (Math.floor(i / 8) + fr * 6) * T, T, T, x * T, y * T, T, T); return; } }
  sprite(winterKey('air'), x, y, 1, 1, animFrame(ASSETS.air, ASSETS.air.fps));
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#1d1610'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(cam.zoom, 0, 0, cam.zoom, -Math.round(cam.x * cam.zoom), -Math.round(cam.y * cam.zoom));
  const x0 = Math.max(0, Math.floor(cam.x / T)), y0 = Math.max(0, Math.floor(cam.y / T));
  const x1 = Math.min(C.MAP_W - 1, Math.ceil((cam.x + cv.width / cam.zoom) / T)), y1 = Math.min(C.MAP_H - 1, Math.ceil((cam.y + cv.height / cam.zoom) / T));
  const inView = (x, y, m = 2) => x >= x0 - m && x <= x1 + m && y >= y0 - m && y <= y1 + m;
  const f = dayFrac(); darkness = 0;
  if (f >= C.NIGHT_START) darkness = Math.min(1, (f - C.NIGHT_START) / 0.05); else if (f < C.NIGHT_END) darkness = Math.min(1, (C.NIGHT_END - f) / 0.05);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = S.tiles[y][x];
    if (t === 0) sprite(winterKey(S.grassVar && S.grassVar[y][x] ? 'rumput2' : 'rumput'), x, y);
    else { drawWater(x, y);
      if (t === 2) { const bl = S.tiles[y][x - 1] === 2, br = S.tiles[y][x + 1] === 2; sprite('jembatan', x, y, 1, 1, !bl ? 0 : !br ? 2 : 1); if (ASSETS.rel_belakang.image) sprite('rel_belakang', x, y, 1, 1, !bl ? 0 : !br ? 2 : 1);
        if (!ASSETS.jembatan.image) { ctx.fillStyle = '#9c6b3c'; ctx.fillRect(x * T, y * T + 4, T, 24); } } } }
  drawFloodLayer(x0, y0, x1, y1); drawTracks();
  const list = [];
  for (const n of S.nodes) { if (!inView(n.x, n.y)) continue;
    const key = winterKey(n.type === 'semak' && n.amount <= 0 ? 'semak_kosong' : n.type);
    list.push({ y: n.y + 1, draw: () => sprite(key, n.x, n.y) }); }
  for (const b of S.buildings) { const d = C.BUILDINGS[b.type];
    if (b.type === 'ladang') { list.push({ y: b.y + 0.5, draw: () => drawBuilding(b, d) }); continue; }  // ladang = lantai
    list.push({ y: b.y + d.h, draw: () => { drawBuilding(b, d); drawHazardOnBuilding(b); } }); }
  // penduduk yang berbagi tile digeser sedikit agar tidak bertumpuk
  const groups = {};
  for (const p of stockpiles()) list.push({ y: p.y + 0.9, draw: () => drawStockpile(p) });
  if (S.merchant) list.push({ y: S.merchant.y + 1, draw: () => drawMerchant(S.merchant) });
  for (const o of S.wolves || []) list.push({ y: o.y + 1, draw: () => drawWolf(o) });
  for (const bd of S.bodies || []) list.push({ y: bd.y + 0.5, draw: () => { ctx.fillStyle = '#e8dcc0'; ctx.fillRect(bd.x * T + 8, bd.y * T + 20, 18, 7); ctx.fillStyle = '#7a6a50'; ctx.fillRect(bd.x * T + 8, bd.y * T + 26, 18, 2); } });
  for (const v of S.villagers) { const k = Math.round(v.x * 2) + ',' + Math.round(v.y * 2); (groups[k] = groups[k] || []).push(v); }
  for (const g of Object.values(groups)) g.forEach((v, i) => { const off = (i - (g.length - 1) / 2) * 12;
    list.push({ y: v.y + 1 + 0.01 * i, draw: () => drawVillager(v, off) }); });
  list.sort((p, q) => p.y - q.y).forEach(o => o.draw());
  if (ASSETS.rel_depan.image) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (S.tiles[y][x] === 2) {
    const bl = S.tiles[y][x - 1] === 2, br = S.tiles[y][x + 1] === 2; sprite('rel_depan', x, y, 1, 1, !bl ? 0 : !br ? 2 : 1); }
  if (!darkness && campfireLit()) for (const b of done('apiunggun')) { const g = ASSETS.cahaya.image; if (g) { ctx.globalAlpha = 0.35; ctx.drawImage(g, b.x * T - 32, b.y * T - 32); ctx.globalAlpha = 1; } }
  // malam: overlay (blend normal) lalu cahaya (additive)
  // senja/fajar: tween warna sebelum & sesudah malam
  const tw = 0.06, dusk = Math.max(0, 1 - Math.abs(f - C.NIGHT_START) / tw), dawn = Math.max(0, 1 - Math.abs(f - C.NIGHT_END) / tw);
  const vw = [cam.x - 2, cam.y - 2, cv.width / cam.zoom + 4, cv.height / cam.zoom + 4];
  if (dusk > 0) { ctx.globalAlpha = dusk; ctx.fillStyle = ASSETS.senja_overlay.color; ctx.fillRect(...vw); ctx.globalAlpha = 1; }
  if (dawn > 0) { ctx.globalAlpha = dawn; ctx.fillStyle = ASSETS.fajar_overlay.color; ctx.fillRect(...vw); ctx.globalAlpha = 1; }
  if (darkness > 0) {
    ctx.globalAlpha = darkness; ctx.fillStyle = ASSETS.malam_overlay.color; ctx.fillRect(cam.x - 2, cam.y - 2, cv.width / cam.zoom + 4, cv.height / cam.zoom + 4);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of S.buildings) { const d = C.BUILDINGS[b.type]; if (!b.done || !d.light || (b.hp ?? 100) <= 0 || b.type === 'obor' && b.unlit || b.type === 'apiunggun' && !campfireLit()) continue;
      const g = ASSETS[d.light === 'besar' ? 'glow_besar' : 'glow_kecil'], im = g.image; if (!im) continue;
      const c = center(b), flick = b.type === 'apiunggun' ? 0.85 + Math.sin(performance.now() / 90) * 0.1 : 0.8;
      ctx.globalAlpha = darkness * flick; ctx.drawImage(im, Math.round(c.x * T + 16 - g.fw / 2), Math.round(c.y * T + 16 - g.fh / 2)); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    for (const b of done('apiunggun')) drawBuilding(b, C.BUILDINGS.apiunggun); // api tetap terang di atas overlay
  }
  const ik = ASSETS.res_ikon;
  for (const n of notes) { const al = Math.max(0, Math.min(1, n.life)), rise = (2 - n.life) * 14, x = n.x * T + 4, y = n.y * T - 4 - rise, im = ik.images && ik.images[ik.keys.indexOf(n.res)];
    ctx.globalAlpha = al; const txt = `+${n.n}`; ctx.font = 'bold 12px sans-serif'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(30,20,10,0.85)';
    if (im) ctx.drawImage(im, x, y - 11, 14, 14); const tx = x + (im ? 16 : 0);
    ctx.strokeText(im ? txt : `${txt} ${RES_LABEL[n.res] || n.res}`, tx, y); ctx.fillStyle = n.res === 'air' ? '#bfe8ff' : '#fff6a0'; ctx.fillText(im ? txt : `${txt} ${RES_LABEL[n.res] || n.res}`, tx, y); ctx.globalAlpha = 1; }
  for (const b of S.buildings) if (b.burning && darkness > 0) drawHazardOnBuilding(b);
  if (placing) { const d = C.BUILDINGS[placing], ok = validSpot(placing, mouse.x, mouse.y) && canAfford(d.cost);
    ctx.fillStyle = ok ? 'rgba(255,255,255,0.4)' : 'rgba(255,0,0,0.4)'; ctx.fillRect(mouse.x * T, mouse.y * T, d.w * T, d.h * T); }
  drawWeather();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function drawBuilding(b, d) {
  ctx.globalAlpha = b.done ? 1 : 0.45;
  let hasImg;
  if (b.type === 'ladang') { const a = ASSETS['tanaman_' + b.crop] || ASSETS.tanaman_gandum;
    const fr = !b.done ? 0 : b.stage === 'siap' ? 4 : b.stage === 'tumbuh' ? 1 + Math.min(2, Math.floor(b.grow / C.FIELD.growDays * 3)) : (b.grow === 0 && b.harvested ? 5 : 0);
    hasImg = sprite('tanaman_' + b.crop, b.x, b.y, 1, 1, fr);
    if (!hasImg) { ctx.fillStyle = ['#8a5a32', '#8a7a32', '#7a9a3a', '#5aa03a', '#e0c040'][fr] || '#8a5a32'; ctx.fillRect(b.x * T + 2, b.y * T + 2, T - 4, T - 4); }
    if (b.done && (fr === 2 || fr === 3) && !isWinter()) sprite('kilau', b.x, b.y, 1, 1, animFrame(ASSETS.kilau, ASSETS.kilau.fps));
  } else if (b.done && (b.hp ?? 100) <= 0 && b.type !== 'makam') { // hangus -> puing
    hasImg = (ASSETS[b.type + '_hangus'] && ASSETS[b.type + '_hangus'].image) ? sprite(b.type + '_hangus', b.x, b.y, d.w, d.h) : sprite(d.w >= 2 ? 'puing_besar' : 'puing_kecil', b.x, b.y, d.w, d.h);
  } else if (b.type === 'pagar') { const a = ASSETS.pagar, nb = (x, y) => S.buildings.some(o => o.type === 'pagar' && o.x === x && o.y === y);
    const i = (nb(b.x, b.y - 1) ? 1 : 0) + (nb(b.x + 1, b.y) ? 2 : 0) + (nb(b.x, b.y + 1) ? 4 : 0) + (nb(b.x - 1, b.y) ? 8 : 0);
    if (a.image) ctx.drawImage(a.image, (i % 4) * T, Math.floor(i / 4) * T, T, T, b.x * T, b.y * T, T, T); else { ctx.fillStyle = a.color; ctx.fillRect(b.x * T + 2, b.y * T + 12, 28, 6); ctx.fillRect(b.x * T + 13, b.y * T + 4, 6, 24); }
  } else if (b.type === 'obor') { const a = ASSETS.obor, fr = b.done && !b.unlit ? frameAt(a, 4) : a.frameMati;
    if (!sprite('obor', b.x, b.y, 1, 1, b.done ? fr : a.frameMati)) { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(b.x * T + 14, b.y * T + 6, 4, 24); if (!b.unlit) { ctx.fillStyle = '#ffb040'; ctx.fillRect(b.x * T + 12, b.y * T + 2, 8, 6); } }
  } else if (b.type === 'makam') { const a = ASSETS.makam, im = isWinter() && ASSETS.makam_dingin.image && b.occupant ? ASSETS.makam_dingin.image : a.images && (a.images[b.occupant ? (b.variant ?? 1) : 0] || a.image);
    if (im) ctx.drawImage(im, b.x * T, b.y * T); else { ctx.fillStyle = a.color; ctx.fillRect(b.x * T + 10, b.y * T + 8, 12, 20); }
  } else {
    const has = k => ASSETS[k] && ASSETS[k].image, w = isWinter(), night = b.done && darkness > 0.5;
    const key = [night && w && b.type + '_malam_dingin', night && b.type + '_malam', w && b.type + '_dingin', b.type].find(k => k && has(k)) || b.type;
    const a = ASSETS[b.type], fr = b.type === 'apiunggun' && b.done ? animFrame(a, a.fps) : 0;
    hasImg = sprite(key, b.x, b.y, d.w, d.h, fr);
    if (!hasImg && b.type === 'gubuk') { ctx.fillStyle = a.roof; ctx.beginPath(); ctx.moveTo(b.x * T - 2, b.y * T + 26); ctx.lineTo(b.x * T + T, b.y * T - 6); ctx.lineTo(b.x * T + 2 * T + 2, b.y * T + 26); ctx.fill(); }
    if (!hasImg && b.type === 'apiunggun') { ctx.fillStyle = '#ffe14a'; ctx.beginPath(); ctx.arc(b.x * T + 16, b.y * T + 16, 6 + Math.sin(S.t * 8) * 2, 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  const bar = (frac, col) => { ctx.fillStyle = '#000'; ctx.fillRect(b.x * T, b.y * T - 6, d.w * T, 4); ctx.fillStyle = col; ctx.fillRect(b.x * T, b.y * T - 6, d.w * T * frac, 4); };
  if (!b.done) { bar(b.progress / d.work, '#ffd27a'); ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.fillText(d.nama, b.x * T + 1, b.y * T + d.h * T - 2); }
  else if ((b.hp ?? 100) < 100) bar(b.hp / 100, '#e05050');
}
function drawMerchant(m) { const a = ASSETS.pedagang, c = ASSETS.gerobak, dir = m.dir || 0, t = performance.now() / 1000;
  const vx = [0, -1, 1, 0][dir], vy = [1, 0, 0, -1][dir], cx = m.x - vx * 0.9, cy = m.y - vy * 0.9;
  const drawCart = () => { if (c.image) ctx.drawImage(c.image, dir * 64, (m.moving ? Math.floor(t * 5) % 2 : 0) * 64, 64, 64, Math.round(cx * T + 16 - 32), Math.round(cy * T + 16 - 40), 64, 64);
    else { ctx.fillStyle = '#8a5a32'; ctx.fillRect(cx * T + 2, cy * T + 8, 28, 18); } };
  if (vy >= 0) drawCart(); // gerobak di belakang (atas) pedagang
  if (a.image) { const row = (m.moving ? 4 : 0) + dir, fr = Math.floor(t * (m.moving ? 8 : 3)) % 4; ctx.drawImage(a.image, fr * 32, row * 32, 32, 32, Math.round(m.x * T), Math.round(m.y * T), 32, 32); }
  else { ctx.fillStyle = '#7a3b8a'; ctx.fillRect(m.x * T + 10, m.y * T + 12, 12, 14); }
  if (vy < 0) drawCart();
  ctx.fillStyle = '#ffe9a0'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🛒 ' + m.name, m.x * T + 16, m.y * T); ctx.textAlign = 'left'; }
function drawVillager(v, off = 0) {
  if (v.id === selVid) { ctx.strokeStyle = '#ffe14a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(v.x * T + 16 + off, v.y * T + 29, 11, 5, 0, 0, 7); ctx.stroke(); }
  const a = ASSETS.penduduk, wk = ASSETS.penduduk_kerja, variant = v.color % 4, px = v.x * T + 16 + off, py = v.y * T + 16;
  const im = a.images && (a.images[variant] || a.image), wim = wk.images && (wk.images[variant] || wk.image);
  const asleep = v.task && v.task.asleep, t = performance.now() / 1000 + v.id * 0.37, dir = v.dir || 0;
  const dx = Math.round(v.x * T + off), dy = Math.round(v.y * T);
  let workRow = null, fps = 0;
  if (wim && v.working && v.task && v.task.kind === 'kumpul' && v.task.res === 'kayu') { workRow = wk.rows.tebang; fps = wk.fpsWork; }
  else if (wim && v.working && v.task && (v.task.kind === 'kumpul' && v.task.res === 'batu' || v.task.kind === 'bangun')) { workRow = wk.rows.tambang; fps = wk.fpsWork; }
  const cb = ASSETS.penduduk_bawa, cim = cb.images && (cb.images[variant] || cb.image);
  if (cim && v.carry && !asleep && cb.tipe[v.carry.res] != null) { ctx.drawImage(cim, (v.moving ? Math.floor(t * cb.fps) % cb.frames : 0) * 32, (cb.tipe[v.carry.res] * 4 + dir) * 32, 32, 32, dx, dy, 32, 32); workRow = -1; }
  else if (wim && v.carry && !asleep) { workRow = wk.rows.bawa; fps = v.moving ? wk.fpsCarry : 0; }
  if (workRow === -1) { /* sudah digambar (membawa) */ }
  else if (workRow !== null) ctx.drawImage(wim, (Math.floor(t * fps) % wk.frames) * 32, (workRow + dir) * 32, 32, 32, dx, dy, 32, 32);
  else if (im) { const moving = v.moving && !asleep, row = (moving ? 4 : 0) + dir;
    const fr = Math.floor(t * (moving ? a.fpsWalk : a.fpsIdle)) % a.frames;
    ctx.drawImage(im, fr * 32, row * 32, 32, 32, dx, dy, 32, 32); }
  else { ctx.fillStyle = a.shirt[v.color % a.shirt.length]; ctx.fillRect(px - 6, py - 2, 12, 12);
    ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(px, py - 7, 6, 0, 7); ctx.fill(); }
  if (v.carry && workRow === null) { ctx.fillStyle = { kayu: '#8b5a2b', batu: '#aaa', makanan: '#e0413a', gandum: '#e6c35a', air: '#5ab0e6' }[v.carry.res] || '#fff'; ctx.fillRect(px + 6, py - 2, 6, 6); }
  ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(v.name + (asleep ? ' z' : ''), px, py - 16); ctx.textAlign = 'left'; drawVillagerStatus(v, px, py);
}
// ---- tumpukan stok terlihat (di samping gudang / api unggun / pusat kemah) ----
const PILE_RES = ['kayu', 'batu', 'makanan', 'air'];
const pileAmount = r => r === 'makanan' ? (S.res.makanan || 0) + (S.res.gandum || 0) : S.res[r] || 0;
function pileTier(r) { const n = Math.floor(pileAmount(r)); return n <= 0 ? 0 : Math.min(4, 1 + Math.floor(3 * n / C.STOCKPILE.capacity[r])); }
function pileAnchor() { const st = S.buildings.filter(b => b.done && C.BUILDINGS[b.type].storage).sort((a, b) => (a.type === 'gudang' ? 0 : 1) - (b.type === 'gudang' ? 0 : 1) || a.id - b.id)[0]
    || done('apiunggun')[0];
  return st ? { key: st.id, x: st.x, y: st.y, w: C.BUILDINGS[st.type].w, h: C.BUILDINGS[st.type].h } : { key: 'camp', x: CAMP.x, y: CAMP.y, w: 1, h: 1 }; }
let _pileCache = null;
function pileSpots() { const A = pileAnchor(), key = A.key + ':' + S.buildings.length + ':' + S.nodes.length;
  if (_pileCache && _pileCache.key === key) return _pileCache.spots;
  const cand = [], spots = [];
  for (let i = -1; i <= A.w; i++) cand.push({ x: A.x + i, y: A.y + A.h });           // bawah (depan)
  for (let j = A.h - 1; j >= 0; j--) cand.push({ x: A.x + A.w, y: A.y + j }, { x: A.x - 1, y: A.y + j }); // samping
  for (let i = -1; i <= A.w; i++) cand.push({ x: A.x + i, y: A.y + A.h + 1 });       // baris kedua
  for (let i = -1; i <= A.w; i++) cand.push({ x: A.x + i, y: A.y - 1 });             // belakang
  for (const c of cand) { if (spots.length >= PILE_RES.length) break; if (validSpot('obor', c.x, c.y) && !floodTiles().has(c.y * C.MAP_W + c.x)) spots.push(c); }
  _pileCache = { key, spots }; return spots; }
function stockpiles() { const sp = pileSpots(), out = [];
  PILE_RES.forEach((r, i) => { const t = pileTier(r), s = sp[i]; if (s) out.push({ res: r, tier: t, x: s.x, y: s.y, n: Math.floor(pileAmount(r)) }); }); return out; }
function drawStockpile(p) { const X = p.x * T, Y = p.y * T, aw = ASSETS[`stockpile_${p.res}_${p.tier}_winter`], a = isWinter() && aw && aw.image ? aw : ASSETS[`stockpile_${p.res}_${p.tier}`];
  if (a && a.image) { ctx.drawImage(a.image, X + 16 - a.image.width / 2, Y + 32 - a.image.height); return; } // anchor tengah-bawah
  // cadangan bila sprite tidak ada: palet + tumpukan ikon sumber daya
  ctx.fillStyle = '#7a5a36'; ctx.fillRect(X + 4, Y + 25, 24, 4);
  const ik = ASSETS.res_ikon, im = ik.images && ik.images[ik.keys.indexOf(p.res)], rows = [[], [1], [2, 1], [3, 2, 1], [4, 3, 2, 1]][p.tier], sz = 9;
  rows.forEach((n, ri) => { for (let k = 0; k < n; k++) { const x = X + 16 - n * sz / 2 + k * sz, y = Y + 25 - sz - ri * (sz - 3);
    if (im) ctx.drawImage(im, x, y, sz, sz); else { ctx.fillStyle = (a && a.color) || '#999'; ctx.fillRect(x + 1, y + 1, sz - 2, sz - 2); } } }); }
function validSpot(type, x, y) { const d = C.BUILDINGS[type];
  for (let j = 0; j < d.h; j++) for (let i = 0; i < d.w; i++) { const X = x + i, Y = y + j;
    if (X < 0 || Y < 0 || X >= C.MAP_W || Y >= C.MAP_H || S.tiles[Y][X]) return false;
    if (S.nodes.some(n => n.x === X && n.y === Y)) return false;
    if (S.buildings.some(b => { const e = C.BUILDINGS[b.type]; return X >= b.x && X < b.x + e.w && Y >= b.y && Y < b.y + e.h; })) return false; }
  return true; }
// ---------- UI ----------
const $ = id => document.getElementById(id);
const _html = {};
function setHTML(id, h) { if (_html[id] !== h) { _html[id] = h; $(id).innerHTML = h; } }
function ui() {
  const f = dayFrac(), h = Math.floor(f * 24), m = Math.floor((f * 24 % 1) * 60);
  const ICONS = { kayu: '🪵', batu: '🪨', makanan: '🍎', gandum: '🌾', air: '💧', alat: '🔨', kulit: '🧥', papan: '🪚', batu_bata: '🧱' };
  $('res').innerHTML = Object.keys(RES_LABEL).filter(k => k in S.res && (S.res[k] >= 1 || ['kayu', 'batu', 'makanan', 'air'].includes(k)))
    .map(k => `<span title="${RES_LABEL[k]}">${ICONS[k]} ${RES_LABEL[k]}: <b>${Math.floor(S.res[k])}</b></span>`).join(' &nbsp; ') + ` &nbsp; 👥 <b>${S.villagers.length}/${capacity()}</b>`;
  const se = season(), dayInSeason = (S.day - 1) % C.SEASON_DAYS + 1;
  $('time').innerHTML = `${{ semi: '🌱', panas: '☀️', gugur: '🍂', dingin: '❄️' }[se]} ${C.SEASON_NAMES[se]} (${dayInSeason}/${C.SEASON_DAYS}) · Hari <b>${S.day}</b> — ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isNight() ? '🌙 Malam' : '☀️ Siang'}`;
  const TL = { makan: 'Makan', tidur: 'Tidur', kumpul: 'Mengumpulkan', setor: 'Menyetor', bangun: 'Membangun', diam: 'Santai', tani: 'Bertani', air: 'Mengambil air', riset: 'Meneliti', padam: 'Memadamkan api', rawat: 'Merawat', makam: 'Makam', jaga: 'Berjaga' };
  setHTML('vil', S.villagers.map(v => `<div class="v" data-vid="${v.id}"><b>${v.name}</b> (${v.age} th, ${role(v)}) — ${v.task ? TL[v.task.kind] + (v.task.kind === 'kumpul' ? ' ' + v.task.res : v.task.kind === 'tani' ? (v.task.harvest ? ' (panen)' : ' (tanam)') : '') : '-'}<br>
    Lapar ${v.hunger | 0} · Energi ${v.energy | 0} · Hati ${v.mood | 0} · Sehat ${(v.health ?? 100) | 0}</div>`).join(''));
  const warn = foodTotal() < foodPerDay() * 2, wwarn = (se === 'gugur' || se === 'dingin') && foodTotal() < foodPerDay() * C.WINTER_BUFFER_DAYS;
  $('res').innerHTML += (warn ? ' &nbsp; <b style="color:#ff6b6b">⚠️ Makanan menipis!</b>' : wwarn ? ' &nbsp; <b style="color:#ffb36b">❄️ Stok musim dingin kurang</b>' : '') + (S.res.air < S.villagers.length ? ' &nbsp; <b style="color:#6bc6ff">💧 Air menipis!</b>' : '');
  const era = C.ERAS[S.era | 0], next = C.ERAS[(S.era | 0) + 1];
  setHTML('era', `<b>${era.nama}</b>` + (next ? `<br>Menuju <b>${next.nama}</b>:<br>` + eraReqStatus(next).map(([t, ok]) => `${ok ? '✅' : '▫️'} ${t}`).join('<br>') : '<br>Era tertinggi tercapai!'));
  document.querySelectorAll('[data-b]').forEach(bt => { const k = bt.dataset.b; if (k) bt.disabled = !unlocked(k) || !canAfford(C.BUILDINGS[k].cost); });
  warnUI(); setHTML('quest', questUI()); setHTML('summary', summaryUI()); villagerPanelUI(); techPanelUI(); marketUI(); $('marketbtn').classList.toggle('on', marketOpen());
  setHTML('log', S.log.slice(0, 15).map(l => `<div>${l}</div>`).join(''));
}
function techPanelUI() { const el = $('techpanel'); if (!el || el.style.display !== 'block') return;
  const T = window.TECH || { cabang: {} }, nodes = techNodes(), R = S.research, rn = R && nodes.find(n => n.id === R.id);
  const ST = { done: 'Selesai ✔', active: 'Sedang diteliti', locked: 'Terkunci', busy: 'Tunggu riset lain', poor: 'Bahan kurang', available: 'Bisa diteliti' };
  const cost = c => Object.entries(c || {}).map(([k, q]) => `${q} ${RES_LABEL[k] || k}`).join(', ') || 'gratis';
  const ico = n => { const a = n.ikon && ASSETS[n.ikon]; return a && a.ui ? `<img src="${a.ui}" width="32" height="32" style="float:left;margin-right:6px;image-rendering:pixelated">` : ''; };
  setHTML('techpanel', `<button class="close" id="techClose">✕</button><h3 style="margin-top:0">🔬 Pohon Teknologi</h3>
    <div style="font-size:12px;margin-bottom:8px">${rn ? `Sedang diteliti: <b>${rn.nama}</b> — ${Math.floor(R.progress)}/${rn.work}<div class="bar"><i class="f-purple" style="width:${100 * R.progress / rn.work}%;--c:var(--bar-energy)"></i></div>` : 'Belum ada riset berjalan. Pilih satu teknologi; biaya dibayar di muka.'}
    Prioritas kerja <b>Riset</b>: ${S.prio.riset || 'mati'}</div>
    <div class="tech-grid">${Object.entries(T.cabang).map(([cb, nm]) => `<div><h3>${nm}</h3>${nodes.filter(n => n.cabang === cb).map(n => { const s = techStatus(n);
      return `<div class="tech ${s.st === 'done' ? 'done' : s.st === 'active' ? 'active' : s.st === 'locked' ? 'locked' : ''}" data-tech="${n.id}">${ico(n)}<b>${n.nama}</b> <small style="display:inline">${n.id}</small>
        <small>${n.deskripsi || ''}</small>${n.efek_ringkas ? `<small><i>${n.efek_ringkas}</i></small>` : ''}${n.angka && n.angka !== n.deskripsi ? `<small>📊 ${n.angka}</small>` : ''}<small>Biaya: ${cost(n.biaya)} · Kerja: ${n.work}</small>
        <small>${ST[s.st]}${s.why ? ': ' + s.why.join(', ') : ''}</small>${s.st === 'available' ? `<button data-research="${n.id}">Teliti</button>` : ''}</div>`; }).join('') || '<small>Segera hadir</small>'}</div>`).join('')}</div>`); }
function openMarket() { const el = $('market'); el.style.display = 'block'; const P = (TEXT && TEXT.pasar) || {}, L = P.label || {};
  const opts = Object.keys(M().harga).map(k => `<option value="${k}">${RES_LABEL[k]}</option>`).join('');
  el.innerHTML = `<button class="close" id="mkClose">✕</button><h3 style="margin-top:0">🛒 ${P.judul || 'Pasar Desa'}</h3><div style="font-size:12px">${P.deskripsi || ''}</div>
    <div id="mkStatus" style="font-size:12px;margin:6px 0"></div><div id="mkTable"></div>
    <div style="margin-top:8px"><b>${L.jual || 'Jual'}:</b> <input id="mkQty" type="number" min="1" value="10" style="width:56px"> <select id="mkGive">${opts}</select>
    → <b>${L.beli || 'Beli'}:</b> <select id="mkGet">${opts}</select> <button id="mkDo">${L.konfirmasi || 'Sepakat!'}</button>
    <div id="mkPreview" style="font-size:12px;margin-top:4px"></div></div>`;
  $('mkGive').value = 'kayu'; $('mkGet').value = 'makanan'; delete _html.mkTable; delete _html.mkStatus; delete _html.mkPreview; marketUI(); }
function marketUI() { const el = $('market'); if (!el || el.style.display !== 'block') return; const P = (TEXT && TEXT.pasar) || {}, L = P.label || {}, q = quota(), TT = P.tooltip_harga || {};
  const m = S.merchant, open = marketOpen();
  setHTML('mkStatus', (open ? (merchantHere() ? `🧺 <b>${m.name}</b> sedang berdagang (beli −${M().merchantBuyDiscount * 100}%).` : '🏪 Pasar desa buka.') : `⛔ ${P.belum_dibuka || 'Pasar belum buka.'}${m ? ' Pedagang sedang dalam perjalanan.' : ` Pedagang berikutnya sekitar hari ${S.nextMerchantDay}.`}`) +
    `<br>${L.kuota || 'Kuota hari ini'}: ${fill((P.kuota && P.kuota.sisa) || 'Sisa kuota jual {jumlah} · beli {jumlah2}', { jumlah: Math.floor(q.sisaJual), jumlah2: Math.floor(q.sisaBeli) })}` +
    (foodSellMult() < 1 ? `<br>🌾 ${(P.pesan_fluktuasi || []).find(x => x.id === 'pangan_melimpah')?.teks || 'Pangan melimpah, harga jual turun.'} (×${foodSellMult().toFixed(2)})` : ''));
  setHTML('mkTable', `<table style="width:100%;font-size:12px;border-collapse:collapse"><tr><th align="left">${L.barang || 'Barang'}</th><th>${L.stok || 'Stok'}</th><th>${L.harga_jual || 'Jual'}</th><th>${L.harga_beli || 'Beli'}</th><th></th></tr>` +
    Object.keys(M().harga).map(k => { const mod = S.priceMod[k] || 1, pct = Math.round((mod - 1) * 100);
      const tip = fill(mod >= 1.35 ? TT.tertinggi : mod <= 0.75 ? TT.terendah : pct >= 5 ? TT.naik : pct <= -5 ? TT.turun : TT.stabil || '', { sumber_daya: RES_LABEL[k].toLowerCase(), persen: Math.abs(pct) });
      return `<tr title="${tip}"><td>${RES_LABEL[k]}</td><td align="center">${Math.floor(S.res[k] || 0)}</td><td align="center">${priceOf(k, 'jual').toFixed(1)}</td><td align="center">${priceOf(k, 'beli').toFixed(1)}</td><td>${pct > 2 ? '▲' : pct < -2 ? '▼' : '•'}</td></tr>`; }).join('') + '</table>');
  const g = $('mkGive'), t = $('mkGet'); if (!g) return; const r = tradeQuote(g.value, +$('mkQty').value, t.value);
  setHTML('mkPreview', r.n != null && r.n >= 0 ? `${L.total || 'Total'}: ${r.qty} ${RES_LABEL[g.value]} (nilai ${r.value.toFixed(1)}) → <b>${r.n} ${RES_LABEL[t.value]}</b>${r.ok ? '' : ` — <span style="color:#a63e34">${r.why}</span>`}` : r.why || '');
  $('mkDo').disabled = !open || !r.ok; }
function openTech() { $('techpanel').style.display = 'block'; delete _html.techpanel; techPanelUI(); tutAction('buka_riset'); }
function buildBuildBar() {
  $('buildbar').innerHTML = 'Bangun: ' + Object.entries(C.BUILDINGS).filter(([k]) => unlocked(k)).map(([k, d]) =>
    `<button data-b="${k}" title="${Object.entries(d.cost).map(([r, n]) => n + ' ' + RES_LABEL[r]).join(', ')}">${d.nama}</button>`).join('') + '<button data-b="">Batal</button>'; }
function buildPrioUI() {
  const PD = (TEXT && TEXT.prioritas_darurat) || {};
  $('prio').innerHTML = Object.keys(S.prio).map(k => `<div class="row" title="${(PD[k] && PD[k].tooltip) || ''}">${PD[k] ? '🚨 ' + PD[k].label : JOB_LABEL[k]} <span>${[0, 1, 2, 3].map(n =>
    `<button data-p="${k}" data-n="${n}" class="${S.prio[k] === n ? 'on' : ''}">${n ? n : 'Off'}</button>`).join('')}</span></div>`).join('');
}
document.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') sfx('klik'); const d = e.target.dataset; if (!d) return;
  if (e.target.id === 'vpClose') closeVillager();
  if (e.target.id === 'techbtn') openTech();
  if (e.target.id === 'marketbtn') openMarket();
  if (e.target.id === 'mkClose') $('market').style.display = 'none';
  if (e.target.id === 'mkDo') { doTrade($('mkGive').value, +$('mkQty').value, $('mkGet').value); marketUI(); }
  if (e.target.id === 'techClose') $('techpanel').style.display = 'none';
  if (e.target.id === 'achClose') $('achpanel').style.display = 'none';
  if (e.target.id === 'achbtn') openAch();
  if (e.target.id === 'collapseOk') { $('modal').style.display = 'none'; S.prio.makanan = 3; buildPrioUI(); }
  if (d.research) startResearch(d.research);
  if (d.ev !== undefined) chooseEvent(+d.ev);
  const vrow = e.target.closest && e.target.closest('[data-vid]'); if (vrow) openVillager(+vrow.dataset.vid);
  if (e.target.id === 'tutNext') { S.tutorialStep++; tutorialUI(); }
  if (e.target.id === 'tutSkip') { S.tutorialStep = 999; tutorialUI(); }
  if (d.p) { S.prio[d.p] = +d.n; buildPrioUI(); tutAction('ubah_prioritas'); }
  if (d.s !== undefined) { setSpeed(+d.s); tutAction('ubah_kecepatan'); }
  if (d.b !== undefined) placing = d.b || null; });
// kamera: seret (klik kiri/tengah) untuk geser, roda mouse / tombol untuk zoom, WASD/panah untuk geser
let drag = null;
const scr = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
cv.addEventListener('mousedown', e => { const p = scr(e); drag = { sx: p.x, sy: p.y, cx: cam.x, cy: cam.y, moved: false }; });
window.addEventListener('mouseup', () => { setTimeout(() => drag = null, 0); });
cv.addEventListener('mousemove', e => { const p = scr(e); const t = screenToTile(p.x, p.y); mouse.x = t.x; mouse.y = t.y;
  if (drag && e.buttons) { const dx = p.x - drag.sx, dy = p.y - drag.sy; if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
    if (drag.moved) { cam.x = drag.cx - dx / cam.zoom; cam.y = drag.cy - dy / cam.zoom; clampCam(); } } });
cv.addEventListener('wheel', e => { e.preventDefault(); const p = scr(e), Z = C.ZOOM_LEVELS, i = Z.indexOf(cam.zoom);
  const ni = Math.max(0, Math.min(Z.length - 1, i + (e.deltaY < 0 ? 1 : -1))); if (ni !== i) setZoom(Z[ni], p.x, p.y); }, { passive: false });
window.addEventListener('keydown', e => { const k = { ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0], ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1] }[e.key];
  if (k) { cam.x += k[0] * 64 / cam.zoom; cam.y += k[1] * 64 / cam.zoom; clampCam(); } });
$('zin').onclick = () => { const Z = C.ZOOM_LEVELS, i = Z.indexOf(cam.zoom); setZoom(Z[Math.min(Z.length - 1, i + 1)]); };
$('zout').onclick = () => { const Z = C.ZOOM_LEVELS, i = Z.indexOf(cam.zoom); setZoom(Z[Math.max(0, i - 1)]); };
cv.addEventListener('click', e => { if (drag && drag.moved) return; handleTap(scr(e)); });
function handleTap(p) { const t = screenToTile(p.x, p.y); mouse.x = t.x; mouse.y = t.y;
  if (!placing) { const wx = (cam.x + p.x / cam.zoom) / T - 0.5, wy = (cam.y + p.y / cam.zoom) / T - 0.4;
    const v = nearest(S.villagers.filter(o => Math.hypot(o.x - wx, o.y - wy) < 0.8), { x: wx, y: wy }); if (v) openVillager(v.id); return; }
  const d = C.BUILDINGS[placing];
  if (!canAfford(d.cost)) return log(`Bahan tidak cukup untuk ${d.nama}.`);
  if (!validSpot(placing, mouse.x, mouse.y)) return;
  for (const [k, n] of Object.entries(d.cost)) S.res[k] -= n;
  addBuilding(placing, mouse.x, mouse.y, false); log(`Rencana ${d.nama} ditempatkan.`); placing = null; tutAction('taruh_bangunan'); }
// ---------- layar sentuh: 1 jari = geser/ketuk, 2 jari = cubit zoom (zoom tetap bulat agar pixel tajam) ----------
let touch = null;
const tpos = t => scr(t), tdist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), tmid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
cv.addEventListener('touchstart', e => { e.preventDefault(); const ts = [...e.touches].map(tpos);
  if (ts.length === 1) { touch = { mode: 'pan', sx: ts[0].x, sy: ts[0].y, cx: cam.x, cy: cam.y, moved: false };
    const t = screenToTile(ts[0].x, ts[0].y); mouse.x = t.x; mouse.y = t.y; }
  else if (ts.length >= 2) { const m = tmid(ts[0], ts[1]); touch = { mode: 'pinch', d0: tdist(ts[0], ts[1]), z0: cam.zoom, mx: m.x, my: m.y, moved: true }; } }, { passive: false });
cv.addEventListener('touchmove', e => { e.preventDefault(); if (!touch) return; const ts = [...e.touches].map(tpos);
  if (touch.mode === 'pan' && ts.length === 1) { const dx = ts[0].x - touch.sx, dy = ts[0].y - touch.sy;
    if (Math.abs(dx) + Math.abs(dy) > C.TOUCH.tapSlop) touch.moved = true;
    if (touch.moved) { cam.x = touch.cx - dx / cam.zoom; cam.y = touch.cy - dy / cam.zoom; clampCam(); }
    const t = screenToTile(ts[0].x, ts[0].y); mouse.x = t.x; mouse.y = t.y; }
  else if (touch.mode === 'pinch' && ts.length >= 2) { const m = tmid(ts[0], ts[1]), ratio = tdist(ts[0], ts[1]) / touch.d0, Z = C.ZOOM_LEVELS;
    // geser ikut titik tengah dua jari
    cam.x -= (m.x - touch.mx) / cam.zoom; cam.y -= (m.y - touch.my) / cam.zoom; touch.mx = m.x; touch.my = m.y; clampCam();
    const i0 = Z.indexOf(touch.z0), steps = ratio >= 1 ? Math.floor(Math.log(ratio) / Math.log(C.TOUCH.pinchStep)) : -Math.floor(Math.log(1 / ratio) / Math.log(C.TOUCH.pinchStep));
    const nz = Z[Math.max(0, Math.min(Z.length - 1, i0 + steps))]; if (nz !== cam.zoom) setZoom(nz, m.x, m.y); } }, { passive: false });
cv.addEventListener('touchend', e => { e.preventDefault(); if (!touch) return;
  if (touch.mode === 'pan' && !touch.moved && e.touches.length === 0) handleTap({ x: touch.sx, y: touch.sy });
  touch = e.touches.length ? (touch.mode === 'pinch' ? { ...touch, mode: 'done' } : touch) : null; }, { passive: false });
cv.addEventListener('touchcancel', () => touch = null);
// ---------- tata letak responsif: di bawah ~900px kanvas memenuhi layar, panel samping jadi laci bawah ----------
function fitCanvas() { const mob = window.innerWidth < C.TOUCH.mobileMaxWidth; document.body.classList.toggle('mobile', mob);
  let w = C.VIEW_W, h = C.VIEW_H;
  if (mob) { w = window.innerWidth; h = Math.max(240, window.innerHeight - $('top').offsetHeight); }
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; ctx.imageSmoothingEnabled = false; clampCam(); }
  if (!mob) document.body.classList.remove('drawer-open'); }
$('drawerbtn').onclick = () => document.body.classList.toggle('drawer-open');
window.addEventListener('resize', fitCanvas); window.addEventListener('orientationchange', () => setTimeout(fitCanvas, 200)); fitCanvas();
cv.addEventListener('contextmenu', e => { e.preventDefault(); placing = null; });
// save/load: referensi node/bangunan di task tidak diserialisasi, task direset saat muat
const KEY = 'desaMandiriSave';
$('save').onclick = () => { localStorage.setItem(KEY, JSON.stringify({ ...S, villagers: S.villagers.map(v => ({ ...v, task: null, path: null, pathKey: null })) })); log('Permainan disimpan.'); };
$('load').onclick = () => loadGame(true);
$('reset').onclick = () => { if (confirm('Mulai permainan baru?')) { S = null; newGame(); lastDay = S.day; buildPrioUI(); buildBuildBar(); tutorialUI(); } };
function loadGame(verbose) { const s = localStorage.getItem(KEY); if (!s) { if (verbose) log('Belum ada simpanan.'); return false; }
  try { const L = JSON.parse(s); if (!L.tiles || L.tiles.length !== C.MAP_H || L.tiles[0].length !== C.MAP_W) { if (verbose) log('Simpanan versi lama tidak cocok dengan peta baru.'); return false; } S = L; lastDay = S.day; S.prio = { ...C.DEFAULT_PRIO, ...S.prio }; S.techDone = S.techDone || []; S.research = S.research || null; marketInit(); S.gathered = S.gathered || {}; S.era |= 0; for (const [k, n] of Object.entries(C.START_RES)) if (!(k in S.res)) S.res[k] = 0; if (!S.banks) computeBanks(); S.villagers.forEach(v => { v.skills.bertani = v.skills.bertani || 0; if (v.health == null) v.health = 100; }); S.questIdx |= 0; S.tutorialStep |= 0; S.restUntil = S.restUntil || 0; buildPrioUI(); buildBuildBar(); tutorialUI(); $('modal').style.display = 'none'; if (S.event) showEvent(); log('Permainan dimuat.'); return true; } catch (e) { console.warn(e); return false; } }

// ---------- loop ----------
let prev = performance.now();
function frame(now) { const real = Math.min(0.25, (now - prev) / 1000); prev = now;
  for (const n of notes) n.life -= real; while (notes.length && notes[0].life <= 0) notes.shift();
  let sim = menuOpen ? 0 : real * speed; while (sim > 0) { const d = Math.min(0.1, sim); step(d); sim -= d; }
  render(); ui(); requestAnimationFrame(frame); }
window.DESA = { get state() { return S; }, stockpiles, pileTier, pileSpots, notify, get notes() { return notes; }, killVillager, makeSick, ignite, spawnWolf, startFlood, famineLevel, warnings, threatDaily, seasonStep, wolfDaily, leaveDaily, sicknessDaily, spoilDaily, year, foodDays, floodTiles, isFlooded, fitCanvas, get placing() { return placing; }, setPlacing(b) { placing = b; }, get ach() { return ACH; }, checkAch, achProgress, unlockAch, endOfDaySummary, newDay, toast, applyEffects, allEvents, eventEraOk, fill, marketNewDay, priceOf, tradeQuote, doTrade, spawnMerchant, marketOpen, quota, foodSellMult, openMarket, startResearch, techVal, techNodes, openTech, showEvent, validSpot, canAfford, addBuilding, season,  step, cam, findPath, setZoom, centerCam };
fetch('TEKS-GAME.json').then(r => r.ok ? r.json() : null).catch(() => null).then(t => { TEXT = t;
  if (!t) console.warn('TEKS-GAME.json tidak dapat dimuat; memakai teks bawaan.');
  loadAssets(() => { newGame(); lastDay = S.day; buildPrioUI(); buildBuildBar(); centerCam(CAMP.x, CAMP.y); applyMenuText(); openMenu(); requestAnimationFrame(frame); }); });
// ---------- menu utama & pengaturan ----------
const SET_KEY = 'desaMandiriSettings';
const SET = Object.assign({ musik: 60, efek: 70, mute: false, speed: 1, lang: 'id' }, (() => { try { return JSON.parse(localStorage.getItem(SET_KEY)) || {}; } catch (e) { return {}; } })());
function applyAudio() { if (SET.volume != null && SET.musik == null) SET.musik = SET.volume; AUDIO.setVolumes((SET.musik ?? 60) / 100, (SET.efek ?? 70) / 100); AUDIO.setMuted(SET.mute);
  $('mutebtn').textContent = SET.mute ? '🔇' : '🔊'; }
function applyMenuText() { if (!TEXT) return; const M_ = TEXT.menu || {}, T_ = M_.tombol || {}, K = M_.keterangan_tombol || {}, PG = TEXT.pengaturan || {}, O = PG.opsi || {};
  if (T_.mulai) { $('btnNew').textContent = T_.mulai; $('btnNew').title = K.mulai || ''; } if (T_.lanjut) { $('btnContinue').textContent = T_.lanjut; $('btnContinue').title = K.lanjut || ''; }
  if (T_.pengaturan) { $('btnSettings').textContent = T_.pengaturan; $('btnSettings').title = K.pengaturan || ''; } if (T_.kembali) $('btnBack').textContent = T_.kembali;
  const sub = document.querySelector('#menu .sub'); if (sub && M_.subjudul) sub.innerHTML = M_.subjudul + (M_.slogan_acak ? `<br><i style="font-size:12px">${pick(M_.slogan_acak)}</i>` : '');
  const h = document.querySelector('#menuSettings h1'); if (h && PG.judul) h.textContent = PG.judul;
  [['lblMusik', 'volume_musik'], ['lblEfek', 'volume_efek'], ['lblSpeed', 'kecepatan_game'], ['lblLang', 'bahasa']].forEach(([id, k]) => { if (O[k] && $(id)) { $(id).textContent = O[k].label; $(id).parentNode.title = O[k].deskripsi || ''; } }); }
function setSpeed(n) { speed = n; document.querySelectorAll('[data-s]').forEach(b => b.classList.toggle('on', +b.dataset.s === n)); }
function hasSave() { try { const L = JSON.parse(localStorage.getItem(KEY)); return !!(L && L.tiles && L.tiles.length === C.MAP_H); } catch (e) { return false; } }
function openMenu() { menuOpen = true; $('menu').style.display = 'flex'; $('menuMain').style.display = ''; $('menuSettings').style.display = 'none';
  $('btnContinue').style.display = hasSave() ? '' : 'none'; tutorialUI(); }
function closeMenu() { menuOpen = false; $('menu').style.display = 'none'; setSpeed(+SET.speed || 1); tutorialUI(); }
$('btnNew').onclick = () => { newGame(); lastDay = S.day; buildPrioUI(); buildBuildBar(); centerCam(CAMP.x, CAMP.y); closeMenu(); };
$('btnContinue').onclick = () => { if (loadGame(true)) { centerCam(CAMP.x, CAMP.y); closeMenu(); } };
$('btnSettings').onclick = () => { $('menuMain').style.display = 'none'; $('menuSettings').style.display = '';
  $('setMusik').value = SET.musik; $('setEfek').value = SET.efek; $('setSpeed').value = SET.speed; $('setLang').value = SET.lang; };
['setMusik', 'setEfek'].forEach(id => $(id).addEventListener('input', () => { SET.musik = +$('setMusik').value; SET.efek = +$('setEfek').value; applyAudio(); sfx('klik'); }));
$('mutebtn').onclick = () => { SET.mute = !SET.mute; localStorage.setItem(SET_KEY, JSON.stringify(SET)); applyAudio(); };
$('btnBack').onclick = () => { SET.musik = +$('setMusik').value; SET.efek = +$('setEfek').value; SET.speed = +$('setSpeed').value; SET.lang = $('setLang').value;
  localStorage.setItem(SET_KEY, JSON.stringify(SET)); applyAudio(); openMenu(); };
applyAudio();
$('menubtn').onclick = () => openMenu();
})();
