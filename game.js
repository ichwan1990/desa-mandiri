(() => {
let TEXT = null;
const C = CONFIG, T = C.TILE;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
cv.width = C.VIEW_W; cv.height = C.VIEW_H; ctx.imageSmoothingEnabled = false;
const RES_OF = { pohon: 'kayu', batu: 'batu', semak: 'makanan' };
const SKILL_OF = { kayu: 'menebang', batu: 'menambang', makanan: 'meramu', bangun: 'membangun', bertani: 'bertani', air: 'meramu', riset: 'meneliti' };
const JOB_LABEL = { bangun: 'Membangun', makanan: 'Makanan', bertani: 'Bertani', air: 'Air', kayu: 'Kayu', batu: 'Batu', riset: 'Riset' };
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
    health: 100, skills: { menebang: 0, menambang: 0, meramu: 0, membangun: 0, bertani: 0, meneliti: 0 }, task: null, carry: null, color: S.villagers.length });
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
const workMult = (v, sk) => 1 + (v.skills[sk] || 0) * 0.5 + (S.res.alat >= 1 ? C.TOOLS.bonus : 0);
function computeBanks() { S.banks = [];
  for (let y = 0; y < C.MAP_H; y++) for (let x = 0; x < C.MAP_W; x++) if (S.tiles[y][x] === 0 &&
    [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => S.tiles[y + b] && S.tiles[y + b][x + a] === 1)) S.banks.push({ x, y }); }
const canAfford = cost => Object.entries(cost).every(([k, n]) => S.res[k] >= n);

// ---------- AI ----------
function chooseTask(v) {
  const st = storage(v);
  // 1. Lapar kritis
  if (v.hunger <= C.HUNGER_CRIT && foodTotal() > 0 && st) return { kind: 'makan', target: stPos(st) };
  // 2. Tidur
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
  for (const job of Object.keys(S.prio)) { const p = S.prio[job]; if (!p) continue;
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
  const f = nearest(done('ladang').filter(b => !taken.has(b) && (b.stage === 'siap' || !harvestOnly && b.stage === 'kosong' && !isWinter())), v, center);
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
function findPath(sx, sy, gx, gy) {
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
      const n = ny * W + nx, ng = g.get(cur) + (dx && dy ? 1.414 : 1);
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
  let step = C.VILLAGER_SPEED * dt;
  while (step > 0 && v.path.length) { const wp = v.path[0], d = dist(v, wp);
    if (d > 0.001) { const dx = wp.x - v.x, dy = wp.y - v.y; v.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); }
    if (d <= step) { v.x = wp.x; v.y = wp.y; step -= d; v.path.shift(); }
    else { v.x += (wp.x - v.x) / d * step; v.y += (wp.y - v.y) / d * step; step = 0; } }
  v.moving = v.path.length > 0;
  if (!v.moving) { v.pathKey = null; return true; } return false;
}

function updateVillager(v, dt) {
  const perSec = 1 / C.DAY_LENGTH_SEC;
  const hm = isWinter() ? Math.max(1, (done('lumbung').length ? C.GRANARY_WINTER_HUNGER_MULT : C.WINTER_HUNGER_MULT) + techVal('lapar_dingin', 0)) : 1;
  v.hunger = Math.max(0, v.hunger - C.HUNGER_PER_DAY * hm * perSec * dt);
  if (v.health == null) v.health = 100;
  if (v.hunger <= 0) v.health -= C.HEALTH.starvePerDay * perSec * dt; else if (v.hunger > 50) v.health = Math.min(100, v.health + C.HEALTH.regenPerDay * perSec * dt);
  if (!(v.task && v.task.kind === 'tidur' && v.task.asleep)) v.energy = Math.max(0, v.energy - C.ENERGY_PER_DAY * perSec * dt);
  const fire = nearest(done('apiunggun'), v, center);
  if (fire && dist(center(fire), v) < 4 * techVal('api_radius', 1)) v.mood = Math.min(100, v.mood + C.MOOD_CAMPFIRE_BONUS * dt); else v.mood -= C.MOOD_DECAY * dt * (isWinter() && S.res.kulit < S.villagers.length ? C.WINTER_MOOD_DECAY_MULT_NO_HIDE : 1);
  if (v.hunger < C.HUNGER_CRIT || v.energy < C.ENERGY_CRIT) v.mood -= C.MOOD_HUNGRY_PENALTY * dt;
  v.mood = Math.max(0, Math.min(100, v.mood));
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
      v.hunger = Math.min(100, v.hunger + (a + g) * per); v.task = null; break; }
    case 'tidur': t.asleep = true; v.energy = Math.min(100, v.energy + C.SLEEP_REGEN_PER_SEC * dt);
      if (v.energy >= 100 && !isNight() || v.hunger <= C.HUNGER_CRIT && foodTotal() > 0) v.task = null; break;
    case 'kumpul': { const n = t.node; if (n.amount <= 0) { v.task = null; break; }
      v.dir = 2; v.working = true; t.work += dt * workMult(v, SKILL_OF[t.res]);
      if (t.work >= C.GATHER_TIME[t.res]) { v.working = false; if (S.res.alat > 0) S.res.alat = Math.max(0, S.res.alat - C.TOOLS.wearPerHaul); const amt = Math.min(C.CARRY[t.res] + Math.round(techVal('carry_' + t.res, 0)), n.amount); n.amount -= amt;
        if (n.amount <= 0) n.regrow = n.type === 'semak' ? C.BUSH_REGROW_SEC : 0;
        v.skills[SKILL_OF[t.res]] += C.SKILL_GAIN; v.carry = { res: t.res, n: amt }; sfx(t.res === 'kayu' ? 'tebang' : t.res === 'batu' ? 'tambang' : 'klik');
        const st = storage(v); v.task = st ? { kind: 'setor', target: stPos(st) } : null; } break; }
    case 'bangun': { const b = t.b; if (b.done || !S.buildings.includes(b)) { v.task = null; break; }
      if (b.done) { b.hp = Math.min(100, (b.hp ?? 100) + C.BUILDING_DAMAGE.repairPerSec * dt * workMult(v, 'membangun')); v.working = true;
        if (b.hp >= 100) { log(`${v.name} selesai memperbaiki ${C.BUILDINGS[b.type].nama}.`); v.working = false; v.task = null; } break; }
      v.working = true; b.progress += dt * workMult(v, 'membangun');
      if (b.progress >= C.BUILDINGS[b.type].work) { b.done = true; v.skills.membangun += C.SKILL_GAIN * 5;
        log(`${v.name} selesai membangun ${C.BUILDINGS[b.type].nama}.`); vhist(v, `Selesai membangun ${C.BUILDINGS[b.type].nama}`); sfx('bangun'); v.working = false; v.task = null; } break; }
    case 'tani': { const b = t.b; if (!S.buildings.includes(b) || (t.harvest ? b.stage !== 'siap' : b.stage !== 'kosong')) { v.task = null; break; }
      v.working = true; t.work += dt * workMult(v, 'bertani');
      if (t.work >= (t.harvest ? C.FIELD.harvestTime : C.FIELD.plantTime) * techVal('tani_waktu', 1)) { v.working = false; v.skills.bertani += C.SKILL_GAIN;
        if (t.harvest) { const F = C.FIELD, res = F.crops[b.crop].res, n = Math.round(F.yieldMin + Math.random() * (F.yieldMax - F.yieldMin) + techVal('ladang_hasil', 0));
          b.stage = 'kosong'; b.grow = 0; b.harvested = true; S.harvests = (S.harvests || 0) + 1; v.carry = { res, n }; vhist(v, `Memanen ${n} ${RES_LABEL[res].toLowerCase()}`); sfx('panen'); log(`${v.name} memanen ${n} ${RES_LABEL[res].toLowerCase()} dari ladang ${b.crop}.`);
          const st = storage(v); v.task = { kind: 'setor', target: stPos(st) }; }
        else { b.stage = 'tumbuh'; b.grow = 0; b.harvested = false; v.task = null; } } break; }
    case 'air': { v.working = true; t.work += dt * workMult(v, 'meramu');
      if (t.work >= (t.src === 'sumur' ? C.WATER.wellTime : C.WATER.riverTime)) { v.working = false;
        v.carry = { res: 'air', n: t.src === 'sumur' ? C.WATER.wellYield : C.WATER.riverYield }; v.task = { kind: 'setor', target: stPos(storage(v)) }; } break; }
    case 'diam': t.timer -= dt; if (t.timer <= 0) v.task = null; break;
    case 'riset': { const R = S.research; if (!R) { v.working = false; v.task = null; break; } const n = techNodes().find(x => x.id === R.id);
      v.working = true; R.progress += dt * workMult(v, 'meneliti');
      if (!t.t0) t.t0 = S.t; if (S.t - t.t0 > 20) { v.working = false; v.task = null; } // pilih ulang tiap 20 dtk
      if (R.progress >= n.work) { S.techDone.push(n.id); S.research = null; v.skills.meneliti = (v.skills.meneliti || 0) + C.SKILL_GAIN * 5;
        log(n.teks_selesai ? '🎓 ' + fill(n.teks_selesai, { nama: v.name }) : `🎓 ${v.name} menyelesaikan riset ${n.nama}!`); sfx('panen'); vhist(v, `Menyelesaikan riset ${n.nama}`); v.working = false; v.task = null; techPanelUI(); } break; }
  }
}
function deposit(v, drop) { if (v.carry) { if (!drop) { S.res[v.carry.res] += v.carry.n; S.gathered[v.carry.res] = (S.gathered[v.carry.res] || 0) + v.carry.n; notify(v.carry.res, v.carry.n, v); } v.carry = null; } }

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
  const vs = S.villagers, a = pick(vs), b = vs.find(v => v !== a) || a, m = TEXT.meta || {};
  const map = { hari: S.day, nama: a.name, nama2: b.name, umur: a.age, jumlah: 3 + Math.floor(Math.random() * 6),
    sumber_daya: pick(['kayu', 'batu', 'makanan']), bangunan: pick(Object.values(m.bangunan || { x: 'Gubuk' })),
    skill: pick(Object.values(m.skill || { x: 'menebang' })), musim: C.SEASON_NAMES[season()].toLowerCase(), pesan_musim: '', era: C.ERAS[S.era | 0].nama,
    jumlah2: 2 + Math.floor(Math.random() * 6), sumber_daya2: pick(['makanan', 'gandum', 'alat']), persen: 10, nilai: 1, kuota: 0, hari_sisa: 5,
    teknologi: S.research ? (techNodes().find(n => n.id === S.research.id) || {}).nama : 'ilmu baru', pencapaian: '', pedagang: (S.merchant && S.merchant.name) || 'Pedagang', ...extra };
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
    else if (k === 'kesehatan_bangunan') { S.buildings.filter(b => b.done).forEach(b => b.hp = Math.max(0, Math.min(100, (b.hp ?? 100) + n)));
      if (n < 0) log(`Bangunan rusak ${-n}%. Tukang akan memperbaikinya.`); }
    else console.info(`[efek] kunci "${k}" belum didukung (${src}), diabaikan.`);
  }
}
// pilih event berbobot sesuai C.EVENT_RULES (musim, maks per tahun, cooldown)
function eventAllowed(e) { const r = (C.EVENT_RULES || {})[e.id] || {}, year = Math.floor((S.day - 1) / (C.SEASON_DAYS * C.SEASONS.length));
  if (r.musim && !r.musim.includes(season())) return false;
  if (r.maksPerTahun && ((S.eventYearCount || {})[e.id + '@' + year] || 0) >= r.maksPerTahun) return false;
  if (r.cooldownHari && S.day - ((S.eventLastDay || {})[e.id] ?? -999) < r.cooldownHari) return false;
  return true; }
const eventWeight = e => { const r = (C.EVENT_RULES || {})[e.id]; return r && r.bobot != null ? r.bobot : e.bobot ?? 1; };
const allEvents = () => !TEXT ? [] : [...(TEXT.event_acak || []), ...(TEXT.event_era_lanjut || [])];
const eventEraOk = e => !e.era || eraIndex(e.era) <= (S.era | 0);
function maybeEvent() { if (!TEXT || !TEXT.event_acak || S.day < C.EVENT_MIN_DAY || Math.random() > C.EVENT_CHANCE_PER_DAY) return;
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
  S.event = null; S.eventName = null; $('modal').style.display = 'none'; }
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
    default: return t.kind; } }
function openVillager(id) { const v = S.villagers.find(x => x.id === id); if (!v) return; selVid = id; tutAction('klik_penduduk');
  const el = $('vpanel'); el.style.display = 'block';
  el.innerHTML = `<button class="close" id="vpClose">✕</button><h3 style="margin-top:0">${v.name}</h3>
    <label>Tugas favorit: <select id="favSel"><option value="">— Tidak ada —</option>${Object.entries(JOB_LABEL).map(([k, l]) => `<option value="${k}" ${v.fav === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <div style="font-size:11px;opacity:.75">Favorit memberi bonus saat memilih kerja, tapi makan/tidur/darurat tetap didahulukan.</div><div id="vpDyn"></div>`;
  delete _html.vpDyn; villagerPanelUI(); }
function closeVillager() { selVid = null; $('vpanel').style.display = 'none'; }
function villagerPanelUI() { if (selVid == null) return; const v = S.villagers.find(x => x.id === selVid); if (!v) { closeVillager(); return; }
  const uiIco = k => ASSETS[k] && ASSETS[k].ui ? `<img class="ico" src="${ASSETS[k].ui}">` : '';
  const bar = (label, val, col, fill, ik) => `${uiIco(ik)}${label} <b>${val | 0}</b><div class="bar"><i class="${fill}" style="width:${Math.max(0, Math.min(100, val))}%;--c:var(${col})"></i></div>`;
  const SK = { menebang: 'Menebang', menambang: 'Menambang', meramu: 'Meramu', membangun: 'Membangun', bertani: 'Bertani', meneliti: 'Meneliti' };
  setHTML('vpDyn', `<div style="font-size:12px;margin:6px 0">${v.age} th · ${role(v)}<br>Sedang: <b>${TASK_TEXT(v.task)}</b>${v.carry ? ` (membawa ${v.carry.n} ${RES_LABEL[v.carry.res].toLowerCase()})` : ''}</div>
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
  for (const v of S.villagers.slice()) if (v.health <= 0) { S.villagers.splice(S.villagers.indexOf(v), 1); log(`💀 ${v.name} meninggal karena kelaparan/sakit.`); }
  const winter = isWinter();
  for (const b of S.buildings) if (b.type === 'ladang' && b.done && b.stage === 'tumbuh' && !winter && (b.grow += dt / C.DAY_LENGTH_SEC) >= C.FIELD.growDays + techVal('ladang_tumbuh', 0, { b })) b.stage = 'siap';
  if (!winter) for (const n of S.nodes) if (n.type === 'semak' && n.amount <= 0 && (n.regrow -= dt) <= 0) n.amount = C.NODE_AMOUNT.makanan;
  S.nodes = S.nodes.filter(n => n.amount > 0 || n.type === 'semak');
  if (S.day !== lastDay) { lastDay = S.day; newDay(); }
}
function newDay() {
  const pop = S.villagers.length; if (!pop) { log('Desa telah kosong... Mulai permainan baru.'); return; }
  // musim
  if ((S.day - 1) % C.SEASON_DAYS === 0) { const se = season(), m = TEXT && TEXT.meta && TEXT.meta.musim && TEXT.meta.musim.find(x => x.id === se);
    log(`🍂 Musim ${C.SEASON_NAMES[se]} tiba. ${m ? m.pesan : ''}`);
    const pf = TEXT && TEXT.pasar && TEXT.pasar.pesan_fluktuasi, fid = { dingin: 'musim_dingin_pangan', semi: 'semi_kayu', panas: 'panas_makanan' }[se];
    if (pf && fid && marketOpen()) { const x = pf.find(o => o.id === fid); if (x) log('📈 ' + fill(x.teks)); } }
  // air
  const wNeed = pop * C.WATER.perDayPerPop;
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
  if ((se === 'gugur' || se === 'dingin') && foodTotal() < buffer) log(`⚠️ Stok untuk musim dingin kurang: ${Math.floor(foodTotal())}/${Math.ceil(buffer)} (target ${C.WINTER_BUFFER_DAYS} hari). Perbanyak panen & simpan makanan!`);
  marketNewDay();
  checkEra();
  const mood = S.villagers.reduce((a, v) => a + v.mood, 0) / pop;
  S.moodGoodDays = mood >= C.SPAWN.minMood ? S.moodGoodDays + 1 : 0;
  const sp = C.SPAWN, foodOk = foodTotal() >= pop * sp.foodDaysPerPop * sp.foodPerDayPerPop;
  if (foodOk && capacity() > pop && S.moodGoodDays >= sp.moodDays && S.day - S.lastSpawnDay >= sp.cooldownDays - (done('balai').length ? C.TOWN_HALL_SPAWN_COOLDOWN_CUT : 0)) {
    const h = done('gubuk').find(Boolean), c = center(h); spawnVillager(c.x, c.y + 1.5); S.lastSpawnDay = S.day;
  }
  const need = pop * C.SPAWN.foodPerDayPerPop;
  if (foodTotal() < need * 2) log(`⚠️ PERINGATAN: makanan hanya cukup ~${(foodTotal() / need).toFixed(1)} hari! Naikkan prioritas Makanan.`);
  if (S.villagers.some(v => v.hunger <= 5)) log('⚠️ Ada penduduk kelaparan parah!');
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
const winterKey = k => isWinter() && ASSETS[k + '_dingin'] ? k + '_dingin' : k;
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
  const list = [];
  for (const n of S.nodes) { if (!inView(n.x, n.y)) continue;
    const key = winterKey(n.type === 'semak' && n.amount <= 0 ? 'semak_kosong' : n.type);
    list.push({ y: n.y + 1, draw: () => sprite(key, n.x, n.y) }); }
  for (const b of S.buildings) { const d = C.BUILDINGS[b.type];
    if (b.type === 'ladang') { list.push({ y: b.y + 0.5, draw: () => drawBuilding(b, d) }); continue; }  // ladang = lantai
    list.push({ y: b.y + d.h, draw: () => drawBuilding(b, d) }); }
  // penduduk yang berbagi tile digeser sedikit agar tidak bertumpuk
  const groups = {};
  if (S.merchant) list.push({ y: S.merchant.y + 1, draw: () => drawMerchant(S.merchant) });
  for (const v of S.villagers) { const k = Math.round(v.x * 2) + ',' + Math.round(v.y * 2); (groups[k] = groups[k] || []).push(v); }
  for (const g of Object.values(groups)) g.forEach((v, i) => { const off = (i - (g.length - 1) / 2) * 12;
    list.push({ y: v.y + 1 + 0.01 * i, draw: () => drawVillager(v, off) }); });
  list.sort((p, q) => p.y - q.y).forEach(o => o.draw());
  if (ASSETS.rel_depan.image) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (S.tiles[y][x] === 2) {
    const bl = S.tiles[y][x - 1] === 2, br = S.tiles[y][x + 1] === 2; sprite('rel_depan', x, y, 1, 1, !bl ? 0 : !br ? 2 : 1); }
  if (!darkness) for (const b of done('apiunggun')) { const g = ASSETS.cahaya.image; if (g) { ctx.globalAlpha = 0.35; ctx.drawImage(g, b.x * T - 32, b.y * T - 32); ctx.globalAlpha = 1; } }
  // malam: overlay (blend normal) lalu cahaya (additive)
  // senja/fajar: tween warna sebelum & sesudah malam
  const tw = 0.06, dusk = Math.max(0, 1 - Math.abs(f - C.NIGHT_START) / tw), dawn = Math.max(0, 1 - Math.abs(f - C.NIGHT_END) / tw);
  const vw = [cam.x - 2, cam.y - 2, cv.width / cam.zoom + 4, cv.height / cam.zoom + 4];
  if (dusk > 0) { ctx.globalAlpha = dusk; ctx.fillStyle = ASSETS.senja_overlay.color; ctx.fillRect(...vw); ctx.globalAlpha = 1; }
  if (dawn > 0) { ctx.globalAlpha = dawn; ctx.fillStyle = ASSETS.fajar_overlay.color; ctx.fillRect(...vw); ctx.globalAlpha = 1; }
  if (darkness > 0) {
    ctx.globalAlpha = darkness; ctx.fillStyle = ASSETS.malam_overlay.color; ctx.fillRect(cam.x - 2, cam.y - 2, cv.width / cam.zoom + 4, cv.height / cam.zoom + 4);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of S.buildings) { const d = C.BUILDINGS[b.type]; if (!b.done || !d.light) continue;
      const g = ASSETS[d.light === 'besar' ? 'glow_besar' : 'glow_kecil'], im = g.image; if (!im) continue;
      const c = center(b), flick = b.type === 'apiunggun' ? 0.85 + Math.sin(performance.now() / 90) * 0.1 : 0.8;
      ctx.globalAlpha = darkness * flick; ctx.drawImage(im, Math.round(c.x * T + 16 - g.fw / 2), Math.round(c.y * T + 16 - g.fh / 2)); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    for (const b of done('apiunggun')) drawBuilding(b, C.BUILDINGS.apiunggun); // api tetap terang di atas overlay
  }
  const ICON = { kayu: '🪵', batu: '🪨', makanan: '🍎', gandum: '🌾', air: '💧' };
  for (const n of notes) { ctx.globalAlpha = Math.max(0, Math.min(1, n.life)); ctx.fillStyle = '#fff6a0'; ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`+${n.n} ${ICON[n.res] || RES_LABEL[n.res] || n.res}`, n.x * T, n.y * T - (2 - n.life) * 12); ctx.globalAlpha = 1; }
  if (placing) { const d = C.BUILDINGS[placing], ok = validSpot(placing, mouse.x, mouse.y) && canAfford(d.cost);
    ctx.fillStyle = ok ? 'rgba(255,255,255,0.4)' : 'rgba(255,0,0,0.4)'; ctx.fillRect(mouse.x * T, mouse.y * T, d.w * T, d.h * T); }
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
  if (cim && v.carry && v.moving && cb.tipe[v.carry.res] != null) { ctx.drawImage(cim, (Math.floor(t * cb.fps) % cb.frames) * 32, (cb.tipe[v.carry.res] * 4 + dir) * 32, 32, 32, dx, dy, 32, 32); workRow = -1; }
  else if (wim && v.carry && v.moving) { workRow = wk.rows.bawa; fps = wk.fpsCarry; }
  if (workRow === -1) { /* sudah digambar (membawa) */ }
  else if (workRow !== null) ctx.drawImage(wim, (Math.floor(t * fps) % wk.frames) * 32, (workRow + dir) * 32, 32, 32, dx, dy, 32, 32);
  else if (im) { const moving = v.moving && !asleep, row = (moving ? 4 : 0) + dir;
    const fr = Math.floor(t * (moving ? a.fpsWalk : a.fpsIdle)) % a.frames;
    ctx.drawImage(im, fr * 32, row * 32, 32, 32, dx, dy, 32, 32); }
  else { ctx.fillStyle = a.shirt[v.color % a.shirt.length]; ctx.fillRect(px - 6, py - 2, 12, 12);
    ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(px, py - 7, 6, 0, 7); ctx.fill(); }
  if (v.carry && workRow === null) { ctx.fillStyle = { kayu: '#8b5a2b', batu: '#aaa', makanan: '#e0413a', gandum: '#e6c35a', air: '#5ab0e6' }[v.carry.res] || '#fff'; ctx.fillRect(px + 6, py - 2, 6, 6); }
  ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(v.name + (asleep ? ' z' : ''), px, py - 16); ctx.textAlign = 'left';
}
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
  const TL = { makan: 'Makan', tidur: 'Tidur', kumpul: 'Mengumpulkan', setor: 'Menyetor', bangun: 'Membangun', diam: 'Santai', tani: 'Bertani', air: 'Mengambil air' };
  setHTML('vil', S.villagers.map(v => `<div class="v" data-vid="${v.id}"><b>${v.name}</b> (${v.age} th, ${role(v)}) — ${v.task ? TL[v.task.kind] + (v.task.kind === 'kumpul' ? ' ' + v.task.res : v.task.kind === 'tani' ? (v.task.harvest ? ' (panen)' : ' (tanam)') : '') : '-'}<br>
    Lapar ${v.hunger | 0} · Energi ${v.energy | 0} · Hati ${v.mood | 0} · Sehat ${(v.health ?? 100) | 0}</div>`).join(''));
  const warn = foodTotal() < foodPerDay() * 2, wwarn = (se === 'gugur' || se === 'dingin') && foodTotal() < foodPerDay() * C.WINTER_BUFFER_DAYS;
  $('res').innerHTML += (warn ? ' &nbsp; <b style="color:#ff6b6b">⚠️ Makanan menipis!</b>' : wwarn ? ' &nbsp; <b style="color:#ffb36b">❄️ Stok musim dingin kurang</b>' : '') + (S.res.air < S.villagers.length ? ' &nbsp; <b style="color:#6bc6ff">💧 Air menipis!</b>' : '');
  const era = C.ERAS[S.era | 0], next = C.ERAS[(S.era | 0) + 1];
  setHTML('era', `<b>${era.nama}</b>` + (next ? `<br>Menuju <b>${next.nama}</b>:<br>` + eraReqStatus(next).map(([t, ok]) => `${ok ? '✅' : '▫️'} ${t}`).join('<br>') : '<br>Era tertinggi tercapai!'));
  document.querySelectorAll('[data-b]').forEach(bt => { const k = bt.dataset.b; if (k) bt.disabled = !unlocked(k) || !canAfford(C.BUILDINGS[k].cost); });
  setHTML('quest', questUI()); villagerPanelUI(); techPanelUI(); marketUI(); $('marketbtn').classList.toggle('on', marketOpen());
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
  $('prio').innerHTML = Object.keys(S.prio).map(k => `<div class="row">${JOB_LABEL[k]} <span>${[0, 1, 2, 3].map(n =>
    `<button data-p="${k}" data-n="${n}" class="${S.prio[k] === n ? 'on' : ''}">${n ? n : 'Off'}</button>`).join('')}</span></div>`).join('');
}
document.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') sfx('klik'); const d = e.target.dataset; if (!d) return;
  if (e.target.id === 'vpClose') closeVillager();
  if (e.target.id === 'techbtn') openTech();
  if (e.target.id === 'marketbtn') openMarket();
  if (e.target.id === 'mkClose') $('market').style.display = 'none';
  if (e.target.id === 'mkDo') { doTrade($('mkGive').value, +$('mkQty').value, $('mkGet').value); marketUI(); }
  if (e.target.id === 'techClose') $('techpanel').style.display = 'none';
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
cv.addEventListener('click', e => { if (drag && drag.moved) return; const p = scr(e), t = screenToTile(p.x, p.y); mouse.x = t.x; mouse.y = t.y;
  if (!placing) { const wx = (cam.x + p.x / cam.zoom) / T - 0.5, wy = (cam.y + p.y / cam.zoom) / T - 0.4;
    const v = nearest(S.villagers.filter(o => Math.hypot(o.x - wx, o.y - wy) < 0.8), { x: wx, y: wy }); if (v) openVillager(v.id); return; }
  const d = C.BUILDINGS[placing];
  if (!canAfford(d.cost)) return log(`Bahan tidak cukup untuk ${d.nama}.`);
  if (!validSpot(placing, mouse.x, mouse.y)) return;
  for (const [k, n] of Object.entries(d.cost)) S.res[k] -= n;
  addBuilding(placing, mouse.x, mouse.y, false); log(`Rencana ${d.nama} ditempatkan.`); placing = null; tutAction('taruh_bangunan'); });
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
window.DESA = { get state() { return S; }, applyEffects, allEvents, eventEraOk, fill, marketNewDay, priceOf, tradeQuote, doTrade, spawnMerchant, marketOpen, quota, foodSellMult, openMarket, startResearch, techVal, techNodes, openTech, showEvent, validSpot, canAfford, addBuilding, season,  step, cam, findPath, setZoom, centerCam };
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
