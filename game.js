(() => {
let TEXT = null;
const C = CONFIG, T = C.TILE;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
cv.width = C.VIEW_W; cv.height = C.VIEW_H; ctx.imageSmoothingEnabled = false;
const RES_OF = { pohon: 'kayu', batu: 'batu', semak: 'makanan' };
const SKILL_OF = { kayu: 'menebang', batu: 'menambang', makanan: 'meramu', bangun: 'membangun', bertani: 'bertani', air: 'meramu' };
const JOB_LABEL = { bangun: 'Membangun', makanan: 'Makanan', bertani: 'Bertani', air: 'Air', kayu: 'Kayu', batu: 'Batu' };
const RES_LABEL = { kayu: 'Kayu', batu: 'Batu', makanan: 'Makanan', gandum: 'Gandum', air: 'Air', alat: 'Alat', kulit: 'Kulit', papan: 'Papan', batu_bata: 'Batu bata' };
const CAMP = C.CAMP;
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
  computeBanks();
  (C.START_BUILDINGS || []).forEach(([t, x, y]) => addBuilding(t, x, y, true));
  S.gathered = {}; S.era = 0; S.questIdx = 0; S.tutorialStep = 0; S.restUntil = 0; S.event = null;
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
    health: 100, skills: { menebang: 0, menambang: 0, meramu: 0, membangun: 0, bertani: 0 }, task: null, carry: null, color: S.villagers.length });
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
const unlocked = type => eraIndex(C.BUILDINGS[type].era || 'perkemahan') <= (S.era | 0);
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
    const t = job === 'bangun' ? buildTask(v) : job === 'bertani' ? farmTask(v) : job === 'air' ? waterTask(v) : gatherTask(v, job); if (!t) continue;
    const full = job === 'air' ? S.res.air >= S.villagers.length * C.WATER.perDayPerPop * C.WATER_SURPLUS_DAYS : job === 'makanan' && foodTotal() >= S.villagers.length * C.SPAWN.foodDaysPerPop * C.SPAWN.foodPerDayPerPop * C.FOOD_SURPLUS_FACTOR;
    const capped = C.RES_SOFT_CAP[job] && S.res[job] >= C.RES_SOFT_CAP[job] * Math.max(1, S.villagers.length / 2);
    const sc = p * 10 - (full || capped ? C.FOOD_SURPLUS_PENALTY : 0) + (S.villagers.filter(o => o.task && o.task.res === job).length ? -4 : 0) - dist(v, t.target) * 0.3 + v.skills[SKILL_OF[job]] * 5;
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
  const hm = isWinter() ? (done('lumbung').length ? C.GRANARY_WINTER_HUNGER_MULT : C.WINTER_HUNGER_MULT) : 1;
  v.hunger = Math.max(0, v.hunger - C.HUNGER_PER_DAY * hm * perSec * dt);
  if (v.health == null) v.health = 100;
  if (v.hunger <= 0) v.health -= C.HEALTH.starvePerDay * perSec * dt; else if (v.hunger > 50) v.health = Math.min(100, v.health + C.HEALTH.regenPerDay * perSec * dt);
  if (!(v.task && v.task.kind === 'tidur' && v.task.asleep)) v.energy = Math.max(0, v.energy - C.ENERGY_PER_DAY * perSec * dt);
  const fire = nearest(done('apiunggun'), v, center);
  if (fire && dist(center(fire), v) < 4) v.mood = Math.min(100, v.mood + C.MOOD_CAMPFIRE_BONUS * dt); else v.mood -= C.MOOD_DECAY * dt * (isWinter() && S.res.kulit < S.villagers.length ? C.WINTER_MOOD_DECAY_MULT_NO_HIDE : 1);
  if (v.hunger < C.HUNGER_CRIT || v.energy < C.ENERGY_CRIT) v.mood -= C.MOOD_HUNGRY_PENALTY * dt;
  v.mood = Math.max(0, Math.min(100, v.mood));
  // interupsi kebutuhan kritis
  if (v.task && !['makan', 'tidur'].includes(v.task.kind) && (v.hunger <= C.HUNGER_CRIT && foodTotal() > 0 || v.energy <= C.ENERGY_CRIT)) { deposit(v, true); v.task = null; }
  if (!v.task) v.task = chooseTask(v);
  const t = v.task;
  if (t.kind === 'setor') { const m = moveTo(v, t.target, dt); if (m) { deposit(v); v.task = null; } else if (m === null) { deposit(v, true); v.task = null; } return; }
  const mv = moveTo(v, t.target, dt);
  if (mv === null) { if (t.node) t.node.unreachable = S.t + 60; v.task = null; v.pathKey = null; return; }
  if (!mv) { v.working = false; return; }
  switch (t.kind) {
    case 'makan': { const per = C.EAT_RESTORE_PER_FOOD * (done('dapur').length ? 1 + C.KITCHEN_EAT_BONUS : 1);
      let need = Math.ceil((100 - v.hunger) / per); const a = Math.min(need, S.res.makanan); S.res.makanan -= a; need -= a;
      const g = Math.min(need, S.res.gandum || 0); S.res.gandum -= g;
      v.hunger = Math.min(100, v.hunger + (a + g) * per); v.task = null; break; }
    case 'tidur': t.asleep = true; v.energy = Math.min(100, v.energy + C.SLEEP_REGEN_PER_SEC * dt);
      if (v.energy >= 100 && !isNight() || v.hunger <= C.HUNGER_CRIT && foodTotal() > 0) v.task = null; break;
    case 'kumpul': { const n = t.node; if (n.amount <= 0) { v.task = null; break; }
      v.dir = 2; v.working = true; t.work += dt * workMult(v, SKILL_OF[t.res]);
      if (t.work >= C.GATHER_TIME[t.res]) { v.working = false; if (S.res.alat > 0) S.res.alat = Math.max(0, S.res.alat - C.TOOLS.wearPerHaul); const amt = Math.min(C.CARRY[t.res], n.amount); n.amount -= amt;
        if (n.amount <= 0) n.regrow = n.type === 'semak' ? C.BUSH_REGROW_SEC : 0;
        v.skills[SKILL_OF[t.res]] += C.SKILL_GAIN; v.carry = { res: t.res, n: amt };
        const st = storage(v); v.task = st ? { kind: 'setor', target: stPos(st) } : null; } break; }
    case 'bangun': { const b = t.b; if (b.done || !S.buildings.includes(b)) { v.task = null; break; }
      if (b.done) { b.hp = Math.min(100, (b.hp ?? 100) + C.BUILDING_DAMAGE.repairPerSec * dt * workMult(v, 'membangun')); v.working = true;
        if (b.hp >= 100) { log(`${v.name} selesai memperbaiki ${C.BUILDINGS[b.type].nama}.`); v.working = false; v.task = null; } break; }
      v.working = true; b.progress += dt * workMult(v, 'membangun');
      if (b.progress >= C.BUILDINGS[b.type].work) { b.done = true; v.skills.membangun += C.SKILL_GAIN * 5;
        log(`${v.name} selesai membangun ${C.BUILDINGS[b.type].nama}.`); v.working = false; v.task = null; } break; }
    case 'tani': { const b = t.b; if (!S.buildings.includes(b) || (t.harvest ? b.stage !== 'siap' : b.stage !== 'kosong')) { v.task = null; break; }
      v.working = true; t.work += dt * workMult(v, 'bertani');
      if (t.work >= (t.harvest ? C.FIELD.harvestTime : C.FIELD.plantTime)) { v.working = false; v.skills.bertani += C.SKILL_GAIN;
        if (t.harvest) { const F = C.FIELD, res = F.crops[b.crop].res, n = Math.round(F.yieldMin + Math.random() * (F.yieldMax - F.yieldMin));
          b.stage = 'kosong'; b.grow = 0; b.harvested = true; v.carry = { res, n }; log(`${v.name} memanen ${n} ${RES_LABEL[res].toLowerCase()} dari ladang ${b.crop}.`);
          const st = storage(v); v.task = { kind: 'setor', target: stPos(st) }; }
        else { b.stage = 'tumbuh'; b.grow = 0; b.harvested = false; v.task = null; } } break; }
    case 'air': { v.working = true; t.work += dt * workMult(v, 'meramu');
      if (t.work >= (t.src === 'sumur' ? C.WATER.wellTime : C.WATER.riverTime)) { v.working = false;
        v.carry = { res: 'air', n: t.src === 'sumur' ? C.WATER.wellYield : C.WATER.riverYield }; v.task = { kind: 'setor', target: stPos(storage(v)) }; } break; }
    case 'diam': t.timer -= dt; if (t.timer <= 0) v.task = null; break;
  }
}
function deposit(v, drop) { if (v.carry) { if (!drop) { S.res[v.carry.res] += v.carry.n; S.gathered[v.carry.res] = (S.gathered[v.carry.res] || 0) + v.carry.n; notify(v.carry.res, v.carry.n, v); } v.carry = null; } }

const notes = [];
// notifikasi melayang: digabung per jenis sumber daya di dekatnya, maksimal C.MAX_NOTES
function notify(res, n, v) { const near = notes.find(o => o.res === res && Math.abs(o.x - v.x) < 3 && Math.abs(o.y - v.y) < 3 && o.life > 1);
  if (near) { near.n += n; near.life = 2; return; }
  if (notes.length >= (C.MAX_NOTES || 6)) notes.shift(); notes.push({ res, n, x: v.x, y: v.y, life: 2 }); }
const ROLE = { menebang: 'Penebang', menambang: 'Penambang', meramu: 'Peramu', membangun: 'Tukang', bertani: 'Petani' };
function role(v) { const [k, n] = Object.entries(v.skills).sort((a, b) => b[1] - a[1])[0]; return n > 0 ? ROLE[k] : 'Pendatang'; }
// ---------- konten (TEKS-GAME.json) ----------
const BID = { api_unggun: 'apiunggun', gubuk: 'gubuk', gudang: 'gudang', ladang: 'ladang', sumur: 'sumur', dapur: 'dapur', bengkel_alat: 'bengkel', lumbung: 'lumbung', pasar: 'pasar', balai_desa: 'balai' }; // id JSON -> id internal
const pick = a => a[Math.floor(Math.random() * a.length)];
function fill(tpl, extra = {}) {
  const vs = S.villagers, a = pick(vs), b = vs.find(v => v !== a) || a, m = TEXT.meta || {};
  const map = { hari: S.day, nama: a.name, nama2: b.name, umur: a.age, jumlah: 3 + Math.floor(Math.random() * 6),
    sumber_daya: pick(['kayu', 'batu', 'makanan']), bangunan: pick(Object.values(m.bangunan || { x: 'Gubuk' })),
    skill: pick(Object.values(m.skill || { x: 'menebang' })), musim: 'semi', pesan_musim: '', era: 'Perkemahan', ...extra };
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
    else if (k === 'kesehatan') S.villagers.forEach(v => v.health = Math.max(1, Math.min(100, (v.health ?? 100) + n)));
    else if (k === 'kesehatan_bangunan') { S.buildings.filter(b => b.done).forEach(b => b.hp = Math.max(0, Math.min(100, (b.hp ?? 100) + n)));
      if (n < 0) log(`Bangunan rusak ${-n}%. Tukang akan memperbaikinya.`); }
    else console.info(`[efek] kunci "${k}" belum didukung (${src}), diabaikan.`);
  }
}
function maybeEvent() { if (!TEXT || !TEXT.event_acak || S.day < C.EVENT_MIN_DAY || Math.random() > C.EVENT_CHANCE_PER_DAY) return;
  S.event = pick(TEXT.event_acak).id; showEvent(); }
const addsPop = ef => (ef && ef.penduduk) > 0;
const housingOk = ef => !addsPop(ef) || capacity() >= S.villagers.length + ef.penduduk;
function showEvent() { const e = TEXT && TEXT.event_acak.find(x => x.id === S.event); if (!e) { S.event = null; return; }
  // event pendatang: siapkan nama baru yang belum dipakai untuk {nama}
  if (e.pilihan.some(p => addsPop(p.efek)) && !S.eventName) { const keep = S.nameIdx; S.eventName = freshName(); S.nameIdx = keep; }
  const box = $('modal'); box.style.display = 'block'; const nm = S.eventName ? { nama: S.eventName } : {};
  const noHouse = e.pilihan.some(p => addsPop(p.efek) && !housingOk(p.efek)) ? '<p style="color:#ffb36b">🏠 Tidak ada tempat kosong di gubuk — bangun Gubuk untuk menerima pendatang.</p>' : '';
  box.innerHTML = `<h3>${e.judul}</h3><p>${fill(e.deskripsi, nm)}</p>${noHouse}` + e.pilihan.map((p, i) => { const can = q => affordable(q.efek) && housingOk(q.efek), ok = can(p) || !e.pilihan.some(can) && i === e.pilihan.length - 1 && !addsPop(p.efek);
    const cost = Object.entries(p.efek || {}).map(([k, n]) => `${n > 0 ? '+' : ''}${n} ${RES_LABEL[resKeyOf(k)] || k.replace(/_/g, ' ')}`).join(', ');
    return `<button data-ev="${i}" ${ok ? '' : `disabled title="${housingOk(p.efek) ? 'Sumber daya tidak cukup' : 'Tidak ada tempat kosong di gubuk'}" style="opacity:.45"`}>${p.teks}</button> <small>(${cost})</small>`; }).join('<br>'); }
function chooseEvent(i) { const e = TEXT.event_acak.find(x => x.id === S.event), p = e.pilihan[i];
  if (addsPop(p.efek) && !housingOk(p.efek)) { log(`${e.judul} — Tidak ada tempat untuk ${S.eventName || 'pendatang'}; ia melanjutkan perjalanan.`); }
  else { const nm = S.eventName ? { nama: S.eventName } : {}; applyEffects(p.efek, 'event ' + e.id); log(`${e.judul} — ${fill(p.teks_hasil || '', nm)}`); }
  S.event = null; S.eventName = null; $('modal').style.display = 'none'; }
function quest() { return TEXT && TEXT.quest_awal && TEXT.quest_awal[S.questIdx]; }
function questProgress(q) { const g = q.tujuan;
  switch (g.tipe) {
    case 'bangun': { const id = BID[g.target]; return id ? done(id).length : null; }
    case 'kumpulkan': return g.target in S.res ? (S.gathered[g.target] || 0) : null;
    case 'simpan': return g.target in S.res ? Math.floor(S.res[g.target]) : null;
    case 'capai_penduduk': return S.villagers.length;
    case 'capai_era': { const i = eraIndex(g.target); return i < 0 ? null : ((S.era | 0) >= i ? g.jumlah || 1 : 0); }
    default: return null; } }
function checkQuest() { const q = quest(); if (!q) return; const pr = questProgress(q);
  if (pr === null) { console.info(`[quest] tujuan "${q.tujuan.tipe}:${q.tujuan.target}" belum didukung, dilewati.`); log(`Misi "${q.judul}" belum tersedia di versi ini, dilewati.`); S.questIdx++; return; }
  if (pr >= q.tujuan.jumlah) { applyEffects(q.hadiah, 'quest ' + q.id); log(`✅ Misi selesai: ${q.judul}. ${q.teks_selesai || ''}`); S.questIdx++; } }
function questUI() { const q = quest(); if (!q) return TEXT ? 'Semua misi selesai!' : '-'; const pr = questProgress(q) ?? 0;
  return `<b>${q.judul}</b><br>${q.deskripsi}<br>Progres: ${Math.min(pr, q.tujuan.jumlah)}/${q.tujuan.jumlah}`; }
function tutorialUI() { const t = TEXT && TEXT.tutorial && TEXT.tutorial[S.tutorialStep], el = $('tut');
  if (!t) { el.style.display = 'none'; return; } el.style.display = 'block';
  el.innerHTML = `<b>${t.judul}</b><br>${t.teks}<br><button id="tutNext">Lanjut</button> <button id="tutSkip">Lewati</button>`; }
// ---------- dunia ----------
let lastDay = 1;
function step(dt) {
  S.t += dt; S.day = Math.floor(S.t / C.DAY_LENGTH_SEC) + 1;
  if (S.event) return;
  for (const v of S.villagers) updateVillager(v, dt);
  checkQuest();
  for (const v of S.villagers.slice()) if (v.health <= 0) { S.villagers.splice(S.villagers.indexOf(v), 1); log(`💀 ${v.name} meninggal karena kelaparan/sakit.`); }
  const winter = isWinter();
  for (const b of S.buildings) if (b.type === 'ladang' && b.done && b.stage === 'tumbuh' && !winter && (b.grow += dt / C.DAY_LENGTH_SEC) >= C.FIELD.growDays) b.stage = 'siap';
  if (!winter) for (const n of S.nodes) if (n.type === 'semak' && n.amount <= 0 && (n.regrow -= dt) <= 0) n.amount = C.NODE_AMOUNT.makanan;
  S.nodes = S.nodes.filter(n => n.amount > 0 || n.type === 'semak');
  if (S.day !== lastDay) { lastDay = S.day; newDay(); }
}
function newDay() {
  const pop = S.villagers.length; if (!pop) { log('Desa telah kosong... Mulai permainan baru.'); return; }
  // musim
  if ((S.day - 1) % C.SEASON_DAYS === 0) { const se = season(), m = TEXT && TEXT.meta && TEXT.meta.musim && TEXT.meta.musim.find(x => x.id === se);
    log(`🍂 Musim ${C.SEASON_NAMES[se]} tiba. ${m ? m.pesan : ''}`); }
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
      if (t === 2) { const bl = S.tiles[y][x - 1] === 2, br = S.tiles[y][x + 1] === 2; sprite('jembatan', x, y, 1, 1, !bl ? 0 : !br ? 2 : 1);
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
  for (const v of S.villagers) { const k = Math.round(v.x * 2) + ',' + Math.round(v.y * 2); (groups[k] = groups[k] || []).push(v); }
  for (const g of Object.values(groups)) g.forEach((v, i) => { const off = (i - (g.length - 1) / 2) * 12;
    list.push({ y: v.y + 1 + 0.01 * i, draw: () => drawVillager(v, off) }); });
  list.sort((p, q) => p.y - q.y).forEach(o => o.draw());
  if (!darkness) for (const b of done('apiunggun')) { const g = ASSETS.cahaya.image; if (g) { ctx.globalAlpha = 0.35; ctx.drawImage(g, b.x * T - 32, b.y * T - 32); ctx.globalAlpha = 1; } }
  // malam: overlay (blend normal) lalu cahaya (additive)
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
    const key = b.done && darkness > 0.5 && ASSETS[b.type + '_malam'] && ASSETS[b.type + '_malam'].image ? b.type + '_malam' : b.type;
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
function drawVillager(v, off = 0) {
  const a = ASSETS.penduduk, wk = ASSETS.penduduk_kerja, variant = v.color % 4, px = v.x * T + 16 + off, py = v.y * T + 16;
  const im = a.images && (a.images[variant] || a.image), wim = wk.images && (wk.images[variant] || wk.image);
  const asleep = v.task && v.task.asleep, t = performance.now() / 1000 + v.id * 0.37, dir = v.dir || 0;
  const dx = Math.round(v.x * T + off), dy = Math.round(v.y * T);
  let workRow = null, fps = 0;
  if (wim && v.working && v.task && v.task.kind === 'kumpul' && v.task.res === 'kayu') { workRow = wk.rows.tebang; fps = wk.fpsWork; }
  else if (wim && v.working && v.task && (v.task.kind === 'kumpul' && v.task.res === 'batu' || v.task.kind === 'bangun')) { workRow = wk.rows.tambang; fps = wk.fpsWork; }
  else if (wim && v.carry && v.moving) { workRow = wk.rows.bawa; fps = wk.fpsCarry; }
  if (workRow !== null) ctx.drawImage(wim, (Math.floor(t * fps) % wk.frames) * 32, (workRow + dir) * 32, 32, 32, dx, dy, 32, 32);
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
function ui() {
  const f = dayFrac(), h = Math.floor(f * 24), m = Math.floor((f * 24 % 1) * 60);
  const ICONS = { kayu: '🪵', batu: '🪨', makanan: '🍎', gandum: '🌾', air: '💧', alat: '🔨', kulit: '🧥', papan: '🪚', batu_bata: '🧱' };
  $('res').innerHTML = Object.keys(RES_LABEL).filter(k => k in S.res && (S.res[k] >= 1 || ['kayu', 'batu', 'makanan', 'air'].includes(k)))
    .map(k => `<span title="${RES_LABEL[k]}">${ICONS[k]} ${RES_LABEL[k]}: <b>${Math.floor(S.res[k])}</b></span>`).join(' &nbsp; ') + ` &nbsp; 👥 <b>${S.villagers.length}/${capacity()}</b>`;
  const se = season(), dayInSeason = (S.day - 1) % C.SEASON_DAYS + 1;
  $('time').innerHTML = `${{ semi: '🌱', panas: '☀️', gugur: '🍂', dingin: '❄️' }[se]} ${C.SEASON_NAMES[se]} (${dayInSeason}/${C.SEASON_DAYS}) · Hari <b>${S.day}</b> — ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isNight() ? '🌙 Malam' : '☀️ Siang'}`;
  const TL = { makan: 'Makan', tidur: 'Tidur', kumpul: 'Mengumpulkan', setor: 'Menyetor', bangun: 'Membangun', diam: 'Santai', tani: 'Bertani', air: 'Mengambil air' };
  $('vil').innerHTML = S.villagers.map(v => `<div class="v"><b>${v.name}</b> (${v.age} th, ${role(v)}) — ${v.task ? TL[v.task.kind] + (v.task.kind === 'kumpul' ? ' ' + v.task.res : v.task.kind === 'tani' ? (v.task.harvest ? ' (panen)' : ' (tanam)') : '') : '-'}<br>
    Lapar ${v.hunger | 0} · Energi ${v.energy | 0} · Hati ${v.mood | 0} · Sehat ${(v.health ?? 100) | 0}</div>`).join('');
  const warn = foodTotal() < foodPerDay() * 2, wwarn = (se === 'gugur' || se === 'dingin') && foodTotal() < foodPerDay() * C.WINTER_BUFFER_DAYS;
  $('res').innerHTML += (warn ? ' &nbsp; <b style="color:#ff6b6b">⚠️ Makanan menipis!</b>' : wwarn ? ' &nbsp; <b style="color:#ffb36b">❄️ Stok musim dingin kurang</b>' : '') + (S.res.air < S.villagers.length ? ' &nbsp; <b style="color:#6bc6ff">💧 Air menipis!</b>' : '');
  const era = C.ERAS[S.era | 0], next = C.ERAS[(S.era | 0) + 1];
  $('era').innerHTML = `<b>${era.nama}</b>` + (next ? `<br>Menuju <b>${next.nama}</b>:<br>` + eraReqStatus(next).map(([t, ok]) => `${ok ? '✅' : '▫️'} ${t}`).join('<br>') : '<br>Era tertinggi tercapai!');
  document.querySelectorAll('[data-b]').forEach(bt => { const k = bt.dataset.b; if (k) bt.disabled = !unlocked(k) || !canAfford(C.BUILDINGS[k].cost); });
  $('quest').innerHTML = questUI();
  $('log').innerHTML = S.log.slice(0, 15).map(l => `<div>${l}</div>`).join('');
}
function buildBuildBar() {
  $('buildbar').innerHTML = 'Bangun: ' + Object.entries(C.BUILDINGS).filter(([k]) => unlocked(k)).map(([k, d]) =>
    `<button data-b="${k}" title="${Object.entries(d.cost).map(([r, n]) => n + ' ' + RES_LABEL[r]).join(', ')}">${d.nama}</button>`).join('') + '<button data-b="">Batal</button>'; }
function buildPrioUI() {
  $('prio').innerHTML = Object.keys(S.prio).map(k => `<div class="row">${JOB_LABEL[k]} <span>${[0, 1, 2, 3].map(n =>
    `<button data-p="${k}" data-n="${n}" class="${S.prio[k] === n ? 'on' : ''}">${n ? n : 'Off'}</button>`).join('')}</span></div>`).join('');
}
document.addEventListener('click', e => { const d = e.target.dataset; if (!d) return;
  if (d.ev !== undefined) chooseEvent(+d.ev);
  if (e.target.id === 'tutNext') { S.tutorialStep++; tutorialUI(); }
  if (e.target.id === 'tutSkip') { S.tutorialStep = 999; tutorialUI(); }
  if (d.p) { S.prio[d.p] = +d.n; buildPrioUI(); }
  if (d.s !== undefined) { speed = +d.s; document.querySelectorAll('[data-s]').forEach(b => b.classList.toggle('on', b === e.target)); }
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
  if (!placing) return; const d = C.BUILDINGS[placing];
  if (!canAfford(d.cost)) return log(`Bahan tidak cukup untuk ${d.nama}.`);
  if (!validSpot(placing, mouse.x, mouse.y)) return;
  for (const [k, n] of Object.entries(d.cost)) S.res[k] -= n;
  addBuilding(placing, mouse.x, mouse.y, false); log(`Rencana ${d.nama} ditempatkan.`); placing = null; });
cv.addEventListener('contextmenu', e => { e.preventDefault(); placing = null; });
// save/load: referensi node/bangunan di task tidak diserialisasi, task direset saat muat
const KEY = 'desaMandiriSave';
$('save').onclick = () => { localStorage.setItem(KEY, JSON.stringify({ ...S, villagers: S.villagers.map(v => ({ ...v, task: null, path: null, pathKey: null })) })); log('Permainan disimpan.'); };
$('load').onclick = () => loadGame(true);
$('reset').onclick = () => { if (confirm('Mulai permainan baru?')) { newGame(); lastDay = S.day; buildPrioUI(); buildBuildBar(); tutorialUI(); } };
function loadGame(verbose) { const s = localStorage.getItem(KEY); if (!s) { if (verbose) log('Belum ada simpanan.'); return false; }
  try { const L = JSON.parse(s); if (!L.tiles || L.tiles.length !== C.MAP_H || L.tiles[0].length !== C.MAP_W) { if (verbose) log('Simpanan versi lama tidak cocok dengan peta baru.'); return false; } S = L; lastDay = S.day; S.prio = { ...C.DEFAULT_PRIO, ...S.prio }; S.gathered = S.gathered || {}; S.era |= 0; for (const [k, n] of Object.entries(C.START_RES)) if (!(k in S.res)) S.res[k] = 0; if (!S.banks) computeBanks(); S.villagers.forEach(v => { v.skills.bertani = v.skills.bertani || 0; if (v.health == null) v.health = 100; }); S.questIdx |= 0; S.tutorialStep |= 0; S.restUntil = S.restUntil || 0; buildPrioUI(); buildBuildBar(); tutorialUI(); $('modal').style.display = 'none'; if (S.event) showEvent(); log('Permainan dimuat.'); return true; } catch (e) { console.warn(e); return false; } }

// ---------- loop ----------
let prev = performance.now();
function frame(now) { const real = Math.min(0.25, (now - prev) / 1000); prev = now;
  for (const n of notes) n.life -= real; while (notes.length && notes[0].life <= 0) notes.shift();
  let sim = real * speed; while (sim > 0) { const d = Math.min(0.1, sim); step(d); sim -= d; }
  render(); ui(); requestAnimationFrame(frame); }
window.DESA = { get state() { return S; }, showEvent, validSpot, canAfford, addBuilding, season,  step, cam, findPath, setZoom, centerCam };
fetch('TEKS-GAME.json').then(r => r.ok ? r.json() : null).catch(() => null).then(t => { TEXT = t;
  if (!t) console.warn('TEKS-GAME.json tidak dapat dimuat; memakai teks bawaan.');
  loadAssets(() => { if (!loadGame(false)) newGame(); lastDay = S.day; buildPrioUI(); buildBuildBar(); tutorialUI(); centerCam(CAMP.x, CAMP.y); requestAnimationFrame(frame); }); });
})();
