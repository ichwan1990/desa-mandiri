(() => {
let TEXT = null;
const C = CONFIG, T = C.TILE;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
cv.width = C.VIEW_W; cv.height = C.VIEW_H; ctx.imageSmoothingEnabled = false;
const RES_OF = { pohon: 'kayu', batu: 'batu', semak: 'makanan' };
const SKILL_OF = { kayu: 'menebang', batu: 'menambang', makanan: 'meramu', bangun: 'membangun', bertani: 'bertani', air: 'meramu', riset: 'meneliti' };
const JOB_LABEL = { bangun: 'Membangun', makanan: 'Makanan', bertani: 'Bertani', air: 'Air', kayu: 'Kayu', batu: 'Batu', riset: 'Riset', jaga: 'Jaga', padam: 'Padam', rawat: 'Rawat', makam: 'Makam' };
const RES_LABEL = Object.assign({ kayu: 'Kayu', batu: 'Batu', makanan: 'Makanan', gandum: 'Gandum', air: 'Air', alat: 'Alat', kulit: 'Kulit', papan: 'Papan', batu_bata: 'Batu bata' }, C.RES_LABEL_THEME || {});
const CAMP = C.CAMP;
// ikon sumber daya sebagai <img> PNG (emoji kayu/batu/gergaji = Emoji 13, tampil kotak kosong di Windows 10)
const resIconSrc = k => { const ik = ASSETS.res_ikon, i = ik ? ik.keys.indexOf(k) : -1; return i >= 0 ? [].concat(ik.img)[i] : null; };
const resIcon = k => { const src = resIconSrc(k); return src ? `<img class="resico" src="${src}" alt="" title="${RES_LABEL[k] || k}">` : ''; };
const withIcons = s => String(s).replace(/\{ikon:(\w+)\}/g, (_, k) => resIcon(k));
let menuOpen = true;
let S, speed = 1, placing = null, mouse = { x: 0, y: 0 };

// ---------- RNG (seedable for map) ----------
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

function newGame() {
  const r = rng(12345);
  S = { t: C.SCHEDULE.wakeFrac * C.DAY_LENGTH_SEC, day: 1, res: { ...C.START_RES }, tiles: [], nodes: [], buildings: [], villagers: [], log: [],
        prio: { ...C.DEFAULT_PRIO }, nextId: 1, moodGoodDays: 0, lastSpawnDay: -99, nameIdx: 0 }; storyInit();
  // 0 = rumput, 1 = air, 2 = jembatan
  for (let y = 0; y < C.MAP_H; y++) { const row = []; const rx = C.RIVER_X + Math.round(Math.sin(y / 3) * 1.5);
    for (let x = 0; x < C.MAP_W; x++) row.push(x === rx || x === rx + 1 ? (C.BRIDGE_ROWS.includes(y) ? 2 : 1) : 0); S.tiles.push(row); }
  S.grassVar = Array.from({ length: C.MAP_H }, () => Array.from({ length: C.MAP_W }, () => r() < 0.12 ? 1 : 0));
  const cx = CAMP.x, cy = CAMP.y;
  const occ = (x, y) => S.tiles[y][x] !== 0 || Math.abs(x - cx) < 5 && Math.abs(y - cy) < 4 || S.nodes.some(n => n.x === x && n.y === y);
  const place = (type, n) => { for (let i = 0; i < n; i++) { let x, y, k = 0;
      do { x = Math.floor(r() * C.MAP_W); y = Math.floor(r() * C.MAP_H); } while (occ(x, y) && ++k < 200);
      if (k < 200) S.nodes.push({ type, x, y, amount: C.NODE_AMOUNT[RES_OF[type]], regrow: 0 }); } };
  place('pohon', 110); place('batu', 32); place('semak', 30); placeFoodNodes(r, occ); // v9: pohon buah & umbi hutan (sesudah node lama -> posisi lama tetap)
  computeBanks(); marketInit();
  (C.START_BUILDINGS || []).forEach(([t, x, y]) => addBuilding(t, x, y, true));
  S.gathered = {}; S.era = 0; S.techDone = []; S.research = null; S.questIdx = 0; S.tutorialStep = 0; S.restUntil = 0; S.event = null;
  for (let i = 0; i < C.START_VILLAGERS; i++) spawnVillager(cx - 1 + i, cy + 1, true);
  foodSourcesDaily(); S.foodDayStart = foodTotal();
  log('Dua penduduk mendirikan perkemahan. Desa Mandiri dimulai!');
}
function addBuilding(type, x, y, done) {
  const b = { id: S.nextId++, type, x, y, done: !!done, progress: done ? C.BUILDINGS[type].work : 0, hp: 100 };
  if (type === 'ladang') { const crops = C.FIELD_ROTATION || Object.keys(C.FIELD.crops); b.crop = crops[S.buildings.filter(o => o.type === 'ladang').length % crops.length]; b.stage = 'kosong'; b.grow = 0; }
  S.buildings.push(b);
}
// nama baru yang belum dipakai penduduk yang masih hidup (dari TEKS-GAME.json, fallback C.NAMES)
function freshName() { const names = TEXT && TEXT.penduduk ? TEXT.penduduk.map(p => p.nama) : C.NAMES, used = new Set(S.villagers.map(v => v.name));
  for (let i = 0; i < names.length; i++) { const n = names[(S.nameIdx + i) % names.length]; if (!used.has(n)) { S.nameIdx += i + 1; return n; } }
  return names[S.nameIdx++ % names.length] + ' ' + (S.villagers.length + 1); }
function spawnVillager(x, y, initial, forcedName) {
  const name = forcedName || freshName();
  const pd = TEXT && TEXT.penduduk && TEXT.penduduk.find(p => p.nama === name), sex = pd ? (pd.jenis_kelamin === 'laki-laki' ? 'L' : 'P') : (S.villagers.filter(v => v.sex === 'P').length > S.villagers.filter(v => v.sex === 'L').length ? 'L' : 'P');
  const ageF = 16 + Math.random() * 25;
  S.villagers.push({ id: S.nextId++, name, sex, age: Math.floor(ageF), ageF, x, y, hunger: 80, energy: 90, mood: 70,
    health: 100, joined: S.day, skills: { menebang: 0, menambang: 0, meramu: 0, membangun: 0, bertani: 0, meneliti: 0 }, task: null, carry: null, color: S.villagers.length,
    traits: initial ? founderTraits() : newcomerTraits(name) });
  relInitFor(S.villagers[S.villagers.length - 1], !!initial);
  if (!initial) traitOnArrive(S.villagers[S.villagers.length - 1]);
  if (!initial) { log(`${name} bergabung dengan desa!`); assignHomes(); }
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
const capacity = () => houses().reduce((a, b) => a + houseCap(b), 0);
const foodTotal = () => S.res.makanan + (S.res.gandum || 0);
// musim dari tema (tema.js): panjang tiap musim boleh berbeda; dihitung kumulatif dari SEASON_LEN
const yearDays = () => C.SEASONS.reduce((a, s) => a + C.SEASON_LEN[s], 0);
const seasonInfo = (day = S.day) => { let d = (day - 1) % yearDays(); for (let i = 0; i < C.SEASONS.length; i++) { const id = C.SEASONS[i], n = C.SEASON_LEN[id]; if (d < n) return { id, idx: i, day: d + 1, len: n }; d -= n; } return { id: C.SEASONS[0], idx: 0, day: 1, len: C.SEASON_LEN[C.SEASONS[0]] }; };
const season = () => seasonInfo().id;
const yearIdx = (day = S.day) => Math.floor((day - 1) / yearDays());
const isHardSeason = () => season() === C.HARD_SEASON;     // musim sulit: kemarau (Nusantara) / dingin (empat musim)
const isSnowy = () => !!(C.SEASON_FX[season()] || {}).snow; // varian salju/beku pada sprite
const isWinter = isHardSeason; // nama lama
// teks tema: C.TXT[k] = [pathTEKS|null, cadangan]
const threatIcon = () => ((C.TERMS || {}).ikon || '⚠️') + ' ';
const TT = (k, ex = {}, fb = '') => { const e = (C.TXT || {})[k]; if (!e) return fill(fb, ex); return e[0] ? TX(e[0], ex, fill(e[1], ex)) : fill(e[1], ex); };
const TERM = k => (C.TERMS || {})[k] || k;
// tanaman: data di C.FIELD.crops (tema). Simpanan lama dengan tanaman tema lain dipetakan (gandum<->padi, wortel<->jagung).
const CROP_ALIAS = { gandum: 'padi', wortel: 'jagung', padi: 'gandum', jagung: 'wortel', singkong: 'wortel', ubi: 'wortel' };
const cropId = b => C.FIELD.crops[b.crop] ? b.crop : C.FIELD.crops[CROP_ALIAS[b.crop]] ? CROP_ALIAS[b.crop] : Object.keys(C.FIELD.crops)[0];
const cropOf = b => C.FIELD.crops[cropId(b)];
const CROP_NAME = { gandum: 'gandum', wortel: 'wortel', padi: 'padi', jagung: 'jagung', singkong: 'singkong', ubi: 'ubi', kopi: 'kopi' };
const cropName = b => CROP_NAME[cropId(b)] || cropId(b);
const irrigated = b => (S.techDone || []).includes('T04') || !!(b && S && S.buildings.some(o => o.mon && o.type === 'bendungan' && o.mon.st >= 2 && dist(center(o), center(b)) <= (monFxLast('irrigateRadius', 10)))); // P1: Saluran Induk bendungan mengairi radius 10
// boleh tumbuh/ditanam sekarang? musim sulit: empat musim -> semua berhenti; Nusantara -> padi berhenti kecuali irigasi, tegalan tetap jalan
function canGrow(b) { const F = FX(), cr = cropOf(b); if (cr.seasons && !cr.seasons.includes(season())) return false;
  if (F.fieldsStop) return false; if (F.padiStops && cr.hardStops) return !!(cr.irrigatedInHard && irrigated(b)); return true; }
// hari tumbuh efektif petak ini
function growDaysOf(b) { const F = FX(), cr = cropOf(b); let g = (cr.growDays ?? C.FIELD.growDays) + techVal('ladang_tumbuh', 0, { b });
  if (F.growDaysAdd && (!F.growAddCrops || F.growAddCrops.includes(cropId(b)))) g += F.growDaysAdd;
  if (F.padiGrowAdd && (F.growAddCrops || []).includes(cropId(b))) g += F.padiGrowAdd;
  if (isHardSeason() && cr.hardGrowMult) g *= cr.hardGrowMult;
  if (F.padiStops && cr.hardStops && irrigated(b)) g *= F.padiIrrigatedGrowMult || 1;
  return g; }
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
const foodPerDay = () => Math.max(1, S.villagers.reduce((a, v) => a + foodMultOf(v), 0) * C.SPAWN.foodPerDayPerPop * (isHardSeason() ? C.HARD_HUNGER_MULT : 1)); // AGE.foodMult
const workMult = (v, sk) => (1 + (v.skills[sk] || 0) * 0.5 + (S.res.alat >= 1 ? C.TOOLS.bonus : 0)) * (v.sick ? C.SICKNESS.workMult : 1) * ageWorkMult(v) * (C.SCHEDULE.dayWorkMult || 1) * traitWorkMult(v, sk); // dayWorkMult: kompensasi jam tidur 21-05
function computeBanks() { S.banks = [];
  for (let y = 0; y < C.MAP_H; y++) for (let x = 0; x < C.MAP_W; x++) if (S.tiles[y][x] === 0 &&
    [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => S.tiles[y + b] && S.tiles[y + b][x + a] === 1)) S.banks.push({ x, y }); }
const canAfford = cost => Object.entries(cost).every(([k, n]) => S.res[k] >= n);

// ---------- jadwal harian & siklus hidup (docs/RISET-SIKLUS-HIDUP.md) ----------
const HOUSES = ['gubuk', 'rumah'];
const isHouse = b => !!b && HOUSES.includes(b.type);
const houses = () => S.buildings.filter(b => b.done && isHouse(b) && (b.hp ?? 100) >= C.BUILDING_DAMAGE.noCapacityBelow);
const houseCap = b => C.BUILDINGS[b.type].kapasitas || 0;
const bById = id => id == null ? null : S.buildings.find(b => b.id === id);
const ageOf = v => v.ageF ?? v.age;
function stageOf(v) { const A = C.AGE, a = ageOf(v); return a < A.babyUntil ? 'bayi' : a < A.childUntil ? 'anak' : a < A.teenUntil ? 'remaja' : a < A.elderFrom ? 'dewasa' : 'lansia'; }
const isBaby = v => ageOf(v) < C.AGE.babyUntil;
const isKid = v => ageOf(v) < C.AGE.teenUntil;
const foodMultOf = v => { const st = stageOf(v); return (C.AGE.foodMult[st === 'remaja' ? 'dewasa' : st] ?? 1) * traitMult(v, 'hungerMult'); }; // sifat hungerMult (pelit) ikut foodPerDay
const canWork = v => ageOf(v) >= C.AGE.childHelpFrom;
const childHelper = v => stageOf(v) === 'anak' && canWork(v);
function ageWorkMult(v) { const A = C.AGE, st = stageOf(v); let m = st === 'anak' ? A.childWorkMult : st === 'remaja' ? A.teenWorkMult : st === 'lansia' ? A.elderWorkMult : 1;
  if (v.pregnantUntil && v.pregnantUntil - S.day <= C.PREGNANCY.lateDays) m *= C.PREGNANCY.lateWorkMult; return m; }
const ageSpeed = v => C.VILLAGER_SPEED * ((C.AGE_LOOK[stageOf(v)] || {}).speedMult || 1) * (C.SCHEDULE.daySpeedMult || 1);
const partnerOf = v => v.partnerId != null ? S.villagers.find(o => o.id === v.partnerId) || null : null;
const nameOf = id => { if (id == null) return null; const v = S.villagers.find(o => o.id === id); if (v) return v.name; const m = (S.memorials || []).find(x => x.id === id); return m ? m.name : null; };
const childrenOf = v => S.villagers.filter(k => k.motherId === v.id || k.fatherId === v.id);
const famEx = v => ({ nama: v.name, umur: v.age, pasangan: nameOf(v.partnerId) || v.formerPartner || '', ibu: nameOf(v.motherId) || 'ibunya', ayah: nameOf(v.fatherId) || 'ayahnya' });
// ---- jadwal ----
const SCH = () => C.SCHEDULE;
const inSleepWindow = (f = dayFrac()) => f >= SCH().sleepFrac || f < SCH().wakeFrac;
const pastLate = (f = dayFrac()) => f >= SCH().sleepFrac + SCH().lateToleranceFrac || f < SCH().wakeFrac;
// kerja yang boleh diteruskan setelah 21:00 (s.d. 22:30 untuk darurat/angkutan/bangunan hampir selesai; setelahnya hanya padam & jaga)
function lateAllowed(v) { const t = v.task; if (!t) return true; const k = t.kind;
  if (k === 'tidur' || k === 'makan') return true;
  if (pastLate()) return k === 'padam' || k === 'jaga';
  if (SCH().urgentJobs.includes(k) || k === 'setor') return true;
  return k === 'bangun' && t.b && !t.b.done && (1 - t.b.progress / bWork(t.b)) * 100 < SCH().finishBuildBelowPct; }
// titik masuk (tengah bawah pintu) dalam koordinat posisi penduduk
function doorPos(b) { const a = ASSETS[b.type + '_pintu'], d = C.BUILDINGS[b.type], fw = (a && a.fw) || d.w * T, fh = (a && a.fh) || d.h * T, dp = (a && a.door) || { x: fw / 2, y: fh - 4 };
  const ox = b.x * T + (d.w * T - fw) / 2, oy = (b.y + d.h) * T - fh; return { x: (ox + dp.x - 16) / T, y: (oy + dp.y - 29) / T }; }
function bedTask(v) { const h = bById(v.homeId);
  if (h && h.done && isHouse(h)) return { kind: 'tidur', home: h.id, target: doorPos(h) };
  const fire = nearest(done('apiunggun'), v, center);
  if (fire) { const c = center(fire), a = (v.id * 2.399) % (2 * Math.PI), r = 1.3 + (v.id % 3) * 0.5;
    return { kind: 'tidur', target: nearestWalkable(Math.round(c.x + Math.cos(a) * r), Math.round(c.y + Math.sin(a) * r)) || { x: c.x, y: c.y + 1 } }; }
  return { kind: 'tidur', target: { x: v.x, y: v.y } }; }
function playTask(v) { const h = bById(v.homeId), base = h ? doorPos(h) : (nearest(done('apiunggun'), v, center) ? center(nearest(done('apiunggun'), v, center)) : CAMP);
  const p = nearestWalkable(Math.round(base.x + Math.random() * 6 - 3), Math.round(base.y + 1 + Math.random() * 4 - 1)) || base; return { kind: 'main', target: p, timer: 4 + Math.random() * 4 }; }
function enterHouse(v, h) { v.inside = h.id; h.doorAt = performance.now(); }
function exitHouse(v) { const h = bById(v.inside); if (h) { h.doorAt = performance.now(); const p = doorPos(h); v.x = p.x; v.y = p.y; } v.inside = null; v.path = null; v.pathKey = null; }
function sleepTick(v, t, dt) { const SO = C.SLEEP_OUTSIDE;
  if (!t.asleep) { t.asleep = true; const h = bById(t.home);
    if (h && h.done) { enterHouse(v, h); t.where = 'bed'; }
    else { t.where = done('apiunggun').some(b => campfireLit() && dist(center(b), v) <= SO.fireRadius) ? 'fire' : 'bare'; } }
  if (inSleepWindow() && !t.night) { t.night = true; if (t.where !== 'bed') sleepOutsideLog(v); }
  const reg = t.where === 'bed' ? SO.bedRegen : t.where === 'fire' ? SO.fireRegen : SO.bareRegen;
  v.energy = Math.min(100, v.energy + C.SLEEP_REGEN_PER_SEC * reg * dt * (v.sick ? C.SICKNESS.energyRegenMult : 1));
  const severe = v.sick && v.sick.lvl === 'parah';
  const wake = !inSleepWindow() && (t.night || v.energy >= SCH().earlyWakeEnergy);
  if (v.hunger <= C.HUNGER_CRIT && foodTotal() > 0) return wakeUp(v, t);
  if (wake && !severe) return wakeUp(v, t);
  if (severe && v.energy >= 100 && !inSleepWindow()) { t.timerS = (t.timerS || 0) + dt; if (t.timerS > 20) wakeUp(v, t); } }
function wakeUp(v, t) { const SO = C.SLEEP_OUTSIDE;
  if (t.night && !inSleepWindow()) { let dm = t.where === 'bed' ? SO.bedMood : t.where === 'fire' ? SO.fireMood : SO.bareMood;
    if (t.where !== 'bed' && isWinter() && C.HARD_COLD) { dm = SO.winterMood; if (!v.sick && Math.random() < SO.winterSickAdd) makeSick(v, 'ringan', 'dingin'); }
    const fl = dm < 0 && !(t.where !== 'bed' && isWinter() && C.HARD_COLD) ? Math.min(v.mood, (C.MOOD_BARE || {}).rainFloor ?? 0) : 0; // v9c: tidur di luar tidak menekan di bawah lantai 'seadanya' (dingin musim sulit tetap)
    v.mood = Math.max(fl, Math.min(100, v.mood + dm)); v.lastSleep = t.where; }
  if (v.inside != null) exitHouse(v); v.task = null; }
function sleepOutsideLog(v) { const L = S.schedLog = S.schedLog || {}, key = dayFrac() >= 0.5 ? S.day : S.day - 1; if (L.outside === key) return; L.outside = key;
  log('🌙 ' + TX(isWinter() && C.HARD_COLD ? 'log_jadwal.tidur_di_luar_dingin' : 'log_jadwal.tidur_di_luar', { nama: v.name }, `Tidak ada tempat di rumah untuk ${v.name}. Ia tidur di luar.`)); }
function scheduleStep() { const f = dayFrac(), d = S.day, L = S.schedLog = S.schedLog || {};
  const adults = S.villagers.filter(v => !isKid(v));
  if (f >= SCH().sleepFrac && L.home !== d) { L.home = d; const a = adults.length && pick(adults); if (a && Math.random() < 0.6) { const p = partnerOf(a);
    log('🌙 ' + (p ? TX('log_jadwal.berpasangan.pulang', { nama: a.name, pasangan: p.name }, `${a.name} pulang menemani ${p.name}.`) : TX('log_jadwal.pulang', { nama: a.name }, `${a.name} membereskan pekerjaannya dan pulang ke rumah.`))); } }
  if (f >= SCH().wakeFrac && f < 0.5 && L.wake !== d) { L.wake = d; const a = adults.length && pick(adults); if (a && Math.random() < 0.5) { const p = partnerOf(a);
    log('🌅 ' + (p ? TX('log_jadwal.berpasangan.bangun_pagi', { nama: a.name, pasangan: p.name }, `${a.name} sarapan bersama ${p.name}.`) : TX('log_jadwal.bangun_pagi', { nama: a.name }, `${a.name} bangun dan menghirup udara pagi.`))); } } }
// ---- rumah: pasangan + anak satu rumah; lajang beda jenis kelamin ditempatkan bersama agar bisa berpasangan ----
function assignHomes() { const hs = houses().sort((a, b) => a.id - b.id), free = new Map(hs.map(h => [h.id, houseCap(h)])), at = new Map(), vs = S.villagers, seen = new Set(), units = [];
  for (const v of vs) { if (seen.has(v.id)) continue;
    if (isKid(v) && vs.some(p => p.id === v.motherId || p.id === v.fatherId)) continue; // ikut orang tua
    const u = [v], p = partnerOf(v); if (p) u.push(p);
    vs.filter(k => isKid(k) && u.some(x => x.id === k.motherId || x.id === k.fatherId)).forEach(k => { if (!u.includes(k)) u.push(k); });
    u.forEach(x => seen.add(x.id)); units.push(u); }
  vs.filter(v => !seen.has(v.id)).forEach(v => units.push([v]));
  units.sort((a, b) => b.length - a.length);
  const occ = hid => vs.filter(o => at.get(o.id) === hid);
  for (const u of units) { let best = null, bs = -1e9;
    for (const h of hs) { if (free.get(h.id) < u.length) continue; let sc = u.filter(x => x.homeId === h.id).length * 10 - h.id * 0.001;
      if (u.length === 1 && !isKid(u[0]) && !partnerOf(u[0])) { const o = occ(h.id); if (o.length === 1 && !partnerOf(o[0]) && !isKid(o[0]) && o[0].sex !== u[0].sex) sc += 25; if (!o.length) sc += 2; }
      if (sc > bs) { bs = sc; best = h; } }
    if (best) { u.forEach(x => at.set(x.id, best.id)); free.set(best.id, free.get(best.id) - u.length); continue; }
    for (const x of u) { const h = hs.filter(h => free.get(h.id) > 0).sort((a, b) => (b.id === x.homeId) - (a.id === x.homeId))[0]; if (h) { at.set(x.id, h.id); free.set(h.id, free.get(h.id) - 1); } } }
  for (const v of vs) { const n = at.get(v.id) ?? null; if (n !== v.homeId && v.inside != null && v.inside !== n) exitHouse(v); v.homeId = n; } }
// ---- bayi: tidak berjalan; digendong ibu/ayah saat santai, di buaian depan rumah saat orang tua bekerja, di dalam rumah saat malam ----
const cookBonus = () => { const P = TRT().list.pandai_masak; return Math.min(P.kitchenBonusCap, S.villagers.filter(o => hasTrait(o, 'pandai_masak')).length * P.kitchenBonusAdd); }; // pandai_masak: dapur +0.05 (maks +0.10 desa)
// v9b: porsi lebih kecil & lebih sering (makan saat lapar <= MEAL_AT bila stok >= 1 hari), supaya stok pangan tidak turun berundak 7 per orang tiap 3 hari
// v9c: tanpa api unggun & rumah mood hanya turun ke lantai 'hidup seadanya' (tetap berat: < syarat pendatang/pasangan), lapar/dingin/hujan bisa menurunkan lebih jauh
const bareFloor = () => (C.MOOD_BARE || {}).floor ?? 0;
const wantMeal = v => foodTotal() > 0 && (v.hunger <= C.HUNGER_CRIT || (v.hunger <= (C.MEAL_AT ?? C.HUNGER_CRIT) && foodTotal() >= foodPerDay()));
// v9b: batas nyaman mood (desa bahagia harus diperjuangkan): api unggun & rumah hanya menaikkan mood sampai batas ini;
// di atasnya hanya dari hal baik (kenduri, keinginan terpenuhi, festival, sahabat, sifat) dan pelan-pelan turun lagi.
function comfortVillage() { const M = C.MOOD_COMFORT; if (!M) return 100; if (S._cvDay === S.t >> 3) return S._cv;
  S._cvDay = S.t >> 3; return S._cv = M.base - harapanWarga() + (foodDays() >= M.foodDays ? M.food : 0) + (done('dapur').length ? M.kitchen : 0) + (done('sumur').length ? M.well || 0 : 0) + monumentComfort(); }
// harapan warga (tekanan mood akhir permainan): mengurangi batas nyaman 1..3 poin sesuai tahun & era (C.HARAPAN_WARGA)
function harapanWarga() { const H = C.HARAPAN_WARGA; if (!H || !S) return 0; const y = year(); if (y < H.fromYear) return 0; return Math.min(H.max, H.start + H.perYear * (y - H.fromYear) + H.perEra * (S.era | 0)); }
function harapanDaily() { const lv = Math.floor(harapanWarga()); if (lv > (S.harapanLv || 0)) { S.harapanLv = lv; log('🌱 ' + TX('harapan_warga.naik', { jumlah: lv }, lv === 1 ? 'Desa makin mapan, warga mulai berharap lebih: hidup yang sekadar cukup tak lagi terasa istimewa.' : 'Harapan warga makin tinggi. Kenyamanan lama kini terasa biasa saja.')); } }
function monumentComfort() { return monumentComfortP1(); } // P1: tiap tahap monumen selesai menaikkan batas nyaman
function comfortCap(v) { const M = C.MOOD_COMFORT; if (!M) return 100; return Math.min(M.max, comfortVillage() + (v.homeId != null ? M.home : 0) + (v.partnerId != null ? M.partner || 0 : 0)); }
function eatNow(v) { const per = C.EAT_RESTORE_PER_FOOD * (done('dapur').length ? 1 + techVal('dapur_bonus', C.KITCHEN_EAT_BONUS) + cookBonus() : 1);
  let need = Math.ceil((100 - v.hunger) / per); const a = Math.min(need, S.res.makanan); S.res.makanan -= a; need -= a;
  const g = Math.min(need, S.res.gandum || 0); S.res.gandum -= g;
  v.hunger = Math.min(100, v.hunger + (a + g) * per); if (a) dstat('eaten', 'makanan', a); if (g) dstat('eaten', 'gandum', g); }
const cradlePos = h => { const p = doorPos(h); return { x: p.x + (C.BUILDINGS[h.type].w >= 3 ? 1.1 : 1), y: p.y + 0.15 }; };
function updateBaby(v, dt) { const perSec = 1 / C.DAY_LENGTH_SEC;
  growUp(v, dt);
  v.hunger = Math.max(0, v.hunger - C.HUNGER_PER_DAY * foodMultOf(v) * (isWinter() ? hungerMultNow() : 1) * perSec * dt);
  if (wantMeal(v)) eatNow(v);
  if (v.hunger <= 0) v.health -= C.HEALTH.starvePerDay * perSec * dt; else if (v.hunger > 50) v.health = Math.min(100, v.health + C.HEALTH.regenPerDay * perSec * dt);
  v.energy = 100; const m = S.villagers.find(o => o.id === v.motherId) || S.villagers.find(o => o.id === v.fatherId);
  if (m) v.mood = Math.max(40, Math.min(100, m.mood + 10));
  v.task = null; v.moving = false; v.heldBy = null; const h = bById(v.homeId);
  if (m && m.inside != null) { v.inside = m.inside; return; }
  if (h && inSleepWindow()) { v.inside = h.id; return; }
  v.inside = null;
  const relaxed = m && !isBaby(m) && (!m.task || ['diam', 'makan', 'main', 'tidur', 'setor'].includes(m.task.kind)) && !m.carry && !m.working && !(m.task && m.task.asleep);
  if (relaxed) { v.heldBy = m.id; v.x = m.x; v.y = m.y; return; }
  const p = h ? cradlePos(h) : (() => { const f = nearest(done('apiunggun'), v, center); return f ? { x: center(f).x + 1, y: center(f).y + 0.6 } : { x: CAMP.x + 1, y: CAMP.y + 1 }; })();
  v.x = p.x; v.y = p.y; }
// ---- tumbuh kembang ----
const MILESTONES = [[0.3, 'senyum_pertama', 'tersenyum untuk pertama kalinya.'], [1, 'langkah_pertama', 'melangkah untuk pertama kali.'], [1.5, 'kata_pertama', 'mengucapkan kata pertamanya.'],
  [4, 'bermain', 'bermain petak umpet dengan anak-anak lain.'], [8, 'mulai_membantu', 'mulai membantu pekerjaan ringan.'], [13, 'belajar_keahlian', 'belajar keahlian dari orang dewasa.']];
function growUp(v, dt) { const before = stageOf(v); v.ageF = ageOf(v) + dt / (C.AGE.daysPerYear * C.DAY_LENGTH_SEC); v.age = Math.floor(v.ageF);
  if (v.born != null) { v.ms = v.ms || 0; const M_ = MILESTONES[v.ms]; if (M_ && v.ageF >= M_[0]) { v.ms++;
    const adult = S.villagers.find(o => !isKid(o) && o.id !== v.motherId) || S.villagers[0];
    log('🧒 ' + TX('tumbuh_kembang.milestone.' + M_[1], { ...famEx(v), nama2: adult ? adult.name : v.name, skill: pick(Object.values((TEXT && TEXT.meta && TEXT.meta.skill) || { a: 'menebang' })) }, `${v.name} ${M_[2]}`)); } }
  if (v.born != null) { revealTraits(v); thirdTrait(v); }
  const now = stageOf(v); if (now !== before) onStage(v, now); }
function onStage(v, st) { const ex = famEx(v);
  if (st === 'anak') log('🧒 ' + TX('tumbuh_kembang.menjadi_anak', ex, `${v.name} bukan bayi lagi.`));
  else if (st === 'remaja') log('🧑 ' + TX('tumbuh_kembang.menjadi_remaja', ex, `${v.name} kini remaja.`));
  else if (st === 'dewasa') log('🎉 ' + TX('tumbuh_kembang.menjadi_dewasa', ex, `${v.name} kini dewasa dan siap bekerja penuh.`));
  else if (st === 'lansia') log('👴 ' + TX('tumbuh_kembang.menjadi_lansia', ex, `${v.name} kini berusia ${v.age} tahun dan menjadi sesepuh desa.`));
  if (st !== 'bayi') assignHomes(); }
// ---- tokoh: sifat & hubungan (fondasi, docs/RISET-CERITA-TUJUAN.md §1.1-1.2; cerita/keinginan/dilema belum) ----
const TRT = () => C.TRAITS, RLC = () => C.RELATION;
const traitName = id => TX('sifat.' + id + '.nama', {}, id.replace('_', ' '));
const traitsVisible = v => !(v.traitsHidden && ageOf(v) < TRT().inherit.revealAge);
function pickTraits(o = {}) { const T = TRT(), L = T.list, out = (o.seed || []).filter(id => L[id]).slice(0, o.max || T.max);
  const n = Math.min(o.max || T.max, o.n ?? (T.perVillager + (Math.random() < T.thirdChance ? 1 : 0)));
  const clash = id => out.includes(id) || T.conflicts.some(([a, b]) => a === id && out.includes(b) || b === id && out.includes(a));
  const w = id => (L[id].bobot || 1) * ((o.weightMult || {})[id] || 1);
  const draw = c => { c = c.filter(id => L[id] && !clash(id) && !(o.exclude || []).includes(id)); if (!c.length) return null;
    let r = Math.random() * c.reduce((a, id) => a + w(id), 0); for (const id of c) if ((r -= w(id)) <= 0) return id; return c[c.length - 1]; };
  if (o.needOneOf && !out.some(id => o.needOneOf.includes(id))) { const id = draw(o.needOneOf); if (id) out.push(id); }
  for (let g = 0; out.length < n && g < 40; g++) { const id = draw(o.from && Math.random() < (o.fromChance || 0) ? o.from : Object.keys(L)); if (id) out.push(id); }
  return out; }
const founderTraits = () => pickTraits({ n: TRT().perVillager, exclude: TRT().founderExclude, needOneOf: TRT().founderNeedOneOf });
function newcomerTraits(name) { const M = TEXT && TEXT.meta && TEXT.meta.peta_sifat_penduduk; return pickTraits({ seed: (M && M[name]) || [], weightMult: TRT().newcomerWeightMult }); }
function babyTraits(m, f) { const T = TRT(), I = T.inherit, par = [...new Set([...(m && m.traits || []), ...(f && f.traits || [])])].filter(id => !I.noInherit.includes(id));
  return pickTraits({ n: T.perVillager, from: par, fromChance: I.fromParents + I.fromMentor, exclude: I.noInherit }); } // mentor belum ada -> porsinya ikut orang tua
// skor hubungan: S.rel['a-b'] (a<b), simetris
const relKey = (a, b) => a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id;
const isFamily = (a, b) => a.motherId === b.id || a.fatherId === b.id || b.motherId === a.id || b.fatherId === a.id
  || (a.motherId != null && a.motherId === b.motherId) || (a.fatherId != null && a.fatherId === b.fatherId);
const relGet = (a, b) => (S.rel || {})[relKey(a, b)] ?? 0;
function relFloor(a, b) { const F = RLC().floors; return a.partnerId === b.id ? F.pasangan : isFamily(a, b) ? F.keluarga : RLC().range[0]; }
function relLevel(a, b, s = relGet(a, b)) { const L = RLC().levels; return a.partnerId === b.id ? 'pasangan' : isFamily(a, b) ? 'keluarga' : s >= L.sahabat ? 'sahabat' : s >= L.teman ? 'teman' : s <= L.rival ? 'rival' : 'kenalan'; }
const gainMult = v => (v.traits || []).reduce((m, id) => m * (TRT().list[id].relGainMult || 1) * (TRT().list[id].earlyRelGainMult && S.day - (v.joined ?? 1) < TRT().list[id].earlyDays ? TRT().list[id].earlyRelGainMult : 1), 1);
function relSet(a, b, s) { S.rel = S.rel || {}; S.rel[relKey(a, b)] = Math.max(relFloor(a, b), Math.min(RLC().range[1], Math.round(s * 100) / 100)); }
// d>0: dibatasi +6/hari per pasangan (dan per jenis pemicu bila 'cap' diberi); penurunan tidak dibatasi
function relAdd(a, b, d, kind, cap) { if (!a || !b || a === b) return 0; S.rel = S.rel || {}; const k = relKey(a, b), before = relGet(a, b), lv0 = relLevel(a, b, before);
  if (d > 0) { d *= Math.sqrt(gainMult(a) * gainMult(b)); const G = (S.relGain = S.relGain || {}), g = G[k] && G[k].day === S.day ? G[k] : (G[k] = { day: S.day, all: 0 });
    let room = RLC().dailyGainCap - g.all; if (kind && cap != null) room = Math.min(room, cap - (g[kind] || 0)); d = Math.max(0, Math.min(d, room)); if (!d) return 0;
    g.all += d; if (kind) g[kind] = (g[kind] || 0) + d; }
  relSet(a, b, before + d); (S.relSeen = S.relSeen || {})[k] = S.day; const lv = relLevel(a, b);
  if (lv !== lv0 && ['teman', 'sahabat', 'rival'].includes(lv) && (lv !== 'teman' || lv0 === 'kenalan')) { markMeaningful('naik_hubungan');
    const ex = { nama: a.name, nama2: b.name, pasangan: b.name };
    log({ teman: '🙂 ', sahabat: '🤝 ', rival: '⚡ ' }[lv] + TX('hubungan.log.menjadi_' + lv, ex, lv === 'rival' ? `${a.name} dan ${b.name} sering berselisih.` : `${a.name} dan ${b.name} kini ${lv}.`)); }
  return d; }
// awal: pendiri +25; pendatang 0 (+15 bila salah satu ramah, +5 bila salah satu jujur); orang tua-anak 60, saudara 50
function relInitFor(v, founder) { const R = RLC(), has = (x, id) => (x.traits || []).includes(id);
  for (const o of S.villagers) { if (o === v || (S.rel || {})[relKey(v, o)] != null) continue;
    let s = founder && (o.joined ?? 1) <= 1 ? R.start.pendiri : R.start.pendatang;
    if (v.motherId === o.id || v.fatherId === o.id) s = R.start.orangTuaAnak; else if (isFamily(v, o)) s = R.start.saudara;
    else if (!(founder && (o.joined ?? 1) <= 1)) { // sambutan ramah/jujur hanya untuk pendatang (spes: pendiri tetap 25)
      if (has(v, 'ramah') || has(o, 'ramah')) s += R.welcome.ramahRel; if (has(v, 'jujur') || has(o, 'jujur')) s += R.welcome.jujurRel; }
    relSet(v, o, s); } }
// pemicu berkala (tiap 30 dtk): kerja bareng; senja: api unggun; malam: ronda bareng
function relTick(dt) { const R = RLC(), TICK = 5; S._relAcc = (S._relAcc || 0) + dt; if (S._relAcc < TICK) return; S._relAcc -= TICK; // cek tiap 5 dtk; kerja = 0.5 per 30 dtk
  const vs = S.villagers.filter(v => !isBaby(v)), f = dayFrac(), fire = campfireLit() ? done('apiunggun') : []; traitTick(vs, TICK);
  if (f > 0.05 && f < 0.2 && S._relNight !== S.day) { S._relNight = S.day; // tidur serumah semalam (tambahan lokal: RELATION.gain.serumahMalam)
    for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) if (vs[i].inside != null && vs[i].inside === vs[j].inside) relAdd(vs[i], vs[j], R.gain.serumahMalam || 0, 'serumah', R.gain.serumahMalam || 0); }
  for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) { const a = vs[i], b = vs[j], ta = a.task, tb = b.task; if (!ta || !tb) continue; const d = dist(a, b);
    if (a.working && b.working && ta.kind === tb.kind && d <= R.gain.kerjaRadius) relAdd(a, b, R.gain.kerjaPer30s * TICK / 30, 'kerja', R.gain.kerjaMax);
    if (f >= C.NIGHT_START && f < SCH().sleepFrac && fire.some(fp => dist(center(fp), a) <= R.gain.apiRadius && dist(center(fp), b) <= R.gain.apiRadius)) relAdd(a, b, R.gain.apiMalam, 'api', R.gain.apiMalam);
    if (ta.kind === 'jaga' && tb.kind === 'jaga' && ta.b === tb.b && ta.arrived && tb.arrived) relAdd(a, b, R.gain.ronda, 'ronda', R.gain.ronda); } }
function relOnEat(v) { const R = RLC(); v.ateAt = S.t;
  for (const o of S.villagers) if (o !== v && o.ateAt != null && S.t - o.ateAt < 20 && dist(o, v) <= R.gain.makanRadius) relAdd(v, o, R.gain.makan, 'makan', R.gain.makanMax); }
// harian: pelupaan setelah 3 hari tanpa interaksi
function relDaily() { const D = RLC().decay; for (const k of Object.keys(S.rel || {})) { const [x, y] = k.split('-').map(Number), a = S.villagers.find(v => v.id === x), b = S.villagers.find(v => v.id === y);
    if (!a || !b) { delete S.rel[k]; continue; } if (S.day - ((S.relSeen || {})[k] ?? S.day) < D.idleDays) continue; const s = S.rel[k];
    if (s > 0) relSet(a, b, Math.max(0, s - (s >= RLC().levels.sahabat ? D.sahabat : D.teman))); else if (s < 0) relSet(a, b, Math.min(0, s + D.rivalRecover)); } }
// duka berdasar hubungan (tambahan di atas DEATH)
function relGrief(dead, old) { const G = RLC().grief, m = old ? C.AGE.oldDeathGriefMult : 1;
  for (const o of S.villagers) { if (o === dead) continue; const lv = relLevel(o, dead);
    const add = lv === 'keluarga' ? C.DEATH.griefMoodInstant * (G.keluargaMult - 1) : lv === 'sahabat' ? G.sahabatInstant : lv === 'teman' ? G.temanInstant : lv === 'rival' ? G.rivalInstant : 0;
    const cm = isKid(dead) ? traitMult(o, 'childGriefMult') : 1; // suka_menolong: duka anak x1.3
    if (add) o.mood = Math.max(0, o.mood + add * m * cm * griefM(o));
    // duka pribadi lebih lama: keluarga +3 hari (x1.5), sahabat +2 hari, pasangan x1.5 (selain duka desa)
    const days = (lv === 'pasangan' || lv === 'keluarga' || lv === 'sahabat' ? monFxSum('griefDaysAdd') : 0) + (lv === 'pasangan' ? C.DEATH.griefDays + G.keluargaDaysAdd : lv === 'keluarga' ? C.DEATH.griefDays + G.keluargaDaysAdd : lv === 'sahabat' ? C.DEATH.griefDays + G.sahabatDaysAdd : 0);
    if (days) o.griefP = { name: dead.name, until: S.day + days, mult: (lv === 'pasangan' ? G.pasanganMult : lv === 'keluarga' ? G.keluargaMult : 1) * m * cm * griefM(o), lv }; } }
function personalGriefDaily() { for (const o of S.villagers) { const g = o.griefP; if (!g) continue; if (S.day > g.until) { o.griefP = null; continue; }
    const inVillage = S.grief && S.day <= S.grief.until; o.mood = Math.max(0, o.mood + C.DEATH.griefPerDay * (inVillage ? Math.max(0, g.mult - 1) : g.mult)); } }
function revealTraits(v) { if (!v.traitsHidden || ageOf(v) < TRT().inherit.revealAge) return; v.traitsHidden = false;
  const names = v.traits.map(id => TX('sifat.' + id + '.kata', {}, id)).join(' dan '), id0 = v.traits[0];
  log('✨ ' + TX('sifat.' + id0 + '.log_terlihat', { nama: v.name }, `Sifat ${v.name} mulai terlihat: ${names}.`)); }
function thirdTrait(v) { const T = TRT(); if (v.thirdDone || ageOf(v) < T.inherit.thirdAtAge) return; v.thirdDone = true; if (Math.random() < T.thirdChance) v.traits = pickTraits({ seed: v.traits, n: v.traits.length + 1 }); }
function relHTML(v) { const H = (k, fb) => TX('hubungan.' + k, {}, fb), list = S.villagers.filter(o => o !== v).map(o => ({ o, s: relGet(v, o), lv: relLevel(v, o) }))
    .filter(r => r.lv !== 'kenalan').sort((a, b) => Math.abs(b.s) - Math.abs(a.s)).slice(0, 6);
  return `<h3 id="vpRel">${H('panel.judul', 'Hubungan')}</h3>` + (list.length ? list.map(r => `<div class="row rel-row" data-rel="${r.lv}"><span><img class="ico" src="assets/icons/relations/rel_${r.lv}_16.png" alt=""> ${r.o.name}</span><span title="${H('tooltip.' + r.lv, '')}">${H('tingkat.' + r.lv, r.lv)} <b>${Math.round(r.s)}</b></span></div>`).join('')
    : `<div style="font-size:12px;opacity:.8">${H('panel.kosong', 'Belum ada')}</div>`); }
function traitsHTML(v) { if (!v.traits || !v.traits.length) return '';
  const body = traitsVisible(v) ? v.traits.map(id => `<span class="trait" data-trait="${id}" title="${TX('sifat.' + id + '.tooltip', {}, '')}"><img class="ico" src="assets/icons/traits/trait_${id}_16.png" alt=""> ${traitName(id)}</span>`).join(' ') : '<span class="trait">?</span>';
  return `<div id="vpTraits" style="font-size:12px;margin:4px 0">${body}</div>`; }
// ---- efek sifat (RISET-CERITA-TUJUAN §1.1) & efek tingkat hubungan (§1.2 fx); angka di balance.js TRAITS.list / RELATION.fx ----
const tList = v => (v && v.traits || []).map(id => TRT().list[id]).filter(Boolean);
const traitMult = (v, k) => tList(v).reduce((m, t) => m * (typeof t[k] === 'number' ? t[k] : 1), 1);
const traitAdd = (v, k) => tList(v).reduce((a, t) => a + (typeof t[k] === 'number' ? t[k] : 0), 0);
const hasTrait = (v, id) => !!(v && v.traits || []).includes(id);
const _near = new WeakMap(); // cache 1 dtk per penduduk: sendirian? pengali kerja dari teman/sahabat/rival di dekatnya
function nearInfo(v) { const c = _near.get(v); if (c && Math.abs(S.t - c.t) < 1) return c;
  const F = RLC().fx, L = RLC().levels; let alone = true, rel = 1, rival = 1;
  for (const o of S.villagers) { if (o === v || isBaby(o) || o.inside != null) continue; const d = dist(o, v); if (d <= TRT().auraRadius) alone = false;
    const s = relGet(v, o);
    if (s >= L.sahabat && d <= F.sahabat.radius) rel = Math.max(rel, F.sahabat.workMult); else if (s >= L.teman && d <= F.teman.radius) rel = Math.max(rel, F.teman.workMult);
    else if (s <= L.rival && d <= F.rival.radius && v.task && o.task && v.task.kind === o.task.kind) rival = F.rival.workMult; }
  const r = { t: S.t, alone, rel: rel * rival }; _near.set(v, r); return r; }
// pengali kerja dari sifat + hubungan (dipakai workMult)
function traitWorkMult(v, sk) { let m = traitMult(v, 'workMult') * buffMult('kerja');
  for (const t of tList(v)) { if (t.jobMult && t.jobMult[sk]) m *= t.jobMult[sk]; if (t.helpWorkMult && (t.helpJobs || []).includes(sk)) m *= t.helpWorkMult; }
  const ni = nearInfo(v); if (ni.alone) m *= traitMult(v, 'aloneWorkMult'); if (isNight()) m *= traitMult(v, 'nightWorkMult');
  const rg = TRT().list.religius; if (hasTrait(v, 'religius') && S.day % rg.jumatEvery === 0) m *= rg.jumatWorkMult;
  return m * ni.rel; }
// tiap 5 dtk (dari relTick): aura mood (periang; seniman di api unggun malam), lama dekat rival, lama bertemu (untuk konflik)
function traitTick(vs, TICK) { const T = TRT(), fire = campfireLit() ? done('apiunggun') : [], night = isNight(), Rr = RLC().fx.rival.radius;
  for (const v of vs) { if (v.inside != null) continue; let aura = 0, n = 0;
    for (const o of vs) { if (o === v || o.inside != null || dist(o, v) > T.auraRadius) continue; let a = traitAdd(o, 'aura');
      if (night && fire.some(fp => dist(center(fp), o) <= 3)) a += traitAdd(o, 'fireAura'); if (a > 0 && n < T.auraMaxStack) { aura += a; n++; } }
    if (aura) v.mood = Math.min(100, v.mood + aura * TICK / C.DAY_LENGTH_SEC); }
  S._meet = S._meet || {};
  for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) { const a = vs[i], b = vs[j]; if (a.inside != null || b.inside != null || dist(a, b) > Rr) continue;
    const k = relKey(a, b); S._meet[k] = (S._meet[k] || 0) + TICK; } }
const relLog = (path, ex, fb) => log(TX(path, ex, fb));
// harian: mood pasif sifat & hubungan (dibatasi), gosip/kejahilan (jahil), hadiah (dermawan), konflik (skor < 0 dan sering bertemu)
function traitDaily() { const T = TRT(), R = RLC(), F = R.fx, L = R.levels, vs = S.villagers.filter(v => !isBaby(v)), meet = S._meet || {}, hourSec = C.DAY_LENGTH_SEC / 24;
  for (const v of vs) { let tm = 0, sm = 0, rv = 0;
    for (const o of vs) { if (o === v) continue; const s = relGet(v, o);
      if (s >= L.sahabat) sm += F.sahabat.moodPerDay; else if (s >= L.teman) tm += F.teman.moodPerDay; else if (s <= L.rival && (meet[relKey(v, o)] || 0) >= F.rival.minHours * hourSec) rv += F.rival.moodPerDay; }
    const p = partnerOf(v), pm = p && p.homeId != null && p.homeId === v.homeId ? F.pasangan.moodPerDay : 0;
    const relMood = Math.min(3.5, Math.min(F.teman.moodCap, tm) + Math.min(F.sahabat.moodCap, sm) + pm) + rv;
    const kid = (T.list.suka_menolong || {}).childHomeMood && hasTrait(v, 'suka_menolong') && vs.some(o => o !== v && o.homeId != null && o.homeId === v.homeId && ageOf(o) < 12) ? T.list.suka_menolong.childHomeMood : 0;
    const d = Math.min(6, traitAdd(v, 'moodPerDay') + relMood + kid); v.mood = Math.max(0, Math.min(100, v.mood + d)); }
  const adults = vs.filter(v => !isKid(v)), other = (v, not = []) => adults.filter(o => o !== v && !not.includes(o));
  for (const v of adults) { const J = T.list.jahil;
    if (hasTrait(v, 'jahil') && Math.random() < J.gossipChance) { const ls = other(v), lis = ls.length && pick(ls), ts = lis ? other(v, [lis]).filter(o => relGet(v, o) < L.teman) : [], tg = ts.length && pick(ts);
      if (lis && tg) { relAdd(v, lis, R.gossip.speakerListener, 'gosip'); relAdd(tg, lis, R.gossip.targetListener, 'gosip'); S.gossips = (S.gossips || 0) + 1;
        relLog('hubungan.log.gosip', { nama: v.name, nama2: lis.name }, `${v.name} berbisik-bisik dengan ${lis.name}.`); } }
    if (hasTrait(v, 'jahil') && Math.random() < J.prankChance) { const near3 = other(v).sort((a, b) => dist(a, v) - dist(b, v)).slice(0, J.prankAudience); if (near3.length) {
      near3.forEach(o => o.mood = Math.min(100, o.mood + J.prankMood)); const tg = near3[0];
      if (Math.random() < J.prankRelChance) { const m = tg.traits.reduce((x, id) => J.prankRelMult[id] ?? x, 1); if (m) relAdd(v, tg, J.prankRel * m, 'jahil'); }
      relLog('sifat.log_sifat.jahil_kejahilan', { nama: v.name, nama2: tg.name }, `${v.name} menjahili ${tg.name}. Semua tertawa.`); } }
    const D = T.list.dermawan;
    if (hasTrait(v, 'dermawan') && !hasTrait(v, 'pelit') && Math.random() < D.giftChance && S.res.makanan >= 1 + (D.giftCost.makanan || 0) && famineLevel() === 'aman') { const os = other(v); if (os.length) {
      const tg = os.sort((a, b) => relGet(v, b) - relGet(v, a))[0]; S.res.makanan -= D.giftCost.makanan || 0; if (D.giftCost.makanan) dstat('sink', 'hadiah', D.giftCost.makanan); relAdd(v, tg, R.gain.hadiah, 'hadiah', R.gain.hadiah);
      relLog('hubungan.log.hadiah', { nama: v.name, nama2: tg.name }, `${v.name} memberi ${tg.name} hadiah kecil.`); } } }
  // konflik: pasangan skor < conflict.below yang bertemu >= meetHours jam hari ini
  const K = R.conflict;
  for (let i = 0; i < adults.length; i++) for (let j = i + 1; j < adults.length; j++) { const a = adults[i], b = adults[j], s = relGet(a, b);
    if (s >= K.below || (meet[relKey(a, b)] || 0) < K.meetHours * hourSec) continue;
    const ch = K.chancePerDay * traitMult(a, 'conflictMult') * traitMult(b, 'conflictMult') * (s <= L.rival ? F.rival.conflictMult : 1);
    if (Math.random() < ch) { relAdd(a, b, K.rel, 'konflik'); a.mood = Math.max(0, a.mood + K.mood); b.mood = Math.max(0, b.mood + K.mood); S.conflicts = (S.conflicts || 0) + 1;
      relLog('hubungan.log.bertengkar', { nama: a.name, nama2: b.name }, `${a.name} dan ${b.name} bertengkar kecil.`); } }
  S._meet = {}; }
// pendatang baru: perantau dapat skill awal; sambutan warga ramah (+mood, betah 14 hari)
function traitOnArrive(v) { const T = TRT(), P = T.list.perantau, Rm = T.list.ramah;
  if (hasTrait(v, 'perantau')) { const ks = Object.keys(v.skills); v.skills[pick(ks)] += P.skillStartAdd; }
  if (hasTrait(v, 'cerdas')) { const ks = Object.keys(v.skills); v.skills[pick(ks)] += T.list.cerdas.skillStartRandom; }
  const host = S.villagers.find(o => o !== v && hasTrait(o, 'ramah') && !isKid(o));
  if (host) { v.mood = Math.min(100, v.mood + Rm.welcome.newcomerMood); v.welcomedUntil = S.day + Rm.welcome.newcomerStayDays; S.welcomed = (S.welcomed || 0) + 1;
    relLog('sifat.log_sifat.ramah_sambutan', { nama: host.name, nama2: v.name }, `${host.name} menyambut ${v.name} dengan hangat.`); } }
// ---- berpasangan ----
function pairingDaily() { const P = C.PAIRING, RP = RLC().pairing;
  for (const v of S.villagers) v.goodMoodDays = v.mood >= P.minMood ? (v.goodMoodDays || 0) + 1 : 0;
  const free = v => v.partnerId == null && ageOf(v) >= P.minAge && ageOf(v) <= P.maxAge && !(v.widowDay != null && S.day - v.widowDay < P.rematchDays);
  const elig = v => free(v) && (v.goodMoodDays || 0) >= P.moodDays;
  const vs = S.villagers.filter(elig);
  // calon: beda jenis kelamin, skor >= sahabat (50), bukan rival/keluarga; skor tertinggi dulu (pindah serumah lewat assignHomes)
  const cands = []; for (const a of vs) for (const b of vs) if (a.id < b.id && a.sex !== b.sex && !(RP.noFamily && isFamily(a, b)) && relGet(a, b) >= RP.minRel) cands.push([relGet(a, b), a, b]);
  cands.sort((x, y) => y[0] - x[0]);
  for (const [, a, b] of cands) { if (a.partnerId != null || b.partnerId != null) continue;
    if (!a.closeTo || a.closeTo !== b.id) { a.closeTo = b.id; b.closeTo = a.id; log('💞 ' + TX('log_hubungan.menjadi_dekat', { nama: a.name, pasangan: b.name }, `${a.name} dan ${b.name} mulai akrab.`)); continue; }
    if (Math.random() < P.chancePerDay) pairUp(a, b); }
  const singles = S.villagers.filter(free), L = singles.filter(v => v.sex === 'L'), Pp = singles.filter(v => v.sex === 'P');
  const hs = houses(); if (S.villagers.some(v => v.partnerId != null && partnerOf(v) && partnerOf(v).homeId !== v.homeId) && S.day - (S.needHouseLog || -99) >= 7) { S.needHouseLog = S.day;
    const a = S.villagers.find(v => v.partnerId != null && partnerOf(v).homeId !== v.homeId), b = partnerOf(a);
    log('🏠 ' + TX('log_hubungan.butuh_rumah', { nama: a.name, pasangan: b.name }, `${a.name} dan ${b.name} ingin tinggal bersama, tapi belum ada rumah kosong.`)); } }
function pairUp(a, b) { markMeaningful('naik_hubungan'); S.pairsN = (S.pairsN || 0) + 1; a.partnerId = b.id; b.partnerId = a.id; a.pairedDay = b.pairedDay = S.day; a.heartUntil = b.heartUntil = S.t + C.DAY_LENGTH_SEC; a.loveAt = b.loveAt = S.t; S.pairs = (S.pairs || 0) + 1; relSet(a, b, relGet(a, b));
  log('💍 ' + TX(Math.random() < 0.5 ? 'log_hubungan.menikah' : 'log_hubungan.menjadi_pasangan', { nama: a.name, pasangan: b.name }, `${a.name} dan ${b.name} kini resmi berpasangan.`));
  vhist(a, `Berpasangan dengan ${b.name}`); vhist(b, `Berpasangan dengan ${a.name}`); assignHomes(); }
// ---- kehamilan & kelahiran ----
function pregnancyOk(m, f) { const P = C.PREGNANCY, pop = S.villagers.length, carrying = S.villagers.filter(v => v.pregnantUntil).length;
  const si = (Math.floor((S.day - 1) / yearDays()) * 8 + seasonInfo(S.day).idx), cap = Math.ceil(pop / P.perSeasonCapDiv);
  return (S.era | 0) >= eraIndex(P.minEra) && m.sex === 'P' && !!f && !m.pregnantUntil && ageOf(m) >= P.motherAge[0] && ageOf(m) <= P.motherAge[1] && m.mood >= P.minMood && f.mood >= P.minMood
    && foodDays() >= P.minFoodDays && P.famineLevels.includes(famineLevel()) && capacity() >= pop + carrying + 1 && (m.health ?? 100) >= P.minHp && (f.health ?? 100) >= P.minHp
    && (!P.needHome || m.homeId != null && m.homeId === f.homeId && houses().some(h => h.id === m.homeId)) && !m.sick && !f.sick && !(m.lastBirthDay != null && S.day - m.lastBirthDay < P.cooldownDays) && ((S.seasonBirths || {})[si] || 0) < cap; }
function pregnancyDaily() { const P = C.PREGNANCY;
  for (const m of S.villagers.slice()) { const f = partnerOf(m);
    if (m.pregnantUntil) { const left = m.pregnantUntil - S.day, ex = { ...famEx(m), ibu: m.name, ayah: f ? f.name : (m.formerPartner || 'ayahnya') };
      if (left <= 0) { giveBirth(m); continue; }
      if (left <= 2 && (['kritis', 'kolaps'].includes(famineLevel()) || m.sick && m.sick.lvl === 'parah')) log('⚠️ ' + `${m.name} akan segera melahirkan, tapi desa sedang kesulitan. Jaga stok makanan dan kesehatannya!`);
      else if (left === 1) log('🤰 ' + TX('kehamilan.menjelang_lahir', ex, `Sebentar lagi si kecil akan lahir. ${m.name} beristirahat di rumah.`));
      else if (Math.random() < 0.25) log('🤰 ' + TX('kehamilan.masa_kehamilan', ex, `${m.name} sedang hamil. ${ex.ayah} selalu menemaninya.`));
      continue; }
    const RM = RLC().pregnancyRelMult, relM = f ? Math.max(0, Math.min(RM.maxTotal, 1 + (relGet(m, f) - RM.from) / RM.per)) : 1;
    if (!pregnancyOk(m, f) || Math.random() >= P.chancePerDay * relM * (isWinter() ? P.winterMult : 1)) continue;
    m.pregnantUntil = S.day + P.lengthDays; const si = (Math.floor((S.day - 1) / yearDays()) * 8 + seasonInfo(S.day).idx); S.seasonBirths = S.seasonBirths || {}; S.seasonBirths[si] = (S.seasonBirths[si] || 0) + 1;
    log('🤰 ' + TX('kehamilan.kabar', { ...famEx(m), ibu: m.name, ayah: f.name }, `Kabar bahagia! ${m.name} dan ${f.name} sedang menanti buah hati.`)); vhist(m, 'Menanti buah hati'); } }
function babyName(sex) { const N = TEXT && TEXT.kelahiran && TEXT.kelahiran.nama_bayi, list = (N && N[sex === 'L' ? 'laki_laki' : 'perempuan']) || (sex === 'L' ? ['Arya', 'Bima', 'Raka', 'Dimas'] : ['Anisa', 'Laras', 'Putri', 'Sekar']);
  const used = new Set([...S.villagers.map(v => v.name), ...(S.memorials || []).map(m => m.name)]); const free = list.filter(n => !used.has(n)); return free.length ? pick(free) : pick(list) + ' ' + (S.births || 0); }
function giveBirth(m) { const P = C.PREGNANCY, f = partnerOf(m); markMeaningful('lahir'); m.pregnantUntil = null; m.lastBirthDay = S.day;
  const ayah = f ? f.name : (m.formerPartner || 'ayahnya');
  if ((['kritis', 'kolaps'].includes(famineLevel()) || m.sick && m.sick.lvl === 'parah') && Math.random() < P.birthRiskCritical) {
    S.deaths = (S.deaths || 0) + 1; S.babyLost = (S.babyLost || 0) + 1; S.lastDeathDay = S.day; m.mood = Math.max(0, m.mood - 25); if (f) f.mood = Math.max(0, f.mood - 25);
    log('🕯️ ' + `Bayi ${m.name} dan ${ayah} tidak tertolong. Desa ikut berduka.`); return; }
  const sex = Math.random() < 0.5 ? 'L' : 'P', name = babyName(sex), h = bById(m.homeId), p = h ? cradlePos(h) : { x: m.x, y: m.y };
  const b = { id: S.nextId++, name, sex, age: 0, ageF: 0, born: S.day, ms: 0, x: p.x, y: p.y, hunger: 90, energy: 100, mood: 80, health: 100, joined: S.day,
    skills: { menebang: 0, menambang: 0, meramu: 0, membangun: 0, bertani: 0, meneliti: 0 }, task: null, carry: null, color: (m.color + (f ? f.color : 1)) % 4, motherId: m.id, fatherId: f ? f.id : null, homeId: m.homeId };
  b.traits = babyTraits(m, f); b.traitsHidden = true;
  S.villagers.push(b); relInitFor(b, false); S.births = (S.births || 0) + 1; dstat('births', name, 1);
  S.villagers.forEach(o => o.mood = Math.min(100, o.mood + P.birthMood)); [m, f].forEach(o => { if (o) { o.mood = Math.min(100, o.mood + P.parentMood); o.heartUntil = S.t + C.DAY_LENGTH_SEC / 2; vhist(o, `Anak lahir: ${name}`); } });
  const ex = { bayi: name, ibu: m.name, ayah, nama: m.name, pasangan: ayah };
  log('👶 ' + TX('kelahiran.log', ex, `Tangisan kecil terdengar dari rumah ${m.name} dan ${ayah}. Selamat datang, ${name}!`)); sfx('lonceng');
  const N = (TEXT && TEXT.kelahiran && TEXT.kelahiran.notifikasi) || {};
  toast(ASSETS.ikon_hati.img, fillSafe(N.judul || 'Bayi Lahir!', ex), fillSafe(N.teks || '{bayi} lahir dari keluarga {ibu} dan {ayah}.', ex));
  S.syukuran = { name, day: S.day + 1, ex }; assignHomes(); }
// ---- tua & meninggal karena usia ----
const oldDeathChance = v => { const A = C.AGE; return ageOf(v) < A.oldDeathFrom ? 0 : Math.min(A.oldDeathMaxPerDay, A.oldDeathPerYear * (ageOf(v) - (A.oldDeathFrom - 1))); };
function oldAgeDaily() { const A = C.AGE;
  for (const v of S.villagers.slice()) { if (ageOf(v) < A.oldDeathFrom) continue;
    if (!v.frail) { v.frail = true; log('🍂 ' + `${v.name} (${v.age} tahun) mulai renta. Langkahnya makin pelan, tapi ceritanya makin panjang.`); vhist(v, 'Mulai renta'); }
    if (ageOf(v) >= A.maxAge || Math.random() < oldDeathChance(v)) killVillager(v, 'tua'); } }
function lifeDaily() { if (S.syukuran && S.syukuran.day === S.day) { log('🎊 ' + TX('kelahiran.syukuran', S.syukuran.ex, `Desa mengadakan syukuran kecil untuk ${S.syukuran.name}.`)); surplusSink(SKC().syukuranLahir, 'syukuran_lahir'); S.syukuran = null; }
  assignHomes(); relDaily(); traitDaily(); pairingDaily(); pregnancyDaily(); oldAgeDaily(); }
// ---------- AI ----------
function chooseTask(v) {
  const st = storage(v);
  // 1. Lapar kritis
  if (wantMeal(v) && st) return { kind: 'makan', target: stPos(st) };
  // 2. Tidur kritis, sakit parah (istirahat), lalu tugas darurat (padam/rawat/jaga/makam), baru tidur malam biasa
  if (v.energy <= C.ENERGY_CRIT || v.sick && v.sick.lvl === 'parah') return bedTask(v);
  // darurat: anak tidak ikut; ibu hamil tidak jaga; setelah 21:00 hanya darurat jadwal, setelah 22:30 hanya padam/jaga
  if (!isKid(v)) { const only = pastLate() ? ['padam', 'jaga'] : inSleepWindow() ? SCH().urgentJobs : null, em = emergencyTask(v, v.pregnantUntil ? (only || EMERG).filter(k => k !== 'jaga') : only); if (em) return em; }
  if (v.goHome && isNight() && houses().length) return bedTask(v);
  if (inSleepWindow()) return bedTask(v);
  if (!canWork(v)) return playTask(v);
  if (S.lombaOn && !isKid(v) && !v.pregnantUntil) { const lt = lombaTask(v); if (lt) return lt; }
  { const kt = kbTask(v); if (kt) return kt; } // P1 kerja bakti: warga dewasa & remaja ke lokasi bangun (monumen dulu) sampai sore // Agustusan: semua ke lapangan saat lomba
  if (S.t < S.restUntil) return { kind: 'diam', target: { ...CAMP }, timer: 5 };
  // 3. Darurat desa: makanan menipis
  const pop = S.villagers.length;
  // v9c: utamakan pangan bila stok < FOOD_PRIORITY_DAYS hari (dulu < 3/orang -> hari 1-2 menebang dulu)
  if (foodTotal() < Math.max(pop * 3, foodPerDay() * (C.FOOD_PRIORITY_DAYS || 0))) { const planting = S.villagers.filter(o => o.task && o.task.kind === 'tani' && !o.task.harvest).length;
    // panen dulu; ladang kosong tetap ditanami oleh sebagian penduduk (dulu darurat pangan hanya panen/meramu -> ladang kosong berminggu-minggu -> kolaps)
    const t = (childHelper(v) ? null : farmTask(v, true) || (planting < Math.ceil(pop / 3) ? farmTask(v) : null)) || gatherTask(v, 'makanan'); if (t) return t; }
  if (S.res.air < pop * C.WATER.perDayPerPop) { const t = waterTask(v); if (t) return t; }
  // 3b. Pengaman: hari >= 6 tanpa gubuk jadi -> bangun gubuk yang sudah ditaruh, atau kumpulkan kayu/batu yang kurang untuk biayanya (Asisten Analisa)
  { const t = hutEmergencyTask(v); if (t) return t; }
  // 4. Prioritas kerja (utility: prioritas, jarak, skill)
  let best = null, bs = -1e9; const fdNow = foodDays(); // v9c: stok < FOOD_TILT_DAYS hari -> kerja pangan sedikit diutamakan (hari 1 tak semua menebang)
  for (const job of Object.keys(S.prio)) { const p = S.prio[job]; if (!p || EMERG.includes(job) || childHelper(v) && !C.AGE.childJobs.includes(job)) continue;
    const t = job === 'bangun' ? buildTask(v) : job === 'bertani' ? farmTask(v) : job === 'air' ? waterTask(v) : job === 'riset' ? researchTask(v) : gatherTask(v, job); if (!t) continue;
    const full = job === 'air' ? S.res.air >= S.villagers.length * C.WATER.perDayPerPop * C.WATER_SURPLUS_DAYS : job === 'makanan' && foodTotal() >= S.villagers.length * C.SPAWN.foodDaysPerPop * C.SPAWN.foodPerDayPerPop * (C.FOOD_SURPLUS_FACTOR + techVal('surplus_makanan', 0));
    const HC = (C.RES_HARD_CAP || {})[job]; if (HC && S.res[job] >= HC.base + HC.perPop * S.villagers.length) continue; // RES_HARD_CAP: di atas batas, sumber daya ini tidak dikumpulkan
    const capped = C.RES_SOFT_CAP[job] && S.res[job] >= C.RES_SOFT_CAP[job] * Math.max(1, S.villagers.length / 2);
    const sc = (v.fav === job ? C.FAV_TASK_BONUS : 0) + ((job === 'makanan' || job === 'bertani') && fdNow < (C.FOOD_TILT_DAYS || 0) ? 8 : 0) + p * 10 - (full || capped ? C.FOOD_SURPLUS_PENALTY : 0) + (S.villagers.filter(o => o.task && o.task.res === job).length ? -4 : 0) - dist(v, t.target) * 0.3 + v.skills[SKILL_OF[job]] * 5;
    if (sc > bs) { bs = sc; best = t; } }
  if (best) return best;
  // 5. Fallback: meramu
  return gatherTask(v, 'makanan') || { kind: 'diam', target: { x: v.x + (Math.random() * 4 - 2), y: v.y + (Math.random() * 4 - 2) }, timer: 3 };
}
function gatherTask(v, res) { if (res === 'makanan') return foodTask(v); // v9: semua sumber pangan liar (semak, ikan, jamur, buah, umbi, keong)
  const taken = new Set(S.villagers.filter(o => o !== v && o.task && o.task.node).map(o => o.task.node));
  const nodes = S.nodes.filter(n => RES_OF[n.type] === res && n.amount > 0 && !(n.tunas && !(C.NODE_REGROW && C.NODE_REGROW.pohon.tunasChoppable)) && !taken.has(n) && !(n.unreachable > S.t)); // QC T-01: tunas tak ditebang
  const n = nearest(nodes, v); return n ? { kind: 'kumpul', res, node: n, target: { x: n.x, y: n.y }, work: 0 } : null;
}
function hutEmergencyTask(v) { if (S.day < ((C.AUTO_BUILD || {}).hutTaskDay ?? 6) || houses().length || childHelper(v)) return null;
  const site = nearest(S.buildings.filter(b => b.type === 'gubuk' && !b.done), v, center); if (site) return { kind: 'bangun', b: site, target: center(site) };
  const need = Object.entries(C.BUILDINGS.gubuk.cost).find(([k, n]) => (k === 'kayu' || k === 'batu') && S.res[k] < n);
  return need ? gatherTask(v, need[0]) : null; }
function buildTask(v) { const b = nearest(S.buildings.filter(b => !b.done || (b.hp ?? 100) < C.BUILDING_DAMAGE.repairBelow || b.windHit != null && (b.hp ?? 100) < 100), v, center); return b ? { kind: 'bangun', b, target: center(b) } : null; }
function farmTask(v, harvestOnly) {
  const taken = new Set(S.villagers.filter(o => o !== v && o.task && o.task.kind === 'tani').map(o => o.task.b));
  const f = nearest(done('ladang').filter(b => !taken.has(b) && (b.stage === 'siap' || !harvestOnly && b.stage === 'kosong' && canGrow(b) && !isFlooded(b.x, b.y))), v, center);
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
  if (isBaby(v)) return updateBaby(v, dt);
  growUp(v, dt); if (isBaby(v)) return;
  if (v.inside != null && !(v.task && v.task.kind === 'tidur')) exitHouse(v);
  v.speed = ageSpeed(v);
  const perSec = 1 / C.DAY_LENGTH_SEC;
  const hm = isHardSeason() ? Math.max(1, hungerMultNow() + techVal('lapar_dingin', 0)) : 1;
  v.hunger = Math.max(0, v.hunger - C.HUNGER_PER_DAY * hm * foodMultOf(v) * perSec * dt);
  if (v.health == null) v.health = 100;
  if (v.hunger <= 0) v.health -= C.HEALTH.starvePerDay * perSec * dt; else if (v.hunger > 50) v.health = Math.min(100, v.health + C.HEALTH.regenPerDay * perSec * dt);
  if (!(v.task && v.task.kind === 'tidur' && v.task.asleep)) v.energy = Math.max(0, v.energy - C.ENERGY_PER_DAY * (stageOf(v) === 'lansia' ? C.AGE.elderEnergyDecayMult : 1) / traitMult(v, 'energyMult') * perSec * dt); // energyMult: rajin lebih awet, malas cepat lelah
  const fire = nearest(done('apiunggun'), v, center);
  const cap = comfortCap(v), gain = g => { if (v.mood < cap) v.mood = Math.min(cap, v.mood + g); }; // v9b: api/rumah hanya menaikkan mood sampai batas nyaman
  if (v.mood > cap) v.mood = Math.max(cap, v.mood - ((C.MOOD_COMFORT || {}).aboveDecay || 0) * dt); // di atas batas nyaman (dari kenduri, keinginan, festival) turun pelan
  if (fire && campfireLit() && dist(center(fire), v) < 4 * techVal('api_radius', 1)) gain(C.MOOD_CAMPFIRE_BONUS * traitMult(v, 'fireMoodMult') * dt); else if (inHut(v)) gain(C.MOOD_HOME_BONUS * dt); else if (v.mood > bareFloor()) v.mood = Math.max(bareFloor(), v.mood - C.MOOD_DECAY * dt * (isWinter() && S.res.kulit < S.villagers.length ? C.WINTER_MOOD_DECAY_MULT_NO_HIDE : 1)); // v9c: tanpa api/rumah mood turun ke batas 'seadanya' (MOOD_BARE.floor), bukan ke 0
  if (v.hunger < C.HUNGER_CRIT || v.energy < C.ENERGY_CRIT) v.mood -= C.MOOD_HUNGRY_PENALTY * dt;
  v.mood = Math.max(0, Math.min(v.traumaUntil >= S.day ? TH().traumaMoodCap : 100, v.mood));
  // interupsi kebutuhan kritis
  if (v.task && !['makan', 'tidur'].includes(v.task.kind) && (v.hunger <= C.HUNGER_CRIT && foodTotal() > 0 || v.energy <= C.ENERGY_CRIT)) { deposit(v, true); v.task = null; }
  // jadwal: pukul 21:00 pulang (darurat/angkutan/bangunan hampir selesai boleh s.d. 22:30)
  if (v.task && inSleepWindow() && !lateAllowed(v)) { deposit(v, false); v.working = false; v.task = null; }
  if (!v.task) { v.task = chooseTask(v); const k = v.task.kind;
    if (k !== 'diam' && k !== 'setor' && (v._lastKind !== k || k === 'kumpul' && v._lastRes !== v.task.res)) vhist(v, TASK_TEXT(v.task));
    v._lastKind = k; v._lastRes = v.task.res; }
  const t = v.task;
  if (t.kind === 'setor') { const m = moveTo(v, t.target, dt); if (m) { deposit(v); v.task = null; } else if (m === null) { deposit(v, true); v.task = null; } return; }
  const mv = moveTo(v, t.target, dt);
  if (mv === null) { if (t.node) t.node.unreachable = S.t + 60; v.task = null; v.pathKey = null; return; }
  if (!mv) { v.working = false; return; }
  switch (t.kind) {
    case 'makan': eatNow(v); relOnEat(v); v.task = null; break;
    case 'tidur': sleepTick(v, t, dt); break;
    case 'kumpul': { if (t.src && t.src !== 'meramu') { foodWork(v, t, dt); break; } const n = t.node; if (n.amount <= 0) { v.task = null; break; }
      v.dir = 2; v.working = true; t.work += dt * workMult(v, SKILL_OF[t.res]);
      const MER = t.res === 'makanan' && FS().meramu; // v9: semak +2-3 (dulu +1)
      if (t.work >= (MER ? MER.time : C.GATHER_TIME[t.res]) * (t.res === 'kayu' && isRaining() ? (FX().chopTimeMultRain || 1) : 1) / (t.res === 'makanan' ? FX().forageMult || 1 : 1)) { v.working = false; if (S.res.alat > 0) S.res.alat = Math.max(0, S.res.alat - C.TOOLS.wearPerHaul); const amt = Math.min(Math.max(1, Math.round(((MER ? rndInt(MER.yield[0], MER.yield[1]) : C.CARRY[t.res]) + Math.round(techVal('carry_' + t.res, 0))) * (childHelper(v) ? C.AGE.childCarryMult : 1))), n.amount); n.amount -= amt;
        if (n.amount <= 0) n.regrow = n.type === 'semak' ? C.BUSH_REGROW_SEC : 0;
        v.skills[SKILL_OF[t.res]] += C.SKILL_GAIN * traitMult(v, 'skillGainMult') * (isKid(v) && S.villagers.some(o => o.homeId === v.homeId && v.homeId != null && stageOf(o) === 'lansia') ? C.AGE.mentorSkillMult : 1); v.carry = { res: t.res, n: amt, src: t.res === 'makanan' ? 'meramu' : undefined }; sfx(t.res === 'kayu' ? 'tebang' : t.res === 'batu' ? 'tambang' : 'klik');
        const st = storage(v); v.task = st ? { kind: 'setor', target: stPos(st) } : null; } break; }
    case 'bangun': { const b = t.b; if (!S.buildings.includes(b) || b.done && (b.hp ?? 100) >= 100) { v.task = null; break; } // bangunan rusak (hp<100) tetap diperbaiki (Asisten Analisa: dulu tugas langsung dibuang)
      if (b.done) { b.hp = Math.min(100, (b.hp ?? 100) + C.BUILDING_DAMAGE.repairPerSec * dt * workMult(v, 'membangun')); v.working = true;
        if (b.hp >= 100) { log(`${v.name} selesai memperbaiki ${C.BUILDINGS[b.type].nama}.`); v.working = false; v.task = null; } break; }
      v.working = true; b.progress += dt * workMult(v, 'membangun') * (b.mon ? monWorkMult(v, b) : kbOn() ? KBC().workMult : 1);
      if (b.mon) { monProgress(b, dt); if (b.progress >= bWork(b)) { monStageDone(b, v); v.working = false; v.task = null; } break; }
      if (b.progress >= C.BUILDINGS[b.type].work) { b.done = true; v.skills.membangun += C.SKILL_GAIN * traitMult(v, 'skillGainMult') * 5;
        log(`${v.name} selesai membangun ${C.BUILDINGS[b.type].nama}.`); b.doneDay = S.day; markMeaningful('bangunan_selesai'); if (isHouse(b)) assignHomes(); vhist(v, `Selesai membangun ${C.BUILDINGS[b.type].nama}`); sfx('bangun'); dstat('built', C.BUILDINGS[b.type].nama, 1); v.working = false; v.task = null; } break; }
    case 'tani': { const b = t.b; if (!S.buildings.includes(b) || (t.harvest ? b.stage !== 'siap' : b.stage !== 'kosong')) { v.task = null; break; }
      v.working = true; t.work += dt * workMult(v, 'bertani');
      if (t.work >= (t.harvest ? C.FIELD.harvestTime : C.FIELD.plantTime * (FX().plantTimeMult || 1) / buffMult('tanam')) * techVal('tani_waktu', 1)) { v.working = false; v.skills.bertani += C.SKILL_GAIN * traitMult(v, 'skillGainMult');
        if (t.harvest) { const F = C.FIELD, cr = cropOf(b), res = cr.res, y = cr.yield || [F.yieldMin, F.yieldMax], n = Math.round((y[0] + Math.random() * (y[1] - y[0]) + techVal('ladang_hasil', 0)) * (FX().yieldMult || 1)) + traitAdd(v, 'yieldAdd');
          if (traitAdd(v, 'harvestMood')) v.mood = Math.min(100, v.mood + traitAdd(v, 'harvestMood'));
          b.stage = 'kosong'; b.grow = 0; b.harvested = true; S.harvests = (S.harvests || 0) + 1; (S.harvestDays = S.harvestDays || []).push(S.day); if (S.harvestDays.length > 40) S.harvestDays.shift(); v.carry = { res, n, src: cropId(b) }; vhist(v, `Memanen ${n} ${RES_LABEL[res].toLowerCase()}`); sfx('panen'); log(`${v.name} memanen ${n} ${RES_LABEL[res].toLowerCase()} dari ladang ${cropName(b)}.`);
          const st = storage(v); v.task = { kind: 'setor', target: stPos(st) }; }
        else { b.stage = 'tumbuh'; b.grow = 0; b.harvested = false; v.task = null; } } break; }
    case 'air': { v.working = true; t.work += dt * workMult(v, 'meramu');
      if (t.work >= (t.src === 'sumur' ? C.WATER.wellTime : C.WATER.riverTime)) { v.working = false;
        v.carry = { res: 'air', n: Math.max(1, Math.round((t.src === 'sumur' ? wellYieldNow() : riverYieldNow()) * (childHelper(v) ? C.AGE.childCarryMult : 1))) }; v.task = { kind: 'setor', target: stPos(storage(v)) }; } break; }
    case 'diam': case 'main': t.timer -= dt; if (t.timer <= 0) v.task = null; break;
    case 'padam': { if (!t.b.burning || !S.buildings.includes(t.b)) { v.working = false; v.task = null; break; } v.working = true; t.work += dt;
      if (t.work >= C.FIRE.actionSec) { doFireAction(v, t); v.working = false; v.task = null; } break; }
    case 'rawat': { const pt = vById(t.pid); if (!pt || !pt.sick || pt.sick.lvl !== 'parah') { v.task = null; break; } if (dist(v, pt) > 1.5) { t.target = { x: pt.x, y: pt.y }; break; }
      v.working = true; t.work += dt; pt.sick.careWork = t.work; pt.sick.underCareUntil = Math.max(pt.sick.underCareUntil || 0, S.day + 1); // perlindungan selama masa rawat, juga saat perawat tidur malam
      if (t.work >= C.SICKNESS.careSeconds) { finishCare(v, t); v.working = false; v.task = null; } break; }
    case 'makam': { if (!S.buildings.includes(t.b)) { v.task = null; break; } v.working = true; t.work += dt * workMult(v, 'membangun');
      if (t.work >= (t.b.done ? 5 : C.BUILDINGS.makam.work)) { finishGrave(v, t); v.working = false; v.task = null; } break; }
    case 'jaga': { t.arrived = true; v.working = false; const w = S.wolf; if (!w || w.phase === 'usai' || !w.phase) { v.task = null; } break; }
    case 'riset': { const R = S.research; if (!R) { v.working = false; v.task = null; break; } const n = techNodes().find(x => x.id === R.id);
      v.working = true; R.progress += dt * workMult(v, 'meneliti');
      if (!t.t0) t.t0 = S.t; if (S.t - t.t0 > 20) { v.working = false; v.task = null; } // pilih ulang tiap 20 dtk
      if (R.progress >= n.work) { S.techDone.push(n.id); markMeaningful('riset_selesai'); S.research = null; v.skills.meneliti = (v.skills.meneliti || 0) + C.SKILL_GAIN * traitMult(v, 'skillGainMult') * 5;
        log(n.teks_selesai ? '🎓 ' + fill(n.teks_selesai, { nama: v.name }) : `🎓 ${v.name} menyelesaikan riset ${n.nama}!`); sfx('panen'); vhist(v, `Menyelesaikan riset ${n.nama}`); v.working = false; v.task = null; techPanelUI(); } break; }
  }
}
function deposit(v, drop) { if (v.carry) { if (!drop) { const c = v.carry; S.res[c.res] += c.n; S.gathered[c.res] = (S.gathered[c.res] || 0) + c.n; dstat('gathered', c.res, c.n);
  if (isFoodRes(c.res)) dstat('panganMasuk', c.src || c.res, c.n); if (c.src === 'memancing') v.fishedDay = S.day; notify(c.res, c.n, v, isFoodRes(c.res) ? c.src || c.res : undefined); } v.carry = null; } }

const notes = [];
// notifikasi melayang: digabung per jenis sumber daya di dekatnya, maksimal C.MAX_NOTES
// v9: src = sumber pangan ('ikan', 'padi', 'jamur', ...) -> teks '+4 Ikan' dengan ikon sumber
function notify(res, n, v, src) { const near = notes.find(o => o.res === res && o.src === src && Math.abs(o.x - v.x) < 3 && Math.abs(o.y - v.y) < 3 && o.life > 1);
  if (near) { near.n += n; near.life = 2; return; }
  if (notes.length >= (C.MAX_NOTES || 6)) notes.shift();
  // v9d (uji perangkat @51b6d4d): susun dari posisi y SEKARANG semua teks yang masih hidup di tempat itu -> teks baru di bawah yang terendah dengan jarak minimal
  // (semua naik dengan laju sama, jadi jarak itu tetap terjaga sampai hilang)
  const lows = notes.filter(o => o.life > 0 && Math.abs(o.x - v.x) < 2.5 && Math.abs(o.y - v.y) < 2).map(o => noteRise(o) + (v.y - o.y) * T);
  const off = lows.length ? Math.max(-NOTE_GAP * 3, Math.min(0, Math.min(...lows) - NOTE_GAP)) : 0;
  notes.push({ res, n, x: v.x, y: v.y, life: 2, src, off, label: src ? panganLabel(src) : RES_LABEL[res] || res }); }
// teks melayang tanpa angka (mis. 'Monyet kabur!'), ditumpuk seperti notify
function floatText(label, x, y, col) { if (notes.length >= (C.MAX_NOTES || 6)) notes.shift(); const lows = notes.filter(o => o.life > 0 && Math.abs(o.x - x) < 2.5 && Math.abs(o.y - y) < 2).map(o => noteRise(o) + (y - o.y) * T);
  notes.push({ res: '_teks', n: 0, x, y, life: 2.5, txt: true, label, col, off: lows.length ? Math.max(-NOTE_GAP * 3, Math.min(0, Math.min(...lows) - NOTE_GAP)) : 0 }); }
const NOTE_GAP = 13; // px antar baris teks melayang
// ================= v12: angin kencang (SEASON_FX windChance/windHp; tema sedang tanpa angin) =================
const themeHasWind = () => Object.values(C.SEASON_FX || {}).some(f => f && f.windChance);
const windSheltered = b => { const W = C.WIND || {}, c = center(b); return S.buildings.some(o => o.done && (W.shelter || []).includes(o.type) && dist(center(o), c) <= (W.shelterRadius || 3)); };
function windDaily() { const F = FX(); if (!F.windChance || S.windDay === S.day || Math.random() >= F.windChance) return; windStrike(F.windHp || 15); }
// satu bangunan (gubuk/rumah/atap) rusak windHp; atap diikat (event angin) -> bertahan. Tahun 1: kondisi tak turun di bawah batas kapasitas (tempat tidur tidak hilang)
function windStrike(hp, quiet) { const W = C.WIND || {}; S.windDay = S.day;
  if (S.roofTiedUntil != null && S.day <= S.roofTiedUntil) { if (!quiet) log('🍃 ' + TX('angin.atap_bertahan', {}, 'Angin kencang bertiup, tapi atap yang sudah diikat tetap bertahan.')); return { held: true }; }
  const cand = S.buildings.filter(b => b.done && (W.targets || []).includes(b.type) && (b.hp ?? 100) > 0 && !b.burning); const b = pick(cand); if (!b) return { none: true };
  let dmg = Math.round(hp * (windSheltered(b) ? W.shelterMult ?? 0.5 : 1)); const floor = isY2() ? 0 : C.BUILDING_DAMAGE.noCapacityBelow; const h0 = b.hp ?? 100; b.hp = Math.max(Math.min(h0, floor), h0 - dmg); dmg = Math.round(h0 - b.hp);
  b.windHit = S.day; S.windDamage = (S.windDamage || 0) + 1; const c = center(b), nm = bname(b); dustAt(c.x, c.y); floatText(`-${dmg} ${TX('peta_kejadian.kondisi', {}, 'Kondisi')}`, c.x, c.y - 0.5, '#ff9a8a'); mapEvent('rusak', c.x, c.y, EV_SEC(), b.id); sfx('event');
  const msg = '🌬️ ' + TX('angin.kencang_rusak', { bangunan: nm, jumlah: dmg }, `Angin kencang merobek atap ${nm} (-${dmg} Kondisi). Warga akan memperbaikinya.`); logAt(msg, c.x, c.y); return { b, dmg, msg }; }
// ================= v11: kejadian di peta — penanda '!' berdenyut, efek di lokasi, klik spanduk/log -> kamera ke sana =================
const EV_COL = { serang: '#ff3b30', ladang: '#ff3b30', curi: '#ff8a00', api: '#ff6a00', banjir: '#3aa0ff', rusak: '#ff8a00', pendatang: '#5ad05a' };
const EV_SEC = () => 0.25 * C.DAY_LENGTH_SEC;
let fx = []; // efek sesaat (debu), tidak disimpan
function mapEvent(k, x, y, sec, ref) { S.mapEvents = (S.mapEvents || []).filter(e => S.t < e.until && !(ref != null && e.ref === ref && e.k === k));
  const e = { k, x, y, t0: S.t, until: S.t + (sec ?? EV_SEC()), ref }; S.mapEvents.push(e); if (S.mapEvents.length > 12) S.mapEvents.shift(); S.lastEventAt = { k, x, y }; return e; }
function logAt(msg, x, y) { log(msg); const P = S.logPos = S.logPos || {}; P[S.log[0]] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10]; for (const k of Object.keys(P)) if (!S.log.includes(k)) delete P[k]; }
function dustAt(x, y, big) { fx.push({ k: 'debu', x, y, t0: performance.now(), life: big ? 2600 : 1600, big: !!big }); if (fx.length > 20) fx.shift(); } // v15: debu lebih besar & lama
// penanda aktif: kejadian tercatat + yang dinamis (hewan menyerang, bangunan terbakar, banjir)
function activeMarkers() { const out = (S.mapEvents || []).filter(e => S.t < e.until).map(e => ({ k: e.k, x: e.x, y: e.y }));
  if (S.wolf && S.wolf.phase === 'serang') for (const o of S.wolves || []) if (o.mode !== 'pergi') out.push({ k: 'serang', x: o.x, y: o.y });
  for (const r of S.raiders || []) if (r.mode !== 'pergi') out.push({ k: 'curi', x: r.x, y: r.y });
  for (const b of S.buildings) if (b.burning) { const c = center(b); out.push({ k: 'api', x: c.x, y: c.y }); }
  if (S.flood && S.flood.pos && S.t < S.flood.end) out.push({ k: 'banjir', x: S.flood.pos.x, y: S.flood.pos.y });
  return out; }
function drawMarkers() { const t = performance.now() / 1000;
  for (const m of activeMarkers()) { const cx = m.x * T + 16, cy = m.y * T + 16, p = (Math.sin(t * 6) + 1) / 2, col = EV_COL[m.k] || '#ff3b30';
    ctx.globalAlpha = 0.35 + 0.4 * (1 - p); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 12 + p * 10, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy - 26, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', cx, cy - 22); ctx.textAlign = 'left'; }
  const now = performance.now(); fx = fx.filter(f => now - f.t0 < (f.life || 1600));
  for (const f of fx) { const a = (now - f.t0) / (f.life || 1600), n = f.big ? 9 : 6, s = f.big ? 1.5 : 1; ctx.globalAlpha = 0.85 * (1 - a * a);
    for (let i = 0; i < n; i++) { const ang = i * 6.283 / n + a, r = (5 + a * 20) * s; ctx.fillStyle = i % 2 ? '#8a6238' : '#b08a5a'; ctx.beginPath(); ctx.arc(f.x * T + 16 + Math.cos(ang) * r, f.y * T + 22 + Math.sin(ang) * r * 0.55 - a * 10, (5 + a * 7) * s, 0, 7); ctx.fill(); } }
  ctx.globalAlpha = 1; }
// posisi untuk spanduk peringatan (klik -> kamera ke sana)
function warnPos(k) { const M = activeMarkers(), f = m => m && { x: m.x, y: m.y };
  if (k === 'howl') return f(M.find(m => m.k === 'serang')) || f((S.wolves || [])[0]) || f((S.tracks || [])[0]) || f(S.lastEventAt && S.lastEventAt.k === 'serang' ? S.lastEventAt : null);
  if (k === 'fire') { const b = S.buildings.find(b => b.burning) || (S.fireRisk && S.buildings.find(b => b.id === S.fireRisk.b)); return b ? center(b) : null; }
  if (k === 'flood') return S.flood && S.flood.pos ? { ...S.flood.pos } : null;
  if (k === 'hunger') { const g = storeBuilding(); return g ? center(g) : { x: CAMP.x, y: CAMP.y }; }
  return null; }
function panTo(x, y) { centerCam(+x, +y); S.panFlash = { x: +x, y: +y, t: S.t }; }
// pencuri pangan (monyet/rubah) berjalan dari tepi peta ke ladang/gudang, menyambar, lalu pergi (visual; jumlah dicuri sudah diambil di monkeyDaily)
function spawnRaider(n, kind) { const tg = pick(S.buildings.filter(b => b.type === 'ladang' && b.done)) || storeBuilding() || { x: CAMP.x, y: CAMP.y }; const c = center(tg);
  const e = [{ x: c.x, y: 1 }, { x: C.MAP_W - 2, y: c.y }, { x: c.x, y: C.MAP_H - 2 }, { x: 1, y: c.y }].reduce((a, b) => dist(a, c) < dist(b, c) ? a : b), s = nearestWalkable(Math.round(e.x), Math.round(e.y)) || { x: 1, y: 1 };
  (S.raiders = S.raiders || []).push({ x: s.x, y: s.y, home: { ...s }, goal: { x: c.x, y: c.y }, n, kind, mode: 'jalan', dir: 0 }); mapEvent('curi', c.x, c.y); }
function updateRaiders(dt) { for (const r of S.raiders || []) { if (r.grab > 0) { r.grab -= dt; r.moving = false; continue; } const g = r.mode === 'pergi' ? r.home : r.goal, d = dist(r, g), st = 3.2 * dt; r.moving = d > 0.05;
    if (d > 0.001) { const dx = g.x - r.x, dy = g.y - r.y; r.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); }
    if (d <= st) { r.x = g.x; r.y = g.y; if (r.mode === 'jalan') { r.mode = 'pergi'; r.grab = 0.6; dustAt(r.x, r.y); floatText(`-${r.n} ${TX('peta_kejadian.pangan', {}, 'Pangan')}`, r.x, r.y - 0.5, '#ff9a8a'); } else r.gone = true; }
    else { r.x += (g.x - r.x) / d * st; r.y += (g.y - r.y) / d * st; } }
  if (S.raiders) S.raiders = S.raiders.filter(r => !r.gone); }
// sprite monyet/rubah belum ada (aset hilang): siluet sementara
function drawRaider(r) { const sp = ASSETS[r.kind], im = sp && sp.image; // v12: sprite monyet (tahap 7) / rubah (tahap 10), animasi sama dengan babi/serigala; siluet hanya bila gambar gagal dimuat
  if (im) { const mode = r.grab > 0 ? 'serang' : r.moving ? 'jalan' : 'diam', fr = Math.floor(performance.now() / ({ diam: 250, jalan: 125, serang: 100 })[mode]) % 4; ctx.drawImage(im, fr * 32, (WOLF_ROW[mode] * 4 + (r.dir || 0)) * 32, 32, 32, Math.round(r.x * T), Math.round(r.y * T), 32, 32); return; }
  const x = r.x * T, y = r.y * T, l = r.dir === 1, bob = r.moving ? Math.sin(performance.now() / 60) * 1.5 : 0, fox = r.kind === 'rubah';
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 9, y + 25, 14, 3); ctx.fillStyle = fox ? '#c8642a' : '#7a5a3a'; ctx.fillRect(x + 10, y + 14 + bob, 12, 9);
  ctx.fillRect(l ? x + 5 : x + 20, y + 10 + bob, 8, 8); ctx.fillStyle = fox ? '#f2e6d0' : '#d8b890'; ctx.fillRect(l ? x + 5 : x + 24, y + 13 + bob, 3, 3);
  ctx.fillStyle = fox ? '#c8642a' : '#5a4028'; ctx.fillRect(l ? x + 22 : x + 4, y + 12 + bob, 6, 3); ctx.fillStyle = '#111'; ctx.fillRect(l ? x + 7 : x + 24, y + 12 + bob, 1, 1); }
const noteRise = n => (2 - n.life) * 14 + (n.off || 0);
// ================= PANGAN v9 (permintaan Ichwan 21-10): sumber pangan liar data-driven (C.FOOD_SOURCES), teks melayang per sumber, ringkasan masuk/keluar =================
const FS = () => C.FOOD_SOURCES || {};
const FISH_B = ['kolam', 'tambak'];
const cap1 = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);
// label sumber pangan: '+4 Ikan', '+9 Padi'. TEKS pangan.sumber.<id> bila ada (Asisten Dokumen), cadangan bahasa Indonesia di sini.
const PANGAN_FB = { meramu: 'Buah semak', memancing: 'Ikan', ikan: 'Ikan', jamur: 'Jamur', buah: 'Buah', umbi: 'Umbi hutan', keong: 'Keong sawah', mangga: 'Mangga', pisang: 'Pisang', kelapa: 'Kelapa', rambutan: 'Rambutan', telur: 'Telur',
  padi: 'Padi', jagung: 'Jagung', ubi: 'Ubi', singkong: 'Singkong', gandum: RES_LABEL.gandum, wortel: 'Wortel', makanan: 'Makanan', pasar: 'Pasar', cerita: 'Kejadian' };
const panganLabel = id => TX('pangan.sumber.' + id, {}, (FS()[id] && FS()[id].label) || PANGAN_FB[id] || cap1(id));
const panganIcon = id => { const P = ASSETS.pangan_ikon, i = P ? P.keys.indexOf(id === 'memancing' ? 'ikan' : id === 'meramu' ? 'makanan' : id) : -1; return i >= 0 ? { src: [].concat(P.img)[i], im: P.images && P.images[i] } : null; };
// pengali hasil musim (+hujan) untuk sumber id (kind = jenis pohon buah)
function srcMult(id, kind) { const c = FS()[id]; if (!c) return 0; const sm = kind && c.kinds && c.kinds[kind] ? c.kinds[kind].season : c.season;
  let m = sm ? (sm[season()] ?? 0) : 1; if (c.rainMult && isRaining()) m *= c.rainMult; return m; }
const srcOn = (id, kind) => !!FS()[id] && srcMult(id, kind) >= (FS()[id].minMult || 0);
const avgYield = c => (c.yield[0] + c.yield[1]) / 2;
// peta: pohon buah & umbi hutan (seed peta tetap; dipanggil setelah semak supaya posisi node lama tidak bergeser)
function placeFoodNodes(r, occ) { const B = FS().buah, U = FS().umbi, put = (type, extra) => { let x, y, k = 0;
    do { x = Math.floor(r() * C.MAP_W); y = Math.floor(r() * C.MAP_H); } while (occ(x, y) && ++k < 200); if (k < 200) S.nodes.push({ type, x, y, regrow: 0, ...extra }); };
  if (B) { const kinds = Object.keys(B.kinds || { mangga: {} }); for (let i = 0; i < (B.trees || 0); i++) put('buah', { kind: kinds[i % kinds.length], amount: B.amount || 6 }); }
  if (U) for (let i = 0; i < (U.count || 0); i++) put('umbi', { amount: U.amount || 8 }); }
// pohon 'rimbun' (hutan): >= forestNeighbors pohon lain dalam radius 2.5 -> tempat jamur
function forestTrees() { const J = FS().jamur, trees = S.nodes.filter(n => n.type === 'pohon' && n.amount > 0);
  return trees.filter(n => trees.filter(o => o !== n && Math.abs(o.x - n.x) <= 2.5 && Math.abs(o.y - n.y) <= 2.5).length >= ((J && J.forestNeighbors) || 2)); }
// pagi: jamur tumbuh (yang kemarin layu), stok ikan sungai & kolam pulih, keong muncul di sawah berair
function foodSourcesDaily() { const F = FS();
  for (const n of S.nodes) if (n.jamur) { n.jamur = 0; n.jamurKind = null; }
  const J = F.jamur; if (J) { const m = srcMult('jamur'), k = Math.round(J.patchesPerDay * Math.min(1.5, m)); if (m >= (J.minMult || 0) && k > 0) {
    const pool = forestTrees(), kinds = ['kancing', 'payung', 'tiram', 'kuping'];
    for (let i = 0; i < k && pool.length; i++) { const n = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]; n.jamur = rndInt(J.patchAmount[0], J.patchAmount[1]); n.jamurKind = pick(kinds); n.jamurBanyak = m >= 0.6; } } }
  const M = F.memancing; S.fish = { river: M ? Math.round(M.riverStockPerDay * Math.min(1.3, srcMult('memancing'))) : 0, ponds: {} };
  if (M) for (const b of S.buildings) if (b.done && FISH_B.includes(b.type)) S.fish.ponds[b.id] = Math.round((C.BUILDINGS[b.type].fishStock || 0) * Math.max(M.pondSeasonMin || 0, Math.min(1, srcMult('memancing'))));
  const E = F.telur; if (E) for (const b of S.buildings) if (b.type === 'kandang_ayam' && b.done) b.telur = Math.min(E.stockMax || 6, (b.telur || 0) + (C.BUILDINGS.kandang_ayam.hens || 4) * (E.perHenPerDay || 0.4) * (srcOn('telur') ? srcMult('telur') : 0));
  const K = F.keong; for (const b of S.buildings) if (b.type === 'ladang') b.keong = K && b.done && b.stage === 'tumbuh' && K.crops.includes(cropId(b)) && !sawahDry(b) && srcOn('keong') ? K.perFieldPerDay : 0; }
// tepi air untuk memancing: tile darat di samping air (bukan jembatan); arah hadap ke air
function fishFace(p) { const W = [[0, 1, 0], [-1, 0, 1], [1, 0, 2], [0, -1, 3]]; for (const [dx, dy, d] of W) if (S.tiles[p.y + dy] && S.tiles[p.y + dy][p.x + dx] === 1) return d; return 0; }
function pondSpot(b) { const d = C.BUILDINGS[b.type]; return { x: b.x + Math.floor(d.w / 2), y: b.y + d.h, face: 3 }; }
// tugas Makanan: pilih sumber dengan hasil per detik terbaik (hasil rata-rata x musim / (waktu kerja + jalan pulang-pergi))
function foodTask(v) { const F = FS(), others = S.villagers.filter(o => o !== v && o.task), sp = ageSpeed(v), cand = [];
  const takenN = new Set(others.map(o => o.task.node).filter(Boolean)), takenB = new Set(others.map(o => o.task.fb).filter(Boolean)), takenS = new Set(others.map(o => o.task.spotKey).filter(Boolean));
  const add = (id, val, time, target, extra) => { if (val > 0) cand.push({ sc: val / (time + 2 * dist(v, target) / sp), t: { kind: 'kumpul', res: 'makanan', src: id, target: { x: target.x, y: target.y }, work: 0, ...extra } }); };
  const okN = n => n.amount > 0 && !takenN.has(n) && !(n.unreachable > S.t);
  const mer = F.meramu || { yield: [C.CARRY.makanan, C.CARRY.makanan], time: C.GATHER_TIME.makanan };
  { const n = nearest(S.nodes.filter(n => n.type === 'semak' && okN(n)), v); if (n) add('meramu', Math.min(avgYield(mer), n.amount), mer.time, n, { node: n }); }
  if (F.buah) { const n = nearest(S.nodes.filter(n => n.type === 'buah' && okN(n) && srcOn('buah', n.kind)), v); if (n) add('buah', Math.min(avgYield(F.buah) * srcMult('buah', n.kind), n.amount), F.buah.time, n, { node: n, kindF: n.kind }); }
  if (F.umbi && srcOn('umbi')) { const n = nearest(S.nodes.filter(n => n.type === 'umbi' && okN(n)), v); if (n) add('umbi', Math.min(avgYield(F.umbi) * srcMult('umbi'), n.amount), F.umbi.time, n, { node: n }); }
  if (F.jamur) { const n = nearest(S.nodes.filter(n => n.jamur > 0 && n.amount > 0 && !takenN.has(n) && !(n.unreachable > S.t)), v); if (n) add('jamur', Math.min(avgYield(F.jamur) * Math.max(0.5, srcMult('jamur')), n.jamur), F.jamur.time, n, { node: n, jamurT: true }); }
  const M = F.memancing; if (M && S.fish) { const fishers = others.filter(o => o.task.src === 'memancing' && !o.task.pond).length;
    if (S.fish.river > 0 && fishers < M.maxFishers && srcOn('memancing')) { const b = nearest((S.banks || []).filter(p => !takenS.has(p.x + ',' + p.y) && !(S.tiles[p.y][p.x] === 2)), v);
      if (b) add('memancing', Math.min(avgYield(M) * srcMult('memancing'), S.fish.river), M.time, b, { spotKey: b.x + ',' + b.y, face: fishFace(b) }); }
    for (const pb of S.buildings.filter(b => b.done && FISH_B.includes(b.type) && (S.fish.ponds[b.id] || 0) > 0 && !takenB.has(b))) { const p = pondSpot(pb);
      add('memancing', Math.min(avgYield(M) * Math.max(M.pondSeasonMin || 0, Math.min(1, srcMult('memancing'))) + (M.pondYieldAdd || 0), S.fish.ponds[pb.id]), M.time, p, { pond: pb.id, fb: pb, face: p.face }); } }
  if (F.keong) { const f = nearest(S.buildings.filter(b => b.type === 'ladang' && b.keong > 0 && !takenB.has(b)), v, center); if (f) add('keong', Math.min(avgYield(F.keong) * srcMult('keong'), f.keong), F.keong.time, center(f), { fb: f }); }
  if (F.telur) { const f = nearest(S.buildings.filter(b => b.type === 'kandang_ayam' && b.done && (b.telur || 0) >= 1 && !takenB.has(b)), v, center); if (f) { const p = coopSpot(f); add('telur', Math.min(avgYield(F.telur), Math.floor(f.telur)), F.telur.time, p, { fb: f, face: 3 }); } }
  if (!cand.length) return null; cand.sort((a, b) => b.sc - a.sc); return cand[0].t; }
const coopSpot = b => ({ x: b.x + 1, y: b.y + C.BUILDINGS[b.type].h });
// nama tugas sumber pangan: TEKS pangan.tugas.<id>.nama (Asisten Dokumen v1.6.0), cadangan di sini
const TASK_FB = { meramu: 'Meramu', memancing: 'Memancing', jamur: 'Mencari jamur', buah: 'Memetik buah', umbi: 'Menggali umbi hutan', keong: 'Memungut keong sawah', telur: 'Mengambil telur' };
const taskName = id => TX('pangan.tugas.' + id + '.nama', {}, TASK_FB[id] || 'Meramu');
// sisa pangan yang masih bisa diambil di sumber tugas t
function foodAvail(t) { if (t.src === 'memancing') return t.pond != null ? (S.fish && S.fish.ponds[t.pond]) || 0 : (S.fish && S.fish.river) || 0;
  if (t.src === 'keong') return S.buildings.includes(t.fb) ? t.fb.keong || 0 : 0; if (t.src === 'telur') return S.buildings.includes(t.fb) ? Math.floor(t.fb.telur || 0) : 0; if (t.jamurT) return t.node && t.node.amount > 0 ? t.node.jamur || 0 : 0; return t.node ? t.node.amount : 0; }
// kerja di sumber pangan (selain semak): ikan/jamur/buah/umbi/keong
function foodWork(v, t, dt) { const c = FS()[t.src]; if (!c || foodAvail(t) <= 0) { v.working = false; v.task = null; return; }
  if (t.src === 'memancing') v.dir = [0, 1, 2, 3][t.face || 0];
  v.working = true; t.work += dt * workMult(v, 'meramu'); if (t.work < c.time) return; v.working = false;
  const M = t.src === 'memancing' && t.pond != null ? Math.max(c.pondSeasonMin || 0, Math.min(1, srcMult('memancing'))) : t.src === 'jamur' ? Math.max(0.5, srcMult('jamur')) : srcMult(t.src, t.kindF);
  let n = Math.round((rndInt(c.yield[0], c.yield[1]) * M + (t.pond != null ? c.pondYieldAdd || 0 : 0)) * (childHelper(v) ? C.AGE.childCarryMult : 1));
  n = Math.max(1, Math.min(n, Math.floor(foodAvail(t)) || 1));
  if (t.src === 'memancing') { if (t.pond != null) S.fish.ponds[t.pond] -= n; else S.fish.river -= n; }
  else if (t.src === 'keong') t.fb.keong = Math.max(0, t.fb.keong - n); else if (t.src === 'telur') t.fb.telur = Math.max(0, t.fb.telur - n); else if (t.jamurT) t.node.jamur = Math.max(0, t.node.jamur - n);
  else { t.node.amount -= n; if (t.node.amount <= 0) { t.node.amount = 0; t.node.regrow = (c.regrowDays || 3) * C.DAY_LENGTH_SEC; } }
  v.skills.meramu += C.SKILL_GAIN * traitMult(v, 'skillGainMult'); const src = t.src === 'memancing' ? 'ikan' : t.src === 'buah' ? t.kindF || 'buah' : t.src;
  v.carry = { res: 'makanan', n, src }; sfx('klik'); vhist(v, TX('pangan.tugas.' + t.src + '.log', { nama: v.name, jumlah: n, sumber: panganLabel(src).toLowerCase(), ...(t.src === 'buah' ? { buah: panganLabel(src).toLowerCase() } : {}) }, `${taskName(t.src)}: ${n} ${panganLabel(src).toLowerCase()}`));
  const st = storage(v); v.task = st ? { kind: 'setor', target: stPos(st) } : null; }
// pohon buah & umbi tumbuh lagi (hari game), pohon buah hanya berbuah di musimnya
// QC T-01: regrow pohon/batu harian (tunas pohon tumbuh jadi pohon penuh)
function nodeTileFree(x, y, gap) { if (x < 1 || y < 1 || x >= C.MAP_W - 1 || y >= C.MAP_H - 1 || S.tiles[y][x] !== 0) return false;
  if (Math.abs(x - CAMP.x) < 5 && Math.abs(y - CAMP.y) < 4) return false;
  if (S.nodes.some(n => Math.abs(n.x - x) < 1 && Math.abs(n.y - y) < 1)) return false;
  if (S.villagers.some(v => Math.abs(v.x - x) < 1 && Math.abs(v.y - y) < 1)) return false;
  return !S.buildings.some(b => { const d = C.BUILDINGS[b.type] || { w: 1, h: 1 }; return x > b.x - 1 - gap && x < b.x + d.w + gap && y > b.y - 1 - gap && y < b.y + d.h + gap; }); }
function nodesRegrowDaily() { const G = C.NODE_REGROW; if (!G) return; const st = S.stumps = S.stumps || [], se = season();
  for (const type of ['pohon', 'batu']) { const g = G[type]; if (!g) continue; const sm = g.season ? (g.season[se] ?? 1) : 1, full = C.NODE_AMOUNT[RES_OF[type]];
    if (type === 'pohon') for (const n of S.nodes) if (n.tunas && n.type === 'pohon') { n.amount = Math.min(full, n.amount + Math.ceil(full * (g.tunasGrow || 0.15) * sm)); if (n.amount >= full) n.tunas = 0; } // kemarau/dingin: tunas diam
    if (S.day < (g.startDay || 0)) continue; const missing = g.cap - S.nodes.filter(n => n.type === type).length; if (missing <= 0) continue;
    const rate = Math.min(g.maxPerDay, missing * g.chancePerMissingDay) * sm; let k = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
    const ripe = st.filter(s => s.type === type && S.day - s.day >= (g.delayDays || 0)), fresh = st.filter(s => S.day - s.day < (G[s.type] && G[s.type].delayDays || 0));
    const ok = (x, y) => nodeTileFree(x, y, G.jarakBangunan || 3) && !fresh.some(s => s.x === x && s.y === y); // tunggul baru: belum boleh bertunas
    while (k-- > 0) { let x, y, tries = 0, found = false;
      if (ripe.length && Math.random() < (G.nearStump ?? 0.7)) { const s = ripe[Math.floor(Math.random() * ripe.length)]; for (; tries < 30 && !found; tries++) { x = s.x + Math.round(Math.random() * 6 - 3); y = s.y + Math.round(Math.random() * 6 - 3); found = ok(x, y); } if (found) st.splice(st.indexOf(s), 1), ripe.splice(ripe.indexOf(s), 1); }
      for (tries = 0; !found && tries < 80; tries++) { x = 1 + Math.floor(Math.random() * (C.MAP_W - 2)); y = 1 + Math.floor(Math.random() * (C.MAP_H - 2)); found = ok(x, y); }
      if (!found) break; const tunas = type === 'pohon' && g.tunasFrac;
      S.nodes.push({ type, x, y, amount: tunas ? Math.ceil(full * g.tunasFrac) : Math.ceil(full * (g.amountFrac || 1)), regrow: 0, tunas: tunas ? 1 : 0 }); } }
  if (st.length > 200) st.splice(0, st.length - 200); }
function noteStumps() { for (const n of S.nodes) if (n.amount <= 0 && (n.type === 'pohon' || n.type === 'batu')) (S.stumps = S.stumps || []).push({ type: n.type, x: n.x, y: n.y, day: S.day }); } // QC T-01: tunggul/bekas batu (jeda regrow)
function foodNodesStep(dt) { for (const n of S.nodes) if ((n.type === 'buah' || n.type === 'umbi') && n.amount <= 0 && (n.regrow -= dt) <= 0) {
  const c = FS()[n.type]; if (!c) continue; if (n.type === 'buah' && !srcOn('buah', n.kind)) { n.regrow = C.DAY_LENGTH_SEC / 4; continue; } n.amount = c.amount || (n.type === 'umbi' ? 8 : 6); } }
// ---- ringkasan pangan & tampilan ----
const isFoodRes = r => r === 'makanan' || r === 'gandum';
function foodDayIO(d) { d = d || S.dayStats || {}; const inn = { ...(d.panganMasuk || {}) }, out = {};
  const eaten = Object.values(d.eaten || {}).reduce((a, n) => a + n, 0); if (eaten) out.dimakan = eaten; if (d.spoiled && d.spoiled.makanan) out.busuk = d.spoiled.makanan;
  for (const [k, n] of Object.entries(d.sink || {})) out[k] = (out[k] || 0) + n; return { inn, out }; }
const FOOD_OUT_FB = { dimakan: 'dimakan', busuk: 'busuk', kenduri: 'kenduri', tikus: 'tikus', monyet: 'monyet', syukuran_lahir: 'syukuran', syukuran_panen: 'tasyakuran', pesta: 'pesta', dijual: 'dijual', lainnya: 'lain-lain', event: 'kejadian', cerita: 'cerita', hadiah: 'hadiah', rusak: 'rusak', pasar: 'pasar', lomba: 'lomba', pesta_17an: 'pesta 17-an', kerja_bakti: 'kerja bakti', monumen: 'monumen', keinginan: 'keinginan' };
const ioText = o => Object.entries(o).filter(([, n]) => n >= 0.5).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k in FOOD_OUT_FB ? TX('pangan.keluar.' + k, {}, FOOD_OUT_FB[k]) : panganLabel(k)} ${Math.round(n)}`).join(', ');
// hari-stok yang tampil di lencana (v9c: dihaluskan, tetapi loncatan besar langsung tampil) — dipakai juga oleh banner agar angkanya sama (v9d)
const fdShown = () => { const raw = foodDays(); return S.fdShow == null || raw < 1 || Math.abs(raw - S.fdShow) > 2.5 ? raw : S.fdShow; };
const fdLabel = d => d < 10 ? d.toFixed(1) : String(Math.floor(d));
function panganBadge() { const tot = foodTotal(), d = fdShown(),
    lv = famineLevel(), col = { aman: '', waspada: '#ffd36b', bahaya: '#ffb36b', kritis: '#ff6b6b', kolaps: '#ff6b6b' }[lv];
  const io = foodDayIO(), inn = Object.values(io.inn).reduce((a, n) => a + n, 0);
  const tip = `${TX('pangan.tooltip.judul', {}, 'Pangan = semua yang bisa dimakan')}\n${RES_LABEL.makanan} ${Math.floor(S.res.makanan)} + ${RES_LABEL.gandum} ${Math.floor(S.res.gandum || 0)} = ${Math.floor(tot)}\n`
    + `${TX('pangan.tooltip.konsumsi', {}, 'Dimakan')} ±${foodPerDay().toFixed(1)}/hari → cukup ${d.toFixed(1)} hari` + (inn ? `\n${TX('pangan.tooltip.hari_ini', {}, 'Masuk hari ini')}: ${ioText(io.inn)}` : '');
  return `<span id="panganBadge" data-lv="${lv}" title="${tip}">${resIcon('makanan')} <span class="lbl">${TX('pangan.label', {}, 'Pangan')} </span><b>${Math.floor(tot)}</b> · <b style="${col ? 'color:' + col : ''}">${fdLabel(d)}</b> ${TX('pangan.hari', {}, 'hari')}</span>`; }
// tooltip ladang: tanaman, tahap, progres %, perkiraan hari panen, alasan berhenti tumbuh
function fieldInfo(b) { const cr = cropOf(b), g = growDaysOf(b), nm = cap1(cropName(b)), res = RES_LABEL[cr.res] || cr.res, y = cr.yield || [C.FIELD.yieldMin, C.FIELD.yieldMax];
  const why = !b.done ? TX('pangan.ladang.belum_jadi', {}, 'Ladang belum selesai dibangun') : isFlooded(b.x, b.y) ? TX('pangan.ladang.banjir', {}, 'Tergenang banjir') : !canGrow(b)
    ? (FX().fieldsStop ? TX('pangan.ladang.berhenti_dingin', { musim: C.SEASON_NAMES[season()] }, `Berhenti tumbuh: ${C.SEASON_NAMES[season()]}`) : TX('pangan.ladang.berhenti_kemarau', {}, 'Berhenti tumbuh: kemarau tanpa irigasi (riset Irigasi T04)')) : null;
  const pct = b.stage === 'siap' ? 100 : b.stage === 'tumbuh' ? Math.min(99, Math.floor(100 * b.grow / g)) : 0;
  const left = b.stage === 'tumbuh' ? Math.max(0, g - b.grow) : b.stage === 'kosong' ? g : 0;
  const stage = b.stage === 'siap' ? TX('pangan.ladang.siap', {}, 'Siap panen') : b.stage === 'tumbuh' ? TX('pangan.ladang.tumbuh', {}, 'Tumbuh') : TX('pangan.ladang.kosong', {}, 'Menunggu ditanam');
  return { crop: nm, res, stage: b.stage, pct, left, why, yieldTxt: `${y[0]}–${y[1]} ${res}`,
    html: `<b>${C.BUILDINGS.ladang.nama}: ${nm}</b><br>${stage}${b.stage === 'tumbuh' ? ` · <b>${pct}%</b>` : ''}`
      + (b.stage !== 'siap' && b.done ? `<br>${TX('pangan.ladang.perkiraan', {}, 'Perkiraan panen')}: ${why && b.stage === 'tumbuh' ? '—' : `±${left.toFixed(1)} ${TX('pangan.hari', {}, 'hari')}`}` : '')
      + `<br>${TX('pangan.ladang.hasil', {}, 'Hasil')}: ${y[0]}–${y[1]} ${res}` + (why ? `<br><span class="why">⛔ ${why}</span>` : '') + (b.keong > 0 ? `<br>🐌 ${panganLabel('keong')}: ${b.keong}` : '') }; }
function pondInfo(b) { const s = (S.fish && S.fish.ponds[b.id]) || 0, cap = C.BUILDINGS[b.type].fishStock || 0;
  return `<b>${C.BUILDINGS[b.type].nama}</b><br>${b.done ? `${panganLabel('ikan')} ${TX('pangan.kolam.hari_ini', {}, 'hari ini')}: <b>${s}</b>/${cap}` : TX('pangan.ladang.belum_jadi', {}, 'Belum selesai dibangun')}`; }
function coopInfo(b) { return `<b>${C.BUILDINGS[b.type].nama}</b><br>${b.done ? `🥚 ${panganLabel('telur')} ${TX('pangan.kandang.siap', {}, 'siap diambil')}: <b>${Math.floor(b.telur || 0)}</b>/${(FS().telur || {}).stockMax || 6}<br><small>${TX('pangan.kandang.ayam', { jumlah: C.BUILDINGS[b.type].hens || 4 }, `${C.BUILDINGS[b.type].hens || 4} ekor ayam kampung`)}</small>` : TX('pangan.ladang.belum_jadi', {}, 'Belum selesai dibangun')}`; }
// tooltip tombol bangun: biaya + keterangan P1 (orang-orangan: tidak mempan babi hutan/serigala -> pagar; kandang ayam: telur)
function buildTip(k, d) { const cost = Object.entries(d.cost).map(([r, n]) => n + ' ' + RES_LABEL[r]).join(', '), own = TEXT && TEXT.__localNames, L = (TEXT && TEXT.bangunan_lokal) || {};
  if (k === 'orang_orangan') { const hewan = C.NIGHT_THREAT === 'wolf' ? 'serigala' : 'babi hutan', pagar = (C.BUILDINGS.pagar || {}).nama || 'Pagar';
    return [own && L.orang_orangan_sawah && L.orang_orangan_sawah.tooltip, TX('bangunan_lokal.orang_orangan_sawah.tooltip_ancaman', { hewan, pagar, pencuri: (C.MONKEY && C.MONKEY.hewan) || 'monyet' }, `Membuat ${(C.MONKEY && C.MONKEY.hewan) || 'monyet'} urung mencuri dari ladang. Tidak mempan melawan ${hewan}; untuk itu pakai ${pagar}.`), cost].filter(Boolean).join('\n'); }
  if (k === 'kandang_ayam') return [own && L.kandang_ayam && L.kandang_ayam.tooltip || 'Rumah kecil untuk ayam kampung. Telurnya menambah makanan.', cost].join('\n');
  return cost; }
function hoverInfo(x, y) { const b = S.buildings.find(o => { const d = C.BUILDINGS[o.type]; return x >= o.x && x < o.x + d.w && y >= o.y && y < o.y + d.h; });
  if (b && b.type === 'ladang') return fieldInfo(b).html; if (b && FISH_B.includes(b.type)) return pondInfo(b); if (b && b.type === 'kandang_ayam') return coopInfo(b);
  const n = S.nodes.find(o => o.x === x && o.y === y); if (!n) return null;
  if (n.type === 'buah') return `<b>${TX('pangan.pohon_buah', { buah: panganLabel(n.kind) }, 'Pohon ' + panganLabel(n.kind).toLowerCase())}</b><br>${n.amount > 0 && srcOn('buah', n.kind) ? `${TX('pangan.berbuah', {}, 'Berbuah')}: ${Math.floor(n.amount)}` : TX('pangan.belum_berbuah', {}, 'Belum berbuah')}`;
  if (n.type === 'umbi') return `<b>${panganLabel('umbi')}</b><br>${n.amount > 0 ? Math.floor(n.amount) : TX('pangan.sudah_digali', {}, 'Sudah digali, tumbuh lagi beberapa hari')}`;
  if (n.jamur > 0) return `<b>${panganLabel('jamur')}</b><br>${n.jamur}`; return null; }
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
function priceOf(res, side) { const base = M().harga[res]; if (!base) return null; let p = base[side === 'jual' ? 0 : 1] * (S.priceMod[res] || 1) * (side === 'jual' ? 1 + ((S.sellBonus || {})[res] || 0) : 1); // sellBonus: resep nenek (+10% permanen)
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
  S.res[give] -= r.qty; S.res[get] = (S.res[get] || 0) + r.n; if (isFoodRes(get)) dstat('panganMasuk', 'pasar', r.n); if (isFoodRes(give)) dstat('sink', 'dijual', r.qty); S.quotaUsed.jual += r.value; S.quotaUsed.beli += r.cost; S.trades++;
  const P = (TEXT && TEXT.pasar && TEXT.pasar.transaksi) || {};
  log('🛒 ' + fill(P.jual_berhasil || 'Terjual {jumlah} {sumber_daya}. Desa mendapat {jumlah2} {sumber_daya2}.', { jumlah: r.qty, sumber_daya: RES_LABEL[give].toLowerCase(), jumlah2: r.n, sumber_daya2: RES_LABEL[get].toLowerCase() }));
  sfx('koin'); return r; }
function marketNewDay() { const m = M();
  for (const k of Object.keys(S.priceMod)) S.priceMod[k] = Math.min(m.clamp[1], Math.max(m.clamp[0], S.priceMod[k] * (m.drift[0] + Math.random() * (m.drift[1] - m.drift[0]))));
  S.priceEvents = S.priceEvents.filter(e => e.until > S.day); S.quotaUsed = { jual: 0, beli: 0 };
  if (!S.merchant && S.day >= S.nextMerchantDay) spawnMerchant(); }
const DP = () => (TEXT && TEXT.dialog_pedagang) || {};
function spawnMerchant() { const row = C.BRIDGE_ROWS[C.MERCHANT.spawn.row] ?? CAMP.y, names = DP().nama_pedagang || [C.MERCHANT_NAME || 'Pak Darto'];
  S.merchantSeen = true; S.merchant = { x: C.MERCHANT.spawn.x, y: row, home: { x: C.MERCHANT.spawn.x, y: row }, state: 'datang', name: pick(names), dir: 1, moving: true, id: 9999 };
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
    teknologi: S.research ? (techNodes().find(n => n.id === S.research.id) || {}).nama : 'ilmu baru', pencapaian: '', pedagang: (S.merchant && S.merchant.name) || 'Pedagang', hewan: TERM('hewan'), sifat: (() => { const id = a.traits && a.traits.length && traitsVisible(a) ? pick(a.traits) : null, t = id && TEXT && TEXT.sifat && TEXT.sifat[id]; return (t && t.kata) || 'yang baik hati'; })(), /* TEKS v1.5.0 sifat.<id>.kata */ lama_tinggal: S.day - (a.joined ?? 1), tahun: Math.floor((S.day - 1) / C.YEAR_SCALE.daysPerYear) + 1, ...extra };
  return tpl.replace(/^Hari \{hari\}:\s*/, '').replace(/\{(\w+)\}/g, (_, k) => map[k] ?? k);
}
function flavorLog() { if (!TEXT || !TEXT.log_harian) return; const cats = ['kerja', 'sosial', 'temuan'].filter(c => TEXT.log_harian[c]);
  for (let i = 0; i < C.FLAVOR_LOG_PER_DAY && cats.length; i++) for (let k = 0; k < 6; k++) { const s = pick(TEXT.log_harian[pick(cats)]), ex = flavorReal(s); if (ex) { log(fill(s, ex)); break; } } }
// R-06: log rasa memakai angka nyata kemarin (S.lastSummary); null = kejadian itu tak terjadi kemarin -> pilih teks lain
function flavorReal(s) { if (!/\{(jumlah|sumber_daya|skill)\}/.test(s)) return {}; const L = S.lastSummary || {}, g = L.gathered || {}, fi = L.foodIn || {}, rl = k => (RES_LABEL[k] || k).toLowerCase(), adults = S.villagers.filter(v => !isBaby(v));
  if (/\{skill\}/.test(s)) { const m = (TEXT.meta && TEXT.meta.skill) || {}; let best = null, bs = 0; for (const v of adults) for (const [k, n] of Object.entries(v.skills || {})) if (n > bs) { bs = n; best = [v, k]; } return best ? { nama: best[0].name, skill: m[best[1]] || best[1] } : null; }
  if (/tebang|menebang/i.test(s)) return g.kayu > 0 ? { jumlah: Math.min(Math.floor(g.kayu), C.CARRY.kayu), sumber_daya: rl('kayu') } : null;
  if (/ikan/i.test(s)) return fi.ikan > 0 ? { jumlah: Math.floor(fi.ikan) } : null;
  if (/menimba|\{jumlah\} air/i.test(s)) return g.air > 0 ? { jumlah: Math.floor(g.air) } : null;
  if (/mengangkut|gudang/i.test(s)) { const r = ['kayu', 'batu'].filter(k => g[k] > 0).sort((a, b) => g[b] - g[a])[0]; return r && done('gudang').length ? { jumlah: Math.floor(g[r]), sumber_daya: rl(r) } : null; }
  if (/dapur/i.test(s)) return done('dapur').length ? { jumlah: S.villagers.length } : null;
  return {}; } // lainnya (mis. temuan 'menemukan {jumlah} {sumber_daya}') belum punya angka nyata
const resKeyOf = k => ['buah', 'ikan', 'daging'].includes(k) ? 'makanan' : k;
// pilihan event bisa dipilih jika semua biaya sumber daya (efek negatif) tersedia
const affordable = ef => Object.entries(ef || {}).every(([k, n]) => n >= 0 || !(resKeyOf(k) in S.res) || S.res[resKeyOf(k)] >= -n);
function applyEffects(ef, src) {
  for (const [k, n] of Object.entries(ef || {})) {
    const resKey = resKeyOf(k);
    if (resKey in S.res) { const b0 = S.res[resKey]; S.res[resKey] = Math.max(0, S.res[resKey] + n); const dd = S.res[resKey] - b0; if (isFoodRes(resKey) && dd) dd > 0 ? dstat('panganMasuk', src === 'cerita' ? 'cerita' : 'event', dd) : dstat('sink', src === 'cerita' ? 'cerita' : 'event', -dd); }
    else if (k === 'suasana_hati' || k === 'energi') S.villagers.forEach(v => v[k === 'energi' ? 'energy' : 'mood'] = Math.max(0, Math.min(100, v[k === 'energi' ? 'energy' : 'mood'] + n)));
    else if (k === 'penduduk') { if (n > 0) for (let i = 0; i < n; i++) { spawnVillager(CAMP.x, CAMP.y + 1, false, i === 0 ? S.eventName : null); const nv = S.villagers[S.villagers.length - 1]; if (nv) mapEvent('pendatang', nv.x, nv.y, EV_SEC(), 'v' + nv.id); }
      else for (let i = 0; i < -n && S.villagers.length > 1; i++) log(`${S.villagers.pop().name} meninggalkan desa.`); }
    else if (k === 'monyet_curi') { const got = takeFood(n, 'monyet'); if (got > 0) spawnRaider(Math.round(got), (C.MONKEY && C.MONKEY.hewan) || 'monyet'); } // v13: event Monyet Pencuri 'biarkan saja'
    else if (k === 'hari_kerja_hilang') S.restUntil = S.t + n * C.DAY_LENGTH_SEC;
    else if (k === 'progres_riset') { if (S.research) { const nd = techNodes().find(x => x.id === S.research.id); if (nd) S.research.progress = Math.min(nd.work - 0.01, S.research.progress + nd.work * n / 100); } }
    else if (k === 'harga_jual_pangan' || k === 'harga_beli_pangan') addPriceEvent(k === 'harga_jual_pangan' ? 'jual' : 'beli', ['makanan', 'gandum'], n / 100, C.MARKET.eventDays);
    else if (k === 'kesehatan') S.villagers.forEach(v => v.health = Math.max(1, Math.min(100, (v.health ?? 100) + n)));
    else if (k === 'kesehatan_satu') { const v = S.eventVictim && vById(S.eventVictim) || pick(S.villagers); if (v) { v.health = Math.max(1, Math.min(100, (v.health ?? 100) + n)); if (n < 0) { v.injured = S.day; floatText(`${n} ${TX('peta_kejadian.kesehatan', {}, 'Kesehatan')}`, v.x, v.y - 0.5, '#ff9a8a'); mapEvent('serang', v.x, v.y, EV_SEC(), 'v' + v.id); } } }
    else if (k === 'pertumbuhan_ladang') S.buildings.filter(b => b.type === 'ladang' && b.stage === 'tumbuh').forEach(b => b.grow = Math.max(0, b.grow + n));
    else if (k === 'kesehatan_bangunan') { const hit = S.buildings.filter(b => b.done); hit.forEach(b => b.hp = Math.max(0, Math.min(100, (b.hp ?? 100) + n)));
      if (n < 0) { const big = hit.filter(b => b.type !== 'ladang' && b.type !== 'pagar').sort((a, b) => dist(center(a), CAMP) - dist(center(b), CAMP)).slice(0, 4); // v11: kerusakan (angin/badai) terlihat di peta
        big.forEach((b, i) => { const c = center(b); dustAt(c.x, c.y); if (i < 3) floatText(`${n} ${TX('peta_kejadian.kondisi', {}, 'Kondisi')}`, c.x, c.y - 0.5, '#ff9a8a'); mapEvent('rusak', c.x, c.y, EV_SEC(), b.id); });
        const c0 = big[0] && center(big[0]), msg = `Bangunan rusak ${-n}%. Tukang akan memperbaikinya.`; if (c0) logAt(msg, c0.x, c0.y); else log(msg); } }
    else console.info(`[efek] kunci "${k}" belum didukung (${src}), diabaikan.`);
  }
}
// pilih event berbobot sesuai C.EVENT_RULES (musim, maks per tahun, cooldown)
function eventAllowed(e) { const r = (C.EVENT_RULES || {})[e.id] || {}, year = yearIdx();
  if ((C.EVENT_DISABLE || []).includes(e.id)) return false; // tidak cocok dengan tema
  if (r.hariJadi) return false; // hanya lewat anniversaryEvent()
  if (r.musim && !r.musim.includes(season())) return false;
  if (e.musim && [].concat(e.musim).length && ![].concat(e.musim).map(m => (C.EVENT_SEASON_ALIAS || {})[m] || m).includes(season())) return false;
  if (r.maksPerTahun && ((S.eventYearCount || {})[e.id + '@' + year] || 0) >= r.maksPerTahun) return false;
  if (r.cooldownHari && S.day - ((S.eventLastDay || {})[e.id] ?? -999) < r.cooldownHari) return false;
  if (r.grup) { const G = S.eventGroup || {}; if (r.grupMaksPerTahun && (G[r.grup + '@' + year] || 0) >= r.grupMaksPerTahun) return false; if (r.grupCooldown && S.day - (G[r.grup + '@last'] ?? -999) < r.grupCooldown) return false;
    if (r.grup === 'angin' && S.windDay != null && S.day - S.windDay < (r.grupCooldown || 3)) return false; } // v14: satu slot event angin (badai + angin_mareng), tidak menumpuk dengan angin harian
  if (r.era && eraIndex(r.era) > (S.era | 0)) return false; if (r.minHari && S.day < r.minHari) return false; if (r.butuh && !r.butuh.every(t => done(t).length)) return false; if (r.kecuali && S[r.kecuali]) return false; // v13: syarat dari teks event (bangunan/era/flag)
  return true; }
const eventWeight = e => { const r = (C.EVENT_RULES || {})[e.id]; return (r && r.bobot != null ? r.bobot : e.bobot ?? 1) * (r && r.bobotAwal && S.day <= (C.EVENT_EARLY_DAYS || 30) ? r.bobotAwal : 1) /* v15: event lokal ramah masa awal lebih sering dipilih hari 1-30 (peluang harian tetap) */ * (e.id === 'panen_raya' ? FX().panenRayaWeightMult || 1 : 1); };
const allEvents = () => !TEXT ? [] : [...(TEXT.event_acak || []), ...(TEXT.event_era_lanjut || []), ...(TEXT.event_musiman || []), ...(TEXT.__lokalEv ? TEXT.event_lokal || [] : [])].map(e => e.id === 'pendatang' ? pendatangEvent(e) : e); // v13: event_lokal (Nusantara; tema lain hanya bila overlay-nya punya event_lokal) masuk kolam undian yang sama
// P1: Pendatang Mengetuk = 2 pilihan: Terima (pilihan sambut lama) / Tolak halus (mood kecil, tanpa biaya lain). Teks: event_ui.pendatang.* (fallback Indonesia)
const pendatangEvent = e => { const s = e.pilihan.find(p => addsPop(p.efek)) || e.pilihan[0];
  return { ...e, pilihan: [{ ...s, teks: TX('event_ui.pendatang.terima', {}, 'Terima') },
    { teks: TX('event_ui.pendatang.tolak_halus', {}, 'Tolak halus'), efek: { suasana_hati: -2 }, teks_hasil: TX('event_ui.pendatang.tolak_halus_hasil', {}, 'Pengembara mengangguk mengerti dan melanjutkan perjalanan. Beberapa warga melambai sedikit sedih.') }] }; };
const eventEraOk = e => !e.era || eraIndex(e.era) <= (S.era | 0);
// Hari Jadi Desa (EVENT_RULES[id].hariJadi): bukan event acak; muncul tepat di awal tahun ke-2, ke-3, ... (hari 29, 57, ...), sekali per tahun
function anniversaryEvent() { const yr = yearIdx(); if (yr < 1 || (S.annivDone || {})[yr]) return null;
  const ev = allEvents().find(e => ((C.EVENT_RULES || {})[e.id] || {}).hariJadi); if (!ev) return null; (S.annivDone = S.annivDone || {})[yr] = S.day; return ev; }
function maybeEvent() { const anniv = TEXT && TEXT.event_acak ? anniversaryEvent() : null; if (anniv) return fireEvent(anniv);
  if (S.hjPending && !S.event) { S.event = '@harijadi'; countModal('event'); return showHariJadi(); } if (!TEXT || !TEXT.event_acak) return;
  if (S.day < C.EVENT_MIN_DAY || Math.random() > ((S.era | 0) >= 1 ? C.EVENT_CHANCE_PER_DAY_DUSUN : C.EVENT_CHANCE_PER_DAY)) return;
  const pool = allEvents().filter(e => eventEraOk(e) && eventAllowed(e) && popEventOk(e)), total = pool.reduce((a, e) => a + eventWeight(e), 0); if (!total) return;
  let r = Math.random() * total, ev = pool[pool.length - 1]; for (const e of pool) { r -= eventWeight(e); if (r <= 0) { ev = e; break; } }
  fireEvent(ev); }
function fireEvent(ev) {
  const year = yearIdx();
  S.eventLastDay = S.eventLastDay || {}; S.eventYearCount = S.eventYearCount || {}; S.eventCount = S.eventCount || {};
  { const rg = ((C.EVENT_RULES || {})[ev.id] || {}).grup; if (rg) { const G = S.eventGroup = S.eventGroup || {}; G[rg + '@' + year] = (G[rg + '@' + year] || 0) + 1; G[rg + '@last'] = S.day; } }
  S.eventLastDay[ev.id] = S.day; S.eventYearCount[ev.id + '@' + year] = (S.eventYearCount[ev.id + '@' + year] || 0) + 1; S.eventCount[ev.id] = (S.eventCount[ev.id] || 0) + 1;
  const em = M().eventMods[ev.id]; if (em) for (const [side, items] of Object.entries(em)) for (const [res, pct] of Object.entries(items)) addPriceEvent(side, [res], pct, M().eventDays);
  S.event = ev.id; countModal('event'); markMeaningful(ev.id === 'hari_jadi' || /jadi/.test(ev.id) ? 'hari_jadi' : 'event'); showEvent(); }
const addsPop = ef => (ef && ef.penduduk) > 0;
// 👥 penduduk/tempat tidur; sebelum ada rumah: "2 (belum ada rumah)" alih-alih "2/0"
function popBadge() { const n = S.villagers.length, cap = capacity(), U = (TEXT && TEXT.ui) || {};
  return cap > 0 ? `<span id="popBadge" title="${U.penduduk_tempat || 'Penduduk / tempat tidur di rumah'}">👥 <b>${n}/${cap}</b></span>`
    : `<span id="popBadge" title="${U.penduduk_tanpa_rumah_tip || 'Bangun Gubuk agar penduduk punya tempat tidur'}">👥 <b>${n}</b> <small>(${U.penduduk_tanpa_rumah || 'belum ada rumah'})</small></span>`; }
// event pendatang hanya muncul bila opsi menyambut bisa dipilih (ada tempat tidur & bekal) — dulu tombol 'Sambut' sering mati
const popEventOk = e => !e.pilihan.some(p => addsPop(p.efek)) || e.pilihan.some(p => addsPop(p.efek) && housingOk(p.efek) && affordable(p.efek));
const housingOk = ef => !addsPop(ef) || capacity() >= S.villagers.length + ef.penduduk;
function showEvent() { if (S.event === '@story') return showStory(); if (S.event === '@harijadi') return showHariJadi(); $('modal').className = 'panel'; const e = allEvents().find(x => x.id === S.event); if (!e) { S.event = null; return; }
  // event pendatang: siapkan nama baru yang belum dipakai untuk {nama}
  if (e.pilihan.some(p => addsPop(p.efek)) && !S.eventName) { const keep = S.nameIdx; S.eventName = freshName(); S.nameIdx = keep; }
  else if (!S.eventName && /\{nama\}/.test(JSON.stringify(e))) { const v = pick(adults().filter(o => !o.sick)) || pick(S.villagers); if (v) { S.eventName = v.name; S.eventVictim = v.id; } } // v13: {nama} = penduduk yang terlibat (kesehatan_satu mengenai dia)
  const box = $('modal'); box.style.display = 'block'; sfx('event'); const nm = S.eventName ? { nama: S.eventName } : {};
  const noHouse = e.pilihan.some(p => addsPop(p.efek) && !housingOk(p.efek)) ? '<p style="color:#ffb36b">🏠 Tidak ada tempat kosong di gubuk — bangun Gubuk untuk menerima pendatang.</p>' : '';
  const hj = S.hjPending && S.hjSummary && ((C.EVENT_RULES || {})[e.id] || {}).hariJadi ? hariJadiHTML(S.hjSummary) : ''; if (hj) { S.hjPending = false; box.className = 'panel hjm'; }
  box.innerHTML = `${hj}<h3>${e.judul}</h3><p>${fill(e.deskripsi, nm)}</p>${noHouse}` + e.pilihan.map((p, i) => { const can = q => affordable(q.efek) && housingOk(q.efek), ok = can(p) || !e.pilihan.some(can) && i === e.pilihan.length - 1 && !addsPop(p.efek);
    const cost = Object.entries(p.efek || {}).map(([k, n]) => `${n > 0 ? '+' : ''}${n} ${resIcon(resKeyOf(k))} ${RES_LABEL[resKeyOf(k)] || k.replace(/_/g, ' ')}`).join(', ');
    return `<button data-ev="${i}" ${ok ? '' : `disabled title="${housingOk(p.efek) ? 'Sumber daya tidak cukup' : 'Tidak ada tempat kosong di gubuk'}" style="opacity:.45"`}>${p.teks}</button> <small>(${cost})</small>`; }).join('<br>'); }
function chooseEvent(i) { if (S.event === '@story') return chooseStory(i); if (S.event === '@harijadi') { S.event = null; const m = $('modal'); m.style.display = 'none'; m.className = 'panel'; return; } const e = S.event && allEvents().find(x => x.id === S.event); if (!e || !e.pilihan || !e.pilihan[i]) { if (!e && S.event && S.event[0] !== '@') { S.event = null; S.eventName = null; const m = $('modal'); m.style.display = 'none'; } return; } const p = e.pilihan[i]; // QC R-02: klik ganda / event tak dikenal
  if (addsPop(p.efek) && !housingOk(p.efek)) { log(`${e.judul} — Tidak ada tempat untuk ${S.eventName || 'pendatang'}; ia melanjutkan perjalanan.`); }
  else { const nm = S.eventName ? { nama: S.eventName } : {}; const wtie = (C.WIND && C.WIND.events || {})[e.id], wind = wtie != null && themeHasWind(); // v12: event angin = angin kencang sungguhan
    if (wind && i === wtie) S.roofTiedUntil = S.day + ((C.WIND.tieDays ?? 3) - 1); applyEffects(p.efek, 'event ' + e.id); log(`${e.judul} — ${fill(p.teks_hasil || '', nm)}`);
    if (wind) { const FXw = Object.values(C.SEASON_FX).find(f => f && f.windHp) || {}; windStrike(FX().windHp || FXw.windHp || 15, true); } }
  dstat('events', e.judul, 1); S.eventChoices = S.eventChoices || {}; (S.eventChoices[e.id] = S.eventChoices[e.id] || [])[i] = ((S.eventChoices[e.id] || [])[i] || 0) + 1;
  { const rr = (C.EVENT_RULES || {})[e.id]; if (rr && rr.setel) S[rr.setel] = true; } S.eventVictim = null;
  S.event = null; S.eventName = null; $('modal').style.display = 'none'; $('modal').className = 'panel'; checkAch(); }
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
function questUI() { const hint = bedHintOn() ? `<div class="bedhint">${bedHintText()}</div>` : ''; const q = quest(); if (!q) return hint + (TEXT ? 'Semua misi selesai!' : '-'); const pr = questProgress(q) ?? 0;
  return hint + `<b>${q.judul}</b><br>${q.deskripsi}<br>Progres: ${Math.min(pr, q.tujuan.jumlah)}/${q.tujuan.jumlah}`; }
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
  const s = typeof o === 'string' ? o : fb; return s && (S.villagers.length || Object.keys(extra).length) ? fill(s, extra) : s.replace(/^Hari \{hari\}:\s*/, ''); } // isi {nama} juga saat penduduk terakhir meninggal
let _fxc = null; // P1: efek monumen (bendungan) pada efek musim, di-cache per musim & versi monumen
const FX = () => { const base = C.SEASON_FX[season()] || {}; if (!S || !S.monVer) return base; const k = season() + '|' + S.monVer; if (_fxc && _fxc.k === k && _fxc.s === S) return _fxc.v;
  const v = { ...base }, fm = monFxLast('floodMult', 1), dc = monFxLast('droughtChance', null), wm = monFxLast('hardWaterMult', 1);
  if (v.floodChance) v.floodChance *= fm; if (dc != null && v.droughtChance) v.droughtChance = Math.min(v.droughtChance, dc); if (wm !== 1 && isHardSeason()) v.waterMult = (v.waterMult || 1) / wm;
  _fxc = { k, s: S, v }; return v; };
// kebutuhan air harian (kemarau x1.5, empat musim: panas x1.35)
const waterNeed = () => S.villagers.length * C.WATER.perDayPerPop * (FX().waterMult || 1);
// hasil sumur/sungai per angkut (kemarau: sumur surut, sungai menyusut)
const wellYieldNow = () => Math.max(1, C.WATER.wellYield + (FX().wellYieldAdd || 0) + (isHardSeason() ? (S.wellHardAdd || 0) + monFxSum('wellYieldHardAdd') : 0)); // sumur diperdalam (dilema minta_hujan)
const riverYieldNow = () => Math.max(1, Math.round(C.WATER.riverYield * (FX().riverYieldMult || 1)));
const year = () => Math.floor((S.day - 1) / C.YEAR_SCALE.daysPerYear) + 1;
const isY2 = () => year() >= 2;
const threatMult = () => isY2() ? C.YEAR_SCALE.threatChanceMult : 1;
const winterBuffer = () => isY2() ? (C.YEAR_SCALE.hardBufferDays ?? C.YEAR_SCALE.winterBufferDays) : C.HARD_BUFFER_DAYS;
const rnd = (a, b) => a + Math.random() * (b - a), rndInt = (a, b) => Math.floor(rnd(a, b + 1));
const EMERG = ['jaga', 'padam', 'rawat', 'makam'];
const foodDays = () => foodTotal() / foodPerDay();
const isRaining = () => !!FX().rainChance && S.rainDay === S.day;
const isExtreme = () => !!FX().extremeChance && S.extremeDay === S.day;
const hungerMultNow = () => !isHardSeason() ? 1 : isExtreme() ? (FX().extremeHungerMult || C.HARD_HUNGER_MULT) : (done('lumbung').length ? C.GRANARY_HARD_HUNGER_MULT : C.HARD_HUNGER_MULT);
const inHut = v => v.inside != null;
const campfireLit = () => !S.fireOut;
const torchLit = b => b.type === 'obor' && b.done && !b.unlit && (b.hp ?? 100) > 0;
const near = (type, p, r, f = b => b.done) => S.buildings.some(b => b.type === type && f(b) && dist(center(b), p) <= r);
const vById = id => S.villagers.find(v => v.id === id);
// ---- jenjang kelaparan ----
function famineLevel() { const F = C.FAMINE, d = foodDays();
  if (S.day <= F.graceDays) return foodTotal() <= 0 || d < (F.graceBahaya ?? 0) ? 'bahaya' : d < F.waspada ? 'waspada' : 'aman'; // v9c: < 1 hari tetap 'bahaya' (tanpa penalti mood, lihat famineDaily)
  if (foodTotal() <= 0 && d < F.kolaps) return 'kolaps'; if (d < F.kritis) return 'kritis'; if (d < F.bahaya) return 'bahaya'; if (d < F.waspada) return 'waspada'; return 'aman'; }
const FAMINE_COLOR = { aman: null, waspada: 'yellow', bahaya: 'orange', kritis: 'red', kolaps: 'red' };
function famineDaily() { const lv = famineLevel(), prev = S.famineLv || 'aman', ord = ['aman', 'waspada', 'bahaya', 'kritis', 'kolaps'];
  if (lv !== prev) { const worse = ord.indexOf(lv) > ord.indexOf(prev), d = Math.floor(foodDays());
    if (worse && lv !== 'aman') log('⚠️ ' + TX(`peringatan_dini.ancaman_kelaparan.tingkat.${lv === 'waspada' ? 'waspada' : 'bahaya'}.teks`, { hari_sisa: d },
      lv === 'waspada' ? `Stok pangan tinggal untuk ${d} hari. Saatnya mengutamakan makanan.` : 'Makanan hampir habis! Penduduk mulai lemas dan murung.'));
    if (!worse && lv === 'aman') log('😊 ' + TX('peringatan_dini.ancaman_kelaparan.tingkat.reda.teks', {}, 'Stok pangan kembali aman.')); }
  S.famineLv = lv;
  if ((lv === 'bahaya' || lv === 'kritis' || lv === 'kolaps') && S.day > C.FAMINE.graceDays) S.villagers.forEach(v => v.mood = Math.max(0, v.mood + C.FAMINE.bahayaMoodPerDay));
  if (lv === 'kolaps' && !S.collapseShown) { S.collapseShown = true; showCollapse(); } if (lv === 'aman') S.collapseShown = false; }
function showCollapse() { const m = (TEXT && TEXT.jenjang_kelaparan && TEXT.jenjang_kelaparan.tingkat.kolaps.modal) || {};
  const box = $('modal'); box.style.display = 'block'; sfx('event');
  box.innerHTML = `<h3>${m.judul || 'Desa Kelaparan'}</h3><p>${m.teks || 'Lumbung kosong! Kumpulkan makanan sekarang.'}</p><button id="collapseOk">${m.tombol || 'Kumpulkan makanan sekarang'}</button>`; }
// ---- peringatan di layar ----
function warnings() { const W = [], J = (TEXT && TEXT.jenjang_kelaparan && TEXT.jenjang_kelaparan.tingkat) || {}, lv = famineLevel(), d = Math.floor(foodDays());
  // v9d: angka = lencana (1 desimal < 10 hari); masa awal (tanpa penalti mood) -> tanpa kata 'murung'
  const grace = S.day <= C.FAMINE.graceDays && lv === 'bahaya', jl = fdLabel(fdShown()), JB = J[lv] || {};
  if (FAMINE_COLOR[lv]) W.push({ k: 'hunger', c: FAMINE_COLOR[lv], t: fillSafe(grace ? JB.banner_masa_awal || 'Stok pangan hanya {jumlah} hari! Segera kumpulkan makanan.'
      : JB.banner || { waspada: 'Stok pangan tinggal {jumlah} hari.', bahaya: 'Stok pangan hanya {jumlah} hari!', kritis: 'Pangan kritis: {jumlah} hari lagi!', kolaps: 'Lumbung kosong! Desa kelaparan.' }[lv], { jumlah: jl }),
    tip: grace ? TX('jenjang_kelaparan.tingkat.bahaya.tooltip_masa_awal', {}, 'Masa awal: belum ada penalti suasana hati, tapi stok hampir habis. Utamakan makanan.') : JB.tooltip, lv });
  else if (FX().hardWarnFromDay && foodDays() < winterBuffer() && seasonInfo().day >= FX().hardWarnFromDay) W.push({ k: 'hunger', c: 'yellow', t: `Stok ${C.SEASON_NAMES[C.HARD_SEASON].replace(/^Musim /, '').toLowerCase()} ${d}/${winterBuffer()} hari` });
  const wf = S.wolf; if (wf && wf.phase && wf.phase !== 'usai') W.push({ k: 'howl', c: { jejak: 'yellow', mendekat: 'orange', serang: 'red' }[wf.phase], t: TT('warn_' + wf.phase, {}, { jejak: 'Jejak hewan liar', mendekat: 'Hewan liar mendekat!', serang: 'Hewan liar masuk desa!' }[wf.phase]) });
  if (S.buildings.some(b => b.burning)) W.push({ k: 'fire', c: 'red', t: 'Kebakaran! Padamkan dengan air' });
  else if (S.fireRisk && S.fireRisk.phase === 'asap') W.push({ k: 'fire', c: 'yellow', t: 'Bau asap dari ' + C.BUILDINGS[(S.buildings.find(b => b.id === S.fireRisk.b) || { type: 'dapur' }).type].nama });
  if (S.flood) W.push({ k: 'flood', c: S.t >= S.flood.start ? 'orange' : 'yellow', t: S.t >= S.flood.start ? 'Air meluap di tepi sungai' : 'Sungai naik' });
  if (S.extremeDay === S.day + 1 && FX().extremeChance || isExtreme()) W.push({ k: 'cold', c: isExtreme() ? 'orange' : 'yellow', t: isExtreme() ? TT('warn_ekstrem', {}, 'Cuaca ekstrem hari ini') : TT('warn_ekstrem_besok', {}, 'Cuaca ekstrem besok') });
  if (S.fireOut && FX().campfireWoodPerDay) W.push({ k: C.HARD_COLD ? 'cold' : 'fire', c: 'orange', t: 'Api unggun padam: kayu bakar habis' });
  if (S.drought && S.day <= S.drought.until) W.push({ k: 'flood', c: 'yellow', t: 'Kekeringan', ic: 'thermometer_hot' });
  return W; }
const fillSafe = (s, x) => S.villagers.length ? fill(s, x) : s.replace(/\{(\w+)\}/g, (_, k) => x[k] ?? k);
function warnUI() { const W = warnings();
  setHTML('warnbar', W.map(w => { const ic = w.k === 'cold' ? `${ASSETS.STATUS_DIR}status_thermometer_cold_16.png` : w.ic ? `${ASSETS.STATUS_DIR}status_${w.ic}_16.png` : `${ASSETS.WARN_DIR}warn_${w.k}_${w.c}.png`;
    const wp = warnPos(w.k), at = wp ? ` data-wx="${Math.round(wp.x * 10) / 10}" data-wy="${Math.round(wp.y * 10) / 10}" style="cursor:pointer"` : '';
    return `<div class="warn w-${w.c}" title="${w.tip || ''}" data-warn="${w.k}"${at}><img src="${ic}" alt="">${w.t}${w.lv === 'kritis' ? ' <small>(jeda & atur prioritas)</small>' : ''}</div>`; }).join('')); }
// ---- cuaca harian & musim ----
// teks musim: tema empat musim memakai kunci TEKS lama; tema lain memakai C.TXT (tema.js)
const STX = (kOld, kTheme, ex, fb) => TT(kTheme, ex, fb); // kunci & cadangan per tema ada di tema.js TXT (kOld hanya catatan)
// efek harian musim, digerakkan oleh isi SEASON_FX (lihat tema.js), bukan nama musim
function seasonDaily() { const si = seasonInfo(), se = si.id, dis = si.day, F = FX(), pop = S.villagers.length, ic = (C.SEASON_ICONS || {})[se] || '';
  if (dis === 1) { if (F.newYear && S.day > 1) log('🌱 ' + STX('musim_pembuka.musim_tahun_baru', 'tahun_baru', { tahun: year() }, `Tahun ke-${year()} dimulai.`));
    log(ic + ' ' + (se === C.HARD_SEASON ? TT('sulit_mulai') : (C.TXT || {})['musim_' + se] ? TT('musim_' + se, { musim: C.SEASON_NAMES[se], tahun: year() }) : TT('musim_mulai', { musim: C.SEASON_NAMES[se] })));
    if (F.newYear) S.droughtDone = false; S.floodDone = false; S.floodN = 0; S.firstRainDone = false; }
  // hujan (+ banjir)
  if (F.rainChance) { if (Math.random() < F.rainChance) { S.rainDay = S.day;
      if (F.rainMoodPerDay) S.villagers.forEach(v => v.mood = Math.min(100, v.mood + F.rainMoodPerDay));
      if (F.rainNoRoofMood) { const B = C.MOOD_BARE || {}, pen = F.rainNoRoofMood * (done('apiunggun').length && campfireLit() ? B.rainFireMult ?? 1 : 1); // v9c: api unggun menyala = berteduh di dekat api -> penalti hujan separuh
        S.villagers.forEach(v => { if (v.homeId == null && !houseFor(v)) v.mood = Math.max(Math.min(v.mood, B.rainFloor ?? 0), v.mood + pen); }); }
      if (F.firstRainMood && !S.firstRainDone) { S.firstRainDone = true; S.villagers.forEach(v => v.mood = Math.min(100, v.mood + F.firstRainMood)); log('🌦️ ' + TT('hujan_pertama', {}, 'Hujan pertama turun.')); }
      else log('🌧️ ' + STX('musim_pembuka.musim_semi_hujan', 'hujan', {}, 'Hujan rintik turun.')); }
    if (F.floodChance && !S.floodDone && (S.floodN || 0) < (F.floodMax || 1) && Math.random() < F.floodChance * threatMult()) { S.floodN = (S.floodN || 0) + 1; startFlood(); if (S.floodN < (F.floodMax || 1)) S.floodDone = false; } }
  // kekeringan & risiko api
  if (F.droughtChance && !S.droughtDone && Math.random() < F.droughtChance * threatMult()) { S.droughtDone = true; S.drought = { until: S.day + F.droughtDays - 1 };
    const safe = S.res.air >= pop * C.WATER.perDayPerPop * (F.waterMult || 1) * F.droughtWaterSafeDays;
    log('☀️ ' + TX('peringatan_dini.ancaman_kekeringan.tingkat.' + (safe ? 'waspada' : 'bahaya') + '.teks', { hari_sisa: Math.floor(S.res.air / Math.max(1, pop)) }, 'Kekeringan! Stok air menipis.'));
    if (!safe) { const fs = S.buildings.filter(b => b.type === 'ladang' && b.stage === 'tumbuh'); fs.forEach(b => b.grow = Math.max(0, b.grow - F.droughtGrowDelay)); // tidak pernah negatif
      if (fs.length) log(TX('log_ancaman.kekeringan_ladang', {}, 'Ladang kehausan. Tanaman tumbuh lebih lambat.')); } }
  if (F.fireNightChance) { const risky = S.buildings.filter(b => b.done && (b.type === 'dapur' || b.type === 'bengkel') && !b.burning && (b.hp ?? 100) > 0);
    if (risky.length && !S.fireRisk && Math.random() < F.fireNightChance * threatMult()) S.fireRisk = { day: S.day, b: pick(risky).id, phase: 'menunggu' }; }
  // hitung mundur ke musim sulit & syukur panen
  if (F.hardWarnFromDay) { const d = Math.floor(foodDays()), buf = winterBuffer(), left = si.len - dis + 1;
    if (dis >= F.hardWarnFromDay) log((d >= buf ? ic + ' ' : '⚠️ ') + STX('musim_pembuka.musim_gugur_menuju_dingin', 'menuju_sulit', { hari_sisa: left, jumlah: d, jumlah2: buf }, `Sisa ${left} hari. Stok ${d}/${buf} hari.`) + (d < buf ? ' ' + STX('musim_pembuka.musim_gugur_stok_kurang', 'stok_kurang', {}, '') : ''));
    if (dis === si.len && d >= F.thanksFoodDays) { S.villagers.forEach(v => v.mood = Math.min(100, v.mood + F.thanksMood)); log('🙏 ' + STX('musim_pembuka.musim_gugur_syukur', 'syukur', {}, 'Lumbung penuh. Syukuran kecil!')); markMeaningful('event');
      if (d >= SKC().syukuranPanen.foodDaysMin) { const n = surplusSink(SKC().syukuranPanen, 'syukuran_panen'); if (n >= 1) log('🍚 ' + TX('dilema_ui.syukuran_panen', { jumlah: Math.round(n) }, `Tasyakuran panen: ${Math.round(n)} porsi dimasak bersama dan dibagi ke tetangga.`)); } } }
  // kayu bakar (empat musim: dingin; Nusantara: malam lembap musim hujan)
  if (F.campfireWoodPerDay) { const fires = done('apiunggun').length, need = Math.ceil(fires * F.campfireWoodPerDay * techVal('api_kayu_bakar', 1) * 10) / 10;
    if (fires) { if (S.res.kayu >= need) { S.res.kayu -= need; if (S.fireOut) log('🔥 Api unggun menyala lagi.'); S.fireOut = false; if (dis === 1) log('{ikon:kayu} ' + STX('musim_pembuka.musim_dingin_kayu_bakar', 'kayu_bakar', { jumlah: need }, `Api unggun memakai ${need} kayu bakar per hari.`)); }
      else { S.res.kayu = 0; if (!S.fireOut) log('⚠️ ' + STX('log_ancaman.kayu_bakar_habis', 'api_padam', {}, 'Kayu bakar habis! Api unggun meredup.')); S.fireOut = true; } }
    if (S.extremeDay === S.day - 1) log('🌤️ ' + TT('ekstrem_reda', {}, 'Cuaca sudah kembali biasa.')); }
  else S.fireOut = false;
  // obor: 1 kayu tiap 2 malam per obor
  if (S.day % C.THREAT.wolf.torchWoodPerNights === 0) for (const b of S.buildings.filter(b => b.type === 'obor' && b.done)) {
    if (S.res.kayu >= 1) { S.res.kayu -= 1; if (b.unlit) log(TX('bangunan_ancaman.bangunan_obor.diisi', {}, 'Obor diisi kayu dan menyala lagi.')); b.unlit = false; }
    else if (!b.unlit) { b.unlit = true; log('🕯️ ' + TX('bangunan_ancaman.bangunan_obor.padam', { bangunan: 'desa' }, 'Sebuah obor padam. Tambahkan kayu.')); } } }
const houseFor = v => S.buildings.some(b => b.done && b.type === 'gubuk' && (b.hp ?? 100) > 0) && S.villagers.indexOf(v) < capacityHuts();
const capacityHuts = () => S.buildings.filter(b => b.done && b.type === 'gubuk' && (b.hp ?? 100) > 0).length * C.BUILDINGS.gubuk.kapasitas;
// dipanggil tiap step: transisi dalam hari (sore/malam)
function seasonStep(dt) { const f = dayFrac(), F = FX();
  // hari ekstrem: diumumkan sore sebelumnya
  if (F.extremeChance && f >= 0.7 && S.extremeRolled !== S.day) { S.extremeRolled = S.day; const si = seasonInfo();
    if (Math.random() < F.extremeChance + (isY2() ? C.YEAR_SCALE.extremeChanceAdd || 0 : 0) && si.day !== si.len) { S.extremeDay = S.day + 1;
      log(TT('ikon_ekstrem', {}, '⚠️') + ' ' + TT('ekstrem_waspada', {}, 'Besok cuacanya akan sangat berat.')); } }
  // paparan cuaca (empat musim: dingin tanpa pakaian; Nusantara: terik kemarau tanpa caping) — mood turun saat di luar
  if (F.exposureMood && (!F.exposureDayOnly || !isNight())) { const covered = (C.HARD_COLD && S.res.kulit >= S.villagers.length) || (S.techDone || []).includes(C.CAPING_TECH || 'T02'), r = F.exposureMood[covered ? 'dengan' : 'tanpa'] / C.DAY_LENGTH_SEC;
    for (const v of S.villagers) if (!inHut(v) && !(F.exposureNearFire && campfireLit() && done('apiunggun').some(b => dist(center(b), v) < 4))) v.mood = Math.max(0, v.mood + r * dt); }
  if (isExtreme()) for (const v of S.villagers) { const warm = inHut(v) || done('apiunggun').some(b => dist(center(b), v) < 4) && campfireLit();
    if (!warm) v.mood = Math.max(0, v.mood - C.MOOD_DECAY * ((F.extremeMoodDecayMult || 1) - 1) * dt); }
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
  let pos = null, bd = 1e9; for (const i of floodTiles()) { const p = { x: i % C.MAP_W, y: Math.floor(i / C.MAP_W) }, d = dist(p, CAMP); if (d < bd) { bd = d; pos = p; } }
  S.flood = { start: S.t + 0.1 * C.DAY_LENGTH_SEC, end: S.t + 0.1 * C.DAY_LENGTH_SEC + dur, pos };
  const fl = '🌊 ' + TX('peringatan_dini.ancaman_banjir.tingkat.waspada.teks', {}, 'Sungai naik. Air mungkin meluap ke tepian.'); if (pos) logAt(fl, pos.x, pos.y); else log(fl); sfx('event'); }
function applyFlood() { S.flood.applied = true; const fs = S.buildings.filter(b => b.type === 'ladang' && floodTiles().has(b.y * C.MAP_W + b.x));
  if (techVal('banjir_ladang', 1) > 0) fs.forEach(b => { if (b.stage === 'tumbuh') b.grow = Math.max(0, b.grow - C.FLOOD.growDelayDays); });
  log('🌊 ' + TX('peringatan_dini.ancaman_banjir.tingkat.bahaya.teks', {}, 'Sungai meluap ke tepian. Jalan di dekat air jadi becek.'));
  if (fs.length) log(TX('log_ancaman.banjir_ladang', {}, 'Air menggenangi ladang di tepi sungai.')); }
function endFlood() { S.flood = null; log('🌤️ ' + TX('peringatan_dini.ancaman_banjir.tingkat.reda.teks', {}, 'Air sungai kembali tenang.')); }
// ---- kebakaran (panas) ----
const bname = b => C.BUILDINGS[b.type].nama;
function ignite(b) { const F = C.FIRE; { const c = center(b); mapEvent('api', c.x, c.y, EV_SEC(), b.id); } b.burning = { target: rnd(F.hpLoss[0], F.hpLoss[1]), lost: 0, actions: 0, need: rndInt(F.actionsToPut[0], F.actionsToPut[1]), nextSpread: S.t + F.spreadSec };
  log('🔥 ' + TX('log_ancaman.kebakaran_menyala', { bangunan: bname(b) }, `Api menyala di ${bname(b)}!`)); sfx('event');
  if (C.BUILDINGS[b.type].storage && Math.random() < F.stockLossChance) { const n = Math.floor(S.res.makanan * F.stockLossFrac); S.res.makanan -= n; dstat('sink', 'rusak', n);
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
  if (t.sekat) { if (S.res.kayu < F.firebreakKayu) return; S.res.kayu -= F.firebreakKayu; b.firebreak = true; log(TX('log_ancaman.kebakaran_sekat', { bangunan: bname(b), nama: v.name, jumlah: F.firebreakKayu }, `Air habis! Penduduk membuat sekat (−${F.firebreakKayu} kayu) agar api tidak merembet.`)); return; }
  if (S.res.air < F.waterPerAction) return; S.res.air -= F.waterPerAction; b.burning.actions++;
  if (b.burning.actions >= b.burning.need) { const ember = b.burning.actions; b.burning = null; const o = S.villagers.find(x => x !== v) || v;
    log('💧 ' + TX('log_ancaman.kebakaran_padam', { bangunan: bname(b), nama: v.name, nama2: o.name, jumlah: ember }, `${v.name} berhasil memadamkan api di ${bname(b)}.`)); } }
// ---- ancaman malam (serigala / babi hutan; C.NIGHT_THREAT dari tema) ----
const TH = () => C.THREAT[C.NIGHT_THREAT || 'wolf'];
const TLX = (kOld, kNew, ex, fb) => TT(kNew, ex, fb); // serigala (sedang) / babi hutan (Nusantara): path di tema.js TXT
function wolfDaily() { const W = TH(); if (S.wolf && ['mendekat', 'serang'].includes(S.wolf.phase)) return;
  S.wolf = null; let ch = W.baseNightChance * threatMult() * (isHardSeason() ? W.hardMult || 1 : 1) * threatBuff(C.NIGHT_THREAT === 'wolf' ? 'serigala' : 'babi'); // ronda/dilema: ancaman_mult
  if (Math.random() < ch) S.wolf = { day: S.day, phase: null, tracksOnly: (S.era | 0) < eraIndex(W.minEra), spawned: false, scared: {} }; }
function wolfStep(dt) { const W = TH(), w = S.wolf; S.wolves = S.wolves || [];
  if (w) { const f = dayFrac(), eve = w.day === S.day, morn = S.day === w.day + 1;
    if (eve && !w.phase && f >= C.NIGHT_START - W.warnHoursBefore) { w.phase = 'jejak'; placeTracks();
      log('🐾 ' + TLX('log_ancaman.serigala_jejak', 'jejak', {}, 'Ada jejak hewan liar di tepi hutan.')); }
    if (eve && w.phase === 'jejak' && f >= C.NIGHT_START) { w.phase = 'mendekat'; S.lastThreatNearDay = S.day; if (C.NIGHT_THREAT === 'wolf') sfx('lolong');
      log(threatIcon() + TLX('log_ancaman.serigala_mendekat', 'mendekat', {}, 'Hewan liar makin dekat. Penduduk bergegas pulang.'));
      // penduduk di luar cenderung pulang (60%)
      if (houses().length) S.villagers.forEach(v => { if (!(v.task && v.task.kind === 'tidur') && !EMERG.includes(v.task && v.task.kind) && Math.random() < Math.max(0, Math.min(1, 0.6 + traitAdd(v, 'fleeFracAdd') * 10))) { deposit(v, false); v.goHome = true; v.task = null; } }); }
    if (eve && w.phase === 'mendekat' && f >= W.attackFrac[0] && f < W.attackFrac[1] && !w.spawned) { w.spawned = true;
      if (w.tracksOnly) { log('🐾 ' + TLX('', 'mengintai', {}, 'Hewan liar hanya mengintai dari jauh malam ini.')); }
      else { w.phase = 'serang'; S.lastAttackDay = S.day; const n = rndInt(W.count[0], W.count[1]); for (let i = 0; i < n; i++) spawnWolf(); } }
    if (morn && f >= C.NIGHT_END && w.phase !== 'usai') { w.phase = 'usai'; S.wolves.forEach(o => o.mode = 'pergi'); S.villagers.forEach(v => v.goHome = false);
      log('🌅 ' + TLX('log_ancaman.serigala_usai', 'usai', {}, 'Fajar menyingsing. Hewan liar sudah kembali ke hutan.')); }
    if (S.day > w.day + 1) S.wolf = null; }
  for (const o of S.wolves) updateWolf(o, dt); updateRaiders(dt);
  S.wolves = S.wolves.filter(o => !o.gone);
  if (S.tracks) S.tracks = S.tracks.filter(t => S.t - t.t < C.DAY_LENGTH_SEC); }
function placeTracks() { S.tracks = S.tracks || []; const side = rndInt(0, 3), n = 4 + rndInt(0, 3);
  for (let i = 0; i < n; i++) { const a = rnd(5, side % 2 ? C.MAP_H - 5 : C.MAP_W - 5);
    const p = [{ x: a, y: 1 + i }, { x: C.MAP_W - 2 - i, y: a }, { x: a, y: C.MAP_H - 2 - i }, { x: 1 + i, y: a }][side]; S.tracks.push({ x: Math.round(p.x), y: Math.round(p.y), t: S.t, dir: side }); } }
const outside = v => !inHut(v) && !isBaby(v);
function spawnWolf() { const tg = S.villagers.filter(outside), fl = TH().fieldFirst ? S.buildings.filter(x => x.type === 'ladang' && x.done && x.stage !== 'kosong') : [];
  const t0 = fl.length ? pick(fl) : tg.length ? pick(tg) : pick(S.villagers); if (!t0) return;
  const edges = [{ x: t0.x, y: 0 }, { x: C.MAP_W - 1, y: t0.y }, { x: t0.x, y: C.MAP_H - 1 }, { x: 0, y: t0.y }];
  let e = edges.reduce((a, b) => dist(a, t0) < dist(b, t0) ? a : b); const s = nearestWalkable(Math.round(e.x), Math.round(e.y)) || { x: 0, y: 0 };
  S.wolves.push({ id: S.nextId++, x: s.x, y: s.y, mode: 'jalan', target: null, dir: 0, variant: rndInt(0, 1), repath: 0, path: null, home: { ...s } }); }
const fenceAt = (x, y) => S.buildings.some(b => b.type === 'pagar' && b.done && b.x === x && b.y === y);
const wolfCost = (x, y) => fenceAt(x, y) ? TH().fencePathMult : 1;
// babi hutan: cari petak bertanaman terdekat (yang belum dirusak babi lain), lalu obrak-abrik
function fieldTarget(o) { if (o.field != null) { const b = S.buildings.find(x => x.id === o.field); if (b && b.done && b.stage !== 'kosong') return b; }
  const taken = new Set((S.wolves || []).filter(w => w !== o && w.field != null).map(w => w.field));
  const b = nearest(S.buildings.filter(x => x.type === 'ladang' && x.done && (x.stage === 'tumbuh' || x.stage === 'siap') && !taken.has(x.id)), o, x => x); o.field = b ? b.id : null; return b; }
function wreckField(o, b) { const W = TH(); o.field = null;
  // obor menyala di dekat petak membuat babi ragu (sama seperti melindungi penduduk)
  if (S.buildings.some(t => torchLit(t) && dist(center(t), b) <= W.torchSafeRadius) && Math.random() >= W.torchHitMult) { o.plots = (o.plots || 0) + 1; log('🔥 ' + TT('diusir', {}, 'Cahaya obor membuat babi hutan ragu.')); return; }
  const scareP = C.SCARECROW ? 1 - (C.SCARECROW.boarFieldMult ?? 1) : 0; // QC R-01: peluang orang-orangan mengusir = 1 - boarFieldMult (desain: 1 -> 0%, babi tak mempan; turunkan untuk mengaktifkan)
  if (scareP > 0 && scarecrowNear(b) && Math.random() < scareP) { o.plots = (o.plots || 0) + 1; log('🌾 ' + TT('diusir_orang_orangan', { hewan: TERM('hewan') }, 'Orang-orangan sawah bergoyang ditiup angin. Seekor {hewan} ragu dan mundur ke hutan.')); return; }
  const cn = cropName(b); o.plots = (o.plots || 0) + 1; b.stage = 'kosong'; b.grow = 0; b.wrecked = S.day; b.wreckedT = S.t; S.fieldsWrecked = (S.fieldsWrecked || 0) + 1; sfx('event');
  dustAt(b.x, b.y, true); if (o && o.x != null && dist(o, b) > 0.5) dustAt(o.x, o.y, true); floatText(`🐗 -1 ${cn}`, b.x, b.y - 0.8, '#ff9a8a'); mapEvent('ladang', b.x, b.y, EV_SEC(), b.id);
  logAt('🐗 ' + TT('rusak_ladang', { tanaman: cn }, `Babi hutan merusak ladang ${cn}.`), b.x, b.y); }
function updateWolf(o, dt) { const W = TH();
  if (o.mode === 'serang') { o.t += dt; if (o.t >= 0.5 && !o.bit) { o.bit = true; biteVillager(o, vById(o.target)); } if (o.t >= 0.9) o.mode = 'pergi'; return; }
  let goal;
  // menara jaga / pos ronda yang dijaga mengusir hewan dalam radius (maks towerScarePerNight per malam per menara)
  if (o.mode !== 'pergi') for (const tw of done('menara_jaga')) { const c = center(tw); if (dist(c, o) > W.towerRadius) continue;
    const guard = S.villagers.find(g => g.task && g.task.kind === 'jaga' && g.task.b === tw && g.task.arrived); if (!guard) continue;
    if (S.wolf && (S.wolf.scared[tw.id] || 0) >= Math.round(W.towerScarePerNight * traitMult(guard, 'scareMult'))) continue; // pemberani: scareMult 1.5
    tw.kentAt = performance.now(); if (S.wolf) S.wolf.scared[tw.id] = (S.wolf.scared[tw.id] || 0) + 1; o.mode = 'pergi'; S.scaredOff = (S.scaredOff || 0) + 1;
    log('📯 ' + TLX('bangunan_ancaman.bangunan_menara_jaga.usir', 'menara', { nama: guard.name }, `${guard.name} membunyikan tanda bahaya. Hewan liar lari ke hutan.`)); return; }
  if (o.mode === 'pergi') goal = o.home;
  else if (W.fieldFirst && (o.plots || 0) < (o.maxPlots ?? (o.maxPlots = rndInt(W.plotsDamaged[0], W.plotsDamaged[1]))) && fieldTarget(o)) { const b = fieldTarget(o); goal = { x: b.x, y: b.y };
    if (dist(o, goal) <= 0.8) { wreckField(o, b); return; } }
  else if (W.injureFromEra && (S.era | 0) < eraIndex(W.injureFromEra)) goal = sniffGoal(o, dt);
  else if (!isNight() && !(o.provoked || (o.provoked = S.villagers.some(v => v.task && v.task.kind === 'jaga' && dist(v, o) < 1.5)))) goal = sniffGoal(o, dt); // v9d (uji perangkat): hewan siang (serigala tema sedang, babi hutan) hanya mengendus ±12 dtk lalu pergi; tidak menggigit kecuali diusik
  else { const cands = S.villagers.filter(v => outside(v) && (!W.fieldFirst || dist(v, o) < 6)); if (!cands.length) goal = sniffGoal(o, dt);
    else { const v = nearest(cands, o); o.target = v.id; goal = v;
      if (dist(o, v) <= W.hitRange) { o.mode = 'serang'; o.t = 0; o.bit = false; const dx = v.x - o.x, dy = v.y - o.y; o.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); return; } } }
  o.repath -= dt; const key = Math.round(goal.x) + ',' + Math.round(goal.y);
  if (!o.path || o.repath <= 0 || o.pathKey !== key) { o.repath = 1; o.pathKey = key; o.path = findPath(Math.round(o.x), Math.round(o.y), Math.round(goal.x), Math.round(goal.y), wolfCost) || [];
    o.path.push({ x: goal.x, y: goal.y }); }
  let step = W.speed * dt * (fenceAt(Math.round(o.x), Math.round(o.y)) ? W.fenceSpeedMult : 1); o.moving = false;
  while (step > 0 && o.path.length) { const wp = o.path[0], d = dist(o, wp); o.moving = true;
    if (d > 0.001) { const dx = wp.x - o.x, dy = wp.y - o.y; o.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); }
    if (d <= step) { o.x = wp.x; o.y = wp.y; step -= d; o.path.shift(); } else { o.x += (wp.x - o.x) / d * step; o.y += (wp.y - o.y) / d * step; step = 0; } }
  if (o.mode === 'pergi' && dist(o, o.home) < 0.6) o.gone = true; }
// v9c: tanpa sasaran, hewan mengendus-endus menuju perkemahan sebentar (±0.1 hari) lalu pulang. Dulu langsung 'pergi' -> lenyap di tepi peta begitu muncul
function sniffGoal(o, dt) { const W = TH();
  if (o.sniff == null) { o.sniff = (W.sniffSec ?? 12) * (0.8 + Math.random() * 0.4); const f = 0.35 + Math.random() * 0.25; const px = Math.round(o.home.x + (CAMP.x - o.home.x) * f + rnd(-2, 2)), py = Math.round(o.home.y + (CAMP.y - o.home.y) * f + rnd(-2, 2)); o.sniffAt = nearestWalkable(px, py) || { ...o.home }; }
  if (dist(o, o.sniffAt) < 1) o.sniff -= dt; if (o.sniff <= 0) { o.mode = 'pergi'; return o.home; } return o.sniffAt; }
function biteVillager(o, v) { const W = TH(); if (!v || !S.villagers.includes(v) || !outside(v)) return;
  if (W.injureFromEra && (S.era | 0) < eraIndex(W.injureFromEra)) return;
  let hit = 1; const torch = S.buildings.some(b => torchLit(b) && dist(center(b), v) <= W.torchSafeRadius); if (torch) hit *= W.torchHitMult;
  if (Math.random() >= hit) { log('🔥 ' + TLX('log_ancaman.diusir', 'diusir', { nama: v.name }, 'Cahaya obor membuat hewan liar ragu dan berbalik ke hutan.')); return; }
  const dmg = Math.round(rnd(W.damage[0], W.damage[1]) * traitMult(v, 'threatDmgMult')); v.health = Math.max(isY2() ? 0.5 : 1, (v.health ?? 100) - dmg); v.mood = Math.max(0, v.mood - W.moodHit); v.lastHurt = 'serangan'; v.injured = S.day;
  S.wolfBites = (S.wolfBites || 0) + 1; sfx('event');
  dustAt(v.x, v.y, true); floatText(`-${dmg} ${TX('peta_kejadian.kesehatan', {}, 'Kesehatan')}`, v.x, v.y - 0.5, '#ff9a8a'); mapEvent('serang', v.x, v.y, EV_SEC(), 'v' + v.id);
  logAt(threatIcon() + TLX('log_ancaman.serangan_serigala', 'serang', { nama: v.name, jumlah: dmg }, `Hewan liar menyerang ${v.name}! Kesehatannya turun ${dmg}.`), v.x, v.y);
  if (Math.random() < W.traumaChance * traitMult(v, 'traumaMult')) { v.traumaUntil = S.day + W.traumaDays; log(TX('log_ancaman.trauma', { nama: v.name }, `${v.name} masih teringat malam serangan itu.`)); }
  const guarded = near('menara_jaga', v, W.killSafeRadius) || near('pagar', v, W.killSafeRadius);
  if (isY2() && v.health < W.killHpBelow && !guarded && !(torch && W.torchNoKill) && Math.random() < W.killChanceIfLowHp) { killVillager(v, 'serangan'); return; }
  if (v.health < C.SICKNESS.severeFromHpBelow) makeSick(v, 'parah', 'serangan'); else log(TX('log_ancaman.luka', { nama: v.name }, `${v.name} terluka dan harus beristirahat.`));
  v.task = null; }
// ---- sakit ----
function makeSick(v, lvl, cause) { const K = C.SICKNESS; if (v.sick && v.sick.lvl === 'parah' && lvl === 'ringan') return;
  v.sick = { lvl, until: S.day + rndInt(K.lightDays[0], K.lightDays[1]), cause, cared: false, since: S.day };
  const pc = cause && TEXT && TEXT.penduduk_sakit && TEXT.penduduk_sakit.per_penyebab && TEXT.penduduk_sakit.per_penyebab[cause];
  log('🤒 ' + (pc ? TX('penduduk_sakit.per_penyebab.' + cause, { nama: v.name }) : TX(`penduduk_sakit.${lvl}.mulai`, { nama: v.name }, `${v.name} jatuh sakit${lvl === 'parah' ? ' parah' : ''}.`)));
  if (lvl === 'parah') { log('💊 ' + TX('penduduk_sakit.parah.butuh_rawat', { nama: v.name }, `${v.name} sakit parah dan perlu dirawat.`)); v.task = null; } }
function sicknessDaily() { const K = C.SICKNESS, F = FX();
  for (const v of S.villagers.slice()) {
    if (v.sick) { const s = v.sick;
      if (s.lvl === 'parah') { // tidak ada lemparan maut di hari mulai sakit parah atau saat ada yang sedang merawatnya (dulu: tes rawat gagal ~1/8)
        const tended = S.villagers.some(c => c.task && c.task.kind === 'rawat' && c.task.pid === v.id) || s.since === S.day || (s.underCareUntil != null && s.underCareUntil >= S.day); // underCareUntil: tidak bergantung tugas aktif
        if (!s.cared && !tended && !(s.cause === 'serangan' && !isY2()) && Math.random() < K.severeDeathPerDay * buffMult('matiParah')) { killVillager(v, s.cause === 'serangan' ? 'serangan' : 'sakit'); continue; }
        if (!s.cared && !tended) log(TX('penduduk_sakit.parah.memburuk', { nama: v.name }, `Kondisi ${v.name} memburuk. Ia butuh perawatan.`)); s.cared = false; }
      else if (S.day >= s.until - Math.round((buffMult('sembuh') - 1) * 2)) { if (foodTotal() > 0) { v.sick = null; log('😊 ' + TX('penduduk_sakit.ringan.sembuh', { nama: v.name }, `${v.name} sudah sehat kembali!`)); } else s.until++; }
      continue; }
    if (isBaby(v)) continue; let ch = 0;
    if (F.sickChancePerLowMood) { if (v.mood < 50 || v.hunger <= C.HUNGER_CRIT) ch = F.sickChancePerLowMood; }
    if (F.chillSickChance && v.mood < (F.chillMoodBelow ?? 50)) ch = Math.max(ch, F.chillSickChance); // masuk angin (pancaroba)
    else if (v.mood < K.lowMoodBelow) ch = K.baseLowMoodChance;
    if (stageOf(v) === 'lansia') ch *= C.AGE.elderSickMult;
    if (ch && Math.random() < ch) makeSick(v, isExtreme() && Math.random() < K.severeFromExtremeChance ? 'parah' : 'ringan', C.HARD_COLD && isHardSeason() ? 'dingin' : F.chillSickChance ? 'masuk_angin' : v.hunger <= C.HUNGER_CRIT ? 'kelaparan' : null); }
  for (const v of S.villagers) if (v.injured && v.health >= 80 && !v.sick) { v.injured = null; log(TX('log_ancaman.sembuh', { nama: v.name }, `Luka ${v.name} sudah sembuh.`)); } }
function careTask(v) { if (v.sick && v.sick.lvl === 'parah') return null;
  const p = S.villagers.find(o => o !== v && o.sick && o.sick.lvl === 'parah' && !o.sick.cared && !S.villagers.some(c => c.task && c.task.kind === 'rawat' && c.task.pid === o.id));
  if (!p || !canAfford(C.SICKNESS.careCost)) return null; return { kind: 'rawat', pid: p.id, target: { x: p.x, y: p.y }, work: p.sick.careWork || 0 }; } // lanjut dari progres sebelumnya (mis. terputus tidur)
function finishCare(v, t) { const p = vById(t.pid); if (!p || !p.sick) return; relAdd(v, p, RLC().gain.tolong + traitAdd(v, 'helpRelAdd'), 'tolong'); for (const [k, n] of Object.entries(C.SICKNESS.careCost)) S.res[k] = Math.max(0, S.res[k] - n);
  p.sick = { lvl: 'ringan', until: S.day + 2, cause: p.sick.cause, cared: true };
  log('💊 ' + TX('penduduk_sakit.parah.dirawat', { nama: p.name, nama2: v.name }, `${v.name} merawat ${p.name} seharian. Ia mulai pulih.`)); }
// ---- pergi ----
function leaveDaily() { const L = C.LEAVE;
  for (const v of S.villagers.slice()) { if (isKid(v)) { v.lowMoodDays = 0; continue; }
    const sah = RLC().fx.sahabat, keep = (v.welcomedUntil >= S.day && v.mood >= TRT().list.ramah.welcome.stayAboveMood) || (v.mood >= sah.noLeaveAboveMood && S.villagers.some(o => o !== v && relGet(v, o) >= RLC().levels.sahabat));
    v.lowMoodDays = !keep && v.mood < L.moodBelow + traitAdd(v, 'leaveMoodAdd') + (v.leaveAdd && v.leaveAdd.until >= S.day ? v.leaveAdd.n : 0) + monFxSum('leaveMoodAdd') ? (v.lowMoodDays || 0) + 1 : 0; // sabar -10, perantau +5; sahabat/sambutan ramah menahan v.starveDays = v.hunger <= 0 ? (v.starveDays || 0) + 1 : 0;
    if (v.lowMoodDays === 2) log('😟 ' + TX('penduduk_pergi.peringatan.waspada', { nama: v.name }, `${v.name} terlihat murung beberapa hari ini.`));
    if (v.lowMoodDays === L.days - 1 || v.starveDays === L.starveDays) log('⚠️ ' + TX('penduduk_pergi.peringatan.bahaya', { nama: v.name, hari_sisa: 1 }, `${v.name} mulai mengemasi barang-barangnya.`));
    if (v.wasLeaving && v.lowMoodDays === 0 && v.starveDays === 0) { v.wasLeaving = false; log('😊 ' + TX('penduduk_pergi.tercegah', { nama: v.name }, `${v.name} memutuskan untuk tetap tinggal.`)); }
    if (v.lowMoodDays >= L.days - 1) v.wasLeaving = true;
    if ((v.lowMoodDays >= L.days || v.starveDays > L.starveDays) && S.villagers.length > C.LEAVE.minPop && !(S.lastLeaveDay && S.day - S.lastLeaveDay < L.cooldownDays)) leaveVillager(v, v.starveDays > L.starveDays ? 'lapar' : 'mood'); } }
function leaveVillager(v, why) { if (v.inside != null) exitHouse(v); const pp = partnerOf(v); if (pp) { pp.partnerId = null; pp.formerPartner = v.name; pp.widowDay = S.day; } S.villagers.splice(S.villagers.indexOf(v), 1); S.leavers = (S.leavers || 0) + 1; S.lastLeaveDay = S.day; if (selVid === v.id) closeVillager();
  S.villagers.forEach(o => o.mood = Math.max(0, o.mood - C.LEAVE.villageMoodHit));
  log('🚶 ' + TX('penduduk_pergi.kepergian', { nama: v.name }, `${v.name} meninggalkan desa.`) + ' ' + TX('penduduk_pergi.penyebab.' + why, { nama: v.name }, ''));
  if (S.villagers.length) log(TX('penduduk_pergi.dampak_desa', { nama: v.name }, '')); dstat('leavers', v.name, 1); assignHomes(); }
// ---- kematian, pemakaman & duka ----
function killVillager(v, cause) { const D = C.DEATH; if (!S.villagers.includes(v)) return; markMeaningful('wafat');
  S.villagers.splice(S.villagers.indexOf(v), 1); if (selVid === v.id) closeVillager();
  S.deaths = (S.deaths || 0) + 1; S.lastDeathDay = S.day; dstat('deaths', v.name, 1); { const dc = S.deathCause = S.deathCause || {}, k = cause + (isY2() ? '' : '_th1'); dc[k] = (dc[k] || 0) + 1; } if (cause === 'tua') S.deathsOld = (S.deathsOld || 0) + 1;
  if (v.inside != null) { const h = bById(v.inside); if (h) { const p = doorPos(h); v.x = p.x; v.y = p.y; } v.inside = null; }
  const old = cause === 'tua', partner = partnerOf(v), gm = old ? C.AGE.oldDeathGriefMult : 1;
  const ex = { nama: v.name, umur: v.age, hewan: TERM('hewan'), nama2: (S.villagers[0] || v).name, pasangan: partner ? partner.name : '' };
  log('💀 ' + (old ? TX(partner ? 'lansia_berpulang.meninggal_berpasangan' : 'lansia_berpulang.meninggal', ex, `${v.name} berpulang dengan tenang di usia ${v.age} tahun.`) : TX('penduduk_meninggal.per_penyebab.' + cause, ex, `${v.name} meninggal (${cause}).`)));
  (S.memorials = S.memorials || []).push({ id: v.id, name: v.name, age: v.age, day: S.day, cause, since: v.joined ?? 1 });
  (S.bodies = S.bodies || []).push({ id: v.id, name: v.name, x: v.x, y: v.y, cause, day: S.day });
  S.villagers.forEach(o => o.mood = Math.max(0, o.mood + D.griefMoodInstant * gm * griefM(o))); relGrief(v, old); // griefMult: sabar/religius 0.7
  if (partner) { partner.partnerId = null; partner.formerPartner = v.name; partner.widowDay = S.day; partner.closeTo = null;
    partner.mood = Math.max(0, partner.mood + D.griefMoodInstant * gm * (C.PAIRING.widowGriefMult - 1)); vhist(partner, `Ditinggal ${v.name}`); }
  S.villagers.forEach(o => { if (o.closeTo === v.id) o.closeTo = null; });
  const dekat = partner || S.villagers.filter(o => !isBaby(o)).sort((a, b) => relGet(v, b) - relGet(v, a))[0]; S.grief = { name: v.name, pasangan: dekat ? dekat.name : 'Keluarganya', until: S.day + D.griefDays, mult: gm, old }; // QC S-01: {pasangan} = pasangan / orang terdekat S.mourningUntil = S.t + C.DAY_LENGTH_SEC;
  if (S.villagers.length) log('🕯️ ' + (old ? TX('lansia_berpulang.duka.duka_mulai', ex, `Desa berduka atas kepergian sesepuh ${v.name}.`) : TX('duka.duka_mulai', ex, `Desa berduka atas kepergian ${v.name}.`)));
  const N = (TEXT && (old ? TEXT.lansia_berpulang : TEXT.penduduk_meninggal) && (old ? TEXT.lansia_berpulang : TEXT.penduduk_meninggal).notifikasi) || {};
  toast(ASSETS.STATUS_DIR + 'status_mourning.png', fillSafe(N.judul || 'Selamat Jalan, {nama}', ex), old ? fillSafe(N.teks || '{nama} berpulang di usia {umur} tahun.', ex) : TX('penduduk_meninggal.kenangan_panel', { ...ex, sifat: memSifat(v), skill: memSkill(v), lama_tinggal: S.day - (v.joined ?? 1) }, ''));
  assignHomes(); }
// QC S-02: kenangan memakai sifat & keahlian tertinggi almarhum (bukan acak)
function memSifat(v) { const S2 = TEXT && TEXT.sifat, id = (v.traits || []).find(i => S2 && S2[i] && S2[i].kata); return id ? S2[id].kata : 'penduduk yang baik'; }
function memSkill(v) { const sk = Object.entries(v.skills || {}).sort((a, b) => b[1] - a[1])[0], m = (TEXT && TEXT.meta && TEXT.meta.skill) || {}; return sk ? (m[sk[0]] || sk[0]) : (m.membangun || 'membangun'); }
function griefDaily() { personalGriefDaily(); const G = S.grief; if (!G) return;
  const pre = G.old ? 'lansia_berpulang.duka.' : 'duka.';
  if (S.day > G.until) { log('🌅 ' + TX(pre + 'duka_berakhir', { nama: G.name }, `Masa berkabung untuk ${G.name} usai.`)); S.grief = null; return; }
  S.villagers.forEach(o => o.mood = Math.max(0, o.mood + C.DEATH.griefPerDay * (G.mult ?? 1))); log(TX(pre + 'duka_harian', { nama: G.name, pasangan: G.pasangan || 'Keluarganya' }, `Desa masih merindukan ${G.name}.`)); }
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
  if (v.sick || v.energy < C.ENERGY_CRIT * 1.5 || tList(v).some(t => t.noNightJaga)) return null; return { kind: 'jaga', b: tw, target: { x: tw.x + 0.5, y: tw.y + 1 } }; }
// ---- tugas darurat (dipanggil di chooseTask setelah kebutuhan kritis) ----
function emergencyTask(v, only) { const P = S.prio, ok = k => P[k] && (!only || only.includes(k));
  if (ok('padam')) { const t = fireTask(v); if (t) return t; }
  if (ok('rawat')) { const t = careTask(v); if (t) return t; }
  if (ok('jaga')) { const t = guardTask(v); if (t) return t; }
  if (ok('makam')) { const t = graveTask(v); if (t) return t; }
  return null; }
function threatDaily() { spoilDaily(); famineDaily(); seasonDaily(); windDaily(); wolfDaily(); sicknessDaily(); leaveDaily(); griefDaily(); }
// ---- render: cuaca, bahaya, serigala ----
const WOLF_ROW = { diam: 0, jalan: 1, serang: 2, pergi: 1 };
// kilat sesekali saat hujan lebat: kilatan layar 60ms lalu memudar + sambaran 3 frame di titik acak
let bolt = null;
function drawLightning(now, W, H, z) { if (!bolt || now > bolt.t + 900) { if (Math.random() < 0.004) bolt = { t: now, x: Math.random() * W, y: H * (0.3 + Math.random() * 0.5) }; else return; }
  const e = now - bolt.t; if (e < 0) return;
  if (e < 260) { ctx.globalAlpha = e < 60 ? 0.55 : 0.55 * (1 - (e - 60) / 200); const f = ASSETS.kilat_flash; ctx.fillStyle = f && f.color || 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  const k = ASSETS.kilat; if (k && k.image && e < 300) ctx.drawImage(k.image, Math.min(2, Math.floor(e / 100)) * 32, 0, 32, 96, Math.round(bolt.x - 16 * z), Math.round(bolt.y - 96 * z), 32 * z, 96 * z); }
// kunang-kunang malam (tema Nusantara, bukan musim kemarau): kedip di dekat semak & pohon, digambar setelah overlay malam
function drawFireflies(now, z) { const a = ASSETS.kunang_kunang; if (!a || !a.image || !isNight() || season() === C.HARD_SEASON) return;
  // lebih terlihat: 28 kunang-kunang di sekitar pohon/semak yang tampak di layar, halo lembut berdenyut + sprite 1.5x
  const vx0 = cam.x / T - 1, vy0 = cam.y / T - 1, vx1 = vx0 + cv.width / z / T + 2, vy1 = vy0 + cv.height / z / T + 2;
  const vis = S.nodes.filter(n => (n.type === 'pohon' || n.type === 'semak') && n.x >= vx0 && n.x <= vx1 && n.y >= vy0 && n.y <= vy1); if (!vis.length) return;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 28; i++) { const n = vis[(i * 7) % vis.length], t = now / 1000 + i * 1.7, pulse = 0.55 + 0.45 * Math.sin(t * 2.3 + i);
    const x = ((n.x + 0.5 + Math.sin(t * 0.6 + i) * 1.1) * T - cam.x) * z, y = ((n.y - 0.2 + Math.cos(t * 0.45 + i * 2) * 0.9) * T - cam.y) * z, r = 7 * z;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(230,255,140,${0.55 * pulse})`); g.addColorStop(1, 'rgba(230,255,140,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 0.6 + 0.4 * pulse; ctx.drawImage(a.image, (Math.floor(now / 200 + i) % 4) * 8, 0, 8, 8, Math.round(x - 6 * z), Math.round(y - 6 * z), 12 * z, 12 * z); ctx.globalAlpha = 1; }
  ctx.globalCompositeOperation = 'source-over'; }
// ---- ayam kampung (Kandang Ayam, P1): berkeliaran radius 3 di sekitar kandang siang hari, malam masuk kandang; hanya tampilan (tidak disimpan) ----
const HENS = new Map();
const henFree = (x, y) => walkable(x, y) && !S.buildings.some(o => { const d = C.BUILDINGS[o.type]; return o.type !== 'ladang' && d && x >= o.x && x < o.x + d.w && y >= o.y && y < o.y + d.h; });
function hensOf(b) { const n = C.BUILDINGS.kandang_ayam.hens || 4; let h = HENS.get(b.id);
  if (!h || h.length !== n) { const c = coopSpot(b); h = [...Array(n)].map((_, i) => ({ x: c.x - 0.6 + i * 0.5, y: c.y + (i % 2) * 0.4, tx: null, ty: null, dir: i % 4, walk: false, wait: Math.random() * 3, peck: 0 })); HENS.set(b.id, h); } return h; }
function hensStep(dt) { if (!HENS.size && !S.buildings.some(b => b.type === 'kandang_ayam')) return; const night = inSleepWindow(), ids = new Set();
  for (const b of S.buildings) { if (b.type !== 'kandang_ayam' || !b.done) continue; ids.add(b.id); const c = coopSpot(b);
    for (const e of hensOf(b)) { if (night) { e.x = c.x; e.y = c.y; e.tx = null; e.walk = false; continue; }
      if (e.wait > 0) { e.wait -= dt; e.walk = false; e.peck = Math.max(0, e.peck - dt); if (!e.peck && Math.random() < dt * 0.6) e.peck = 0.35; continue; }
      if (e.tx == null) { for (let k = 0; k < 8; k++) { const x = Math.round(c.x + (Math.random() * 2 - 1) * 3), y = Math.round(c.y + (Math.random() * 2 - 1) * 2.5); if (henFree(x, y)) { e.tx = x + Math.random() * 0.6 - 0.3; e.ty = y + Math.random() * 0.4; break; } }
        if (e.tx == null) { e.wait = 1; continue; } }
      const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy), sp = 0.9 * dt; e.walk = true; e.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
      if (d <= sp) { e.x = e.tx; e.y = e.ty; e.tx = null; e.wait = 1 + Math.random() * 4; } else { e.x += dx / d * sp; e.y += dy / d * sp; } } }
  for (const id of HENS.keys()) if (!ids.has(id)) HENS.delete(id); }
function drawHen(e) { const a = ASSETS.ayam, im = a && a.image, px = Math.round((e.x + 0.5) * T - 16), py = Math.round((e.y + 1) * T - 30);
  if (!im) { ctx.fillStyle = '#f2ead8'; ctx.fillRect(px + 11, py + 18, 10, 8); ctx.fillStyle = '#c0392b'; ctx.fillRect(px + 18, py + 15, 3, 3); return; }
  const row = (e.walk ? 4 : 0) + e.dir, col = e.walk ? Math.floor(performance.now() / 130) % 4 : e.peck > 0 ? 2 : Math.floor(performance.now() / 600) % 2;
  ctx.drawImage(im, col * 32, row * 32, 32, 32, px, py, 32, 32); }
function drawWolf(o) { if (C.NIGHT_THREAT !== 'wolf' && !(ASSETS.babi_hutan && ASSETS.babi_hutan.image)) return drawBoarPlaceholder(o);
  const a = C.NIGHT_THREAT !== 'wolf' ? ASSETS.babi_hutan : ASSETS.serigala, im = a.images && (a.images[o.variant] || a.image), t = performance.now() / 1000;
  const mode = o.mode === 'serang' ? 'serang' : o.moving ? 'jalan' : 'diam', fr = mode === 'serang' ? Math.min(3, Math.floor(o.t / 0.25)) : Math.floor(t * (mode === 'jalan' ? 8 : 3)) % 4;
  if (im) ctx.drawImage(im, fr * 32, (WOLF_ROW[mode] * 4 + o.dir) * 32, 32, 32, Math.round(o.x * T), Math.round(o.y * T), 32, 32);
  else { ctx.fillStyle = a.color; ctx.fillRect(o.x * T + 6, o.y * T + 14, 20, 10); ctx.fillRect(o.x * T + (o.dir === 1 ? 2 : 22), o.y * T + 10, 8, 8); } }
// babi hutan sementara (sprite characters/fauna/babi_hutan.png sedang dibuat Asisten Desain): badan cokelat gelap, moncong, taring
function drawBoarPlaceholder(o) { const x = o.x * T, y = o.y * T, l = o.dir === 1, bob = o.moving ? Math.sin(performance.now() / 70) : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 6, y + 25, 20, 3);
  ctx.fillStyle = '#4a3324'; ctx.fillRect(x + 7, y + 13 + bob, 18, 11); ctx.fillStyle = '#3a271b'; ctx.fillRect(x + 9, y + 11 + bob, 13, 3);
  ctx.fillStyle = '#5b4030'; ctx.fillRect(l ? x + 2 : x + 22, y + 15 + bob, 8, 7); ctx.fillStyle = '#c9a98a'; ctx.fillRect(l ? x + 1 : x + 29, y + 18 + bob, 2, 3);
  ctx.fillStyle = '#f0ead8'; ctx.fillRect(l ? x + 3 : x + 27, y + 21 + bob, 2, 2); ctx.fillStyle = '#111'; ctx.fillRect(l ? x + 5 : x + 25, y + 16 + bob, 1, 1);
  ctx.fillStyle = '#2b1d14'; for (const lx of [9, 13, 18, 22]) ctx.fillRect(x + lx, y + 23, 2, 3 + (o.moving && lx % 2 ? -bob : 0)); }
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
  if (C.THEME !== 'sedang') drawFireflies(now, z);
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
  const wx0 = (C.WEATHER || {})[se];
  if (isRaining() && wx0 === 'hujan_lebat' && ASSETS.cuaca_hujan_lebat) { tile('tint_hujan', 1); tile('cuaca_hujan_lebat', 0.9, -30, 70); drawLightning(now, W, H, z); }
  else if (isRaining()) { tile('tint_hujan', 1); tile('cuaca_hujan', 0.9, -20, 40); }
  else if (wx0 === 'debu' && !isNight()) { tile('tint_kemarau', 1); tile('cuaca_debu', 0.55, 12, -3); }
  else if (wx0 === 'awan' && !isNight()) tile('bayang_awan', 0.5, 6, 3);
  const wx = (C.WEATHER || {})[se]; // cuaca per musim dari tema: panas | daun | salju
  if (!isRaining() && wx === 'panas' && !isNight()) { tile('tint_panas', 1); tile('cuaca_panas', 0.6, 4, -6); }
  else if (!isRaining() && wx === 'daun') tile('cuaca_daun', 0.85, 10, 14);
  if (wx === 'salju') { tile('cuaca_salju', isExtreme() ? 1 : 0.75, 6, 18); if (isExtreme()) { tile('tint_beku', 0.9); stretch('vignette_beku', 0.9); } }
  if (S.mourningUntil > S.t) { tile('duka_overlay', 1); stretch('duka_vignette', 0.8); }
  ctx.globalAlpha = 1; }
// status penduduk (ikon 16px di atas kepala)
const _stImg = {}; const statusImg = n => { if (!_stImg[n]) { _stImg[n] = new Image(); _stImg[n].src = n === 'piala' ? 'assets/icons/status/icon_piala_16.png' : ASSETS.STATUS_DIR + 'status_' + n + '_16.png'; } return _stImg[n]; };
function villagerStatus(v) { const s = [];
  if (v.sick) s.push('sick'); if (v.injured) s.push('injured');
  if (C.HARD_COLD && isHardSeason() && (isExtreme() || S.fireOut) && !inHut(v)) s.push('cold'); if (v.lowMoodDays >= 2 || v.mood < 30) s.push('sad'); if (S.grief || v.griefP) s.push('mourning'); if (v.pialaUntil >= S.day) s.push('piala'); return s; } // piala: juara umum 17-an (14 hari)
function drawVillagerStatus(v, px, py) { villagerStatus(v).slice(0, 2).forEach((n, i) => { const im = statusImg(n); if (im.complete && im.naturalWidth) ctx.drawImage(im, Math.round(px - 8 + (i - 0.5) * 14 + 7), Math.round(py - 36), 16, 16); }); }
// ---- pembusukan stok & penguapan air ----
function spoilDaily() { const P = C.SPOILAGE, pop = Math.max(1, S.villagers.length), fpd = foodPerDay(), free = P.foodFreeDays * fpd;
  if (foodTotal() > free) { const rate = P.foodPerDay * (FX().spoilMult || 1) * (done('lumbung').length ? P.granaryMult : 1);
    const lost = (foodTotal() - free) * rate, fm = S.res.makanan / foodTotal(); S.res.makanan -= lost * fm; S.res.gandum -= lost * (1 - fm);
    S.spoiled = (S.spoiled || 0) + lost; if (lost >= 1) dstat('spoiled', 'makanan', lost); }
  const wpd = pop * C.WATER.perDayPerPop, wf = P.waterFreeDays * wpd;
  if (S.res.air > wf) S.res.air -= (S.res.air - wf) * P.waterEvapPerDay; S.res.air = Math.min(S.res.air, P.waterCapDays * wpd); }

// ---------- statistik harian ----------
function dstat(cat, key, n) { const d = S.dayStats = S.dayStats || {}; (d[cat] = d[cat] || {})[key] = (d[cat][key] || 0) + n; }
function endOfDaySummary() { const d = S.dayStats || {}, day = S.day - 1, from = Math.min(day, S.statsFrom ?? day); S.dayStats = {}; S.statsFrom = S.day; // from<day: hari dilompati (mis. tes/debug) -> label rentang, bukan 'kemarin' yang basi
  const fmt = o => Object.entries(o || {}).map(([k, n]) => `${RES_LABEL[k] ? RES_LABEL[k].toLowerCase() : k}${n > 1 || RES_LABEL[k] ? ' ' + Math.floor(n) : ''}`).join(', ');
  const io = foodDayIO(d), sum = o => Object.values(o).reduce((a, n) => a + n, 0), net = foodTotal() - (S.foodDayStart ?? foodTotal()), other = net - (sum(io.inn) - sum(io.out));
  if (other >= 1) io.inn.lainnya = other; else if (other <= -1) io.out.lainnya = -other; S.foodDayStart = foodTotal(); // v9: pangan masuk/keluar per sumber; selisih (event, pasar, rawat, ...) = lain-lain
  const r = { day, from, gathered: d.gathered || {}, eaten: d.eaten || {}, built: d.built || {}, events: d.events || {}, deaths: d.deaths || {}, foodIn: io.inn, foodOut: io.out, foodNet: net };
  S.lastSummary = r; yearAcc(d, r); if (day < 1) return r;
  const parts = [];
  if (Object.keys(r.gathered).length) parts.push('dikumpulkan ' + fmt(r.gathered));
  if (sum(io.inn) >= 1 || sum(io.out) >= 1) parts.push(`${TX('pangan.ringkasan.masuk', {}, 'pangan masuk')} ${ioText(io.inn) || '0'} | ${TX('pangan.ringkasan.keluar', {}, 'keluar')} ${ioText(io.out) || '0'} (${net >= 0 ? '+' : ''}${Math.round(net)})`);
  else if (Object.keys(r.eaten).length) parts.push('dimakan ' + fmt(r.eaten));
  if (Object.keys(r.built).length) parts.push('dibangun ' + Object.entries(r.built).map(([k, n]) => n > 1 ? `${k} ×${n}` : k).join(', '));
  if (Object.keys(r.events).length) parts.push('kejadian: ' + Object.keys(r.events).join(', '));
  if (Object.keys(r.deaths).length) parts.push('berpulang: ' + Object.keys(r.deaths).join(', '));
  log(`📊 Ringkasan hari ${from < day ? from + '–' + day : day}: ${parts.length ? parts.join('; ') : 'hari yang tenang'}.`); return r; }
function summaryUI() { const r = S.lastSummary; if (!r || r.day < 1) return '<i>Belum ada hari yang lewat.</i>';
  const row = (lbl, o) => { const e = Object.entries(o); return `<div><b>${lbl}:</b> ${e.length ? e.map(([k, n]) => `${RES_LABEL[k] || k} ${Math.floor(n)}`).join(', ') : '-'}</div>`; };
  return `<div style="opacity:.8">Hari ${r.from != null && r.from < r.day ? r.from + '–' + r.day : r.day}</div>` + row('Dikumpulkan', r.gathered) + (r.foodIn ? `<div id="sumPangan"><b>${TX('pangan.ringkasan.judul_masuk', {}, 'Pangan masuk')}:</b> ${ioText(r.foodIn) || '-'}<br><b>${TX('pangan.ringkasan.judul_keluar', {}, 'Pangan keluar')}:</b> ${ioText(r.foodOut) || '-'} <small>(${r.foodNet >= 0 ? '+' : ''}${Math.round(r.foodNet)})</small></div>` : row('Dimakan', r.eaten)) + row('Dibangun', r.built) + `<div><b>Kejadian:</b> ${Object.keys(r.events).join(', ') || '-'}</div>`; }
// ---------- pencapaian (A01-A24, disimpan terpisah dari save game) ----------
const ACH_KEY = 'desaMandiriPencapaian';
let ACH = (() => { try { return JSON.parse(localStorage.getItem(ACH_KEY)) || {}; } catch (e) { return {}; } })(); ACH.unlocked = ACH.unlocked || {};
const achAll = () => (TEXT && TEXT.pencapaian) || [];
// T-04: pencapaian yang belum bisa diraih (riset/kontrak/festival belum ada, tipe syarat belum didukung) disembunyikan & tidak dihitung bila C.ACH_HIDE_UNAVAILABLE
function achReqOk(sy) { if (!sy) return false; const tn = techNodes().map(n => n.id);
  if (sy.tipe === 'riset' && ((sy.target && sy.target !== 'semua' && !tn.includes(sy.target)) || ((!sy.target || sy.target === 'semua') && sy.jumlah > tn.length))) return false;
  if (sy.tipe === 'kontrak_selesai' && !C.CONTRACTS) return false; if (sy.tipe === 'adakan_festival' && !C.FESTIVALS) return false;
  if (sy.tipe === 'gabungan') return (sy.semua || []).every(achReqOk); return achProgress(sy) !== null; }
const achList = () => { const L = achAll(); if (!C.ACH_HIDE_UNAVAILABLE || !S) return L; return L.filter(a => achReqOk(a.syarat)); };
const achHidden = () => achAll().filter(a => !achList().includes(a)).map(a => a.id);
const achText = () => (TEXT && TEXT.ui_progres && TEXT.ui_progres.pencapaian) || {};
const achUnsupported = new Set();
function achProgress(sy) { // -> angka progres, atau null jika tipe belum didukung
  switch (sy.tipe) {
    case 'bangun': case 'kumpulkan': case 'capai_penduduk': case 'riset': case 'transaksi_pasar': case 'panen': case 'simpan_pangan': case 'hari_pangan': case 'capai_hari': case 'alami_event': case 'capai_era':
      return questProgress({ tujuan: sy });
    case 'lewati_musim': return sy.target === 'dingin' || sy.target === C.HARD_SEASON ? (S.wintersOk || 0) : null;
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
    case 'makan': return 'Makan'; case 'tidur': return t.asleep ? (t.where === 'bed' ? 'Tidur di rumah' : 'Tidur di luar') : 'Pulang untuk tidur'; case 'main': return 'Bermain'; case 'diam': return 'Santai'; case 'setor': return 'Menyetor ke gudang';
    case 'kumpul': return t.src && t.src !== 'meramu' ? taskName(t.src) : 'Mengumpulkan ' + String(RES_LABEL[t.res] || t.res).toLowerCase();
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
  setHTML('vpDyn', traitsHTML(v) + `<div style="font-size:12px;margin:6px 0">${v.age} th · ${role(v)}<br>Sedang: <b>${TASK_TEXT(v.task)}</b>${v.sick ? ` · <span style="color:#a63e34">Sakit ${v.sick.lvl}</span>` : ''}${v.injured ? ' · Terluka' : ''}${v.traumaUntil >= S.day ? ' · Trauma' : ''}${v.lowMoodDays >= 2 ? ` · Murung ${v.lowMoodDays} hari` : ''}${v.carry ? ` (membawa ${v.carry.n} ${RES_LABEL[v.carry.res].toLowerCase()})` : ''}</div>
    ${bar('Kenyang', v.hunger, '--bar-hunger', 'f-red', 'ikon_need_hunger')}${bar('Energi', v.energy, '--bar-energy', 'f-blue', 'ikon_need_energy')}${bar('Suasana hati', v.mood, '--bar-mood', 'f-yellow', 'ikon_need_mood')}${bar('Kesehatan', v.health ?? 100, '--bar-health', 'f-green', 'ikon_need_health')}
    ${familyHTML(v)}${relHTML(v)}<h3>Keahlian</h3>${Object.entries(SK).map(([k, l]) => `<div class="row"><span>${uiIco('ikon_skill_' + k)}${l}</span><span>${'★'.repeat(Math.min(5, Math.floor((v.skills[k] || 0) * 2)))}${'☆'.repeat(5 - Math.min(5, Math.floor((v.skills[k] || 0) * 2)))} ${(v.skills[k] || 0).toFixed(2)}</span></div>`).join('')}
    <h3>Riwayat</h3><ul>${(v.history || []).map(h => `<li>${h}</li>`).join('') || '<li>Belum ada catatan.</li>'}</ul>`); }
// panel keluarga: umur, tahap usia, status, pasangan, orang tua, anak (TEKS panel_keluarga, cadangan bahasa Indonesia)
function familyHTML(v) { const K = (k, ex, fb) => TX('panel_keluarga.' + k, ex || {}, fb);
  const st = stageOf(v), p = partnerOf(v), ex = famEx(v);
  let rel = p ? K(v.pregnantUntil || p.pregnantUntil ? 'status_hubungan.menanti_bayi' : 'status_hubungan.berpasangan', { pasangan: p.name }, (v.pregnantUntil || p.pregnantUntil) ? 'Menanti buah hati' : `Berpasangan dengan ${p.name}`)
    : v.formerPartner ? K('status_hubungan.ditinggal', ex, 'Ditinggal pasangan') : v.closeTo != null && nameOf(v.closeTo) ? K('status_hubungan.dekat', { pasangan: nameOf(v.closeTo) }, `Sedang dekat dengan ${nameOf(v.closeTo)}`) : K('status_hubungan.lajang', null, 'Lajang');
  if (isKid(v)) rel = '–';
  const pas = p ? p.name : v.formerPartner ? K('format.pasangan_berduka', { pasangan: v.formerPartner }, `${v.formerPartner} (telah berpulang)`) : K('kosong.pasangan', null, 'Belum ada');
  const ay = nameOf(v.fatherId), ib = nameOf(v.motherId);
  const ortu = ay || ib ? K('format.orang_tua', { ayah: ay || '?', ibu: ib || '?' }, `${ay || '?'} & ${ib || '?'}`) : (v.joined ?? 1) <= 1 && v.born == null ? K('kosong_pendiri', null, 'Pendatang pertama desa') : K('kosong.orang_tua', null, 'Belum ada');
  const kids = childrenOf(v), anak = kids.length ? kids.map(k => `${k.name} (${k.age})`).join(', ') : K('kosong.anak', null, 'Belum ada');
  const row = (k, fb, val) => `<div class="row"><span>${K('label.' + k, null, fb)}</span><span style="text-align:right">${val}</span></div>`;
  return `<h3 id="vpFam">${K('judul', null, 'Keluarga')}</h3>
    ${row('umur', 'Umur', K('format.umur', { umur: v.age }, `${v.age} tahun`))}
    ${row('tahap_usia', 'Tahap usia', `<span title="${K('tooltip.' + st, null, '')}">${K('tahap_usia.' + st, null, st)}</span>`)}
    ${row('status_hubungan', 'Status', rel)}${row('pasangan', 'Pasangan', pas)}${row('orang_tua', 'Orang tua', ortu)}${row('anak', 'Anak', anak)}`; }
document.addEventListener('change', e => { if (e.target.id === 'favSel' && selVid != null) { const v = S.villagers.find(x => x.id === selVid); if (!v) return;
  v.fav = e.target.value || null; vhist(v, v.fav ? `Tugas favorit diatur: ${JOB_LABEL[v.fav]}` : 'Tugas favorit dihapus'); } });
function tutAction(name) { if (tutHook(S.tutorialStep).aksi === name) { S.tutorialStep++; tutorialUI(); } }
// ---------- dunia ----------
let lastDay = 1;
function step(dt) {
  S.t += dt; S.day = Math.floor(S.t / C.DAY_LENGTH_SEC) + 1;
  { const fd = foodDays(), k = Math.min(1, dt / (C.DAY_LENGTH_SEC * (C.FOOD_DAYS_SMOOTH || 0.01))); S.fdShow = S.fdShow == null || fd < 1 || Math.abs(fd - S.fdShow) > 2.5 ? fd : S.fdShow + (fd - S.fdShow) * k; } // v9c: angka 'hari' di lencana dihaluskan (makan/setor membuatnya meloncat)
  if (S.event) return;
  for (const v of S.villagers) updateVillager(v, dt);
  checkQuest();
  updateMerchant(dt); tujuanTick(); hensStep(dt);
  for (const v of S.villagers.slice()) if (v.health <= 0) killVillager(v, v.lastHurt === 'serangan' && v.injured ? 'serangan' : v.hunger <= 0 ? (isHardSeason() && C.HARD_COLD ? 'dingin' : 'kelaparan') : 'sakit');
  seasonStep(dt); scheduleStep(); relTick(dt);
  const winter = isHardSeason() && !!FX().fieldsStop;
  for (const b of S.buildings) if (b.type === 'ladang' && b.done && b.stage === 'tumbuh' && canGrow(b) && (b.grow += dt / C.DAY_LENGTH_SEC) >= growDaysOf(b)) b.stage = 'siap';
  if (!winter) for (const n of S.nodes) if (n.type === 'semak' && n.amount <= 0 && (n.regrow -= dt / (isRaining() ? (FX().rainBushRegrowMult || 1) : 1)) <= 0) n.amount = C.NODE_AMOUNT.makanan;
  foodNodesStep(dt); noteStumps(); S.nodes = S.nodes.filter(n => n.amount > 0 || n.type === 'semak' || n.type === 'buah' || n.type === 'umbi');
  if (S.day !== lastDay) { lastDay = S.day; newDay(); }
  if (!S.event) agustusStep(); if (!S.event) directorTick(); // Juru Cerita (09:00) & Agustusan (cerita.js)
  if (isHardSeason() && S.villagers.some(v => v.hunger <= 5)) S.winterStarve = true;
}
// v9c: warga berinisiatif sendiri bila kepala desa belum menaruh apa-apa: api unggun (hari 2) & gubuk pertama (hari 4), dibayar dari stok bila cukup
const autoNames = () => { const a = adults().slice().sort(() => Math.random() - 0.5); return { nama: a[0] ? a[0].name : 'Warga', nama2: a[1] ? a[1].name : (a[0] ? a[0].name : 'warga') }; }; // TEKS v1.6.1 otomatis.* ({nama}/{nama2})
function autoBuildDaily() { const A = C.AUTO_BUILD; if (!A) return;
  const place = (type, minR) => { for (let r = minR; r < 9; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = Math.round(CAMP.x) + dx, y = Math.round(CAMP.y) + dy; if (validSpot(type, x, y)) { for (const [k, n] of Object.entries(C.BUILDINGS[type].cost)) S.res[k] -= n; addBuilding(type, x, y, false); return true; } } return false; };
  if (S.day >= A.fireDay && !S.buildings.some(b => b.type === 'apiunggun') && canAfford(C.BUILDINGS.apiunggun.cost) && place('apiunggun', 1))
    log('🔥 ' + TX('otomatis.api_unggun', autoNames(), 'Warga menyusun batu dan kayu: api unggun pertama akan dinyalakan di perkemahan.'));
  if (S.day >= A.hutDay && !S.buildings.some(b => b.type === 'gubuk') && canAfford(C.BUILDINGS.gubuk.cost) && place('gubuk', 2))
    log('🏠 ' + TX('otomatis.gubuk', autoNames(), 'Warga tak tahan tidur di bawah langit: mereka mulai mendirikan gubuk sendiri.'));
  // v10: gubuk pertama (kapasitas 2) penuh oleh 2 warga awal -> tak ada pendatang/kelahiran. Warga menambah gubuk sendiri sampai A.hutMax bila tak ada tempat kosong & tak ada rumah yang sedang dibangun
  else if (A.hutMoreDay && S.day >= A.hutMoreDay && capacity() <= S.villagers.length && S.buildings.filter(b => b.type === 'gubuk').length < (A.hutMax || 2)
    && !S.buildings.some(b => isHouse(b) && !b.done) && canAfford(C.BUILDINGS.gubuk.cost) && place('gubuk', 2))
    { const n = autoNames(); log('🏠 ' + TX('otomatis.gubuk_tambahan', { ...n, gubuk: C.BUILDINGS.gubuk.nama }, `${n.nama} dan ${n.nama2} mendirikan ${C.BUILDINGS.gubuk.nama} lagi supaya ada tempat untuk pendatang dan anak.`)); }
  bedHintDaily(); }
// v10: petunjuk bila hari >= A.bedHintDay belum ada tempat tidur kosong (gubuk/rumah) -> pendatang & anak tidak akan datang
const bedHintOn = () => { const A = C.AUTO_BUILD || {}; return S.day >= (A.bedHintDay || 6) && capacity() <= S.villagers.length && !S.buildings.some(b => isHouse(b) && !b.done); };
const bedHintText = () => TX('petunjuk.butuh_gubuk', { gubuk: C.BUILDINGS.gubuk.nama }, `Pendatang dan anak-anak butuh tempat tidur. Bangun ${C.BUILDINGS.gubuk.nama} supaya desa bisa bertambah.`);
function bedHintDaily() { if (!bedHintOn()) return; if (!S.bedHintLogged) { S.bedHintLogged = true; log('🏠 ' + bedHintText()); } }
function newDay() {
  endOfDaySummary(); autoBuildDaily(); nodesRegrowDaily(); harapanDaily(); autosaveDaily();
  const pop = S.villagers.length; if (!pop) { log('Desa telah kosong... Mulai permainan baru.'); return; }
  // musim
  if (seasonInfo().day === 1) { const se = season();
    const pf = TEXT && TEXT.pasar && TEXT.pasar.pesan_fluktuasi, fid = C.THEME === 'sedang' ? { dingin: 'musim_dingin_pangan', semi: 'semi_kayu', panas: 'panas_makanan' }[se] : null;
    if (pf && fid && marketOpen()) { const x = pf.find(o => o.id === fid); if (x) log('📈 ' + fill(x.teks)); } }
  // air
  const wNeed = waterNeed();
  if (S.res.air >= wNeed) S.res.air -= wNeed; else { S.res.air = 0; S.villagers.forEach(v => { v.mood -= C.WATER.shortageMood; v.health -= C.WATER.shortageHealth; });
    log('⚠️ Persediaan air habis! Penduduk kehausan. Naikkan prioritas Air atau bangun Sumur.'); }
  if (done('sumur').length) S.villagers.forEach(v => v.mood = Math.min(100, v.mood + C.WATER.wellMoodPerDay));
  // produksi bangunan
  const trade = (cfg, label) => { if (Object.entries(cfg.in).every(([k, n]) => S.res[k] >= n)) {
    Object.entries(cfg.in).forEach(([k, n]) => S.res[k] -= n); Object.entries(cfg.out).forEach(([k, n]) => S.res[k] = (S.res[k] || 0) + n); return true; } };
  done('bengkel').forEach(() => trade(C.WORKSHOP_DAILY));
  done('pasar').forEach(() => S.res.kayu >= C.MARKET_DAILY.minKayu && trade(C.MARKET_DAILY));
  // stok musim dingin
  const se = season(), buffer = foodPerDay() * C.HARD_BUFFER_DAYS;

  marketNewDay();
  checkEra();
  const mood = S.villagers.reduce((a, v) => a + v.mood, 0) / pop;
  S.moodGoodDays = mood >= C.SPAWN.minMood ? S.moodGoodDays + 1 : 0;
  { const H = C.SPAWN.happy || {}, minV = Math.min(...S.villagers.map(v => v.mood)); // v9b: rata-rata >= H.mood DAN tidak ada warga < H.minMood, berturut-turut
    S.happyDays = mood >= (H.mood ?? 101) && minV >= (H.minMood ?? 0) ? (S.happyDays || 0) + 1 : 0; S.happyMinMood = minV;
    if ((S.happyDays || 0) >= (H.days || 1e9)) S.happyActiveDays = (S.happyActiveDays || 0) + 1; }
  const A = attraction(), sp = C.SPAWN;
  if (A.ok && Math.random() < A.chance * monFxLast('newcomerMult', 1) * (teladanBonus('newcomerMult') || 1)) {
    if (A.happy) { log('💌 ' + TX('pangan.daya_tarik.pendatang', {}, 'Kabar desa yang bahagia sampai ke kampung sebelah… Seorang perantau ingin tinggal.')); S.happySpawns = (S.happySpawns || 0) + 1; }
    const h = houses()[0], c = h ? doorPos(h) : CAMP; spawnVillager(c.x, c.y + 0.5); S.lastSpawnDay = S.day; S.newcomerSpawns = (S.newcomerSpawns || 0) + 1;
    const nv = S.villagers[S.villagers.length - 1]; if (nv) { nv.newcomerUntil = S.day + 3; mapEvent('pendatang', nv.x, nv.y, EV_SEC(), 'v' + nv.id); } // ikon pendatang di atas kepala 3 hari
  }
  const need = pop * C.SPAWN.foodPerDayPerPop;
  if (S.villagers.some(v => v.hunger <= 5)) log('⚠️ Ada penduduk kelaparan parah!');
  threatDaily(); if (!S.villagers.length) return; foodSourcesDaily(); lifeDaily(); if (!S.villagers.length) return;
  // pelacak pencapaian: beruntun hari pangan & musim dingin yang terlewati
  const fdays = foodTotal() / foodPerDay(); S.foodStreak = fdays >= 5 ? (S.foodStreak || 0) + 1 : 0; S.foodStreakMax = Math.max(S.foodStreakMax || 0, S.foodStreak);
  if (S.prevSeason === C.HARD_SEASON && se !== C.HARD_SEASON) { if (!S.winterStarve) S.wintersOk = (S.wintersOk || 0) + 1; S.winterStarve = false; } S.prevSeason = se;
  checkAch();
  storyNewDay(); if (!S.villagers.length) return;
  wishDaily(); tujuanDaily();
  flavorLog(); maybeEvent();
  log(`Fajar menyingsing. Penduduk: ${S.villagers.length}, makanan: ${Math.floor(foodTotal())}, air: ${Math.floor(S.res.air)}.`);
}
// daya tarik desa (v9): syarat pendatang + bonus desa bahagia (rata-rata mood >= SPAWN.happy.mood selama happy.days hari -> peluang & jeda lebih baik)
function attraction() { const sp = C.SPAWN, H = sp.happy || {}, pop = S.villagers.length, mood = pop ? S.villagers.reduce((a, v) => a + v.mood, 0) / pop : 0;
  const lowMood = pop ? Math.min(...S.villagers.map(v => v.mood)) : 0, happy = (S.happyDays || 0) >= (H.days || 1e9), fd = foodDays(), needFd = sp.foodDays ?? sp.foodDaysPerPop, free = capacity() - pop - S.villagers.filter(v => v.pregnantUntil).length;
  const cd = (sp.cooldownDays + (sp.cooldownPerPop || 0) * pop) * ((S.era | 0) >= eraIndex(C.PREGNANCY.minEra) ? C.PREGNANCY.newcomerCooldownMult : 1) * (happy ? H.cooldownMult || 1 : 1) - (done('balai').length ? C.TOWN_HALL_SPAWN_COOLDOWN_CUT : 0) + (teladanBonus('spawnCooldownAdd') || 0);
  const cdLeft = Math.max(0, Math.ceil(cd - (S.day - S.lastSpawnDay))), moodOk = S.moodGoodDays >= sp.moodDays, foodOk = fd >= needFd, houseOk = free > 0;
  const ok = foodOk && houseOk && moodOk && cdLeft <= 0, chance = happy ? H.chancePerDay ?? 1 : sp.chancePerDay ?? 1;
  const score = (moodOk ? 1 : 0) + (happy ? 1 : 0) + (foodOk ? 1 : 0) + (houseOk ? 1 : 0);
  return { mood, lowMood, happyMinMood: H.minMood, happy, happyDays: S.happyDays || 0, needHappy: H.days, happyMood: H.mood, moodOk, minMood: sp.minMood, fd, needFd, foodOk, free, houseOk, cdLeft, ok, chance, score }; }
function attractionHTML() { const A = attraction(), K = (k, ex, fb) => TX('pangan.daya_tarik.' + k, ex || {}, fb), ic = ASSETS.ikon_daya_tarik && ASSETS.ikon_daya_tarik.ui;
  const lvl = A.score >= 4 ? K('tinggi', null, 'Tinggi') : A.score >= 3 ? K('sedang', null, 'Sedang') : K('rendah', null, 'Rendah');
  const tip = K('tooltip', null, 'Pendatang datang bila suasana hati baik, stok pangan cukup, dan ada tempat tidur kosong. Desa yang bahagia lebih sering didatangi perantau.');
  const row = (ok, t) => `${ok ? '✅' : '▫️'} ${t}`;
  return `<div id="dayaTarik" title="${tip}" data-score="${A.score}" data-happy="${A.happy ? 1 : 0}" style="margin-top:6px">${ic ? `<img class="ico" src="${ic}" alt=""> ` : '💗 '}<b>${K('judul', null, 'Daya tarik desa')}: ${lvl}</b>${'★'.repeat(A.score)}${'☆'.repeat(4 - A.score)}<br>`
    + [row(A.moodOk, K('mood', { jumlah: Math.round(A.mood), jumlah2: A.minMood }, `Suasana hati ${Math.round(A.mood)} (≥ ${A.minMood})`)),
       row(A.happy, K('bahagia', { jumlah: Math.min(A.happyDays, A.needHappy), jumlah2: A.needHappy, jumlah3: A.happyMood, jumlah4: A.happyMinMood }, `Desa bahagia ${Math.min(A.happyDays, A.needHappy)}/${A.needHappy} hari`)
         + ` <small>${K('bahagia_syarat', { jumlah: A.happyMood, jumlah2: A.happyMinMood }, `(rata-rata mood ≥ ${A.happyMood}, tak ada warga < ${A.happyMinMood})`)}</small>`
         + (!A.happy && A.lowMood < (A.happyMinMood || 0) ? ` <small class="murung">(${K('murung', { jumlah: Math.round(A.lowMood) }, `ada warga murung: ${Math.round(A.lowMood)}`)})</small>` : '') + (A.happy ? ' ' + K('bonus', null, '→ perantau lebih sering datang') : '')),
       row(A.foodOk, K('pangan', { jumlah: A.fd.toFixed(1), jumlah2: A.needFd }, `Stok pangan ${A.fd.toFixed(1)}/${A.needFd} hari`)),
       row(A.houseOk, K('rumah', { jumlah: Math.max(0, A.free) }, `Tempat tidur kosong: ${Math.max(0, A.free)}`)),
       A.cdLeft > 0 ? `⏳ ${K('jeda', { jumlah: A.cdLeft }, `Pendatang berikutnya paling cepat ${A.cdLeft} hari lagi`)}` : ''].filter(Boolean).join('<br>') + '</div>'; }
function eraReqStatus(e) { const r = e.req || {}, out = [];
  if (r.pop) out.push([`Penduduk ${S.villagers.length}/${r.pop}`, S.villagers.length >= r.pop]);
  for (const [b, n] of Object.entries(r.bangunan || {})) out.push([`${C.BUILDINGS[b].nama} ${done(b).length}/${n}`, done(b).length >= n]);
  if (r.foodDays) { const d = foodTotal() / foodPerDay(); out.push([`Stok makanan ${d.toFixed(1)}/${r.foodDays} hari`, d >= r.foodDays]); }
  for (const [k, n] of Object.entries(r.res || {})) out.push([`${RES_LABEL[k]} ${Math.floor(S.res[k] || 0)}/${n}`, (S.res[k] || 0) >= n]);
  return out; }
function checkEra() { const next = C.ERAS[(S.era | 0) + 1]; if (!next) return;
  if (eraReqStatus(next).every(x => x[1])) { S.era = (S.era | 0) + 1; const nb = Object.entries(C.BUILDINGS).filter(([, d]) => d.era === next.id).map(([, d]) => d.nama);
    log(`🎉 Desa naik ke era ${next.nama}!${nb.length ? ' Bangunan baru: ' + nb.join(', ') + '.' : ''}`); buildBuildBar(); } }

// ================= CERITA P0 (cerita.js): Juru Cerita, dilema, momen kecil, akibat tertunda (S.pending), Agustusan, penyerap pangan =================
const adults = () => S.villagers.filter(v => !isKid(v));
const DIRC = () => C.DIRECTOR, AGC = () => C.AGUSTUSAN, SKC = () => C.STORY_SINK;
const dayOfYear = (d = S.day) => ((d - 1) % yearDays()) + 1;
const storySeason = () => (C.STORY_SEASON_ALIAS || {})[season()] || season(); // tema sedang: musim dipetakan ke musim Nusantara di data dilema
function storyInit() { if (!S) return;
  S.director = S.director || { streak: 0, days: '', checked: 0, modal: { day: 0, n: 0, dil: 0 }, lastModalT: -1e9, lastById: {}, lastCat: {}, seen: {}, mday: {}, landed: [], counts: {} };
  S.pending = S.pending || []; S.buffs = S.buffs || []; S.lomba = S.lomba || { year: -1, history: [] }; S.debts = S.debts || []; S.recurring = S.recurring || [];
  S.storyFood = S.storyFood || { in: 0, out: 0, sink: 0 }; S.monkeyDays = S.monkeyDays || []; S.decisions = S.decisions || []; S.neighborRel = S.neighborRel || 0; S.freeFields = S.freeFields || 0; tujuanInit(); }
function markMeaningful(kind) { if (!S) return; storyInit(); const m = S.director.mday; if (!m[S.day]) m[S.day] = kind; }
// buff berdurasi: { k, mult, until (null = permanen), ids? }
function addBuff(k, mult, days) { storyInit(); S.buffs.push({ k, mult, until: days == null ? null : S.day + days }); }
function buffMult(k) { if (!S || !S.buffs) return 1; let m = 1; for (const b of S.buffs) if (b.k === k && (b.until == null || b.until >= S.day)) m *= b.mult; return m; }
const threatBuff = jenis => buffMult('ancaman_' + jenis) * buffMult('ancaman_semua');
// pangan: catat masuk/keluar dari fitur cerita (laporan "tidak menambah pangan bersih")
function foodLedger(n, sink) { storyInit(); if (n > 0) S.storyFood.in += n; else { S.storyFood.out -= n; if (sink) S.storyFood.sink -= n; } }
function takeFood(n, why) { n = Math.min(n, foodTotal()); if (n <= 0) return 0; const fm = S.res.makanan / Math.max(1e-9, foodTotal()); S.res.makanan -= n * fm; S.res.gandum -= n * (1 - fm);
  foodLedger(-n, true); dstat('sink', why || 'pesta', n); return n; }
// penyerap surplus pangan berskala stok (syukuran/pesta/kenduri); pandai_masak membuat pesta 10% lebih hemat
const feastMult = () => S.villagers.some(v => tList(v).some(t => t.feastCostMult)) ? Math.min(...S.villagers.flatMap(v => tList(v).map(t => t.feastCostMult || 1))) : 1;
// musim sulit tanpa panen (sedang: dingin, ladang berhenti) -> cadangan musim itu tidak ikut dibagi
const hardReserveDays = () => { const H = C.HARD_SEASON, F = (C.SEASON_FX || {})[H] || {}; if (!F.fieldsStop) return 0;
  const i = C.SEASONS.indexOf(H), se = season(); return se === H || se === C.SEASONS[(i + C.SEASONS.length - 1) % C.SEASONS.length] ? (C.SEASON_LEN[H] || 0) * (C.HARD_HUNGER_MULT || 1) : 0; }; // hanya menjelang & selama musim sulit
function surplusSink(cfg, why) { if (!cfg) return 0; const pop = S.villagers.length, fpd = foodPerDay(), surplus = Math.max(0, foodTotal() - fpd * ((cfg.surplusDays ?? 20) + hardReserveDays()));
  return takeFood(((cfg.perPop || 0) * pop + surplus * (cfg.surplusFrac || 0)) * feastMult(), why); }
// ---- syarat (dilema, momen, akibat tertunda) ----
const anyTrait = id => S.villagers.some(v => (v.traits || []).includes(id) && traitsVisible(v));
const sickN = lvl => S.villagers.filter(v => v.sick && (!lvl || v.sick.lvl === lvl)).length;
function syaratOk(s, ctx = {}) { if (!s) return true;
  for (const [k, n] of Object.entries(s)) {
    const ok = k === 'salahSatu' ? n.some(x => syaratOk(x, ctx)) : k === 'popMin' ? S.villagers.length >= n : k === 'makananMin' ? S.res.makanan >= n : k === 'gandumMin' ? (S.res.gandum || 0) >= n
      : k === 'ladangMin' ? done('ladang').length >= n : k === 'ladangTumbuh' ? S.buildings.filter(b => b.type === 'ladang' && b.stage === 'tumbuh').length >= n
      : k === 'sakitParah' ? sickN('parah') >= n : k === 'sakit' ? sickN() >= n : k === 'curianMonyet7' ? (S.monkeyDays || []).filter(d => S.day - d < 7).length >= n
      : k === 'seranganHari' ? S.lastAttackDay != null && S.day - S.lastAttackDay <= n : k === 'hariMusimMin' ? seasonInfo().day >= n : k === 'kekeringan' ? !!(S.drought && S.day <= S.drought.until) === n
      : k === 'kayuBawah' ? S.res.kayu < n : k === 'batuBawah' ? S.res.batu < n : k === 'famine' ? ['waspada', 'bahaya', 'kritis', 'kolaps'].indexOf(famineLevel()) >= ['waspada', 'bahaya', 'kritis', 'kolaps'].indexOf(n) && famineLevel() !== 'aman'
      : k === 'musim' ? storySeason() === n : k === 'tanpaSifat' ? !anyTrait(n) : k === 'adaSifat' ? anyTrait(n) : k === 'foodDaysBawah' ? foodDays() < n
      : k === 'moodPendatangBawah' ? (ctx.newcomers || []).some(id => { const v = vById(id); return v && v.mood < n; }) : k === 'bangunan' ? done(n).length > 0
      : k === 'rumahBaruHari' ? houses().some(h => h.doneDay != null && S.day - h.doneDay <= n) && houses().length >= 2 : k === 'hujan' ? isRaining() === n : k === 'anak' ? S.villagers.filter(v => isKid(v)).length >= n : true;
    if (!ok) return false; }
  return true; }
// ---- efek cerita (§4.2); kunci lama diteruskan ke applyEffects ----
const LEGACY_FX = ['suasana_hati', 'energi', 'penduduk', 'hari_kerja_hilang', 'progres_riset', 'harga_jual_pangan', 'harga_beli_pangan', 'kesehatan', 'kesehatan_satu', 'pertumbuhan_ladang', 'kesehatan_bangunan'];
const resAlias = k => (k in S.res) ? k : (SKC().resAlias || {})[k];
// biaya dalam sumber daya yang belum ada -> pengganti; hadiah sumber daya yang belum ada dibuang
function resolveCost(ef) { const out = {};
  for (const [k, n] of Object.entries(ef || {})) { if (typeof n !== 'number' || LEGACY_FX.includes(k) || ['buah', 'ikan', 'daging'].includes(k)) { out[k] = n; continue; }
    if (k in S.res) { out[k] = (out[k] || 0) + n; continue; } const a = n < 0 && resAlias(k); if (a) out[a] = (out[a] || 0) + n; else out[k] = n; /* negatif tak dikenal = biaya (tak terbayar); positif = kunci efek (P1: harga_jual_makanan_permanen, energi_aktor, ...) */ }
  return out; }
const costOf = ef => Object.entries(ef).filter(([k, n]) => typeof n === 'number' && n < 0 && k in S.res).reduce((a, [, n]) => a - n, 0);
function optEffects(p) { let ef = resolveCost(p.efek); if (!affordable(ef) && p.biayaAlt) { const alt = { ...ef }; for (const [k, n] of Object.entries(ef)) if (typeof n === 'number' && n < 0 && k in S.res) delete alt[k]; Object.assign(alt, resolveCost(p.biayaAlt)); if (affordable(alt)) ef = alt; } return ef; }
const griefM = o => traitMult(o, 'griefMult') * monFxLast('griefMult', 1); // sabar/religius 0.7; Masjid Kayu 0.75
const relAll = (n, list = S.villagers) => { for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) relAdd(list[i], list[j], n, 'cerita'); };
function applyStoryEffects(ef, ctx = {}) { const A = ctx.aktor || [], va = vById(A[0]), vb = vById(A[1]), moodTo = (v, n) => { if (v) v.mood = Math.max(0, Math.min(100, v.mood + n)); };
  for (const [k, n] of Object.entries(ef || {})) {
    if (k in S.res && typeof n === 'number') { const before = S.res[k]; applyEffects({ [k]: n }, 'cerita'); if (k === 'makanan' || k === 'gandum') foodLedger(S.res[k] - before); continue; }
    if (LEGACY_FX.includes(k)) { if (k === 'penduduk' && n > 0) { const ids0 = S.villagers.map(v => v.id); applyEffects({ penduduk: n }, 'cerita'); ctx.newcomers = S.villagers.filter(v => !ids0.includes(v.id)).map(v => v.id); } else applyEffects({ [k]: n }, 'cerita'); continue; }
    switch (k) {
      case 'mood_aktor': case 'mood_A': moodTo(va, n); break; case 'mood_B': moodTo(vb, n); break; case 'mood_AB': moodTo(va, n); moodTo(vb, n); break;
      case 'mood_sifat': for (const [t, m] of Object.entries(n)) S.villagers.filter(v => (v.traits || []).includes(t)).forEach(v => moodTo(v, m)); break;
      case 'mood_anak': S.villagers.filter(isKid).forEach(v => moodTo(v, n)); break;
      case 'mood_tertua': moodTo(S.villagers.slice().sort((a, b) => ageOf(b) - ageOf(a))[0], n); break;
      case 'energi_lelah': { const v = adults().sort((a, b) => a.energy - b.energy)[0]; if (v) v.energy = Math.min(100, v.energy + n); break; }
      case 'rel_AB': if (va && vb) n > 0 ? relAdd(va, vb, n, 'cerita') : relSet(va, vb, relGet(va, vb) + n); break;
      case 'rel_A_semua': if (va) S.villagers.forEach(o => o !== va && relAdd(va, o, n, 'cerita')); break;
      case 'rel_semua': relAll(n); break;
      case 'rel_acak': { const a = pick(S.villagers), b = pick(S.villagers.filter(o => o !== a)); if (a && b) n > 0 ? relAdd(a, b, n, 'cerita') : relSet(a, b, relGet(a, b) + n); break; }
      case 'rel_tetangga': S.neighborRel = Math.max(-5, Math.min(5, (S.neighborRel || 0) + n)); break;
      case 'sembuh_mult': addBuff('sembuh', n, 7); break; case 'mati_parah_mult': addBuff('matiParah', n, 7); break;
      case 'tanam_mult': addBuff('tanam', n.kali, n.hari); break;
      case 'ancaman_mult': for (const [j, m] of Object.entries(n)) if (j !== 'hari') addBuff('ancaman_' + j, m, n.hari); break;
      case 'tikus_mult': typeof n === 'number' ? addBuff('tikus', n, null) : addBuff('tikus', n.kali, n.hari); break;
      case 'hewan_peliharaan': S.pet = n; break;
      case 'bangun_gratis': if (n === 'orang_orangan' || n === 1 || n === true) { if (placeScarecrow()) log('🌾 ' + TX('dilema_ui.orang_orangan_berdiri', { nama: (va || pick(S.villagers) || { name: 'Warga' }).name }, 'Orang-orangan sawah berdiri di tepi ladang, bajunya berkibar ditiup angin.')); else addBuff('ancaman_monyet', 0.5, 28); } S.scarecrow = S.day; break; // P1: bangunan nyata (tak ada tempat -> monyet x0.5 selama 28 hari)
      case 'biaya_berkala': S.recurring.push({ res: Object.keys(n).find(x => !['tiapHari', 'kali'].includes(x)), n: n[Object.keys(n).find(x => !['tiapHari', 'kali'].includes(x))], every: n.tiapHari, left: n.kali, next: S.day + n.tiapHari }); break;
      case 'teladan_poin': S.teladanPoin = (S.teladanPoin || 0) + n; break;
      case 'ronda': { const c = adults().filter(v => !tList(v).some(t => t.noNightJaga) && !v.sick).sort((a, b) => ((b.traits || []).includes('pemberani') ? 1 : 0) - ((a.traits || []).includes('pemberani') ? 1 : 0)).slice(0, n.orang);
        S.ronda = { ids: c.map(v => v.id), until: S.day + n.malam, energi: n.energiPagi }; break; }
      case 'sakit_acak': for (let i = 0; i < (Array.isArray(n.n) ? rndInt(n.n[0], n.n[1]) : n.n); i++) { const v = pick(S.villagers.filter(o => !o.sick && !isBaby(o))); if (v) makeSick(v, 'ringan', n.jenis === 'diare' ? 'diare' : null); } break;
      case 'kekeringan_selesai': if (S.drought) { S.drought.until = S.day - 1; } break;
      case 'sumur_kemarau_add': S.wellHardAdd = (S.wellHardAdd || 0) + n; break;
      case 'banjir': startFlood(); break;
      case 'longsor': case 'kesehatan_bangunan_dekat': if (k === 'kesehatan_bangunan_dekat') { const bs = S.buildings.filter(b => b.done && b.type !== 'ladang'); for (let i = 0; i < Math.min(2, bs.length); i++) { const b = pick(bs); b.hp = Math.max(0, (b.hp ?? 100) + n); const c = center(b); dustAt(c.x, c.y); floatText(`${n} ${TX('peta_kejadian.kondisi', {}, 'Kondisi')}`, c.x, c.y - 0.5, '#ff9a8a'); mapEvent('rusak', c.x, c.y, EV_SEC(), b.id); } } break;
      case 'ladang_gratis': S.freeFields = (S.freeFields || 0) + n; break;
      case 'tebang_pohon': { const tr = S.nodes.filter(o => o.type === 'pohon').sort((a, b) => dist(b, CAMP) - dist(a, CAMP)); for (let i = 0; i < n && tr.length; i++) S.nodes.splice(S.nodes.indexOf(tr.shift()), 1); break; }
      case 'kerja_bakti_gratis': startKerjaBakti(false, true); break; // P1: kerja bakti sungguhan (tanpa jeda tunggu)
      case 'utang': S.debts.push({ from: S.day, due: S.day + n.hari, res: Object.fromEntries(Object.entries(n).filter(([x]) => x in S.res)), bunga: n.bungaPer7, telatMaks: n.telatMaks, sita: n.sita, telat: 0 }); break;
      case 'tagih_utang': payDebts(true); break;
      case 'pentas_reog': S.lastReog = S.day; break;
      case 'diskon_monumen': S.monumentDiscount = Object.assign(S.monumentDiscount || {}, n); break;
      case 'beri_sifat_acak': { const c = S.villagers.filter(v => !isKid(v) && !(v.traits || []).includes(n) && !v.traitChanged && (v.traits || []).length < TRT().max); const v = pick(c);
        if (v) { v.traits = [...v.traits, n]; v.traitChanged = true; log('✨ ' + TX('sifat.' + n + '.log_terlihat', { nama: v.name }, `${v.name} kini ${TX('sifat.' + n + '.kata', {}, n)}.`)); } break; }
      case 'kentongan': S.kentongan = true; break;
      case 'buff': addBuff(n.k, n.mult, n.hari); break;
      case 'sakit_anak': S.villagers.filter(isKid).forEach(v => { if (!v.sick && Math.random() < n) makeSick(v, 'ringan', 'masuk_angin'); }); break;
      case 'pamit_pendatang': { const v = (ctx.newcomers || []).map(vById).filter(Boolean)[0]; if (v && S.villagers.length > C.LEAVE.minPop) { if (v.inside != null) exitHouse(v); S.villagers.splice(S.villagers.indexOf(v), 1); S.storyLeavers = (S.storyLeavers || 0) + 1; assignHomes(); } break; } // pamit (kangen kampung) bukan 'pergi karena tidak betah'
      // P1 cerita berantai: efek pada aktor (ctx.aktor[0])
      case 'energi_aktor': if (va) va.energy = Math.max(0, Math.min(100, va.energy + n)); break;
      case 'kesehatan_aktor': if (va) va.health = Math.max(1, Math.min(100, va.health + n)); break;
      case 'sifat_aktor': if (va && !hasTrait(va, n) && (va.traits || []).length < TRT().max && !(TRT().conflicts || []).some(c => c.includes(n) && c.some(t => t !== n && hasTrait(va, t)))) { va.traits = [...(va.traits || []), n]; log('✨ ' + TX('sifat.' + n + '.log_terlihat', { nama: va.name }, `${va.name} kini ${TX('sifat.' + n + '.kata', {}, n)}.`)); } break;
      case 'sifat_ganti': if (va && hasTrait(va, n[0])) { va.traits = va.traits.map(t => t === n[0] ? n[1] : t); log('✨ ' + TX('sifat.' + n[1] + '.log_terlihat', { nama: va.name }, `${va.name} kini ${TX('sifat.' + n[1] + '.kata', {}, n[1])}.`)); } break;
      case 'absen_aktor': if (va) sendAway(va, n, 'cerita'); break;
      case 'pamit_aktor': if (va && S.villagers.length > C.LEAVE.minPop) leaveVillager(va, 'pamit'); break;
      case 'paksa_keinginan': if (va && !va.wish && WSC().list[n]) wishStart(va, n); break;
      case 'harga_jual_makanan_permanen': S.sellBonus = S.sellBonus || {}; S.sellBonus.makanan = (S.sellBonus.makanan || 0) + n; break;
      case 'ronda_aktor': if (va) { const mate = adults().filter(v => v !== va && !v.sick && !tList(v).some(t => t.noNightJaga)).sort((a, b) => hasTrait(b, 'pemberani') - hasTrait(a, 'pemberani'))[0]; S.ronda = { ids: [va.id, ...(mate ? [mate.id] : [])], until: S.day + n, energi: -8 }; } break;
      case 'rel_rekan_ronda': if (va) { const m = S.ronda && S.ronda.ids.map(vById).find(o => o && o !== va); if (m) relAdd(va, m, n, 'ronda'); } break;
      case 'mood_pemilik_harian': if (va) S.petMood = { vid: va.id, n }; break;
      case 'pendatang_sifat': case 'ternak': case 'kopi': break; // pendatang sudah dapat sifat acak; ternak & kopi belum ada
      default: console.info(`[cerita] kunci "${k}" belum didukung, diabaikan.`); }
  } }
function payDebts(force) { for (const d of (S.debts || []).slice()) { if (!force && S.day < d.due) continue; if (S.day < d.due) continue;
    if (canAfford(d.res)) { for (const [k, n] of Object.entries(d.res)) S.res[k] -= n; S.debts.splice(S.debts.indexOf(d), 1); log('💰 ' + TX('dilema_ui.utang_lunas', {}, 'Utang ke rentenir dilunasi.')); continue; }
    if ((S.day - d.due) % 7 === 0 && S.day > d.due || force && !d.warned) { d.warned = true; if (S.day > d.due) { d.telat++; for (const k of Object.keys(d.res)) d.res[k] = Math.ceil(d.res[k] * (1 + d.bunga)); }
      if (d.telat > d.telatMaks) { for (const k of ['kayu', 'batu', 'papan']) S.res[k] = Math.floor(S.res[k] * (1 - d.sita)); S.villagers.forEach(v => v.mood = Math.max(0, v.mood - 5)); S.debts.splice(S.debts.indexOf(d), 1);
        log('😟 ' + TX('dilema_ui.utang_sita', {}, 'Rentenir menyita separuh kayu, batu, dan papan desa.')); } } } }
// ---- teks ----
const dilText = id => ((TEXT && TEXT.dilema) || []).find(d => d.id === id);
const momText = id => TEXT && TEXT.momen_kecil && TEXT.momen_kecil[id];
const DUI = (k, fb) => TX('dilema_ui.' + k, {}, fb);
function tundaText(p) { const d = dilText(p.src), o = d && d.pilihan[p.opt], t = o && (o.tertunda || []).find(x => x.kunci === p.kunci);
  return (t && t.teks_tertunda) || (o && o.teks_tertunda) || `Akibat keputusan hari {hari_keputusan} terasa.`; }
const actorEx = ids => { const a = vById(ids && ids[0]), b = vById(ids && ids[1]); return { ...(a ? { nama: a.name } : {}), ...(b ? { nama2: b.name } : {}) }; };
// ---- pilih & buka dilema / momen ----
function dilemmaAllowed(id, d, onlyR) { const R = S.director, tx = dilText(id); if (!tx || (C.STORY_DISABLE || []).includes(id)) return false;
  if (onlyR && d.kelas !== 'R') return false; if (d.kelas === 'B' && S.day < 25) return false; if (d.minDay && S.day < d.minDay) return false; if (d.era && (S.era | 0) < eraIndex(d.era)) return false;
  if (d.musim && !d.musim.includes(storySeason())) return false; if (R.lastById[id] != null && S.day - R.lastById[id] < (d.ulangHari || DIRC().defaultRepeatDays)) return false;
  if (d.sekaliSaja && R.seen[id]) return false; const cat = tx.kategori; if (cat && R.lastCat[cat] != null && S.day - R.lastCat[cat] < DIRC().sameCategoryGapDays) return false;
  if (d.aktor === 'sakit' && !S.villagers.some(v => v.sick)) return false; return syaratOk(d.syarat); }
function dilemmaWeight(id, d) { const W = DIRC().weight, R = S.director; let w = d.bobot ?? 1;
  w *= (d.musimMult || {})[storySeason()] ?? 1; if (d.stateMult && d.stateMult.famineWaspada && famineLevel() !== 'aman') w *= W.stateBoost; if (id === 'ronda_wajib' || id === 'obat_sakit') w *= W.stateBoost;
  if (d.p.some(p => Object.keys(p.reaksi || {}).some(anyTrait))) w *= W.traitBoost; if (!R.seen[id]) w *= W.novelty; return w; }
function pickWeighted(list) { const tot = list.reduce((a, x) => a + x[1], 0); if (!tot) return null; let r = Math.random() * tot; for (const x of list) { r -= x[1]; if (r <= 0) return x[0]; } return list[list.length - 1][0]; }
function pickDilemma(onlyR) { return pickWeighted(Object.entries(C.DILEMMAS || {}).filter(([id, d]) => dilemmaAllowed(id, d, onlyR)).map(([id, d]) => [id, dilemmaWeight(id, d)])); }
function pickMomen(rep) { const M = C.MOMEN_KECIL, R = S.director; return pickWeighted(Object.entries(M.list).filter(([id, m]) => momText(id) && !(C.STORY_DISABLE || []).includes(id)
  && !(m.sekali && R.seen['m:' + id]) && !(R.lastById['m:' + id] != null && S.day - R.lastById['m:' + id] < (rep || M.repeatDays)) && syaratOk(m.syarat) && (!m.aktor || S.villagers.length >= m.aktor)).map(([id]) => [id, 1])); }
function pickActors(spec, prefTrait) { if (!spec) return []; if (spec === 'sakit') { const v = S.villagers.filter(o => o.sick).sort((a, b) => (b.sick.lvl === 'parah') - (a.sick.lvl === 'parah'))[0]; return v ? [v.id] : []; }
  const n = spec === 'acak' ? 1 : spec, pool = adults().length >= n ? adults() : S.villagers.slice(), out = [];
  const first = prefTrait && pool.find(v => (v.traits || []).includes(prefTrait)); if (first) out.push(first.id);
  while (out.length < n && out.length < pool.length) { const v = pick(pool.filter(o => !out.includes(o.id))); out.push(v.id); } return out; }
function countModal(kind) { storyInit(); const M = S.director.modal; if (M.day !== S.day) { M.day = S.day; M.n = 0; M.dil = 0; } M.n++; if (kind === 'dilema') M.dil++; S.director.lastModalT = S.t; }
function modalOk() { const D = DIRC(), M = S.director.modal; return (M.day !== S.day || M.n < D.maxModalPerDay) && S.t - S.director.lastModalT >= D.minGapDays * C.DAY_LENGTH_SEC; }
function openStory(st) { S.story = st; S.event = '@story'; countModal(st.type); const R = S.director; R.counts[st.type] = (R.counts[st.type] || 0) + 1; showStory(); }
function openDilemma(id) { if (!id) return false; const d = C.DILEMMAS[id], tx = dilText(id), R = S.director; R.lastById[id] = S.day; R.seen[id] = 1; if (tx.kategori) R.lastCat[tx.kategori] = S.day;
  if (d.efekPemicu) applyStoryEffects(resolveCost(d.efekPemicu), {}); markMeaningful('dilema'); openStory({ type: 'dilema', id, aktor: pickActors(d.aktor), day: S.day }); return true; }
function openMomen(id) { if (!id) return false; const m = C.MOMEN_KECIL.list[id], R = S.director; R.lastById['m:' + id] = S.day; R.seen['m:' + id] = 1; markMeaningful('momen');
  openStory({ type: 'momen', id, aktor: pickActors(m.aktor, m.aktorSifatA), day: S.day }); return true; }
// ---- Juru Cerita: sekali sehari jam 09:00 (§3.4) ----
function directorTick(force) { const D = DIRC(), f = dayFrac(); if (!TEXT || !D) return false; storyInit(); const R = S.director;
  if (!force) { if (S.day < D.startDay || S.event || R.checked === S.day || f < D.checkFrac || f > D.scheduleCutoffFrac || D.nightBlock && isNight()) return false;
    if (!modalOk()) { if (R.modal.day === S.day && R.modal.n >= D.maxModalPerDay) R.checked = S.day; return false; } }
  R.checked = S.day;
  if (!force && (R.mday[S.day] || agustusDay())) return false; // hari sudah bermakna -> diam
  { const dc = chainDueCard(); if (dc) return chainCard(dc); } // P1: langkah cerita berantai yang jatuh tempo didahulukan di hari sepi
  const early = S.day <= D.fillEarly.untilDay, ch = (early ? D.fillEarly.chances : D.fill)[Math.min(R.streak, 2)];
  if (!force && Math.random() >= ch) return false;
  const mixE = S.day <= D.mixEarly.untilDay, r = Math.random(), kind = mixE ? (r < D.mixEarly.dilemaR ? 'dilema' : 'momen') : (r < D.mix.dilema ? 'dilema' : r < D.mix.dilema + (D.mix.cerita || 0) ? 'cerita' : 'momen'); // P1: 'cerita' = mulai rantai baru (tak ada yang cocok -> momen)
  if (kind === 'dilema' && R.modal.dil < D.maxDilemmaPerDay && openDilemma(pickDilemma(mixE))) return true;
  if (kind === 'cerita' && chainStart()) return true;
  return openMomen(pickMomen() || pickMomen(C.MOMEN_KECIL.fallbackRepeatDays || 10)); } // stok momen habis (tema sedang: 8 momen) -> boleh ulang setelah 10 hari
// ---- tampilan kartu dilema / momen / panitia ----
const portraitOf = v => v ? `assets/ui/dilemma/portraits/portrait_villager_${(v.color % 4) + 1}_ekspresi.png` : null;
function showStory() { const st = S.story, box = $('modal'); if (!st) { S.event = null; return; } box.style.display = 'block'; box.classList.add('story'); sfx('event');
  if (st.type === 'panitia') return showPanitia();
  if (st.type === 'cerita') return showChain();
  const isD = st.type === 'dilema', d = isD ? C.DILEMMAS[st.id] : C.MOMEN_KECIL.list[st.id], tx = isD ? dilText(st.id) : momText(st.id), ex = actorEx(st.aktor), a = vById(st.aktor && st.aktor[0]);
  const kat = isD && tx.kategori ? TX('dilema_ui.kategori.' + tx.kategori, {}, tx.kategori) : TX('momen_kecil.judul', {}, 'Momen Kecil');
  const FR = 'url(assets/ui/dilemma/portrait_frame_80.png) 0 0/80px 80px no-repeat', por = a ? `<div class="por" style="background:${FR}, url(${portraitOf(a)}) ${8 - (isD ? 4 : 1) * 64}px 8px/320px 64px no-repeat"></div>` // potret ekspresi: khawatir (dilema) / senang (momen)
    : `<div class="por" style="background:${FR}, url(assets/icons/traits/icon_kepala_desa.png) 8px 8px/64px 64px no-repeat"></div>`;
  const opts = (tx.pilihan || []).map((p, i) => { const dp = d.p[i] || {}, ef = isD ? optEffects(dp) : resolveCost(dp), canPop = !(isD && dp.butuhRumah) || capacity() >= S.villagers.length + dp.butuhRumah;
    const ok = !isD || (affordable(ef) && canPop && (!dp.butuh || done(dp.butuh).length > 0));
    const cost = Object.entries(ef).filter(([k, n]) => typeof n === 'number' && (k in S.res || k === 'suasana_hati')).map(([k, n]) => `${n > 0 ? '+' : ''}${n} ${k === 'suasana_hati' ? '🙂' : resIcon(k)}`).join(' ');
    const chips = Object.entries((isD ? dp.reaksi : dp.mood_sifat) || {}).filter(([t]) => anyTrait(t)).map(([t, m]) => `<span class="rchip" title="${TX('sifat.' + t + '.nama', {}, t)}"><img src="assets/icons/traits/trait_${t}_16.png"><img src="assets/ui/dilemma/reaksi_${m > 0 ? 'suka' : 'cemas'}.png"></span>`).join('');
    const tun = isD && (dp.tunda && dp.tunda.length || dp.efek && dp.efek.utang) ? `<span class="tunda" title="${DUI('petunjuk_tertunda', '⏳ Mungkin ada akibatnya nanti')}"><img src="assets/ui/dilemma/icon_tunda_16.png"></span>` : '';
    return { i, ok, html: `<button class="opt" data-ev="${i}" ${ok ? '' : 'disabled'}><span class="ot">${fill(p.teks, ex)}</span><span class="oc">${cost}${tun}${chips}</span></button>` }; });
  if (!opts.some(o => o.ok)) opts[0].html = opts[0].html.replace(' disabled', '');
  box.innerHTML = `<div class="dcard ${isD ? 'k' + d.kelas : 'km'}">${por}<div class="dhead"><small>${isD ? DUI('judul', 'Keputusan Kepala Desa') : ''} · ${kat}</small><h3>${fill(tx.judul, ex)}</h3></div>`
    + `<p>${fill(tx.deskripsi, ex)}</p><div class="opts">${opts.map(o => o.html).join('')}</div>${isD && d.p.some(p => p.tunda || p.efek && p.efek.utang) ? `<small class="hint"><img src="assets/ui/dilemma/icon_tunda_16.png"> ${DUI('petunjuk_tertunda', '⏳ Mungkin ada akibatnya nanti').replace('⏳ ', '')}</small>` : ''}</div>`; }
function chooseStory(i) { const st = S.story; if (!st) return; if (st.type === 'panitia') return choosePanitia(i); if (st.type === 'cerita') return chooseChain(i);
  const isD = st.type === 'dilema', d = isD ? C.DILEMMAS[st.id] : C.MOMEN_KECIL.list[st.id], tx = isD ? dilText(st.id) : momText(st.id), dp = d.p[i] || {}, txp = (tx.pilihan || [])[i] || {}, ex = actorEx(st.aktor);
  const ctx = { aktor: st.aktor };
  if (isD) { let ef = optEffects(dp); if (dp.butuhRumah && capacity() < S.villagers.length + dp.butuhRumah) { ef = { ...ef }; delete ef.penduduk; }
    const spent = costOf(ef); applyStoryEffects(ef, ctx);
    if (spent >= (TRT().list.pelit.bigSpendAt || 10)) S.villagers.filter(v => (v.traits || []).includes('pelit')).forEach(v => v.mood = Math.max(0, v.mood + TRT().list.pelit.bigSpendMood)); // pelit: −1 tiap pengeluaran besar
    log(`📜 ${tx.judul} — ${fill(txp.teks_hasil || '', ex)}`);
    const RS = (TEXT.dilema_ui || {}).reaksi_sifat || {}; let shown = 0;
    for (const [t, m] of Object.entries(dp.reaksi || {})) for (const v of S.villagers.filter(o => (o.traits || []).includes(t))) { v.mood = Math.max(0, Math.min(100, v.mood + m));
      if (shown < 2 && traitsVisible(v) && (m >= 3 || m <= -3)) { shown++; const pool = RS[m > 0 ? 'senang' : 'kecewa']; if (pool && pool.length) log((m > 0 ? '😊 ' : '😟 ') + fill(pick(pool), { nama: v.name, sifat: TX('sifat.' + t + '.kata', {}, t) })); } }
    for (const t of dp.tunda || []) S.pending.push({ src: st.id, opt: i, kunci: t.teks, from: S.day, due: S.day + rndInt(t.hari[0], t.hari[1]), syarat: t.syarat || null, peluang: t.peluang, efek: t.efek, kelas: d.kelas, aktor: st.aktor, newcomers: ctx.newcomers || [] });
    if (st.id === 'rentenir' && dp.efek.utang) S.pending.push({ src: st.id, opt: i, kunci: 'tagihan_rentenir', from: S.day, due: S.day + dp.efek.utang.hari, syarat: null, peluang: 1, efek: { tagih_utang: 1 }, kelas: d.kelas, aktor: [] });
    S.decisions.push({ day: S.day, id: st.id, opt: i }); if (S.decisions.length > 60) S.decisions.shift(); dstat('events', tx.judul, 1);
  } else { const ef = { ...dp }; if (ef.makanan && S.day < C.MOMEN_KECIL.foodFromDay) delete ef.makanan; if (ef.makanan) ef.makanan = Math.max(-C.MOMEN_KECIL.foodMax, ef.makanan);
    for (const k of ['suasana_hati', 'mood_anak', 'mood_A']) if (ef[k]) ef[k] = Math.min(C.MOMEN_KECIL.maxMood, ef[k]); applyStoryEffects(ef, ctx); log(`💬 ${fill(txp.teks_hasil || tx.judul, ex)}`); }
  S.event = null; S.story = null; const box = $('modal'); box.style.display = 'none'; box.classList.remove('story'); checkAch(); }
// ---- akibat tertunda: diundi pagi saat jatuh tempo; syarat gagal -> menunggu (maks pendingExpireDays) ----
function firePending() { storyInit(); const keep = [];
  for (const p of S.pending) { if (S.day < p.due) { keep.push(p); continue; }
    if (!syaratOk(p.syarat, p)) { if (S.day - p.due < DIRC().pendingExpireDays) keep.push(p); continue; }
    if (Math.random() >= p.peluang) continue;
    applyStoryEffects(resolveCost(p.efek), { aktor: p.aktor, newcomers: p.newcomers }); markMeaningful('tunda');
    log('⏳ ' + fill(tundaText(p), { hari_keputusan: p.from, ...actorEx(p.aktor) }));
    S.director.landed.push({ kunci: p.kunci, src: p.src, from: p.from, due: p.due, day: S.day }); if (S.director.landed.length > 40) S.director.landed.shift(); }
  S.pending = keep; }
// ---- harian (dipanggil di newDay sebelum event acak) ----
function storyNewDay() { storyInit(); const R = S.director, prev = S.day - 1;
  if (prev >= 1 && R.days.length < prev) { while (R.days.length < prev - 1) R.days += '0'; const m = !!R.mday[prev]; R.days += m ? '1' : '0'; R.streak = m ? 0 : R.streak + 1; }
  for (const k of Object.keys(R.mday)) if (+k < S.day - 3) delete R.mday[k];
  S.buffs = S.buffs.filter(b => b.until == null || b.until >= S.day);
  firePending(); payDebts(false);
  for (const r of S.recurring.slice()) if (S.day >= r.next) { const ef = resolveCost({ [r.res]: -r.n }); if (affordable(ef)) { applyStoryEffects(ef, {}); } r.left--; r.next = S.day + r.every; if (r.left <= 0) S.recurring.splice(S.recurring.indexOf(r), 1); }
  if (S.ronda) { if (S.day > S.ronda.until) S.ronda = null; else { const vs = S.ronda.ids.map(vById).filter(Boolean); vs.forEach(v => v.energy = Math.max(10, v.energy + S.ronda.energi)); if (vs.length === 2) relAdd(vs[0], vs[1], RLC().gain.ronda, 'ronda'); } }
  monkeyDaily(); ratDaily();
  const K = SKC().kenduri; if (K && S.day >= K.fromDay && (S.day - K.fromDay) % K.everyDays === 0 && foodDays() > K.surplusDays + hardReserveDays() && !(isHardSeason() && hardReserveDays())) { const n = surplusSink(K, 'kenduri');
    if (n >= 1) { S.villagers.forEach(v => v.mood = Math.min(100, v.mood + K.mood)); relAll(K.rel);
      // bentuk bergantian (kenduri / syukuran / sedekah ke desa tetangga) supaya log tidak monoton; sedekah menambah hubungan tetangga
      const forms = K.forms || ['kenduri'], f = forms[(S.kenduriN = (S.kenduriN || 0) + 1) % forms.length]; if (f === 'sedekah') S.neighborRel = Math.min(5, (S.neighborRel || 0) + 0.5);
      const FB = { kenduri: `Kenduri kecil di balai: ${Math.round(n)} porsi dibagi untuk warga dan tetangga.`, syukuran: `Syukuran sederhana: warga makan bersama, ${Math.round(n)} porsi habis dengan gembira.`, sedekah: `Sedekah ke desa tetangga: ${Math.round(n)} porsi diantar dengan bakul. Tetangga berterima kasih.` };
      if (S.day - (S.kenduriLog || -99) >= (K.logGapDays || 5) && (S.kenduriLog = S.day)) log({ kenduri: '🍚 ', syukuran: '🎊 ', sedekah: '🧺 ' }[f] + TX('kerja_bakti.' + (f === 'kenduri' ? 'kenduri' : 'kenduri_' + f), { jumlah: Math.round(n) }, FB[f])); } }
  agustusNewDay(); }
// monyet pencuri siang (D15) & tikus lumbung (D21): penyerap kecil
function monkeyDaily() { const M = C.MONKEY; if (!M || !M.enabled || S.day < M.fromDay || (S.era | 0) < eraIndex(M.era) || !M.musim.includes(storySeason()) || foodTotal() < M.minFood) return;
  if (Math.random() >= M.chancePerDay * threatBuff('monyet')) return;
  if (Math.random() >= scarecrowMonkeyMult()) return scarecrowScare(M.hewan || 'monyet'); // orang-orangan sawah menjaga ladang dalam radius: kawanan urung mencuri
  const n = rndInt(M.steal[0], M.steal[1]); const got = takeFood(n, 'monyet'); spawnRaider(Math.round(got || n), M.hewan || 'monyet'); S.monkeyDays.push(S.day); if (S.monkeyDays.length > 12) S.monkeyDays.shift(); // dulu baris ini tertelan komentar -> monyet tak pernah mengambil makanan
  { const r = S.raiders[S.raiders.length - 1]; logAt((M.icon || '🐒') + ' ' + TX('peringatan_dini.ancaman_monyet.tingkat.bahaya.teks', {}, M.fallback || 'Monyet-monyet melompat ke tegalan dan menyambar jagung!'), r.goal.x, r.goal.y); } }
function ratDaily() { const T = SKC().tikus; if (!T || S.day < T.fromDay || (S.res.gandum || 0) < T.gandumMin) return; const n = S.res.gandum * T.fracPerDay * buffMult('tikus'); S.res.gandum -= n; foodLedger(-n, true); dstat('sink', 'tikus', n); }
// ================= P1 Cerita & Tujuan (docs/RISET-CERITA-TUJUAN.md): keinginan warga (§1.3) =================
const WSC = () => C.WISHES, MNC = () => C.MONUMENTS;
const p1Off = k => (C.TUJUAN_DISABLE || []).includes(k);   // tema (sedang) mematikan konten khas Nusantara: id keinginan/monumen/rantai/'teladan'/'rencana'
function tujuanInit() { if (!S) return; S.wishStats = S.wishStats || { done: 0, fail: 0, byId: {} }; S.away = S.away || []; S.kb = S.kb || { last: -99, day: -1 };
  S.p1 = S.p1 || { wishDone: 0, monStages: 0, kbCount: 0, chainDone: 0, pairs0: 0, births0: 0 }; S.chains = S.chains || { active: [], done: {}, last: -99 }; }
const isMon = b => !!(b && C.BUILDINGS[b.type] && C.BUILDINGS[b.type].monumen);
const monB = id => S.buildings.find(b => b.type === id && b.mon);
const monStage = id => { const b = monB(id); return b ? b.mon.st : 0; };                     // jumlah tahap selesai
const monStagesAll = () => S.buildings.filter(b => b.mon).reduce((a, b) => a + b.mon.st, 0);
const monDoneN = () => S.buildings.filter(b => b.mon && b.mon.st >= MNC()[b.type].stages.length).length;
// efek monumen: jumlah (penambah) / nilai tahap tertinggi yang punya kunci itu (pengali yang "menggantikan")
function monFxSum(k) { let s = 0; for (const b of S.buildings) if (b.mon) MNC()[b.type].stages.slice(0, b.mon.st).forEach(t => { const x = t.fx && t.fx[k]; if (typeof x === 'number') s += x; }); return s; }
function monFxLast(k, def) { let r = def; for (const b of S.buildings) if (b.mon) MNC()[b.type].stages.slice(0, b.mon.st).forEach(t => { if (t.fx && t.fx[k] != null) r = t.fx[k]; }); return r; }
const wishText = id => (TEXT && TEXT.keinginan && TEXT.keinginan[id]) || {};
const wishName = id => wishText(id).judul || id.replace(/_/g, ' ');
const wishDaysLeft = v => v.wish ? v.wish.until - S.day : 0;
// syarat desa untuk keinginan muncul (butuh)
function wishNeed(c, v) { if (!c) return true; const [k, a] = c.split(':');
  switch (k) {
    case 'kopiDikenal': return !!S.kopiDikenal || (S.techDone || []).includes('T_KOPI');
    case 'rumahDikenal': return done('rumah').length > 0;
    case 'hajiTerbuka': return monStage('masjid') >= 3 || yearIdx() >= 2;
    case 'bangunanAda': return !!C.BUILDINGS[a] && done(a).length > 0;
    case 'bisaBangunLagi': { const B = C.BUILDINGS[a]; return !!B && eraIndex(B.era || 'perkemahan') <= (S.era | 0) && S.buildings.filter(o => o.type === a).length < 1 + Math.floor(S.villagers.length / 8); } // punya_ayam: kandang masih bisa ditambah
    case 'pedagangAtauPasar': return !!S.merchantSeen || done('pasar').length > 0;
    case 'makamKerabat': return (S.memorials || []).some(m => m.day >= (v.joined || 0) && (m.id === v.motherId || m.id === v.fatherId || m.id === v.exPartnerId || (S.rel || {})[relKey({ id: m.id }, v)] >= RLC().levels.teman));
    case 'monumenAda': return S.buildings.some(b => b.mon);
    case 'punyaTeman': return S.villagers.some(o => o !== v && relGet(v, o) >= RLC().levels.teman);
    case 'pasanganSiapHamil': { const p = partnerOf(v); if (!p) return false; const m = v.sex === 'P' ? v : p, f = v.sex === 'P' ? p : v; return pregnancyOk(m, f) || (S.era | 0) >= eraIndex(C.PREGNANCY.minEra) && !m.pregnantUntil && capacity() >= S.villagers.length + 1; }
    case 'ladang': return done('ladang').length >= +a;
    case 'gamelan': return monStage('pendopo_reog') >= 1 || done('balai').length > 0;
    case 'panen3': return seasonHarvests() >= 3;
  } return true; }
const seasonHarvests = () => { const s0 = S.day - seasonInfo().day + 1; return (S.harvestDays || []).filter(d => d >= s0).length; };
function wishEligible(v, id, d) { const W = WSC();
  if (p1Off(id) || S.day < (d.minDay || 0) || d.minEra && (S.era | 0) < eraIndex(d.minEra)) return false;
  const a = ageOf(v); if (d.umur ? a < d.umur[0] || a > d.umur[1] : a < (d.minAge || W.minAge)) return false;
  if (d.butuhSifat && !hasTrait(v, d.butuhSifat)) return false;
  if (d.musim && !d.musim.includes(storySeason()) || d.bukanMusim && d.bukanMusim.includes(storySeason())) return false;
  if (d.hariTahun && (dayOfYear() < d.hariTahun[0] || dayOfYear() > d.hariTahun[1])) return false;
  if (d.siklusHari && (S.day - (v.joined || 0) < d.siklusHari || (S.day - (v.joined || 0)) % d.siklusHari > 3)) return false;
  if (d.biaya && S.day < W.foodWishMinDay && costOf(resolveCost(neg(d.biaya))) && Object.keys(resolveCost(neg(d.biaya))).some(k => isFoodRes(k))) return false;
  if (d.pergiHari && !canGoAway(v)) return false;
  return wishNeed(d.butuh, v); }
const neg = o => Object.fromEntries(Object.entries(o || {}).map(([k, n]) => [k, typeof n === 'number' ? -n : n]));
function wishCost(d, part) { let ef = resolveCost(neg(d.biaya)); if (!affordable(ef) && d.biayaAlt) { const alt = resolveCost(neg(d.biayaAlt)); if (affordable(alt)) ef = alt; }
  if (part) for (const k of Object.keys(ef)) ef[k] = -Math.ceil(-ef[k] / part); return ef; }
function wishStart(v, id) { const W = WSC(), d = W.list[id]; tujuanInit();
  let days = (d.hari || W.defaultDays) + monFxSum('wishDaysAdd'); if (d.hariTahun) days = Math.max(1, d.hariTahun[1] - dayOfYear() + 1);
  v.wish = { id, from: S.day, until: S.day + days - 1, paid: 0 }; v.wishT0 = null;
  log('💭 ' + TX('keinginan.' + id + '.teks_muncul', { nama: v.name, hari: S.day }, `${v.name} ingin: ${wishName(id).toLowerCase()}.`));
  if (d.cara !== 'otomatis') markMeaningful('keinginan'); }
// cek otomatis (otomatis: kejadian/hook atau kebiasaan harian)
function wishAuto(v, w, d) { const [k, a] = (d.cek || '').split(':');
  switch (k) {
    case 'tinggalRumah': { const h = bById(v.homeId); return !!h && h.type === 'rumah'; }
    case 'pentasReog': return (S.lastReog ?? -1) >= w.from;
    case 'memancing': return (v.fishedDay ?? -1) >= w.from;
    case 'kebiasaan': return Math.random() < WSC().autoChance;
    case 'kerjaBakti': return (S.kb && S.kb.day) >= w.from;
    case 'hamil': { const p = partnerOf(v); return !!(v.pregnantUntil || p && p.pregnantUntil); }
    case 'petakSiap': return S.buildings.filter(b => b.type === 'ladang' && b.stage === 'siap').length >= +a;
    case 'ronda': return !!(S.ronda && S.ronda.ids.includes(v.id)) || Math.random() < WSC().autoChance * 0.6;
    case 'menangLomba': return (v.lombaWonDay ?? -1) >= w.from;
    case 'bangunan': return done(a).length > 0;
    case 'bangunanBaru': return done(a).some(b => (b.doneDay ?? -1) >= w.from); // dibangun setelah keinginan muncul
  } return false; }
function wishFulfil(v, how) { const W = WSC(), w = v.wish; if (!w) return; const id = w.id, d = W.list[id] || {}, up = (o, n) => { if (o) o.mood = Math.max(0, Math.min(100, o.mood + n)); };
  up(v, (d.mood || 0) * (W.moodMult ?? 1)); if (d.buff) v.wishBuff = { n: d.buff * (W.moodMult ?? 1), until: S.day + W.buffDays };
  if (d.moodDesa) S.villagers.forEach(o => o !== v && up(o, d.moodDesa));
  if (d.moodSekitar) S.villagers.forEach(o => o !== v && dist(o, v) < 5 && up(o, d.moodSekitar));
  if (d.rel) { const fr = S.villagers.filter(o => o !== v && !isBaby(o)).sort((a, b) => relGet(v, b) - relGet(v, a))[0]; if (fr) relAdd(v, fr, d.rel, 'keinginan'); }
  if (d.relSerumah) S.villagers.forEach(o => o !== v && o.homeId != null && o.homeId === v.homeId && relAdd(v, o, d.relSerumah, 'keinginan'));
  if (d.moodOrtu) [v.motherId, v.fatherId].map(vById).forEach(o => up(o, d.moodOrtu));
  if (d.hasil) applyStoryEffects(d.hasil, {});
  if (d.skill) for (const [k, n] of Object.entries(d.skill)) v.skills[k] = (v.skills[k] || 0) + n;
  if (d.dukaKurangHari && v.griefP) v.griefP.until -= d.dukaKurangHari;
  if (d.gelar) { const gl = TX('keinginan.' + id + (v.sex === 'P' ? '.gelar_p' : '.gelar_l'), {}, v.sex === 'P' ? 'Hajjah' : 'Haji'); if (gl) v.gelar = gl; } // QC T-03: gelar dari TEKS (tema)
  log('🌟 ' + TX('keinginan.' + id + '.teks_terpenuhi', { nama: v.name, hari: S.day }, TX('keinginan._ui.terpenuhi', { nama: v.name, hari: S.day, keinginan: wishName(id).toLowerCase() }, `Keinginan ${v.name} terwujud: ${wishName(id).toLowerCase()}!`)));
  vhist(v, 'Keinginan terwujud: ' + wishName(id)); markMeaningful('keinginan_selesai'); sfx('panen');
  tujuanInit(); S.wishStats.done++; S.wishStats.byId[id] = (S.wishStats.byId[id] || 0) + 1; S.p1.wishDone++; (S.wishYear = S.wishYear || {})[yearIdx()] = ((S.wishYear || {})[yearIdx()] || 0) + 1;
  v.wish = null; v.wishNext = S.day + W.gapDays;
  if (d.pergiHari) sendAway(v, d.pergiHari, id, d.olehOleh); }
function wishFail(v) { const W = WSC(), w = v.wish, d = W.list[w.id] || {};
  const safe = W.noPenaltyFamine.includes(famineLevel()); // desa sedang susah pangan: kecewa dimaklumi
  if (!safe) { v.mood = Math.max(0, v.mood + (d.gagal || 0) * traitMult(v, 'wishFailMult')); if (d.gagalLeaveAdd) v.leaveAdd = { n: d.gagalLeaveAdd, until: S.day + 14 }; }
  log('😔 ' + TX('keinginan.' + w.id + '.teks_kecewa', { nama: v.name, hari: S.day }, `${v.name} kecewa, keinginannya (${wishName(w.id).toLowerCase()}) tidak terwujud.`));
  tujuanInit(); S.wishStats.fail++; v.wish = null; v.wishNext = S.day + W.gapDays; }
// tombol Penuhi / Setor (cicil)
function wishPay(vid) { const v = vById(vid), W = WSC(); if (!v || !v.wish) return false; const d = W.list[v.wish.id]; if (!d || d.cara === 'otomatis') return false;
  if (d.pergiHari && !canGoAway(v)) return false;
  const parts = d.cara === 'cicil' ? W.cicilParts : 0, ef = wishCost(d, parts); if (!affordable(ef)) return false;
  for (const [k, n] of Object.entries(ef)) if (k in S.res) { S.res[k] = Math.max(0, S.res[k] + n); if (isFoodRes(k)) { foodLedger(n, true); dstat('sink', 'keinginan', -n); S.p1.foodWish = (S.p1.foodWish || 0) - n; } }
  if (parts && ++v.wish.paid < parts) { v.wish.until = Math.max(v.wish.until, S.day + 7); log(`🪙 ${v.name} menyetor tabungan (${v.wish.paid}/${parts}).`); wishUI(); return true; }
  wishFulfil(v, 'tombol'); wishUI(); return true; }
// pergi sementara (pulang kampung / haji / surat dari kota): keluar dari S.villagers, kembali pada hari 'back'
function canGoAway(v) { const pop = S.villagers.length; return pop - 1 >= Math.max(2, C.LEAVE.minPop || 2) && !v.pregnantUntil && !v.sick && !S.villagers.some(o => isBaby(o) && (o.motherId === v.id || o.fatherId === v.id)) && (pop >= 8 || !(S.away || []).length); }
function sendAway(v, days, why, oleh) { tujuanInit(); if (!canGoAway(v)) return false; if (v.inside != null) exitHouse(v);
  v.task = null; v.carry = null; v.working = false; S.villagers.splice(S.villagers.indexOf(v), 1); S.away.push({ v, back: S.day + days, why, oleh: oleh || null });
  const ex = { nama: v.name, jumlah: days }; log('🧳 ' + TX('keinginan.' + why + '.log_berangkat', ex, TX('keinginan._ui.log_berangkat', ex, `${v.name} berangkat ke kampung halaman selama ${days} hari.`))); return true; } // QC T-03: teks dari TEKS
function awayDaily() { tujuanInit(); for (const a of S.away.slice()) if (S.day >= a.back) { S.away.splice(S.away.indexOf(a), 1); const v = a.v; v.x = CAMP.x + Math.random() * 2; v.y = CAMP.y + 1; v.task = null; S.villagers.push(v);
    let extra = ''; if (a.oleh && Math.random() < a.oleh.chance) { for (const [k, n] of Object.entries(a.oleh)) if (k in S.res) S.res[k] += n; extra = ' Ia membawa oleh-oleh.'; }
    log(`🏡 ${v.gelar && a.why === 'tabungan_haji' ? v.gelar + ' ' : ''}${v.name} kembali ke desa.${extra}`); assignHomes(); } }
// harian: kedaluwarsa, cek otomatis, buff, muncul
function wishDaily() { const W = WSC(); if (!W || !W.enabled || p1Off('keinginan')) return; tujuanInit(); awayDaily();
  for (const v of S.villagers) { if (v.wishBuff && v.wishBuff.until >= S.day) v.mood = Math.min(100, v.mood + v.wishBuff.n);
    const w = v.wish; if (!w) continue; const d = W.list[w.id]; if (!d) { v.wish = null; continue; }
    if (d.cara === 'otomatis' && wishAuto(v, w, d)) { wishFulfil(v, 'otomatis'); continue; }
    if (S.day > w.until) wishFail(v); }
  if ((S.era | 0) < eraIndex(W.minEra) || S.day < W.minDay) return;
  let act = S.villagers.filter(v => v.wish).length; const cap = Math.ceil(S.villagers.length / 3);
  for (const v of S.villagers.slice().sort(() => Math.random() - 0.5)) { if (act >= cap) break;
    if (v.wish || isBaby(v) || (v.wishNext || 0) > S.day || Math.random() >= W.chancePerDay * traitMult(v, 'wishRateMult')) continue;
    const opts = Object.entries(W.list).filter(([id, d]) => wishEligible(v, id, d) && !S.villagers.some(o => o.wish && o.wish.id === id && d.cara !== 'otomatis'));
    if (!opts.length) continue; const ws = opts.map(([, d]) => Object.entries(d.bobotSifat || {}).reduce((m, [t, k]) => hasTrait(v, t) ? m * k : m, d.butuhSifat ? 1.5 : 1));
    let r = Math.random() * ws.reduce((a, b) => a + b, 0), i = 0; while (i < ws.length - 1 && (r -= ws[i]) > 0) i++;
    wishStart(v, opts[i][0]); act++; } }
// panel "Keinginan Warga" (di panel samping)
function wishUI() { const W = WSC(); if (!W || p1Off('keinginan') || !$('wish')) return;
  const ws = S.villagers.filter(v => v.wish), K = (TEXT && TEXT.keinginan && TEXT.keinginan._ui) || {};
  let h = `<h4>💭 ${K.judul_panel || 'Keinginan Warga'}</h4>`;
  if (!ws.length) h += `<small class="dim">${K.kosong || 'Belum ada warga yang punya keinginan.'}</small>`;
  for (const v of ws) { const id = v.wish.id, d = W.list[id], tx = wishText(id), left = wishDaysLeft(v), parts = d.cara === 'cicil' ? W.cicilParts : 0;
    let btn = ''; if (d.cara !== 'otomatis') { const ef = wishCost(d, parts), ok = affordable(ef) && (!d.pergiHari || canGoAway(v)), cost = Object.entries(ef).map(([k, n]) => `${-n} ${resIcon(k)}`).join(' ');
      btn = `<button class="wbtn" data-wish="${v.id}" ${ok ? '' : 'disabled'}>${parts ? `Setor ${v.wish.paid + 1}/${parts}` : (tx.tombol || 'Penuhi')} <small>${cost}</small></button>`; }
    else btn = `<small class="dim">⏳ ${TX('keinginan._ui.otomatis', {}, 'menunggu kesempatan')}</small>`;
    h += `<div class="wcard${left <= 1 ? ' hampir' : ''}" title="${(tx.deskripsi || '').replace(/"/g, '&quot;')}"><img src="assets/icons/wishes/wish_${id}.png" width="32" height="32"><div><b>${v.name}</b>: ${wishName(id)}<br><small>${left <= 0 ? 'hari terakhir' : left + ' hari lagi'}</small> ${btn}</div></div>`; }
  setHTML('wish', h); }
// gelembung keinginan di atas kepala (aset tahap 8b): 4 frame 24x24, muncul 0->1->2 (80ms), lalu 2<->3 (300ms); ikon 16px di (4,2)/(4,1)
const WISH_OFF = { anak: [4, -16], remaja: [4, -18], dewasa: [4, -20], lansia: [4, -19] };
const _wImg = {}; const wImg = src => { let im = _wImg[src]; if (!im) { im = _wImg[src] = new Image(); im.src = src; } return im.complete && im.naturalWidth ? im : null; };
function drawWishBubble(v, now) { const w = v.wish; if (!w) return; const st = stageOf(v); if (st === 'bayi') return;
  const bub = wImg(wishDaysLeft(v) <= 1 ? 'assets/ui/wish/wish_bubble_hampir.png' : 'assets/ui/wish/wish_bubble.png'); if (!bub) return;
  if (v.wishT0 == null || now - v.wishT0 > 6e4 && w.shown !== w.from) { v.wishT0 = now; w.shown = w.from; }
  const e = now - v.wishT0, fr = e < 80 ? 0 : e < 160 ? 1 : e < 240 ? 2 : (Math.floor((e - 240) / 300) % 2 ? 3 : 2), o = WISH_OFF[st] || WISH_OFF.dewasa;
  const x = Math.round(v.x * T + o[0]), y = Math.round(v.y * T + o[1]);   // relatif kiri-atas sprite 32x32 (README Tahap 8b)
  ctx.drawImage(bub, fr * 24, 0, 24, 24, x, y, 24, 24);
  if (fr >= 2) { const ic = wImg(`assets/icons/wishes/wish_${w.id}_16.png`); if (ic) ctx.drawImage(ic, x + 4, y + (fr === 2 ? 2 : 1), 16, 16); } }
// ================= P1: monumen bertahap & kerja bakti (§2.1) =================
const KBC = () => C.KERJA_BAKTI;
const monText = id => (TEXT && TEXT.monumen && TEXT.monumen[id]) || {};
const MUI = (k, ex, fb) => TX('monumen.ui.' + k, ex || {}, fb);
const monStages = id => MNC()[id].stages;
const monName = id => monText(id).nama || MNC()[id].nama;
const stName = (id, k) => ((monText(id).tahap || [])[k] || {}).nama || (monStages(id)[k] || {}).nama || '';
// kerja yang dibutuhkan tahap aktif (monumen) / bangunan biasa
function bWork(b) { return b && b.mon ? (monStages(b.type)[b.mon.act ?? Math.max(0, b.mon.st - 1)] || {}).work || 1 : C.BUILDINGS[b.type].work; }
function monCost(id, k) { const disc = (S.monumentDiscount || {})[id] || 0, ef = resolveCost(neg(monStages(id)[k].cost)); if (disc) for (const r of Object.keys(ef)) ef[r] = Math.round(ef[r] * (1 - disc)); return ef; }
function monNext(id) { const M = MNC(), Md = M[id], b = monB(id), k = b ? b.mon.st : 0, st = Md.stages[k];
  if (!M.enabled || p1Off(id)) return { k, off: true }; if (!st) return { k, done: true }; if (b && b.mon.act != null) return { k: b.mon.act, active: true };
  const minD = Math.max(M.minDay, Md.minDay || 0); if (S.day < minD) return { k, why: MUI('terkunci_hari', {}, 'Terbuka mulai hari ke-' + minD).replace(/\d+/, minD) };
  if ((S.era | 0) < eraIndex(st.era)) return { k, why: MUI('terkunci_era', { era: C.ERAS[eraIndex(st.era)].nama }, 'Terbuka di era ' + C.ERAS[eraIndex(st.era)].nama) };
  if (S.buildings.filter(o => o.mon && o.mon.act != null).length >= M.parallel) return { k, why: MUI('satu_aktif', {}, 'Selesaikan dulu tahap monumen yang sedang dikerjakan.') };
  const ef = monCost(id, k), miss = Object.entries(ef).find(([r, n]) => r in S.res && S.res[r] < -n);
  if (miss) return { k, ef, why: MUI('butuh', { jumlah: Math.ceil(-miss[1] - S.res[miss[0]]), sumber_daya: (RES_LABEL[miss[0]] || miss[0]).toLowerCase() }, `Butuh ${Math.ceil(-miss[1] - S.res[miss[0]])} ${(RES_LABEL[miss[0]] || miss[0]).toLowerCase()} lagi`) };
  return { k, ef, ok: true }; }
const nearRiver = (type, x, y, r) => { const d = C.BUILDINGS[type]; for (let j = -r; j < d.h + r; j++) for (let i = -r; i < d.w + r; i++) { const row = S.tiles[y + j]; if (row && row[x + i] === 1) return true; } return false; };
// mulai tahap berikutnya (tahap 1: x,y = fondasi)
function monStart(id, x, y) { const n = monNext(id); if (!n.ok) return false; let b = monB(id);
  if (!b) { if (x == null || !validSpot(id, x, y)) return false; addBuilding(id, x, y, false); b = S.buildings[S.buildings.length - 1]; b.mon = { st: 0, act: 0, pl: 0 }; }
  else { b.mon.act = b.mon.st; b.mon.pl = 0; b.done = false; b.progress = 0; }
  for (const [r, v] of Object.entries(n.ef)) if (r in S.res) { S.res[r] = Math.max(0, S.res[r] + v); if (isFoodRes(r)) { foodLedger(v, true); dstat('sink', 'monumen', -v); } }
  if (S.monumentDiscount) delete S.monumentDiscount[id];
  const a = pick(adults()), ex = { hari: S.day, nama: a ? a.name : 'Warga', monumen: monName(id), tahap: stName(id, b.mon.act) };
  log('🏗️ ' + TX(`monumen.${id}.tahap.${b.mon.act}.mulai`, ex, MUI('log_mulai_umum', ex, `Pembangunan ${ex.monumen} memasuki tahap ${ex.tahap}. Warga bergotong royong.`)));
  markMeaningful('monumen'); S.monVer = (S.monVer || 0) + 1; return b; }
function monStageDone(b, v) { const id = b.type, k = b.mon.act, st = monStages(id)[k]; b.mon.st = k + 1; b.mon.act = null; b.done = true; b.hp = 100; b.doneDay = S.day;
  const ex = { hari: S.day, nama: v ? v.name : 'Warga', monumen: monName(id), tahap: stName(id, k) };
  log('🎉 ' + TX(`monumen.${id}.tahap.${k}.selesai`, ex, MUI('log_selesai_umum', ex, `Tahap ${ex.tahap} pada ${ex.monumen} selesai! Desa makin membanggakan.`)));
  toast('assets/ui/progress/icon_bangun.png', MUI('tahap_selesai_banner', { bangunan: ex.tahap }, `Tahap selesai: ${ex.tahap}!`), TX(`monumen.${id}.tahap.${k}.bonus_ringkas`, {}, ''));
  tujuanInit(); S.p1.monStages++; if (S.p1.firstStageDay == null) S.p1.firstStageDay = S.day; (S.monLog = S.monLog || []).push({ day: S.day, id, k }); if (b.mon.st >= monStages(id).length && S.p1.firstMonDay == null) S.p1.firstMonDay = S.day; S.monVer = (S.monVer || 0) + 1; markMeaningful('monumen'); sfx('bangun'); dstat('built', ex.tahap, 1);
  if (st.fx && st.fx.teladan) S.teladanPoin = (S.teladanPoin || 0) + st.fx.teladan;
  if (v) { v.skills.membangun += C.SKILL_GAIN * 8; vhist(v, 'Menyelesaikan tahap ' + ex.tahap); } }
// dipanggil dari tugas 'bangun' tiap frame: log progres per sepertiga, catat jam kerja (makan pekerja)
function monProgress(b, dt) { S.monWorkSec = (S.monWorkSec || 0) + dt; const third = Math.floor(b.progress / bWork(b) * 3);
  if (third > (b.mon.pl || 0) && third < 3) { b.mon.pl = third; const p = ((monText(b.type).tahap || [])[b.mon.act] || {}).progres; if (p && p[third - 1]) log('🔨 ' + fill(p[third - 1], { hari: S.day })); } }
const monWorkMult = (v, b) => (b.type === 'pendopo_reog' && hasTrait(v, 'seniman') ? 1.2 : 1) * (kbOn() ? KBC().workMult : 1);
// ---- kerja bakti ----
const kbOn = () => !!(S.kb && S.kb.day === S.day && dayFrac() < KBC().untilFrac);
function kbStatus() { const K = KBC(); if (!K || !K.enabled) return { off: true }; tujuanInit();
  if (kbOn()) return { active: true };
  if (K.blockedFamine.includes(famineLevel())) return { why: TX('kerja_bakti.terkunci_lapar', {}, 'Warga sedang kesusahan pangan. Kerja bakti ditunda dulu.') };
  if (isNight() || dayFrac() >= K.untilFrac) return { why: TX('kerja_bakti.terkunci_malam', {}, 'Kerja bakti hanya bisa siang hari.') };
  const cd = (S.kb.last ?? -99) + K.cooldownDays - S.day; if (cd > 0) return { why: TX('kerja_bakti.cooldown', { jumlah: cd }, `Kerja bakti berikutnya bisa ${cd} hari lagi.`) };
  if (!S.buildings.some(b => !b.done)) return { why: 'Belum ada yang sedang dibangun.' };
  return { ok: true }; }
function startKerjaBakti(kopi, free) { const K = KBC(); if (!K || !free && !kbStatus().ok) return false; tujuanInit();
  const ad = adults(); S.kb = { day: S.day, last: free ? S.kb.last : S.day, ended: false };
  ad.forEach(v => v.mood = Math.min(100, v.mood + K.mood)); relAll(K.rel, ad); S.p1.foodKb = (S.p1.foodKb || 0) + takeFood(K.foodPerPerson * ad.length, 'kerja_bakti');
  if (kopi && K.kopiOptional) { const ef = resolveCost(neg({ kopi: K.kopiOptional.kopi })); if (affordable(ef)) { applyStoryEffects(ef, {}); ad.forEach(v => v.mood = Math.min(100, v.mood + K.kopiOptional.mood)); } }
  S.p1.kbCount++; markMeaningful('kerja_bakti'); const a = ad.slice().sort(() => Math.random() - 0.5);
  log('🤝 ' + TX('kerja_bakti.mulai', { hari: S.day, nama: a[0] ? a[0].name : 'Warga', nama2: a[1] ? a[1].name : 'warga' }, `Kentongan dipukul. Seluruh desa berkumpul untuk kerja bakti.`));
  ad.forEach(v => { if (v.task && v.task.kind !== 'bangun' && !v.task.asleep && !v.carry) v.task = null; }); return true; }
function kbTask(v) { if (!kbOn() || isKid(v) && stageOf(v) !== 'remaja' || v.sick || v.pregnantUntil) return null;
  const bs = S.buildings.filter(b => !b.done); if (!bs.length) return null; const mon = bs.filter(b => b.mon), b = nearest(mon.length ? mon : bs, v, center); return b ? { kind: 'bangun', b, target: center(b) } : null; }
function tujuanTick() { if (S.kb && S.kb.day === S.day && !S.kb.ended && dayFrac() >= KBC().untilFrac) { S.kb.ended = true; log('🌇 ' + TX('kerja_bakti.selesai', { hari: S.day }, `Kerja bakti selesai. Desa bersih dan semua makin akrab.`)); } }
// ---- pentas reog (Pendopo tahap 2): Hari Jadi & panggung 17-an ----
function pentasReog() { const fx = monStages('pendopo_reog')[1].fx.pentasReog; if (p1Off('pendopo_reog') || monStage('pendopo_reog') < 2 || S.lastReog === S.day) return false; S.lastReog = S.day;
  S.villagers.forEach(v => v.mood = Math.min(100, v.mood + fx.mood * traitMult(v, 'festivalMoodMult')));
  const kids = S.villagers.filter(o => isKid(o) && !isBaby(o)), ad = adults(); kids.forEach(k => ad.slice().sort(() => Math.random() - 0.5).slice(0, 2).forEach(a => relAdd(k, a, fx.relAnakDewasa, 'reog')));
  log('🦚 ' + TX('agustusan.pentas_reog', { hari: S.day, nama: (pick(S.villagers.filter(v => !isBaby(v))) || { name: 'Warga' }).name }, `Pentas reog di pendopo! Dadak merak menari, gamelan bertalu, anak-anak ikut berjoget.`)); markMeaningful('monumen'); return true; }
// ---- harian: makan pekerja (penyerap), mood pasif, Hari Jadi, Teladan, target tahunan ----
function monDaily() { const M = MNC(); if (!M || !M.enabled) return; tujuanInit();
  const wd = (S.monWorkSec || 0) / (C.DAY_LENGTH_SEC * 0.5); S.monWorkSec = 0; if (wd > 0.05) S.p1.foodMon = (S.p1.foodMon || 0) + takeFood(wd * M.workerFoodPerDay, 'monumen');
  const all = monFxSum('moodAll') + (teladanBonus('moodAll') || 0), pend = monB('pendopo_reog'), nm = pend && pend.mon.st >= 1 ? monStages('pendopo_reog')[0].fx : null;
  if (all || S.buildings.some(b => b.mon && b.mon.st)) for (const v of S.villagers) { let m = all;
    for (const b of S.buildings) if (b.mon) monStages(b.type).slice(0, b.mon.st).forEach(t => { for (const [tr, n] of Object.entries((t.fx && t.fx.moodSifat) || {})) if (hasTrait(v, tr)) m += n; });
    const h = bById(v.homeId); if (nm && h && dist(center(h), center(pend)) <= nm.radius) m += nm.nightMoodNear;
    if (m) v.mood = Math.min(100, Math.max(0, v.mood + Math.min(M.passiveMoodCap, m) * (M.passiveMoodMult || 1))); }
  if (dayOfYear() === 1 && S.day > 1) pentasReog(); }
// kenyamanan: tiap tahap monumen selesai menaikkan batas nyaman mood desa (MONUMENTS.comfortPerStage, maks comfortMax)
function monumentComfortP1() { const M = MNC(); return S && S.buildings && M ? Math.min(M.comfortMax ?? 5, (M.comfortPerStage ?? 1) * monStagesAll()) : 0; }
// ---- Desa Teladan (§2.2) ----
const TLC = () => C.TELADAN;
const tierIdx = () => (S.teladan && S.teladan.tier) || 0;
function teladanBonus(k) { const T = TLC(); if (!T || !S.teladan || S.teladan.suspended) return 0; let r = 0; T.tiers.slice(1, tierIdx() + 1).forEach(t => { if (t.bonus && t.bonus[k] != null) r = t.bonus[k]; }); return r; }
function histDaily() { const H = S.hist = S.hist || { mood: [], fam: [] }, pop = S.villagers.length; H.mood.push(pop ? S.villagers.reduce((a, v) => a + v.mood, 0) / pop : 0); H.fam.push(famineLevel()); if (H.mood.length > 56) H.mood.shift(); if (H.fam.length > 56) H.fam.shift(); }
function teladanReq(t) { const H = S.hist || { mood: [], fam: [] }, m7 = H.mood.slice(-7), mood7 = m7.length ? m7.reduce((a, b) => a + b, 0) / m7.length : 0, cnt = (lv, n) => H.fam.slice(-n).filter(x => x === lv || lv === 'bahaya' && (x === 'kritis' || x === 'kolaps')).length;
  const lastStarve = Math.max(-999, ...(S.memorials || []).filter(m => /lapar|kelaparan/.test(m.cause || '')).map(m => m.day)), r = [];
  const add = (key, okv, txt) => r.push({ key, ok: !!okv, txt });
  if (t.pop) add('pop', S.villagers.length >= t.pop, `Penduduk ≥ ${t.pop}`); if (t.mood7) add('mood7', mood7 >= t.mood7, `Suasana hati 7 hari ≥ ${t.mood7}`);
  if (t.bangunan) add('bangunan', S.buildings.filter(b => b.done && b.type !== 'ladang').length >= t.bangunan, `${t.bangunan} bangunan`);
  if (t.tahap) add('tahap', monStagesAll() >= t.tahap, `${t.tahap} tahap monumen`); if (t.monumenSelesai) add('mon', monDoneN() >= t.monumenSelesai, `${t.monumenSelesai} monumen selesai`);
  if (t.maxKritis28 != null) add('kritis', cnt('kritis', 28) + cnt('kolaps', 28) <= t.maxKritis28, 'Tanpa krisis pangan 28 hari');
  if (t.maxBahaya28 != null) add('bahaya28', cnt('bahaya', 28) <= t.maxBahaya28, `Pangan 'bahaya' ≤ ${t.maxBahaya28} hari (28 hari)`);
  if (t.maxBahaya56 != null) add('bahaya56', cnt('bahaya', 56) <= t.maxBahaya56, 'Tanpa pangan bahaya 56 hari');
  if (t.foodDays) add('food', foodDays() >= t.foodDays, `Stok pangan ≥ ${t.foodDays} hari`); if (t.poin) add('poin', (S.teladanPoin || 0) >= t.poin, `Poin Teladan ≥ ${t.poin}`);
  if (t.noStarveDeathDays) add('starve', S.day - lastStarve >= t.noStarveDeathDays, `Tanpa kematian lapar ${t.noStarveDeathDays} hari`);
  if (t.era) add('era', (S.era | 0) >= eraIndex(t.era), 'Era ' + C.ERAS[eraIndex(t.era)].nama);
  if (t.needPrevYears) add('prev', ((S.teladan.years || {})[tierIdx()] || 0) >= t.needPrevYears && tierIdx() === TLC().tiers.indexOf(t) - 1, 'Bertahan setahun di gelar sebelumnya');
  return r; }
const gelarName = i => TX('teladan.gelar.' + TLC().tiers[i].id, {}, 'Desa ' + TLC().tiers[i].id);
function teladanDaily() { const T = TLC(); if (!T || !T.enabled || p1Off('teladan')) return; S.teladan = S.teladan || { tier: 0, years: {}, history: [] };
  if (dayOfYear() !== T.assessDayOfYear) return; const yr = yearIdx() + 1, ex = { hari: S.day };
  if (yr < T.firstAssessYear) { log('🚲 ' + TX('teladan.pratinjau_tahun1', ex, `Pak Camat lewat dan berjanji datang menilai tahun depan.`)); return; }
  log('📋 ' + TX('teladan.kedatangan', ex, `Pak Camat datang untuk Penilaian Lomba Desa.`)); markMeaningful('teladan');
  const D = S.teladan; let best = D.tier; for (let i = D.tier + 1; i < T.tiers.length; i++) { if (teladanReq(T.tiers[i]).every(x => x.ok)) best = i; else break; }
  const keep = D.tier === 0 || teladanReq(T.tiers[D.tier]).filter(x => x.key !== 'prev').every(x => x.ok);
  if (best > D.tier) { for (let i = D.tier + 1; i <= best; i++) if (T.tiers[i].hadiah) applyEffects(T.tiers[i].hadiah, 'teladan'); D.tier = best; D.suspended = false;
    const a = pick(adults()); log('🏆 ' + TX('teladan.naik_gelar', { ...ex, gelar: gelarName(best), nama: a ? a.name : 'Kepala desa' }, `Selamat! Desa kini menyandang gelar ${gelarName(best)}!`)); sfx('panen');
    toast(ASSETS.medali_teladan ? ASSETS.medali_teladan.img : 'assets/ui/progress/icon_bangun.png', gelarName(best), TX('teladan.deskripsi.' + T.tiers[best].id, {}, ''));
    if (T.tiers[best].ending) log('🎆 ' + TX('teladan.ending', ex, 'Desa Teladan Nasional! Cerita boleh terus berlanjut...')); }
  else if (keep) { D.suspended = false; log('🙂 ' + TX('teladan.tetap', ex, 'Pak Camat tersenyum. "Pertahankan, ya."')); }
  else { D.suspended = true; log('😕 ' + TX('teladan.ditangguhkan', ex, 'Tahun ini agak berat. Bonus gelar ditangguhkan sementara.')); }
  D.years[D.tier] = (D.years[D.tier] || 0) + 1; D.history.push({ year: yr, tier: D.tier }); S.monVer = (S.monVer || 0) + 1; }
// ---- target tahunan (§2.4) ----
const YGC = () => C.YEAR_GOALS;
function goalSnap() { return { wish: S.p1.wishDone, pairs: S.pairsN || 0, births: S.births || 0, chain: S.p1.chainDone, wins: S.lombaWinsN || 0, haji: (S.wishStats.byId || {}).tabungan_haji || 0 }; }
// target riset tak boleh melebihi jumlah node riset yang ada (T09+ belum ada): min(target, jumlah riset)
const goalJ = g => g.tipe === 'riset' && (!g.target || g.target === 'semua') ? Math.min(g.jumlah || 1, techNodes().length || 1) : g.jumlah || 1;
function goalProg(g, G) { const b = G.base, n = goalJ(g), t = g.target;
  switch (g.tipe) {
    case 'capai_era': return [(S.era | 0) >= eraIndex(t) ? 1 : 0, 1];
    case 'bangun': return [Math.min(n, done(t).length), n];
    case 'tanpa_jenjang': return [g.seen && !g.fail ? 1 : 0, 1];
    case 'lomba_ikut': return [S.lomba && S.lomba.year === G.year - 1 && (S.lomba.stage || 0) > 0 ? 1 : 0, 1];
    case 'keinginan_terpenuhi': return [Math.min(n, S.p1.wishDone - b.wish), n];
    case 'tahap_monumen': return [Math.min(n, t === 'semua' ? monStagesAll() : monStage(t)), n];
    case 'gelar_teladan': return [tierIdx() >= TLC().tiers.findIndex(x => x.id === t) ? 1 : 0, 1];
    case 'pasangan': return [Math.min(n, (S.pairsN || 0) - b.pairs), n];
    case 'sahabat': { let c = 0; for (let i = 0; i < S.villagers.length; i++) for (let j = i + 1; j < S.villagers.length; j++) if (relGet(S.villagers[i], S.villagers[j]) >= RLC().levels.sahabat) c++; return [Math.min(n, c), n]; }
    case 'cerita_selesai': return [Math.min(n, S.p1.chainDone - b.chain), n];
    case 'monumen_selesai': return t ? [monStage(t) >= monStages(t).length ? 1 : 0, 1] : [Math.min(n, monDoneN()), n];
    case 'riset': return [Math.min(n, (S.techDone || []).length), n];
    case 'kelahiran': return [Math.min(n, (S.births || 0) - b.births), n];
    case 'lomba_menang': return [Math.min(n, (S.lombaWinsN || 0) - b.wins), n];
    case 'anak_bekerja': return [S.villagers.some(v => v.motherId != null && canWork(v) && !isBaby(v)) ? 1 : 0, 1];
    case 'keinginan_khusus': return [(S.wishStats.byId[t] || 0) > b.haji ? 1 : 0, 1];
  } return [0, 1]; }
function goalLabel(g) { const ex = { jumlah: goalJ(g), era: g.tipe === 'capai_era' ? C.ERAS[eraIndex(g.target)].nama : '', bangunan: g.target && C.BUILDINGS[g.target] ? C.BUILDINGS[g.target].nama : '', gelar: g.tipe === 'gelar_teladan' ? gelarName(TLC().tiers.findIndex(x => x.id === g.target)) : '' };
  let s = TX('rencana_tahun.nama_target.' + g.tipe, ex, g.tipe.replace(/_/g, ' ')); if (g.tipe === 'tahap_monumen' && g.target !== 'semua') s += ` (${monName(g.target)})`; if (g.tipe === 'monumen_selesai' && g.target) s = s.replace(/\d+ monumen|monumen/, monName(g.target)); return s; }
function goalsDaily() { const Y = YGC(); if (!Y || !Y.enabled || p1Off('rencana')) return; tujuanInit(); const yr = yearIdx() + 1, G = S.goals;
  if (G && G.year !== yr) { const n = G.list.filter(g => { const [c, m] = goalProg(g, G); return c >= m; }).length;
    if (n >= Y.needOf) { applyEffects(G.piagam || {}, 'piagam'); log('📜 ' + TX('rencana_tahun.piagam', { hari: S.day }, `Piagam Tahunan diraih!`)); S.piagam = (S.piagam || 0) + 1; }
    else log('🌱 ' + TX('rencana_tahun.tanpa_piagam', { hari: S.day }, `Tahun ini belum semua target tercapai. Tahun depan kita coba lagi.`));
    (S.goalHist = S.goalHist || []).push({ year: G.year, n }); S.goals = null; }
  if (!S.goals && Y.years[yr]) { const d = Y.years[yr]; S.goals = { year: yr, base: goalSnap(), piagam: d.piagam, list: [...d.utama.map(g => ({ ...g, utama: true })), ...d.pilihan.map(g => ({ ...g }))] };
    log('🗓️ ' + TX('rencana_tahun.pembuka_tahun.' + yr, { hari: S.day, tahun: yr }, TX('rencana_tahun.pembuka', { hari: S.day, tahun: yr }, `Rencana Desa Tahun ke-${yr} disusun.`))); if (S.day > 1) markMeaningful('hari_jadi'); }
  if (S.goals) for (const g of S.goals.list) if (g.tipe === 'tanpa_jenjang') { const inS = storySeason() === (g.musim === 'kemarau' ? (C.STORY_SEASON_ALIAS ? 'kemarau' : 'kemarau') : g.musim), lv = famineLevel(), bad = g.target === 'kritis' ? ['kritis', 'kolaps'] : ['bahaya', 'kritis', 'kolaps'];
    if (inS) { g.inS = true; if (bad.includes(lv)) g.fail = true; } else if (g.inS) g.seen = true; } }
// ---- Ringkasan Hari Jadi (modal): statistik setahun, target tahunan, gelar & monumen (data panel Tujuan). Teks: hari_jadi_ringkasan.* (cadangan di sini) ----
const HJ = (k, ex, fb) => TX('hari_jadi_ringkasan.' + k, ex || {}, fb);
const yearAccNew = () => ({ from: S.day, pop0: S.villagers.length, births: 0, deaths: 0, leavers: 0, built: 0, foodIn: 0, foodOut: 0, events: 0, wish0: (S.p1 && S.p1.wishDone) || 0 });
function yearAcc(d, r) { const Y = S.yearAcc = S.yearAcc || { ...yearAccNew(), from: 1 }, sum = o => Object.values(o || {}).reduce((a, n) => a + n, 0);
  Y.births += sum(d.births); Y.deaths += sum(d.deaths); Y.leavers += sum(d.leavers); Y.built += sum(d.built); Y.events += sum(d.events); Y.foodIn += sum(r.foodIn); Y.foodOut += sum(r.foodOut); }
function hariJadiSummary() { tujuanInit(); const Y = S.yearAcc || { ...yearAccNew(), from: 1, pop0: S.villagers.length }, pop = S.villagers.length, yr = yearIdx(), G = S.goals;
  const goals = G && YGC() && YGC().enabled && !p1Off('rencana') ? G.list.map(g => { const [c, m] = goalProg(g, G); return { txt: goalLabel(g), ok: c >= m, utama: !!g.utama }; }) : null;
  return { tahun: yr, hari: S.day, from: Y.from, to: S.day - 1, pop0: Y.pop0, pop, births: Y.births, deaths: Y.deaths, leavers: Y.leavers, newcomers: Math.max(0, pop - Y.pop0 - Y.births + Y.deaths + Y.leavers),
    built: Y.built, foodIn: Math.round(Y.foodIn), foodOut: Math.round(Y.foodOut), events: Y.events, wishes: Math.max(0, (S.p1.wishDone || 0) - (Y.wish0 || 0)),
    stages: (S.monLog || []).filter(m => m.day >= Y.from && MNC()[m.id]).map(m => ({ tahap: stName(m.id, m.k), monumen: monName(m.id) })),
    goals, need: goals ? YGC().needOf : 0, piagam: goals ? goals.filter(g => g.ok).length >= YGC().needOf : null,
    gelar: TLC() && TLC().enabled && !p1Off('teladan') && S.teladan ? gelarName(tierIdx()) : null,
    mons: MNC() && MNC().enabled ? MNC().order.filter(id => !p1Off(id)).map(id => { const b = monB(id); return { nama: monName(id), st: b ? b.mon.st : 0, N: monStages(id).length, pct: b && b.mon.act != null ? Math.round(Math.min(1, b.progress / bWork(b)) * 100) : null }; }) : [] }; }
// pagi Hari Jadi (hari pertama tahun ke-2, ke-3, ...): susun ringkasan SEBELUM target tahunan direset, catat di log, tampilkan modal (menyatu dengan event Hari Jadi bila ada)
function hariJadiDaily() { if (S.day <= 1 || dayOfYear() !== 1 || (S.hjDone || {})[yearIdx()]) return; const R = hariJadiSummary();
  (S.hjDone = S.hjDone || {})[R.tahun] = S.day; S.hjSummary = R; S.hjPending = true; S.yearAcc = yearAccNew(); markMeaningful('hari_jadi');
  log('🎂 ' + HJ('log', { hari: S.day, tahun: R.tahun, lahir: R.births, pendatang: R.newcomers, bangunan: R.built, tahap: R.stages.length },
    `Hari Jadi Desa ke-${R.tahun}! Setahun ini ${R.births} bayi lahir, ${R.newcomers} pendatang, ${R.built} bangunan, ${R.stages.length} tahap monumen.`)); }
function hariJadiHTML(R) { const row = (ic, k, fb, n) => `<div class="hjs"><span>${ic} ${HJ(k, {}, fb)}</span><b>${n}</b></div>`;
  let h = `<div class="hj"><h3>🎂 ${HJ('judul', { tahun: R.tahun }, `Hari Jadi Desa ke-${R.tahun}`)}</h3><small class="dim">${HJ('rentang', { hari: R.from, hari2: R.to }, `Hari ${R.from}–${R.to}`)}</small>`;
  h += `<h4>${HJ('statistik', {}, 'Setahun ini')}</h4><div class="hjgrid">` + row('👥', 'penduduk', 'Penduduk', `${R.pop0} → ${R.pop}`) + row('👶', 'lahir', 'Lahir', R.births) + row('🧳', 'pendatang', 'Pendatang', R.newcomers)
    + row('🕯️', 'wafat', 'Berpulang', R.deaths) + (R.leavers ? row('🚶', 'pergi', 'Pergi', R.leavers) : '') + row('🔨', 'bangunan', 'Bangunan selesai', R.built)
    + row('🍚', 'pangan_masuk', 'Pangan masuk', R.foodIn) + row('🍽️', 'pangan_keluar', 'Pangan keluar', R.foodOut) + row('💭', 'keinginan', 'Keinginan terwujud', R.wishes) + row('📜', 'kejadian', 'Kejadian', R.events) + '</div>';
  if (R.goals) h += `<h4>🗓️ ${HJ('target', { jumlah: R.goals.filter(g => g.ok).length, jumlah2: R.goals.length }, `Rencana Desa: ${R.goals.filter(g => g.ok).length}/${R.goals.length} tercapai`)}</h4><div class="greq">`
    + R.goals.map(g => `<div>${g.ok ? '✅' : '▫️'} ${g.txt}</div>`).join('') + `</div><div class="hjp">${R.piagam ? '📜 ' + HJ('piagam', {}, 'Piagam Tahunan diraih!') : '🌱 ' + HJ('tanpa_piagam', { jumlah: R.need }, `Piagam butuh ${R.need} target. Tahun depan kita coba lagi.`)}</div>`;
  if (R.gelar) h += `<h4>🏆 ${HJ('gelar', {}, 'Gelar desa')}: ${R.gelar}</h4>`;
  if (R.mons.length) h += `<h4>🏛️ ${HJ('monumen', {}, 'Monumen')}</h4>` + R.mons.map(m => `<div class="hjs"><span>${m.nama}</span><span>${[...Array(m.N)].map((_, i) => pipHTML(i < m.st ? 2 : i === m.st && m.pct != null ? 1 : 0)).join('')} <small>${m.st}/${m.N}${m.pct != null ? ' · ' + m.pct + '%' : ''}</small></span></div>`).join('')
    + (R.stages.length ? `<small>${HJ('tahap_tahun_ini', {}, 'Selesai tahun ini')}: ${R.stages.map(t => `${t.tahap} (${t.monumen})`).join(', ')}</small>` : '');
  return h + '</div>'; }
// modal mandiri bila tidak ada event Hari Jadi (mis. teks event tidak ada): S.event '@harijadi', tombol data-ev="0" menutup
function showHariJadi() { const box = $('modal'); box.className = 'panel hjm'; box.style.display = 'block'; sfx('event'); S.hjPending = false;
  box.innerHTML = hariJadiHTML(S.hjSummary) + `<div><button data-ev="0">${HJ('tutup', {}, 'Lanjutkan')}</button></div>`; }
// nama monumen (monumen.<id>.nama) & bangunan lokal P1 (bangunan_lokal.orang_orangan_sawah / kandang_ayam .nama) dari TEKS; tema bertimpa (sedang) tanpa bangunan_lokal -> nama tema/cadangan
function tujuanNames(t) { if (!t) return; const M = MNC() || {}; for (const id of Object.keys(M)) if (C.BUILDINGS[id] && C.BUILDINGS[id].monumen && monText(id).nama) C.BUILDINGS[id] = { ...C.BUILDINGS[id], nama: monText(id).nama };
  if (t.__localNames) for (const [b, k] of [['orang_orangan', 'orang_orangan_sawah'], ['kandang_ayam', 'kandang_ayam']]) { const n = ((t.bangunan_lokal || {})[k] || {}).nama; if (n && C.BUILDINGS[b]) C.BUILDINGS[b] = { ...C.BUILDINGS[b], nama: cap1(n) }; } }
function tujuanDaily() { tujuanInit(); histDaily(); monDaily(); teladanDaily(); hariJadiDaily(); goalsDaily(); chainDaily();
  if (S.petMood) { const v = vById(S.petMood.vid); if (v) v.mood = Math.min(100, v.mood + S.petMood.n * 0.25); else S.petMood = null; } } // kucing belang: pemilik sedikit lebih senang tiap hari
// ---- panel Tujuan Desa ----
function openTujuan() { const p = $('tujuanpanel'); p.style.display = p.style.display === 'block' ? 'none' : 'block'; tujuanPanelUI(); }
const pipHTML = f => `<span class="mpip" style="background-position:-${f * 8}px 0"></span>`;
function tujuanPanelUI() { const p = $('tujuanpanel'); if (!p || p.style.display !== 'block') return; const M = MNC(), U = (TEXT && TEXT.monumen && TEXT.monumen.ui) || {};
  let h = `<button id="tjClose" class="x">✖</button><h3>🏛️ ${U.judul_panel || 'Tujuan Desa'}</h3><h4>${U.monumen || 'Monumen'}</h4>`;
  for (const id of M.order) { if (p1Off(id)) continue; const b = monB(id), N = monStages(id).length, n = monNext(id), st = b ? b.mon.st : 0, act = b && b.mon.act != null;
    const frac = act ? Math.min(1, b.progress / bWork(b)) : 0, pct = Math.round(frac * 100), all = (st + frac) / N;
    const thumb = `assets/buildings/monuments/${id}_tahap${Math.max(1, st)}.png`;
    const pips = monStages(id).map((_, i) => pipHTML(i < st ? 2 : act && i === b.mon.act ? 1 : 0)).join('');
    const bar = `<div class="mbar"><div class="mfill" style="width:${Math.round(all * 84)}px"></div>${monStages(id).slice(1).map((_, j) => `<span class="mdiv" style="left:${6 + Math.round(84 * (j + 1) / N) - 1}px"></span>`).join('')}</div>`;
    const lbl = act ? MUI('progres', { jumlah: b.mon.act + 1, jumlah2: N, persen: pct }, `Tahap ${b.mon.act + 1}/${N} · ${pct}%`) : `Tahap ${st}/${N}`;
    let btn = ''; if (!n.done && !n.active) { const cost = n.ef ? Object.entries(n.ef).map(([k, v]) => `${-v} ${resIcon(k)}`).join(' ') : Object.entries(resolveCost(neg(monStages(id)[n.k].cost))).map(([k, v]) => `${-v} ${resIcon(k)}`).join(' ');
      btn = `<button class="mbtn" data-mon="${id}" ${n.ok ? '' : `disabled title="${(n.why || '').replace(/"/g, '&quot;')}"`}><img src="assets/ui/progress/icon_bangun_16.png"> ${b ? MUI('tombol_mulai_tahap', { jumlah: n.k + 1 }, 'Mulai tahap ' + (n.k + 1)) : MUI('tombol_fondasi', {}, 'Taruh fondasi')}: ${stName(id, n.k)}</button><small class="cost">${cost}</small>${n.why ? `<small class="why">${n.why}</small>` : ''}`; }
    else if (n.done) btn = `<small>✅ ${monName(id)}</small>`;
    const bon = TX(`monumen.${id}.tahap.${Math.min(N - 1, act ? b.mon.act : st)}.bonus_ringkas`, {}, '');
    h += `<div class="mcard"><img class="mthumb" src="${thumb}" onerror="this.style.visibility='hidden'"><div><b>${monName(id)}</b><div class="mrow">${pips} <small>${lbl}</small></div>${bar}<small class="dim">${bon}</small><div>${btn}</div></div></div>`; }
  const kb = kbStatus(); if (!kb.off) h += `<h4>🤝 ${TX('kerja_bakti.tombol', {}, 'Kerja bakti')}</h4><small class="dim">${TX('kerja_bakti.tooltip', {}, '')}</small><div><button id="kbBtn" ${kb.ok ? '' : 'disabled'}><img src="assets/ui/progress/icon_bangun_16.png"> ${TX('kerja_bakti.tombol', {}, 'Kerja bakti')}</button> <label><input type="checkbox" id="kbKopi"> ${TX('kerja_bakti.tombol_kopi', {}, 'Sediakan kopi (+semangat)')}</label>${kb.why ? `<br><small class="why">${kb.why}</small>` : kb.active ? '<br><small>Sedang berlangsung…</small>' : ''}</div>`;
  const T = TLC(); if (T && T.enabled && !p1Off('teladan') && S.teladan) { const nx = T.tiers[tierIdx() + 1], TP = (TEXT && TEXT.teladan && TEXT.teladan.panel) || {};
    const nextDay = S.day + ((T.assessDayOfYear - dayOfYear() + yearDays()) % yearDays() || yearDays());
    h += `<h4>🏆 ${TP.judul || 'Gelar Desa'}: ${gelarName(tierIdx())}${S.teladan.suspended ? ' (ditangguhkan)' : ''}</h4><small>${fill(TP.poin || 'Poin Teladan: {jumlah}', { jumlah: S.teladanPoin || 0 })} · ${fill(TP.penilaian_berikut || 'Penilaian berikutnya: hari ke-{hari}', { hari: nextDay })}</small>`;
    if (nx) h += `<div class="greq"><small>${fill(TP.syarat || 'Syarat {gelar}', { gelar: gelarName(tierIdx() + 1) })}:</small>${teladanReq(nx).map(x => `<div>${x.ok ? '✅' : '▫️'} ${x.txt}</div>`).join('')}</div>`; }
  const G = S.goals; if (G && !p1Off('rencana')) { const RP = (TEXT && TEXT.rencana_tahun && TEXT.rencana_tahun.panel) || {}, nDone = G.list.filter(g => { const [c, m] = goalProg(g, G); return c >= m; }).length;
    h += `<h4>🗓️ ${fill(RP.judul || 'Rencana Desa Tahun ke-{tahun}', { tahun: G.year })}</h4><small>${fill(RP.syarat_piagam || 'Selesaikan {jumlah} dari {jumlah2} untuk Piagam Tahunan', { jumlah: YGC().needOf, jumlah2: G.list.length })} · ${fill(RP.progres || '{jumlah}/{jumlah2} selesai', { jumlah: nDone, jumlah2: G.list.length })}</small>`;
    for (const [lab, arr] of [[RP.utama || 'Target utama', G.list.filter(g => g.utama)], [RP.pilihan || 'Target pilihan', G.list.filter(g => !g.utama)]]) h += `<div class="greq"><small><b>${lab}</b></small>${arr.map(g => { const [c, m] = goalProg(g, G); return `<div>${c >= m ? '✅' : '▫️'} ${goalLabel(g)}${m > 1 ? ` <small>(${c}/${m})</small>` : ''}</div>`; }).join('')}</div>`; }
  setHTML('tujuanpanel', h); }
// monumen di peta: seni tahap (proses: <id>_tahapN_stages frame min(2, floor(p*3)); selesai: <id>_tahapN), jangkar tengah-bawah tapak; batang progres monument_bar_*
function drawMonument(b, d) { const act = b.mon.act != null, k = act ? b.mon.act + 1 : Math.max(1, b.mon.st), key = `${b.type}_tahap${k}${act ? '_stages' : ''}`;
  const fr = act ? Math.min(2, Math.floor(b.progress / bWork(b) * 3)) : 0; ctx.globalAlpha = act && b.mon.st === 0 && b.progress < 1 ? 0.6 : 1;
  const ok = ASSETS[key] && sprite(key, b.x, b.y, d.w, d.h, fr); ctx.globalAlpha = 1; if (act) drawMonBar(b, d); return ok; }
function drawMonBar(b, d) { const fr = wImg('assets/ui/progress/monument_bar_frame.png'), fill_ = wImg('assets/ui/progress/monument_bar_fill.png'), fd = wImg('assets/ui/progress/monument_bar_fill_done.png'), fe = wImg('assets/ui/progress/monument_bar_fill_end.png'), dv = wImg('assets/ui/progress/monument_bar_divider.png');
  const N = monStages(b.type).length, p = (b.mon.act + Math.min(1, b.progress / bWork(b))) / N, x = Math.round(b.x * T + d.w * T / 2 - 24), fh = (ASSETS[b.type + '_tahap1'] || {}).fh || d.h * T, y = Math.round((b.y + d.h) * T - fh - 14);
  if (!fr) { ctx.fillStyle = '#000a'; ctx.fillRect(x + 4, y + 4, 40, 4); ctx.fillStyle = '#ffd27a'; ctx.fillRect(x + 4, y + 4, 40 * p, 4); return; }
  ctx.drawImage(fr, x, y); const doneW = Math.round(40 * b.mon.act / N), w = Math.round(40 * p);
  for (let i = 0; i < w; i += 4) { const im = i < doneW ? fd : fill_, ww = Math.min(4, w - i); if (im) ctx.drawImage(im, 0, 0, ww, 4, x + 4 + i, y + 4, ww, 4); }
  if (fe && w > 2 && w < 40) ctx.drawImage(fe, x + 4 + w - 2, y + 4);
  if (dv) for (let j = 1; j < N; j++) ctx.drawImage(dv, x + 4 + Math.round(40 * j / N) - 1, y + 2);
  ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`${stName(b.type, b.mon.act)} ${Math.round(b.progress / bWork(b) * 100)}%`, x + 24, y - 2); ctx.textAlign = 'left'; }
// ================= P1: cerita berantai (§1.4) — 5 rantai; langkah pilihan = kartu cerita (Juru Cerita), langkah otomatis/acak/cek/tunggu diselesaikan pagi hari =================
const CHC = () => C.STORY_CHAINS;
const chainText = id => (TEXT && TEXT.cerita && TEXT.cerita[id]) || {};
const chainStepText = (id, k) => (chainText(id).langkah || [])[k] || {};
function chainActorOk(id, d, v) { const s = d.syarat || {};
  if (!v || isKid(v) && !(s.adaAnakAtauSifat && stageOf(v) === 'anak' && ageOf(v) >= 6)) return false;
  if (s.sifat && !hasTrait(v, s.sifat)) return false; if (s.sifatSalah && !s.sifatSalah.some(t => hasTrait(v, t))) return false;
  if (s.adaAnakAtauSifat && !(isKid(v) || hasTrait(v, s.adaAnakAtauSifat))) return false; return true; }
function chainEligible(id) { const H = CHC(), d = H[id], s = d.syarat || {}, D = S.chains.done[id];
  if (p1Off(id) || S.day < Math.max(H.minDay, s.minDay || 0) || s.era && (S.era | 0) < eraIndex(s.era) || S.chains.active.some(c => c.id === id)) return null;
  if (s.butuh === 'pedagangPernahDatang' && !S.merchantSeen || s.bangunan && !done(s.bangunan).length || s.setelah === 'serangan' && S.lastAttackDay == null) return null;
  if (D && S.day - D.day < H.repeatOtherVillagerDays) return null;
  const busy = new Set(S.chains.active.flatMap(c => c.aktor));
  const vs = S.villagers.filter(v => !busy.has(v.id) && (!D || v.id !== D.vid) && chainActorOk(id, d, v)); return vs.length ? pick(vs) : null; }
function chainStart() { const H = CHC(); if (!H || !H.enabled || !TEXT || !TEXT.cerita) return false; tujuanInit(); if (S.chains.active.length >= H.maxActive) return false;
  const ids = Object.keys(H).filter(k => H[k] && H[k].langkah).sort(() => Math.random() - 0.5);
  for (const id of ids) { const v = chainEligible(id); if (!v) continue; const ch = { id, aktor: [v.id], nama: v.name, step: 0, due: S.day, since: S.day, from: S.day }; S.chains.active.push(ch); return chainCard(ch); }
  return false; }
const chainDueCard = () => (S.chains && S.chains.active || []).find(c => S.day >= c.due && (CHC()[c.id].langkah[c.step] || {}).pilihan && vById(c.aktor[0]));
function chainCard(ch) { markMeaningful('cerita'); openStory({ type: 'cerita', id: ch.id, step: ch.step, aktor: ch.aktor, day: S.day }); return true; }
function chainEx(ch) { const a = vById(ch.aktor[0]) || ((S.away || []).find(x => x.v.id === ch.aktor[0]) || {}).v; return { nama: a ? a.name : ch.nama || 'Warga', hari: S.day }; }
function showChain() { const st = S.story, box = $('modal'), d = CHC()[st.id], L = d.langkah[st.step], tx = chainStepText(st.id, st.step), ct = chainText(st.id), ch = S.chains.active.find(c => c.id === st.id), ex = chainEx(ch || { aktor: st.aktor }), a = vById(st.aktor[0]);
  const FR = 'url(assets/ui/dilemma/portrait_frame_80.png) 0 0/80px 80px no-repeat', por = a ? `<div class="por" style="background:${FR}, url(${portraitOf(a)}) ${8 - 64}px 8px/320px 64px no-repeat"></div>` : '';
  const opts = (L.pilihan || []).map((p, i) => { const ef = resolveCost(p.efek || {}), ok = affordable(ef), pt = (tx.pilihan || [])[i] || {};
    const cost = Object.entries(ef).filter(([k, n]) => typeof n === 'number' && (k in S.res || k === 'suasana_hati')).map(([k, n]) => `${n > 0 ? '+' : ''}${n} ${k === 'suasana_hati' ? '🙂' : resIcon(k)}`).join(' ');
    return { ok, html: `<button class="opt" data-ev="${i}" ${ok ? '' : 'disabled'}><span class="ot">${fill(pt.teks || (i ? 'Tidak' : 'Ya'), ex)}</span><span class="oc">${cost}</span></button>` }; });
  if (!opts.some(o => o.ok)) opts[opts.length - 1].html = opts[opts.length - 1].html.replace(' disabled', '');
  box.innerHTML = `<div class="dcard km">${por}<div class="dhead"><small>📖 ${TX('cerita_ui.label', {}, 'Cerita Warga')} · ${st.step + 1}/${d.langkah.length}</small><h3>${fill(ct.judul || st.id, ex)}</h3></div><p>${fill(tx.teks || ct.ringkasan || '', ex)}</p><div class="opts">${opts.map(o => o.html).join('')}</div></div>`; }
function chooseChain(i) { const st = S.story, ch = S.chains.active.find(c => c.id === st.id); S.event = null; S.story = null; const box = $('modal'); box.style.display = 'none'; box.classList.remove('story');
  if (!ch) return; const L = CHC()[ch.id].langkah[ch.step], p = (L.pilihan || [])[i] || {}, pt = (chainStepText(ch.id, ch.step).pilihan || [])[i] || {};
  applyStoryEffects(resolveCost(p.efek || {}), { aktor: ch.aktor }); log(`📖 ${chainText(ch.id).judul || ch.id} — ${fill(pt.teks_hasil || pt.teks || '', chainEx(ch))}`);
  chainNext(ch, 'lanjut' in p ? p.lanjut : L.lanjut, p.jeda || L.jeda); checkAch(); }
function chainNext(ch, next, jeda) { if (next == null) return chainFinish(ch); ch.step = next; ch.since = S.day; ch.due = S.day + (jeda ? rndInt(jeda[0], jeda[1]) : 1); }
function chainFinish(ch) { S.chains.active = S.chains.active.filter(c => c !== ch); S.chains.done[ch.id] = { day: S.day, vid: ch.aktor[0] }; S.p1.chainDone++;
  const t = chainText(ch.id).selesai; if (t) log('📕 ' + fill(t, chainEx(ch))); markMeaningful('cerita'); }
// hasil acak: [{peluang, kunci, efek, lanjut, jeda, peluangDenganDapur, syaratMoodBawah}]
function chainRoll(list, a) { let r = Math.random(); for (const o of list) { if (o.syaratMoodBawah != null && !(a && a.mood < o.syaratMoodBawah)) continue; const pr = o.peluangDenganDapur != null && done('dapur').length ? o.peluangDenganDapur : o.peluang; if ((r -= pr) < 0) return o; } return null; }
function chainOutcome(ch, o, L) { if (!o) return; if (o.efek) applyStoryEffects(resolveCost(o.efek), { aktor: ch.aktor }); const h = o.kunci && (chainStepText(ch.id, ch.step).hasil || {})[o.kunci]; if (h) log('📖 ' + fill(h, chainEx(ch))); return o; }
function chainDaily() { const H = CHC(); if (!H || !H.enabled) return; tujuanInit();
  for (const ch of S.chains.active.slice()) { const a = vById(ch.aktor[0]), away = (S.away || []).find(x => x.v.id === ch.aktor[0]);
    if (!a) { if (away) { ch.due = Math.max(ch.due, away.back); continue; } S.chains.active = S.chains.active.filter(c => c !== ch); continue; } // aktor meninggal/pergi: rantai berhenti
    if (S.day < ch.due) continue; const L = H[ch.id].langkah[ch.step]; if (!L || L.pilihan) continue;
    if (L.tunggu) { const ok = L.tunggu === 'pentasBerikut' ? Math.max(S.lastReog ?? -1, S.lastPanggungDay ?? -1) >= ch.since : L.tunggu === 'ancamanMendekat' ? Math.max(S.lastAttackDay ?? -1, S.lastThreatNearDay ?? -1) >= ch.since : true;
      if (!ok && S.day - ch.since < (L.batasHari || 30)) continue; }
    const tx = chainStepText(ch.id, ch.step); if (tx.teks && !L.cek) log('📖 ' + fill(tx.teks, chainEx(ch)));
    if (L.efek) applyStoryEffects(resolveCost(L.efek), { aktor: ch.aktor });
    let o = null; if (L.kunci) { const h = (tx.hasil || {})[L.kunci]; if (h) log('📖 ' + fill(h, chainEx(ch))); }
    if (L.acak) o = chainOutcome(ch, chainRoll(L.acak, a), L);
    if (L.cek) { const best = Math.max(-100, ...S.villagers.filter(v => v !== a).map(v => relGet(a, v))), br = best >= (L.cek.relTertinggi ?? 50) ? L.ya : L.tidak;
      if (tx.teks) log('📖 ' + fill(tx.teks, chainEx(ch))); if (br) { if (br.efek) applyStoryEffects(resolveCost(br.efek), { aktor: ch.aktor }); const r = br.acak ? chainOutcome(ch, chainRoll(br.acak, a), L) : null;
        if (!r && br.kunci) { const h = (tx.hasil || {})[br.kunci]; if (h) log('📖 ' + fill(h, chainEx(ch))); } } }
    markMeaningful('cerita'); if (!S.chains.active.includes(ch)) continue;
    chainNext(ch, o && 'lanjut' in o ? o.lanjut : L.lanjut, o && o.jeda || L.jeda); } }
// ================= P1: orang-orangan sawah (bangunan nyata; D15 monyet_kebun opsi 1 = dibangunkan gratis) =================
const scarecrowNear = b => S.buildings.some(s => s.type === 'orang_orangan' && s.done && dist(center(s), center(b)) <= C.SCARECROW.radius);
function scarecrowScare(hewan) { const sc = S.buildings.filter(b => b.type === 'orang_orangan' && b.done), b = sc.length ? pick(sc) : null; S.scarecrowScares = (S.scarecrowScares || 0) + 1;
  log('🌾 ' + TT('diusir_orang_orangan', { hewan }, 'Orang-orangan sawah bergoyang ditiup angin. Seekor {hewan} ragu dan mundur ke hutan.'));
  if (b) floatText(cap1(TX('dilema_ui.orang_orangan_teks_melayang', { hewan: cap1(hewan) }, `${cap1(hewan)} kabur!`)), b.x, b.y - 1); }
function scarecrowMonkeyMult() { const fl = S.buildings.filter(b => b.type === 'ladang' && b.done); if (!fl.length || !C.SCARECROW) return 1; return 1 - (1 - C.SCARECROW.monkeyMult) * fl.filter(scarecrowNear).length / fl.length; }
function placeScarecrow() { const fl = S.buildings.filter(b => b.type === 'ladang'), base = fl.length ? fl : [{ x: C.CAMP.x, y: C.CAMP.y }], cands = [];
  for (const f of base) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [0, 2], [-2, 0], [0, -2]]) { const x = f.x + dx, y = f.y + dy;
    if (validSpot('orang_orangan', x, y)) cands.push({ x, y, s: fl.filter(o => dist(center(o), { x: x + 0.5, y: y + 0.5 }) <= C.SCARECROW.radius).length }); }
  if (!cands.length) return null; cands.sort((a, b) => b.s - a.s); addBuilding('orang_orangan', cands[0].x, cands[0].y, true); return S.buildings[S.buildings.length - 1]; }
// ---- Agustusan (§2.3) ----
const agustusYear = () => yearIdx();
function agustusDay() { const A = AGC(); if (!A || !A.enabled) return false; const d = dayOfYear(); return d === A.prepDayOfYear || d === A.tirakatanDayOfYear || d === A.dayOfYear; }
function lombaAvail(id) { const L = AGC().lomba[id]; return L && (S.era | 0) >= eraIndex(L.era || 'perkemahan'); }
function lombaCost(ids, yr) { if (yr === 0 && AGC().year1Free) return {}; const c = {}; for (const id of ids) { const L = AGC().lomba[id]; for (const [k, n] of Object.entries(L.cost || {})) c[k] = (c[k] || 0) - n;
    if (L.costOnce && !S.lomba.owned?.[id]) for (const [k, n] of Object.entries(L.costOnce)) c[k] = (c[k] || 0) - n; if (L.hadiahGantung) for (const [k, n] of Object.entries(L.hadiahGantung)) c[k] = (c[k] || 0) - n; } return resolveCost(c); }
function findLapangan() { const ok = (x, y) => x >= 1 && y >= 1 && x < C.MAP_W - 1 && y < C.MAP_H - 1 && !S.tiles[y][x] && !S.nodes.some(n => n.x === x && n.y === y) && !S.buildings.some(b => { const d = C.BUILDINGS[b.type]; return x >= b.x && x < b.x + d.w && y >= b.y && y < b.y + d.h; });
  for (let r = 2; r < 16; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = CAMP.x + dx, y = CAMP.y + dy; let good = true; for (let j = 0; j < 4 && good; j++) for (let i = 0; i < 7 && good; i++) good = ok(x + i, y + j); if (good) return { x, y }; }
  return { x: CAMP.x + 2, y: CAMP.y + 3 }; }
function agustusNewDay() { const A = AGC(); if (!A || !A.enabled) return; const L = S.lomba, d = dayOfYear();
  if (L.year === agustusYear() && L.umbul > 0 && d >= A.umbul.days[0] && d <= A.umbul.days[1]) { const m = Math.min(3, L.umbul * A.umbul.moodPerDay) * festMult(); S.villagers.forEach(v => v.mood = Math.min(100, v.mood + m)); }
  if (d === A.prepDayOfYear && L.year !== agustusYear()) { if (L.year >= 0) L.history.push({ year: L.year, results: L.results, juara: L.juara }); Object.assign(L, { year: agustusYear(), stage: 0, picked: null, umbul: 0, results: [], wins: {}, juara: null, lap: findLapangan(), owned: L.owned || {} }); } }
const festMult = () => anyTrait('seniman') ? TRT().list.seniman.festivalMoodMult : 1; // seniman: mood festival/lomba x1.25 (sekali per desa)
const lombaFrac = () => (agustusYear() === 0 ? AGC().year1LombaFrac : AGC().lombaFrac) || AGC().lombaFrac;
function agustusStep() { const A = AGC(); if (!A || !A.enabled || !S.lomba || S.lomba.year !== agustusYear()) return; const L = S.lomba, d = dayOfYear(), f = dayFrac(), AT = (TEXT && TEXT.agustusan) || {};
  if (L.stage === 0 && d >= A.prepDayOfYear && d < A.dayOfYear && f >= A.prepFrac && !S.event && !isNight()) { L.stage = 1; markMeaningful('agustusan'); openStory({ type: 'panitia', day: S.day }); return; }
  if (L.stage <= 1 && d >= A.dayOfYear && !S.event) { if (!L.picked) L.picked = defaultLomba(); L.stage = Math.max(L.stage, 2); }
  if (L.stage === 2 && d === A.tirakatanDayOfYear && f >= A.tirakatanFrac) { L.stage = 3; tirakatan(); }
  if (L.stage <= 3 && d === A.dayOfYear && f >= A.upacaraFrac) { if (L.stage < 3) L.stage = 3; L.stage = 4; markMeaningful('agustusan'); const fm = festMult();
    if (AT.upacara) log(agusIkon() + ' ' + fill(pick(AT.upacara))); S.villagers.forEach(v => v.mood = Math.min(100, v.mood + 2 * fm)); }
  const [l0, l1] = lombaFrac();
  if (L.stage === 4 && d === A.dayOfYear && f >= l0) { L.stage = 5; S.lombaOn = true; L.next = 0; }
  if (L.stage === 5) { const n = L.picked.length, slot = (l1 - l0) / Math.max(1, n); while (L.next < n && f >= l0 + slot * (L.next + 0.5)) { runLomba(L.picked[L.next]); L.next++; } L.current = L.picked[Math.min(n - 1, Math.floor((f - l0) / slot))];
    if (f >= l1 || d !== A.dayOfYear) { while (L.next < n) { runLomba(L.picked[L.next]); L.next++; } S.lombaOn = false; L.current = null; L.stage = 6; } }
  if (L.stage === 6 && (f >= A.panggungFrac || d !== A.dayOfYear)) { L.stage = 7; panggung(); } }
function defaultLomba() { const yr = agustusYear(), A = AGC(), n = yr === 0 ? A.year1Slots : A.slots; const ids = A.order.filter(lombaAvail); const out = [];
  for (const id of ids) { if (out.length >= n) break; if (affordable(lombaCost([...out, id], yr))) out.push(id); } return out; }
const agusIkon = () => TX('agustusan.ikon_log', {}, C.THEME === 'sedang' ? '🎉' : '🇮🇩'); // QC T-03: ikon log Agustusan per tema
function showPanitia() { const A = AGC(), AT = (TEXT && TEXT.agustusan) || {}, P = AT.panitia || {}, yr = agustusYear(), n = yr === 0 ? A.year1Slots : Math.min(A.maxSlots, A.slots), def = defaultLomba(), box = $('modal');
  const rows = A.order.filter(lombaAvail).map(id => { const t = (AT.lomba || {})[id] || {}, c = lombaCost([id], yr), cs = Object.entries(c).map(([k, v]) => `${v} ${resIcon(k)}`).join(' ');
    return `<label class="lomba"><input type="checkbox" data-lomba="${id}" ${def.includes(id) ? 'checked' : ''}> <b>${t.nama || id}</b> <small>${t.deskripsi || ''} ${cs ? '(' + cs + ')' : ''}</small></label>`; }).join('');
  const uc = resolveCost(A.umbul.cost), um = k => Object.entries(uc).map(([r, v]) => `${v * k} ${resIcon(r)}`).join(' '), u3 = Object.fromEntries(Object.entries(uc).map(([r, v]) => [r, v * 3])), u6 = Object.fromEntries(Object.entries(uc).map(([r, v]) => [r, v * 6]));
  box.innerHTML = `<div class="dcard kA"><div class="por" style="background:url(assets/ui/dilemma/portrait_frame_80.png) 0 0/80px 80px no-repeat${(C.AGUS_HIDE || []).includes('agus_bendera') ? '' : ', url(assets/decor/agustus/bendera_merah_putih.png) 24px -14px/128px 96px no-repeat'}"></div><div class="dhead"><small>${qAttr(TX('agustusan.panitia.label', {}, C.THEME === 'sedang' ? 'Festival Panen' : '17 Agustus'))}</small><h3>${P.judul || 'Panitia 17-an'}</h3></div><p>${fill(P.teks || 'Pilih lomba tahun ini.')}</p>`
    + `${yr === 0 ? `<p><small>${P.tahun1 || ''}</small></p>` : ''}<p><small>${fill(P.slot || 'Lomba dipilih: {jumlah}/{jumlah2}', { jumlah: def.length, jumlah2: n })}</small></p>${rows}`
    + `<div class="opts"><button class="opt" data-ev="0"><span class="ot">✔️ ${TX('agustusan.panitia.setuju', {}, 'Setuju')}</span></button>`
    + `<button class="opt" data-ev="1" ${affordable(u3) ? '' : 'disabled'}><span class="ot">${P.umbul || 'Pasang umbul-umbul'} ×3</span><span class="oc">${um(3)}</span></button>`
    + `<button class="opt" data-ev="2" ${affordable(u6) ? '' : 'disabled'}><span class="ot">${P.umbul || 'Pasang umbul-umbul'} ×6</span><span class="oc">${um(6)}</span></button></div></div>`; }
function choosePanitia(i) { const A = AGC(), AT = (TEXT && TEXT.agustusan) || {}, L = S.lomba, yr = agustusYear(), n = yr === 0 ? A.year1Slots : Math.min(A.maxSlots, A.slots);
  const boxes = [...document.querySelectorAll('[data-lomba]')]; let ids = boxes.length ? boxes.filter(b => b.checked).map(b => b.dataset.lomba).slice(0, n) : defaultLomba(); if (!ids.length) ids = defaultLomba();
  while (ids.length && !affordable(lombaCost(ids, yr))) ids.pop(); const cost = lombaCost(ids, yr); applyStoryEffects(cost, {}); for (const id of ids) if (A.lomba[id].costOnce) L.owned[id] = true;
  L.picked = ids; const u = [0, 3, 6][i] || 0; if (u) { const uc = resolveCost(A.umbul.cost), c = Object.fromEntries(Object.entries(uc).map(([r, v]) => [r, v * u])); if (affordable(c)) { applyStoryEffects(c, {}); L.umbul = Math.min(A.umbul.max, u);
      if (AT.umbul_umbul) log('🎏 ' + fill(pick(AT.umbul_umbul))); } }
  const P = AT.panitia || {}; if (P.log) log(agusIkon() + ' ' + fill(pick(P.log))); L.stage = 2;
  S.event = null; S.story = null; const box = $('modal'); box.style.display = 'none'; box.classList.remove('story'); }
function tirakatan() { const A = AGC(), AT = (TEXT && TEXT.agustusan) || {}, fm = festMult(); markMeaningful('agustusan');
  S.villagers.forEach(v => v.mood = Math.min(100, v.mood + A.tirakatan.mood * fm)); relAll(A.tirakatan.rel);
  const tp = A.tirakatan.tumpeng; let tumpeng = false; if (agustusYear() + 1 >= tp.fromYear && foodDays() >= 10) { const c = resolveCost(Object.fromEntries(Object.entries(tp.cost).map(([k, n]) => [k, -Math.ceil(n * feastMult())])));
    if (affordable(c)) { for (const [k, n] of Object.entries(c)) { S.res[k] += n; if (k === 'makanan' || k === 'gandum') foodLedger(n, true); } tumpeng = true; S.villagers.forEach(v => v.mood = Math.min(100, v.mood + tp.mood * fm)); } }
  const T = AT.malam_tirakatan || []; if (T.length) log('🕯️ ' + fill(T[tumpeng && T[1] ? 1 : 0])); }
const lombaPool = () => S.villagers.filter(v => canWork(v) && !isKid(v) && !v.sick && !(v.pregnantUntil && v.pregnantUntil - S.day <= 2));
const lombaScore = (v, L) => { const Sc = AGC().score; return Sc.base + (L.skill ? (v.skills[L.skill] || 0) * Sc.skillMult : 0) + Object.entries(L.sifat || {}).reduce((a, [t, n]) => a + ((v.traits || []).includes(t) ? n : 0), 0) + Math.random() * Sc.rand; };
function runLomba(id) { const A = AGC(), L = A.lomba[id], LT = ((TEXT && TEXT.agustusan && TEXT.agustusan.lomba) || {})[id] || {}, R = S.lomba, fm = festMult(), pool = lombaPool().sort(() => Math.random() - 0.5);
  const mood = (vs, n) => vs.forEach(v => v.mood = Math.min(100, v.mood + n * fm)), lg = (k, ex) => { if (LT[k] && LT[k].length) log('🏁 ' + fill(pick(LT[k]), ex)); }, win = vs => vs.forEach(v => { R.wins[v.id] = (R.wins[v.id] || 0) + 1; v.lombaWonDay = S.day; S.lombaWinsN = (S.lombaWinsN || 0) + 1; });
  if (pool.length < 2) { R.results.push({ id, winners: [] }); return; } lg('mulai', {}); markMeaningful('agustusan'); let winners = [];
  if (L.tim) { const n = id === 'panjat_pinang' ? Math.min(pool.length, S.villagers.length >= L.timBesarPop ? 4 : 3) : pool.length;
    if (id === 'tarik_tambang') { const half = Math.floor(n / 2), t1 = pool.slice(0, half), t2 = pool.slice(half, half * 2), sc = t => t.reduce((a, v) => a + 1 + Object.entries(L.sifat).reduce((x, [s, k]) => x + ((v.traits || []).includes(s) ? k : 0), 0) + (v.skills.membangun || 0) * 0.3, 0) + Math.random();
      const [w, l] = sc(t1) >= sc(t2) ? [t1, t2] : [t2, t1]; winners = w; relAll(L.menangRel, w); relAll(RLC().gain.lombaTim, l); mood(w, L.menang); mood(l, L.kalah); mood(S.villagers, L.semua);
      for (const a of t1) for (const b of t2) if (relLevel(a, b) === 'rival') { if (Math.random() < L.rivalOpp.shake) relAdd(a, b, L.rivalOpp.relShake, 'lomba'); else relSet(a, b, relGet(a, b) + L.rivalOpp.relSour); }
      lg('menang', { nama: w[0].name, nama2: l[0].name }); if (l[0]) lg('kalah', { nama: l[0].name }); }
    else { const team = pool.slice(0, n), su = L.sukses, p = su.base + su.perSifat * team.filter(v => su.sifat.some(s => (v.traits || []).includes(s))).length + su.perSkill * team.reduce((a, v) => a + (v.skills.membangun || 0), 0) / team.length; let ok = false;
      for (let k = 0; k < L.coba && !ok; k++) { if (Math.random() < p) ok = true; else { mood(team, L.cobaGagal); if (k === 0) lg('coba_gagal', { nama: team[0].name }); } }
      if (ok) { winners = team; mood(team, L.menang + 2); relAll(L.rel, team); mood(S.villagers, L.semua); lg('menang', { nama: pick(team).name }); } else { mood(S.villagers, L.gagal); lg('gagal_semua', {}); } } }
  else { const n = Math.max(2, Math.min(L.peserta[1], pool.length)), ps = pool.slice(0, n), sc = ps.map(v => [v, lombaScore(v, L)]).sort((a, b) => b[1] - a[1]), w = sc[0][0]; winners = [w];
    mood([w], L.menang); mood(ps, L.ikut || 0); mood(S.villagers, L.semua); relAll(RLC().gain.lombaTim / 2, ps);
    if (L.rivalTumble) { const rv = ps.find(a => ps.some(b => b !== a && relLevel(a, b) === 'rival')); if (rv && Math.random() < L.rivalTumble.chance) { const b = ps.find(o => o !== rv && relLevel(rv, o) === 'rival'); relAdd(rv, b, L.rivalTumble.rel, 'lomba'); relSet(rv, b, relGet(rv, b) + Math.max(0, L.rivalTumble.rel - 6)); lg('rival_jatuh', { nama: rv.name, nama2: b.name }); } }
    if (Math.random() < 0.5) lg('lucu', { nama: pick(ps).name }); lg('menang', { nama: w.name }); const lo = sc[sc.length - 1][0]; if (lo !== w) lg('kalah', { nama: lo.name }); }
  win(winners); R.results.push({ id, winners: winners.map(v => v.name) }); S.lombaWins = (S.lombaWins || 0) + (winners.length ? 1 : 0);
  const PL = TEXT && TEXT.agustusan && TEXT.agustusan.pengumuman_lomba; if (PL && winners.length) log('📣 ' + fill(pick(PL), { nama: winners.map(v => v.name).join(', '), lomba: (LT.nama || id).toLowerCase() })); }
function panggung() { const A = AGC(), AT = (TEXT && TEXT.agustusan) || {}, R = S.lomba; markMeaningful('agustusan');
  if (AT.panggung_hiburan) log('🎤 ' + fill(pick(AT.panggung_hiburan)));
  const best = Object.entries(R.wins || {}).sort((a, b) => b[1] - a[1])[0], v = best && vById(+best[0]);
  if (v) { R.juara = v.name; v.pialaUntil = S.day + A.juaraUmumIconDays; v.mood = Math.min(100, v.mood + 5); if (AT.juara_umum) log('🏆 ' + fill(pick(AT.juara_umum), { nama: v.name })); }
  if (agustusYear() + 1 >= A.pesta.fromYear) { const n = surplusSink(A.pesta, 'pesta_17an'); if (n >= 1) S.villagers.forEach(o => o.mood = Math.min(100, o.mood + A.pesta.mood * festMult())); }
  S.lombaYears = (S.lombaYears || 0) + 1; S.lastPanggungDay = S.day; pentasReog(); } // P1: Pendopo tahap 2 -> pentas reog penutup 17-an
// tugas saat lomba: semua penduduk dewasa berkumpul di lapangan (kebutuhan kritis tetap didahulukan di chooseTask)
function lombaTask(v) { const L = S.lomba, p = L && L.lap; if (!p) return null; const i = S.villagers.indexOf(v); return { kind: 'diam', target: { x: p.x + (i % 7), y: p.y + 3 + Math.floor(i / 7) % 2 }, timer: 6 }; }
// dekorasi Agustusan di peta (aset tahap 8b): umbul-umbul, bendera, pinang, kerupuk, karung, peserta balap karung
function storyDecor() { const out = storyDecorAll(), hide = C.AGUS_HIDE || []; return hide.length ? out.filter(o => !hide.includes(o.key)) : out; }
function storyDecorAll() { const A = AGC(), L = S.lomba, out = []; if (!A || !A.enabled || !L || L.year !== agustusYear() || !L.lap) return out; const d = dayOfYear(), p = L.lap;
  const show = d >= A.prepDayOfYear && d <= A.umbul.days[1] && L.stage >= 2; if (!show) return out;
  for (let i = 0; i < (L.umbul || 0); i++) { const x = p.x - 1 + (i % 2) * 8, y = p.y - 1 + Math.floor(i / 2) * 2; out.push({ y: y + 1, draw: () => sprite('agus_umbul', x, y, 1, 1, frameAt(ASSETS.agus_umbul, 4)) }); }
  out.push({ key: 'agus_bendera', y: p.y + 1, draw: () => sprite('agus_bendera', p.x + 3, p.y, 1, 1, frameAt(ASSETS.agus_bendera, 4)) });
  if (L.umbul > 0) for (let i = 0; i < 7; i++) out.push({ key: 'agus_bunting', y: p.y - 0.5, draw: () => sprite('agus_bunting', p.x + i, p.y - 1, 1, 1, frameAt(ASSETS.agus_bunting, 2)) });
  if (d === A.dayOfYear && L.stage >= 4 && L.stage < 7) { const picked = L.picked || [];
    if (picked.includes('panjat_pinang')) out.push({ y: p.y + 2, draw: () => sprite('agus_pinang', p.x + 5, p.y + 1, 2, 1) });
    if (picked.includes('makan_kerupuk')) out.push({ y: p.y + 2, draw: () => sprite('agus_kerupuk', p.x + 1, p.y + 1, 1, 1, frameAt(ASSETS.agus_kerupuk, 2)) });
    if (picked.includes('balap_karung')) { out.push({ y: p.y + 1.6, draw: () => sprite('agus_karung', p.x, p.y + 0.6) });
      if (L.current === 'balap_karung' || L.stage === 4) { const ps = lombaPool().slice(0, 4), t = performance.now() / 1000; ps.forEach((v, k) => { const x = p.x + 0.5 + ((t * 0.6 + k * 0.37) % 5), y = p.y + 1.2 + k * 0.45;
        out.push({ y: y + 1, draw: () => { const a = ASSETS.agus_karung_v, im = a.images && (a.images[v.color % 4] || a.image); if (im) ctx.drawImage(im, (Math.floor(t * 9 + k) % 4) * 32, 2 * 32, 32, 32, Math.round(x * T), Math.round(y * T), 32, 32); } }); }); } }
    if (picked.includes('tarik_tambang') && L.current === 'tarik_tambang') out.push({ y: p.y + 2.5, draw: () => { for (let i = 0; i < 4; i++) sprite('agus_tambang', p.x + 1 + i, p.y + 2, 1, 1, Math.floor(performance.now() / 300) % 2); } }); }
  return out; }

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
  const a = ASSETS[key]; if (!a) return false; // null-guard: kunci aset tak terdaftar (mis. monumen ditaruh tanpa b.mon) -> kotak cadangan drawBuilding
  const im = (a.images && a.images[variant]) || a.image;
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
// varian sprite per musim dari tema (C.ART_SUFFIX); musim bersalju memakai varian walau gambarnya belum termuat (placeholder warna salju)
const winterKey = k => { const se = season(), suf = (C.ART_SUFFIX || {})[se]; if (!suf) return k; const kk = k + suf, a = ASSETS[kk]; return a && (se === C.WINTER_ART || a.image) ? kk : k; };
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
    list.push({ y: n.y + 1, draw: () => drawNode(n) }); }
  for (const b of S.buildings) { const d = C.BUILDINGS[b.type];
    if (b.type === 'ladang') { list.push({ y: b.y + 0.5, draw: () => drawBuilding(b, d) }); continue; }  // ladang = lantai
    list.push({ y: b.y + d.h, draw: () => { drawBuilding(b, d); if (b.done && (b.hp ?? 100) > 0 && d.storage) drawStoreFill(b); drawHazardOnBuilding(b); } }); }
  // penduduk yang berbagi tile digeser sedikit agar tidak bertumpuk
  const groups = {};
  if (!storeBuilding()) for (const p of stockpiles()) list.push({ y: p.y + 0.9, draw: () => drawStockpile(p) }); // ada gudang utuh -> tumpukan tanah disembunyikan
  if (S.merchant) list.push({ y: S.merchant.y + 1, draw: () => drawMerchant(S.merchant) });
  for (const o of S.wolves || []) list.push({ y: o.y + 1, draw: () => drawWolf(o) });
  for (const r of S.raiders || []) list.push({ y: r.y + 1, draw: () => drawRaider(r) });
  if (!inSleepWindow()) for (const b of S.buildings) if (b.type === 'kandang_ayam' && b.done) for (const e of hensOf(b)) list.push({ y: e.y + 0.6, draw: () => drawHen(e) });
  for (const bd of S.bodies || []) list.push({ y: bd.y + 0.5, draw: () => { ctx.fillStyle = '#e8dcc0'; ctx.fillRect(bd.x * T + 8, bd.y * T + 20, 18, 7); ctx.fillStyle = '#7a6a50'; ctx.fillRect(bd.x * T + 8, bd.y * T + 26, 18, 2); } });
  for (const v of S.villagers) { if (v.inside != null) continue;
    if (isBaby(v)) { if (v.heldBy == null) list.push({ y: v.y + 0.9, draw: () => drawBaby(v) }); else { const h = bById(v.homeId); if (h) { const p = cradlePos(h); list.push({ y: p.y + 0.9, draw: () => sprite('buaian_kosong', p.x, p.y, 1, 1, frameAt(ASSETS.buaian_kosong, 2)) }); } } continue; }
    const k = Math.round(v.x * 2) + ',' + Math.round(v.y * 2); (groups[k] = groups[k] || []).push(v); }
  for (const g of Object.values(groups)) g.forEach((v, i) => { const off = (i - (g.length - 1) / 2) * 12;
    list.push({ y: v.y + 1 + 0.01 * i, draw: () => drawVillager(v, off) }); });
  for (const o of storyDecor()) list.push(o);
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
    for (const b of S.buildings) { const d = C.BUILDINGS[b.type]; if (!b.done || !d.light || (b.hp ?? 100) <= 0 || b.type === 'obor' && b.unlit || b.type === 'apiunggun' && !campfireLit() || isHouse(b) && !houseLit(b)) continue;
      const g = ASSETS[d.light === 'besar' ? 'glow_besar' : 'glow_kecil'], im = g.image; if (!im) continue;
      const c = center(b), flick = b.type === 'apiunggun' ? 0.85 + Math.sin(performance.now() / 90) * 0.1 : 0.8;
      ctx.globalAlpha = darkness * flick; ctx.drawImage(im, Math.round(c.x * T + 16 - g.fw / 2), Math.round(c.y * T + 16 - g.fh / 2)); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    for (const b of done('apiunggun')) drawBuilding(b, C.BUILDINGS.apiunggun); // api tetap terang di atas overlay
  }
  if (darkness > 0.3) { ctx.globalAlpha = Math.min(0.85, darkness); for (const o of S.wolves || []) drawWolf(o); for (const r of S.raiders || []) drawRaider(r); ctx.globalAlpha = 1; } // v11: penyerang tetap terlihat di malam gelap
  drawMarkers();
  const ik = ASSETS.res_ikon;
  for (const n of notes) { const al = Math.max(0, Math.min(1, n.life)), rise = noteRise(n), x = n.x * T + 4, y = n.y * T - 4 - rise, pi = n.src && panganIcon(n.src), im = (pi && pi.im) || ik.images && ik.images[ik.keys.indexOf(n.res)];
    ctx.globalAlpha = al; const txt = `+${Math.round(n.n)}`, s = n.txt ? n.label : `${txt} ${n.label || RES_LABEL[n.res] || n.res}`; ctx.font = 'bold 12px sans-serif'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(30,20,10,0.85)'; // v9c: kayu/batu/air sama dengan pangan: ikon + '+4 Kayu' (gaya huruf dulu ikut tertelan komentar)
    if (im) ctx.drawImage(im, x, y - 11, 14, 14); const tx = x + (im ? 16 : 0);
    ctx.strokeText(s, tx, y); ctx.fillStyle = n.txt ? n.col || '#ffe0a0' : n.res === 'air' ? '#bfe8ff' : n.src ? '#c8ffa0' : '#fff6a0'; ctx.fillText(s, tx, y); ctx.globalAlpha = 1; }
  drawLifeIcons();
  for (const b of S.buildings) if (b.burning && darkness > 0) drawHazardOnBuilding(b);
  if (placing) { const d = C.BUILDINGS[placing], ok = validSpot(placing, mouse.x, mouse.y) && canAfford(d.cost);
    ctx.fillStyle = ok ? 'rgba(255,255,255,0.4)' : 'rgba(255,0,0,0.4)'; ctx.fillRect(mouse.x * T, mouse.y * T, d.w * T, d.h * T); }
  drawWeather();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
// sawah kering: kemarau tanpa irigasi (T04) -> air pada autotile diganti lumpur retak (dibuat sekali dari sawah_autotile, tanpa aset baru)
const sawahDry = b => isHardSeason() && !irrigated(b);
let _drySawah = null;
function drySawahImg() { if (ASSETS.sawah_kering && ASSETS.sawah_kering.image) return ASSETS.sawah_kering.image; // aset tahap 8c; di bawah = cadangan prosedural
  if (_drySawah) return _drySawah; const src = ASSETS.sawah.image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d'); g.drawImage(src, 0, 0); const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let k = 0; k < p.length; k += 4) { const r = p[k], gg = p[k + 1], bl = p[k + 2]; if (p[k + 3] < 8 || bl <= r + 10) continue; // hanya piksel air (kebiruan)
    const x = (k / 4) % c.width, y = Math.floor(k / 4 / c.width), crack = (x * 7 + y * 13) % 17 === 0 || (x + y * 3) % 23 === 0, lite = bl > 200;
    const col = crack ? [96, 66, 40] : lite ? [196, 160, 110] : (x + y) % 5 === 0 ? [160, 124, 82] : [176, 140, 94]; p[k] = col[0]; p[k + 1] = col[1]; p[k + 2] = col[2]; }
  g.putImageData(d, 0, 0); return (_drySawah = c); }
// padi layu (aset 8c) berwarna hampir sama dengan lumpur retak -> dibuat sekali versi bergaris tepi gelap 1px supaya terbaca (hardware retest @5abc262)
const _wilt = {};
function wiltImg(key) { if (_wilt[key]) return _wilt[key]; const src = ASSETS[key].image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d');
  g.drawImage(src, 0, 0); const d = g.getImageData(0, 0, c.width, c.height), p = d.data, o = new Uint8ClampedArray(p), W = c.width, H = c.height, A = (x, y) => x >= 0 && y >= 0 && x < W && y < H && p[(y * W + x) * 4 + 3] > 40;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4; if (p[k + 3] > 40) continue;
    if (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1)) { o[k] = 70; o[k + 1] = 46; o[k + 2] = 22; o[k + 3] = 230; } }
  d.data.set(o); g.putImageData(d, 0, 0); return (_wilt[key] = c); }
// node peta (v9: pohon buah berbuah/kosong, umbi hutan, jamur di kaki pohon rimbun)
function drawNode(n) {
  if (n.type === 'buah') { const full = n.amount > 0 && srcOn('buah', n.kind), k = `pohon_buah_${n.kind}${full ? '' : '_kosong'}`; if (ASSETS[k]) sprite(full ? winterKey(k) : k, n.x, n.y); return; }
  if (n.type === 'umbi') { sprite(n.amount > 0 ? 'umbi_hutan' : 'umbi_hutan_digali', n.x, n.y); return; }
  if (n.tunas && n.type === 'pohon') { const s = 0.45 + 0.55 * Math.min(1, n.amount / C.NODE_AMOUNT.kayu), ox = n.x * T + 16, oy = n.y * T + 31; ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s); ctx.translate(-ox, -oy); sprite(winterKey('pohon'), n.x, n.y); ctx.restore(); } else // tunas pohon (QC T-01) digambar kecil
  sprite(winterKey(n.type === 'semak' && n.amount <= 0 ? 'semak_kosong' : n.type), n.x, n.y);
  if (n.jamur > 0) { const k = `jamur_${n.jamurKind || 'kancing'}_${n.jamurBanyak ? 'banyak' : 'sedikit'}`, a = ASSETS[k];
    if (a && a.image) ctx.drawImage(a.image, n.x * T + 8, n.y * T + 4); else { ctx.fillStyle = '#f0e6d0'; ctx.fillRect(n.x * T + 18, n.y * T + 26, 3, 4); ctx.fillStyle = '#c0603a'; ctx.fillRect(n.x * T + 16, n.y * T + 23, 7, 3); } } }
// penduduk memancing (aset tahap 9): duduk di tepi air, kolom 0-1 lempar, 2<->3 tunggu, 4-5 strike, 6-7 tarik; baris = arah hadap air
function drawFisher(v) { const a = ASSETS.memancing, t = v.task, im = a && a.images && (a.images[v.color % 4] || a.image); if (!im || !t || t.src !== 'memancing' || !v.working) return false;
  const c = FS().memancing, f = t.work / ((c && c.time) || 26), ms = performance.now();
  const col = f < 0.08 ? (f < 0.04 ? 0 : 1) : f > 0.9 ? (f > 0.95 ? 7 : 6) : f > 0.82 ? (f > 0.86 ? 5 : 4) : 2 + Math.floor(ms / 500) % 2;
  ctx.drawImage(im, col * 64, (t.face || 0) * 64, 64, 64, Math.round(v.x * T - 16), Math.round(v.y * T - 16), 64, 64);
  if (col >= 4 && t.pond == null && ASSETS.ikan_lompat.image) { const W = [[0, 1], [-1, 0], [1, 0], [0, -1]][t.face || 0]; ctx.drawImage(ASSETS.ikan_lompat.image, frameAt(ASSETS.ikan_lompat, 6) * 32, 0, 32, 32, (Math.round(v.x) + W[0]) * T, (Math.round(v.y) + W[1]) * T, 32, 32); }
  ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(v.name, v.x * T + 16, v.y * T); ctx.textAlign = 'left'; return true; }
function drawBuilding(b, d) {
  ctx.globalAlpha = b.done ? 1 : 0.45;
  let hasImg;
  if (b.type === 'ladang') { const cid = cropId(b), key = ASSETS['tanaman_' + cid] ? 'tanaman_' + cid : 'tanaman_gandum', a = ASSETS[key];
    const fr = !b.done ? 0 : b.stage === 'siap' ? 4 : b.stage === 'tumbuh' ? 1 + Math.min(2, Math.floor(b.grow / growDaysOf(b) * 3)) : (b.grow === 0 && b.harvested ? 5 : 0);
    if (a.overSawah && ASSETS.sawah.image) { // padi: tile sawah 4-bit (tetangga padi = tersambung, pematang di sisi lain) + kilau air + overlay padi
      const nb = (x, y) => S.buildings.some(o => o.type === 'ladang' && o.x === x && o.y === y && cropId(o) === cid), i = (nb(b.x, b.y - 1) ? 1 : 0) + (nb(b.x + 1, b.y) ? 2 : 0) + (nb(b.x, b.y + 1) ? 4 : 0) + (nb(b.x - 1, b.y) ? 8 : 0);
      const dry = sawahDry(b);
      ctx.drawImage(dry ? drySawahImg() : ASSETS.sawah.image, (i % 4) * T, Math.floor(i / 4) * T, T, T, b.x * T, b.y * T, T, T);
      if (!dry && i === 15 && ASSETS.sawah_kilau.image && fr <= 1) sprite('sawah_kilau', b.x, b.y, 1, 1, frameAt(ASSETS.sawah_kilau, 2)); }
    const wilt = a.overSawah && ASSETS[key + '_kering'] && ASSETS[key + '_kering'].image && sawahDry(b); // padi layu di sawah kering
    if (wilt) { const im = wiltImg(key + '_kering'); ctx.drawImage(im, fr * T, 0, T, T, b.x * T, b.y * T, T, T); hasImg = true; } // garis tepi gelap: tanpa itu padi layu tak terlihat di atas lumpur retak
    else hasImg = sprite(key, b.x, b.y, 1, 1, fr);
    if (!hasImg) { ctx.fillStyle = ['#8a5a32', '#8a7a32', '#7a9a3a', '#5aa03a', '#e0c040'][fr] || '#8a5a32'; ctx.fillRect(b.x * T + 2, b.y * T + 2, T - 4, T - 4); }
    if (b.done && (fr === 2 || fr === 3) && canGrow(b)) sprite('kilau', b.x, b.y, 1, 1, animFrame(ASSETS.kilau, ASSETS.kilau.fps));
    if (b.wreckedT != null && S.t - b.wreckedT < 2 * C.DAY_LENGTH_SEC) { const a = 1 - (S.t - b.wreckedT) / (2 * C.DAY_LENGTH_SEC); ctx.globalAlpha = Math.min(1, 0.35 + 0.6 * a); ctx.fillStyle = '#5e3f1c'; ctx.fillRect(b.x * T + 1, b.y * T + 1, T - 2, T - 2); ctx.fillStyle = '#2e1e0c'; for (let i = 0; i < 9; i++) ctx.fillRect(b.x * T + 3 + (i % 3) * 10 + (i * 5) % 4, b.y * T + 4 + Math.floor(i / 3) * 9 + (i % 2) * 2, 6, 3); ctx.fillStyle = '#8a6238'; for (let i = 0; i < 5; i++) ctx.fillRect(b.x * T + 6 + i * 5, b.y * T + 7 + (i % 3) * 8, 3, 3); ctx.strokeStyle = '#2e1e0c'; ctx.lineWidth = 2; ctx.strokeRect(b.x * T + 2, b.y * T + 2, T - 4, T - 4); ctx.globalAlpha = b.done ? 1 : 0.45; } // v11: ladang dirusak hewan -> tanah teraduk cokelat, memudar dalam sehari
    if (b.keong > 0 && ASSETS.keong_sawah) sprite('keong_sawah', b.x, b.y, 1, 1, frameAt(ASSETS.keong_sawah, 2)); // v9: keong di sawah berair
  } else if (b.done && (b.hp ?? 100) <= 0 && b.type !== 'makam') { // hangus -> puing
    hasImg = (ASSETS[b.type + '_hangus'] && ASSETS[b.type + '_hangus'].image) ? sprite(b.type + '_hangus', b.x, b.y, d.w, d.h) : sprite(d.w >= 2 ? 'puing_besar' : 'puing_kecil', b.x, b.y, d.w, d.h);
  } else if (FISH_B.includes(b.type)) { const empty = !b.done || !(S.fish && S.fish.ponds[b.id] > 0), k = b.type + (empty ? '_kosong' : ''), a = ASSETS[k];
    hasImg = sprite(k, b.x, b.y, d.w, d.h, a && a.image ? frameAt(a, 2) : 0);
  } else if (b.mon || d.monumen) { hasImg = b.mon ? drawMonument(b, d) : false; // monumen tanpa data tahap (ditaruh langsung, bukan lewat panel Tujuan) -> kotak cadangan
  } else if (b.type === 'orang_orangan' && ASSETS.orang_orangan && ASSETS.orang_orangan.image) { hasImg = sprite('orang_orangan', b.x, b.y, 1, 1, b.done ? Math.floor(performance.now() / 500) % 2 : 0);
  } else if (b.type === 'pagar') { const a = ASSETS.pagar, nb = (x, y) => S.buildings.some(o => o.type === 'pagar' && o.x === x && o.y === y);
    let i = (nb(b.x, b.y - 1) ? 1 : 0) + (nb(b.x + 1, b.y) ? 2 : 0) + (nb(b.x, b.y + 1) ? 4 : 0) + (nb(b.x - 1, b.y) ? 8 : 0); if (i === 0) i = 10; // v11: pagar tunggal dulu memakai petak 0 = satu tiang bambu 9px -> nyaris tak terlihat; kini ruas mendatar
    if (a.image) ctx.drawImage(a.image, (i % 4) * T, Math.floor(i / 4) * T, T, T, b.x * T, b.y * T, T, T); else { ctx.fillStyle = a.color; ctx.fillRect(b.x * T + 2, b.y * T + 12, 28, 6); ctx.fillRect(b.x * T + 13, b.y * T + 4, 6, 24); }
  } else if (b.type === 'obor') { const a = ASSETS.obor, fr = b.done && !b.unlit ? frameAt(a, 4) : a.frameMati;
    if (!sprite('obor', b.x, b.y, 1, 1, b.done ? fr : a.frameMati)) { ctx.fillStyle = '#5a3a1a'; ctx.fillRect(b.x * T + 14, b.y * T + 6, 4, 24); if (!b.unlit) { ctx.fillStyle = '#ffb040'; ctx.fillRect(b.x * T + 12, b.y * T + 2, 8, 6); } }
  } else if (b.type === 'makam') { const a = ASSETS.makam, im = isSnowy() && ASSETS.makam_dingin.image && b.occupant ? ASSETS.makam_dingin.image : a.images && (a.images[b.occupant ? (b.variant ?? 1) : 0] || a.image);
    if (im) ctx.drawImage(im, b.x * T, b.y * T); else { ctx.fillStyle = a.color; ctx.fillRect(b.x * T + 10, b.y * T + 8, 12, 20); }
  } else {
    const has = k => ASSETS[k] && ASSETS[k].image, w = isSnowy(), night = b.done && darkness > 0.5;
    const off = night && isHouse(b) && !houseLit(b), dk = b.done && isHouse(b) ? doorFrame(b) : null;
    const key = [dk != null && w && b.type + '_pintu_dingin', dk != null && b.type + '_pintu', off && w && b.type + '_mati_dingin', off && b.type + '_mati', night && w && b.type + '_malam_dingin', night && b.type + '_malam', w && b.type + '_dingin', b.type].find(k => k && has(k)) || b.type;
    const a = ASSETS[b.type], fr = key.includes('_pintu') ? dk : b.type === 'apiunggun' && b.done ? animFrame(a, a.fps) : b.kentAt && performance.now() - b.kentAt < 1500 && (a.frames || 1) >= 3 ? 1 + Math.floor(performance.now() / 150) % 2 : 0;
    hasImg = sprite(key, b.x, b.y, d.w, d.h, fr);
    if (!hasImg && isHouse(b)) { ctx.fillStyle = a.roof; ctx.beginPath(); ctx.moveTo(b.x * T - 2, b.y * T + 26); ctx.lineTo(b.x * T + T, b.y * T - 6); ctx.lineTo(b.x * T + 2 * T + 2, b.y * T + 26); ctx.fill(); }
    if (!hasImg && b.type === 'apiunggun') { ctx.fillStyle = '#ffe14a'; ctx.beginPath(); ctx.arc(b.x * T + 16, b.y * T + 16, 6 + Math.sin(S.t * 8) * 2, 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  const bar = (frac, col) => { ctx.fillStyle = '#000'; ctx.fillRect(b.x * T, b.y * T - 6, d.w * T, 4); ctx.fillStyle = col; ctx.fillRect(b.x * T, b.y * T - 6, d.w * T * frac, 4); };
  if (b.mon) { if (b.done && (b.hp ?? 100) < 100) bar(b.hp / 100, '#e05050'); }
  else if (!b.done) { bar(b.progress / d.work, '#ffd27a'); ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.fillText(d.nama, b.x * T + 1, b.y * T + d.h * T - 2); }
  else if ((b.hp ?? 100) < 100) bar(b.hp / 100, '#e05050');
}
// rumah menyala saat sore (sebelum 21:00) bila ada penghuni; lampu mati saat semua tidur/kosong
function houseLit(b) { const res = S.villagers.filter(v => v.homeId === b.id); if (!res.length) return false;
  return !inSleepWindow() || res.some(v => v.inside === b.id && !(v.task && v.task.asleep)); }
// pintu: buka-tutup ~500 ms setelah ada yang masuk/keluar (frame 0 tutup, 1 setengah, 2 buka)
function doorFrame(b) { if (!b.doorAt) return null; const e = performance.now() - b.doorAt; if (e < 0 || e > 500) return null; return [1, 2, 2, 1, 0][Math.floor(e / 100)]; }
function drawBaby(v) { const h = bById(v.homeId);
  if (h) return sprite('buaian', v.x, v.y, 1, 1, frameAt(ASSETS.buaian, 2)) || placeholderBaby(v);
  const a = ASSETS.bayi, im = a.images && (a.images[v.color % 4] || a.image); if (im) ctx.drawImage(im, frameAt(a, 2) * 32, 0, 32, 32, Math.round(v.x * T), Math.round(v.y * T), 32, 32); else placeholderBaby(v); }
function placeholderBaby(v) { ctx.fillStyle = '#9fc4e8'; ctx.fillRect(v.x * T + 10, v.y * T + 18, 12, 8); ctx.fillStyle = '#f2c59b'; ctx.fillRect(v.x * T + 12, v.y * T + 14, 6, 5); }
const iconFrame = a => { const n = a.frames || 1, ms = a.ms || 200, cyc = n * ms + (a.holdMs || 0), e = performance.now() % cyc; return e < (a.holdMs || 0) ? 0 : Math.min(n - 1, Math.floor((e - (a.holdMs || 0)) / ms)); };
function drawIcon(key, x, y) { const a = ASSETS[key]; if (!a || !a.image) { ctx.fillStyle = key === 'ikon_zzz' ? '#cfe4ff' : '#ff6b8a'; ctx.font = 'bold 10px sans-serif'; ctx.fillText(key === 'ikon_zzz' ? 'z' : '♥', x + 4, y + 12); return; }
  ctx.drawImage(a.image, iconFrame(a) * 16, 0, 16, 16, Math.round(x), Math.round(y), 16, 16); }
// Zzz di atap rumah yang penghuninya tidur, Zzz di atas penduduk yang tidur di luar, hati untuk pasangan (digambar setelah overlay malam)
function drawLifeIcons() { const O = ASSETS.IKON_OFFSET;
  for (const b of houses()) if (S.villagers.some(v => v.inside === b.id && v.task && v.task.asleep)) { const d = C.BUILDINGS[b.type], fh = (ASSETS[b.type] && ASSETS[b.type].fh) || d.h * T;
    drawIcon('ikon_zzz', b.x * T + d.w * T / 2 + (d.w >= 3 ? 14 : 8), (b.y + d.h) * T - fh - 4); }
  for (const v of S.villagers) { if (v.inside != null || isBaby(v) && v.heldBy != null) continue; const st = stageOf(v);
    if (v.task && v.task.asleep) { const o = O.zzz[st] || O.zzz.dewasa; drawIcon('ikon_zzz', v.x * T + o[0], v.y * T + o[1]); continue; }
    if (v.newcomerUntil >= S.day && ASSETS.ikon_pendatang.image && !(v.task && v.task.src === 'memancing' && v.working)) drawIcon('ikon_pendatang', v.x * T + 16, v.y * T - 12); // v9: pendatang baru (3 hari)
    else if (v.wish && !(v.loveAt != null && S.t - v.loveAt < 10) && !villagerStatus(v).length) drawWishBubble(v, performance.now()); // P1: emote/status lebih penting dari gelembung keinginan
    if (v.loveAt != null && S.t - v.loveAt < 10 && ASSETS.emote_cinta && ASSETS.emote_cinta.image) { const E = ASSETS.emote_cinta, fr = Math.floor(performance.now() / 180) % (E.frames || 4); ctx.drawImage(E.image, fr * 16, 0, 16, 16, v.x * T + 8, v.y * T - 22, 16, 16); } // pasangan baru terbentuk
    const p = partnerOf(v); if (p && (v.heartUntil > S.t || p.inside == null && dist(p, v) < 1.5 && !v.working && !p.working && v.id < p.id)) { const o = O.hati[st] || O.hati.dewasa; drawIcon('ikon_hati', v.x * T + o[0], v.y * T + o[1]); } } }
function drawMerchant(m) { const a = ASSETS.pedagang, c = ASSETS.gerobak, dir = m.dir || 0, t = performance.now() / 1000;
  const vx = [0, -1, 1, 0][dir], vy = [1, 0, 0, -1][dir], cx = m.x - vx * 0.9, cy = m.y - vy * 0.9;
  const drawCart = () => { if (c.image) ctx.drawImage(c.image, dir * 64, (m.moving ? Math.floor(t * 5) % 2 : 0) * 64, 64, 64, Math.round(cx * T + 16 - 32), Math.round(cy * T + 16 - 40), 64, 64);
    else { ctx.fillStyle = '#8a5a32'; ctx.fillRect(cx * T + 2, cy * T + 8, 28, 18); } };
  if (vy >= 0) drawCart(); // gerobak di belakang (atas) pedagang
  if (a.image) { const row = (m.moving ? 4 : 0) + dir, fr = Math.floor(t * (m.moving ? 8 : 3)) % 4; ctx.drawImage(a.image, fr * 32, row * 32, 32, 32, Math.round(m.x * T), Math.round(m.y * T), 32, 32); }
  else { ctx.fillStyle = '#7a3b8a'; ctx.fillRect(m.x * T + 10, m.y * T + 12, 12, 14); }
  if (vy < 0) drawCart();
  ctx.fillStyle = '#ffe9a0'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🛒 ' + m.name, m.x * T + 16, m.y * T); ctx.textAlign = 'left'; }
function drawVillager(v, off = 0) { if (drawFisher(v)) return;
  if (v.id === selVid) { ctx.strokeStyle = '#ffe14a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(v.x * T + 16 + off, v.y * T + 29, 11, 5, 0, 0, 7); ctx.stroke(); }
  const st = stageOf(v), holding = S.villagers.some(b => b.heldBy === v.id), look = C.AGE_LOOK[st] || {};
  const base = st === 'anak' ? ASSETS.anak : st === 'lansia' ? ASSETS.lansia : holding ? ASSETS.gendong : ASSETS.penduduk;
  const a = ASSETS.penduduk, wk = ASSETS.penduduk_kerja, variant = v.color % 4, px = v.x * T + 16 + off, py = v.y * T + 16;
  const im = (base.images && (base.images[variant] || base.image)) || (a.images && (a.images[variant] || a.image)), wim = (st === 'anak' || st === 'lansia' || holding) ? null : wk.images && (wk.images[variant] || wk.image);
  const asleep = v.task && v.task.asleep, t = performance.now() / 1000 + v.id * 0.37, dir = v.dir || 0;
  const dx = Math.round(v.x * T + off), dy = Math.round(v.y * T);
  let workRow = null, fps = 0;
  if (wim && v.working && v.task && v.task.kind === 'kumpul' && v.task.res === 'kayu') { workRow = wk.rows.tebang; fps = wk.fpsWork; }
  else if (wim && v.working && v.task && (v.task.kind === 'kumpul' && v.task.res === 'batu' || v.task.kind === 'bangun')) { workRow = wk.rows.tambang; fps = wk.fpsWork; }
  const cb = ASSETS.penduduk_bawa, cim = (st === 'anak' || st === 'lansia') ? null : cb.images && (cb.images[variant] || cb.image);
  if (cim && v.carry && !asleep && cb.tipe[v.carry.res] != null) { ctx.drawImage(cim, (v.moving ? Math.floor(t * cb.fps) % cb.frames : 0) * 32, (cb.tipe[v.carry.res] * 4 + dir) * 32, 32, 32, dx, dy, 32, 32); workRow = -1; }
  else if (wim && v.carry && !asleep) { workRow = wk.rows.bawa; fps = v.moving ? wk.fpsCarry : 0; }
  if (workRow === -1) { /* sudah digambar (membawa) */ }
  else if (workRow !== null) ctx.drawImage(wim, (Math.floor(t * fps) % wk.frames) * 32, (workRow + dir) * 32, 32, 32, dx, dy, 32, 32);
  else if (im) { const moving = v.moving && !asleep, row = (moving ? 4 : 0) + dir;
    const fr = Math.floor(t * (moving ? (look.walkMs ? 1000 / look.walkMs : a.fpsWalk) : (look.idleMs ? 1000 / look.idleMs : a.fpsIdle))) % a.frames;
    ctx.drawImage(im, fr * 32, row * 32, 32, 32, dx, dy, 32, 32); }
  else { ctx.fillStyle = a.shirt[v.color % a.shirt.length]; ctx.fillRect(px - 6, py - 2, 12, 12);
    ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(px, py - 7, 6, 0, 7); ctx.fill(); }
  if (v.carry && workRow === null) { ctx.fillStyle = { kayu: '#8b5a2b', batu: '#aaa', makanan: '#e0413a', gandum: '#e6c35a', air: '#5ab0e6' }[v.carry.res] || '#fff'; ctx.fillRect(px + 6, py - 2, 6, 6); }
  ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(v.name, px, py - (st === 'anak' ? 12 : 16)); ctx.textAlign = 'left'; drawVillagerStatus(v, px, py);
}
// ---- tumpukan stok terlihat (di samping gudang / api unggun / pusat kemah) ----
const PILE_RES = ['kayu', 'batu', 'makanan', 'air'];
const pileAmount = r => r === 'makanan' ? (S.res.makanan || 0) + (S.res.gandum || 0) : S.res[r] || 0;
function pileTier(r) { const n = Math.floor(pileAmount(r)); return n <= 0 ? 0 : Math.min(4, 1 + Math.floor(3 * n / C.STOCKPILE.capacity[r])); }
function pileAnchor() { const st = S.buildings.filter(b => b.done && C.BUILDINGS[b.type].storage && (b.hp ?? 100) > 0).sort((a, b) => (a.type === 'gudang' ? 0 : 1) - (b.type === 'gudang' ? 0 : 1) || a.id - b.id)[0]
    || done('apiunggun')[0];
  return st ? { key: st.id, x: st.x, y: st.y, w: C.BUILDINGS[st.type].w, h: C.BUILDINGS[st.type].h } : { key: 'camp', x: CAMP.x, y: CAMP.y, w: 1, h: 1 }; }
let _pileCache = null;
// gudang utuh: tumpukan di tanah disembunyikan (barang dianggap tersimpan di dalam), gudang diberi penanda isi (peti/karung 0-4 tingkat). Hanya tampilan.
const storeBuilding = () => S.buildings.filter(b => b.done && C.BUILDINGS[b.type].storage && (b.hp ?? 100) > 0).sort((a, b) => (a.type === 'gudang' ? 0 : 1) - (b.type === 'gudang' ? 0 : 1) || a.id - b.id)[0] || null;
function storeFillLevel() { const cap = C.STOCKPILE.capacity, tot = PILE_RES.reduce((a, r) => a + pileAmount(r), 0), max = PILE_RES.reduce((a, r) => a + (cap[r] || 1), 0);
  return tot <= 0 ? 0 : Math.min(4, 1 + Math.floor(3 * tot / max)); }
function drawStoreFill(b) { if (b !== storeBuilding()) return; const n = storeFillLevel(), d = C.BUILDINGS[b.type], X = b.x * T, Y = (b.y + d.h) * T;
  // tumpukan peti (1-3) + karung (tingkat 4) di sudut kiri depan; gambar sederhana karena belum ada aset peti kecil
  const crate = (x, y) => { ctx.fillStyle = '#3a2614'; ctx.fillRect(x, y, 10, 9); ctx.fillStyle = '#a8743c'; ctx.fillRect(x + 1, y + 1, 8, 7); ctx.fillStyle = '#7a5028'; ctx.fillRect(x + 1, y + 4, 8, 1); ctx.fillRect(x + 4, y + 1, 1, 7); };
  const sack = (x, y) => { ctx.fillStyle = '#3a2e1c'; ctx.fillRect(x, y + 1, 9, 8); ctx.fillStyle = '#d8c08a'; ctx.fillRect(x + 1, y + 2, 7, 6); ctx.fillStyle = '#b89c64'; ctx.fillRect(x + 3, y, 3, 2); };
  const pos = [[2, -10], [12, -10], [7, -18], [22, -10]];
  for (let i = 0; i < n; i++) (i === 3 ? sack : crate)(X + pos[i][0], Y + pos[i][1]); }
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
function drawStockpile(p) { const X = p.x * T, Y = p.y * T, aw = ASSETS[`stockpile_${p.res}_${p.tier}_winter`], a = isSnowy() && aw && aw.image ? aw : ASSETS[`stockpile_${p.res}_${p.tier}`];
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
  if (d.monumen && MNC()[type].nearRiver && !nearRiver(type, x, y, MNC()[type].nearRiver)) return false; // bendungan: dekat sungai
  return true; }
// ---------- UI ----------
const $ = id => document.getElementById(id);
const _html = {};
function setHTML(id, h) { if (_html[id] !== h) { _html[id] = h; $(id).innerHTML = h; } }
function ui() {
  const f = dayFrac(), h = Math.floor(f * 24), m = Math.floor((f * 24 % 1) * 60);
  let resH = panganBadge() + ' &nbsp; ' + Object.keys(RES_LABEL).filter(k => k in S.res && !isFoodRes(k) && (S.res[k] >= 1 || ['kayu', 'batu', 'air'].includes(k))) // v9: makanan + padi = satu angka Pangan (rincian di tooltip)
    .map(k => `<span title="${RES_LABEL[k]}">${resIcon(k)} <span class="lbl">${RES_LABEL[k]}: </span><b>${Math.floor(S.res[k])}</b></span>`).join(' &nbsp; ') + ` &nbsp; ` + popBadge();
  const si = seasonInfo(), se = si.id;
  $('time').innerHTML = `${(C.SEASON_ICONS || {})[se] || ''} ${C.SEASON_NAMES[se]} (${si.day}/${si.len}) · Hari <b>${S.day}</b> — ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isNight() ? '🌙<span class="lbl"> Malam</span>' : '☀️<span class="lbl"> Siang</span>'}`;
  const TL = { makan: 'Makan', tidur: 'Tidur', kumpul: 'Mengumpulkan', setor: 'Menyetor', bangun: 'Membangun', diam: 'Santai', tani: 'Bertani', air: 'Mengambil air', riset: 'Meneliti', padam: 'Memadamkan api', rawat: 'Merawat', makam: 'Makam', jaga: 'Berjaga' };
  setHTML('vil', S.villagers.map(v => `<div class="v" data-vid="${v.id}"><b>${v.name}</b> (${v.age} th, ${role(v)}) — ${v.task ? TL[v.task.kind] + (v.task.kind === 'kumpul' ? ' ' + (v.task.src && v.task.src !== 'meramu' ? panganLabel(v.task.src === 'memancing' ? 'ikan' : v.task.src).toLowerCase() : v.task.res) : v.task.kind === 'tani' ? (v.task.harvest ? ' (panen)' : ' (tanam)') : '') : '-'}<br>
    Lapar ${v.hunger | 0} · Energi ${v.energy | 0} · Hati ${v.mood | 0} · Sehat ${(v.health ?? 100) | 0}</div>`).join(''));
  const warn = foodTotal() < foodPerDay() * 2, wwarn = (FX().hardWarnFromDay || isHardSeason()) && foodTotal() < foodPerDay() * C.HARD_BUFFER_DAYS;
  resH += (warn ? ' &nbsp; <b style="color:#ff6b6b">⚠️ Makanan menipis!</b>' : wwarn ? ` &nbsp; <b style="color:#ffb36b">${C.SEASON_ICONS[C.HARD_SEASON]} Stok ${C.SEASON_NAMES[C.HARD_SEASON].toLowerCase()} kurang</b>` : '') + (S.res.air < S.villagers.length ? ' &nbsp; <b style="color:#6bc6ff">💧 Air menipis!</b>' : '');
  setHTML('res', resH); // v9c: hanya ditulis ulang bila isinya berubah (dulu innerHTML ~60x/dtk -> tooltip berkedip)
  const era = C.ERAS[S.era | 0], next = C.ERAS[(S.era | 0) + 1];
  setHTML('era', `<b>${era.nama}</b>` + (next ? `<br>Menuju <b>${next.nama}</b>:<br>` + eraReqStatus(next).map(([t, ok]) => `${ok ? '✅' : '▫️'} ${t}`).join('<br>') : '<br>Era tertinggi tercapai!') + attractionHTML());
  if (buildLockSig() !== _buildSig) buildBuildBar();
  document.querySelectorAll('[data-b]').forEach(bt => { const k = bt.dataset.b; if (k) bt.disabled = !unlocked(k) || !canAfford(C.BUILDINGS[k].cost); });
  warnUI(); setHTML('quest', questUI()); wishUI(); tujuanPanelUI(); setHTML('summary', summaryUI()); villagerPanelUI(); techPanelUI(); marketUI(); $('marketbtn').classList.toggle('on', marketOpen());
  setHTML('log', S.log.slice(0, 15).map(l => { const p = S.logPos && S.logPos[l]; return p ? `<div class="loglok" data-wx="${p[0]}" data-wy="${p[1]}" title="${TX('peta_kejadian.lihat_lokasi', {}, 'Klik untuk melihat lokasinya')}">📍 ${withIcons(l)}</div>` : `<div>${withIcons(l)}</div>`; }).join(''));
  // bilah atas bisa memanjang tanpa resize (sumber daya/tombol baru di tengah permainan; uji perangkat 1500x768 -> 89px): ringkas lagi bila > TOPBAR_MAX_H
  if (!document.body.classList.contains('compact2') && !document.body.classList.contains('mobile') && $('top').offsetHeight > (C.TOPBAR_MAX_H || 80)) fitCanvas();
}
function techPanelUI() { const el = $('techpanel'); if (!el || el.style.display !== 'block') return;
  const T = window.TECH || { cabang: {} }, nodes = techNodes(), R = S.research, rn = R && nodes.find(n => n.id === R.id);
  const ST = { done: 'Selesai ✔', active: 'Sedang diteliti', locked: 'Terkunci', busy: 'Tunggu riset lain', poor: 'Bahan kurang', available: 'Bisa diteliti' };
  const cost = c => Object.entries(c || {}).map(([k, q]) => `${q} ${resIcon(k)} ${RES_LABEL[k] || k}`).join(', ') || 'gratis';
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
      return `<tr title="${tip}"><td>${resIcon(k)} ${RES_LABEL[k]}</td><td align="center">${Math.floor(S.res[k] || 0)}</td><td align="center">${priceOf(k, 'jual').toFixed(1)}</td><td align="center">${priceOf(k, 'beli').toFixed(1)}</td><td>${pct > 2 ? '▲' : pct < -2 ? '▼' : '•'}</td></tr>`; }).join('') + '</table>');
  const g = $('mkGive'), t = $('mkGet'); if (!g) return; const r = tradeQuote(g.value, +$('mkQty').value, t.value);
  setHTML('mkPreview', r.n != null && r.n >= 0 ? `${L.total || 'Total'}: ${r.qty} ${resIcon(g.value)} ${RES_LABEL[g.value]} (nilai ${r.value.toFixed(1)}) → <b>${r.n} ${resIcon(t.value)} ${RES_LABEL[t.value]}</b>${r.ok ? '' : ` — <span style="color:#a63e34">${r.why}</span>`}` : r.why || '');
  $('mkDo').disabled = !open || !r.ok; }
function openTech() { $('techpanel').style.display = 'block'; delete _html.techpanel; techPanelUI(); tutAction('buka_riset'); }
// v11: bilah bangun berkategori (C.BUILD_CATS di balance.js). Tombol kategori membuka menu tarik-turun (#buildmenu, position:fixed -> tinggi #top tetap);
// bangunan era/riset berikutnya tampil abu-abu + gembok, tanpa data-b (klik tidak memulai penempatan). Monumen (tujuan.js) membuka panel Tujuan.
let buildCat = null;
const qAttr = t => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const costText = cost => Object.entries(cost || {}).map(([r, n]) => n + ' ' + (RES_LABEL[r] || r)).join(', ');
const LOCK_SVG = '<svg class="lock" viewBox="0 0 10 12" width="9" height="11" aria-hidden="true"><rect x="1" y="5" width="8" height="7" rx="1" fill="currentColor"/><path d="M3 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
function buildCatOf(k) { const cats = C.BUILD_CATS || []; const c = cats.find(c => (c.items || []).includes(k)); return c ? c.id : (cats.length ? cats[cats.length - 1].id : 'lainnya'); }
const buildCatLabel = c => TX('bangun_kategori.' + c.id, {}, c.nama || c.id);
function buildLockWhy(k) { const d = C.BUILDINGS[k], e = C.ERAS.find(x => x.id === (d.era || 'perkemahan'));
  if (eraIndex(d.era || 'perkemahan') > (S.era | 0)) return TX('bangun_kategori.terkunci_era', { era: e ? e.nama : d.era }, `Terbuka di era ${e ? e.nama : d.era}`);
  const n = techNodes().find(n => n.efek.some(f => f.kunci === 'buka_bangunan' && f.nilai === k) && !(S.techDone || []).includes(n.id));
  return n ? TX('bangun_kategori.terkunci_riset', { riset: n.nama || n.id }, `Butuh riset ${n.nama || n.id}`) : ''; }
const buildLockSig = () => Object.keys(C.BUILDINGS).map(k => C.BUILDINGS[k].monumen ? (eraIndex(C.BUILDINGS[k].era || 'perkemahan') <= (S.era | 0) ? 1 : 0) : unlocked(k) ? 1 : 0).join('');
let _buildSig = '';
function buildMenuHTML(cat) { const q = qAttr;
  return Object.entries(C.BUILDINGS).filter(([k]) => buildCatOf(k) === cat).map(([k, d]) => {
    if (d.monumen) { const lock = eraIndex(d.era || 'perkemahan') > (S.era | 0), why = lock ? buildLockWhy(k) : TX('bangun_kategori.monumen_tujuan', {}, 'Monumen dibangun lewat panel Tujuan');
      return `<button ${lock ? 'class="locked" data-lock' : 'data-tujopen'}="${k}" title="${q(why)}">${lock ? LOCK_SVG + ' ' : ''}${d.nama}</button>`; }
    if (unlocked(k)) return `<button data-b="${k}" title="${q(buildTip(k, d))}">${d.nama}</button>`;
    return `<button class="locked" data-lock="${k}" aria-disabled="true" title="${q(buildLockWhy(k) + '\n' + costText(d.cost))}">${LOCK_SVG} ${d.nama}</button>`; }).join(''); }
function buildBuildBar() { _buildSig = buildLockSig(); const cats = C.BUILD_CATS || [];
  $('buildbar').innerHTML = '<span class="lbl">Bangun: </span>' + cats.map(c => `<button data-cat="${c.id}" class="bcat${buildCat === c.id ? ' on' : ''}" title="${qAttr(buildCatLabel(c))}">${buildCatLabel(c)} ▾</button>`).join('') + '<button data-b="">Batal</button>'
    + `<div id="buildmenu" class="panel" style="display:${buildCat ? 'flex' : 'none'}">${buildCat ? buildMenuHTML(buildCat) : ''}</div>`; placeBuildMenu(); }
function placeBuildMenu() { const m = $('buildmenu'), b = buildCat && document.querySelector(`#buildbar [data-cat="${buildCat}"]`); if (!m || !b) return;
  const r = b.getBoundingClientRect(), top = $('top').getBoundingClientRect(); m.style.top = Math.round(top.bottom + 2) + 'px'; m.style.left = Math.round(Math.max(4, Math.min(r.left, innerWidth - m.offsetWidth - 4))) + 'px'; }
function openBuildCat(id) { buildCat = buildCat === id ? null : id; buildBuildBar(); }
function buildPrioUI() {
  const PD = (TEXT && TEXT.prioritas_darurat) || {};
  $('prio').innerHTML = Object.keys(S.prio).map(k => `<div class="row" title="${(PD[k] && PD[k].tooltip) || ''}">${PD[k] ? '🚨 ' + PD[k].label : JOB_LABEL[k]} <span>${[0, 1, 2, 3].map(n =>
    `<button data-p="${k}" data-n="${n}" class="${S.prio[k] === n ? 'on' : ''}">${n ? n : 'Off'}</button>`).join('')}</span></div>`).join('');
}
document.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') sfx('klik'); const d = e.target.dataset; if (!d) return; const inBar = !!(e.target.closest && e.target.closest('#buildbar'));
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
  if (d.mon) { if (monB(d.mon)) monStart(d.mon); else { placing = d.mon; $('tujuanpanel').style.display = 'none'; log(`Pilih tempat fondasi ${monName(d.mon)}${MNC()[d.mon].nearRiver ? ' (dekat sungai)' : ''}.`); } tujuanPanelUI(); }
  if (e.target.id === 'tujuanbtn') openTujuan();
  if (e.target.id === 'tjClose') $('tujuanpanel').style.display = 'none';
  if (e.target.id === 'kbBtn') { startKerjaBakti(!!($('kbKopi') || {}).checked); tujuanPanelUI(); }
  if (d.wish) wishPay(+d.wish);
  if (d.ev !== undefined) chooseEvent(+d.ev);
  const vrow = e.target.closest && e.target.closest('[data-vid]'); if (vrow) openVillager(+vrow.dataset.vid);
  if (e.target.id === 'tutNext') { S.tutorialStep++; tutorialUI(); }
  if (e.target.id === 'tutSkip') { S.tutorialStep = 999; tutorialUI(); }
  if (d.p) { S.prio[d.p] = +d.n; buildPrioUI(); tutAction('ubah_prioritas'); }
  if (d.s !== undefined) { setSpeed(+d.s); tutAction('ubah_kecepatan'); }
  { const el = e.target.closest && e.target.closest('[data-wx]'); if (el) panTo(el.dataset.wx, el.dataset.wy); }
  if (d.cat) openBuildCat(d.cat);
  if (d.tujopen !== undefined) { buildCat = null; buildBuildBar(); openTujuan(); }
  if (d.b !== undefined) { placing = d.b || null; if (buildCat) { buildCat = null; buildBuildBar(); } }
  else if (buildCat && !inBar) { buildCat = null; buildBuildBar(); } });
// kamera: seret (klik kiri/tengah) untuk geser, roda mouse / tombol untuk zoom, WASD/panah untuk geser
let drag = null;
const scr = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
cv.addEventListener('mousedown', e => { const p = scr(e); drag = { sx: p.x, sy: p.y, cx: cam.x, cy: cam.y, moved: false }; });
window.addEventListener('mouseup', () => { setTimeout(() => drag = null, 0); });
// v9: tooltip ladang (tanaman, progres %, perkiraan panen, alasan berhenti tumbuh), kolam, pohon buah, umbi, jamur
function showTip(html, cx, cy) { let el = $('fieldTip'); if (!el) { el = document.createElement('div'); el.id = 'fieldTip'; el.className = 'panel'; document.body.appendChild(el); }
  if (!html) { el.style.display = 'none'; return; } if (el._h !== html) { el.innerHTML = html; el._h = html; } el.style.display = 'block';
  el.style.left = Math.min(window.innerWidth - el.offsetWidth - 6, cx + 14) + 'px'; el.style.top = Math.min(window.innerHeight - el.offsetHeight - 6, cy + 14) + 'px'; }
cv.addEventListener('mouseleave', () => showTip(null));
cv.addEventListener('mousemove', e => { const p = scr(e); const t = screenToTile(p.x, p.y); mouse.x = t.x; mouse.y = t.y; showTip(!placing && !(drag && e.buttons) && S ? hoverInfo(t.x, t.y) : null, e.clientX, e.clientY);
  if (drag && e.buttons) { const dx = p.x - drag.sx, dy = p.y - drag.sy; if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
    if (drag.moved) { cam.x = drag.cx - dx / cam.zoom; cam.y = drag.cy - dy / cam.zoom; clampCam(); } } });
cv.addEventListener('wheel', e => { e.preventDefault(); const p = scr(e), Z = C.ZOOM_LEVELS, i = Z.indexOf(cam.zoom);
  const ni = Math.max(0, Math.min(Z.length - 1, i + (e.deltaY < 0 ? 1 : -1))); if (ni !== i) setZoom(Z[ni], p.x, p.y); }, { passive: false });
window.addEventListener('keydown', e => { if (e.key === 'Escape' && buildCat) { buildCat = null; buildBuildBar(); } const k = { ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0], ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1] }[e.key];
  if (k) { cam.x += k[0] * 64 / cam.zoom; cam.y += k[1] * 64 / cam.zoom; clampCam(); } });
$('zin').onclick = () => { const Z = C.ZOOM_LEVELS, i = Z.indexOf(cam.zoom); setZoom(Z[Math.min(Z.length - 1, i + 1)]); };
$('zout').onclick = () => { const Z = C.ZOOM_LEVELS, i = Z.indexOf(cam.zoom); setZoom(Z[Math.max(0, i - 1)]); };
cv.addEventListener('click', e => { if (drag && drag.moved) return; handleTap(scr(e)); });
function handleTap(p) { const t = screenToTile(p.x, p.y); mouse.x = t.x; mouse.y = t.y;
  if (!placing) { const wx = (cam.x + p.x / cam.zoom) / T - 0.5, wy = (cam.y + p.y / cam.zoom) / T - 0.4;
    const v = nearest(S.villagers.filter(o => o.inside == null && o.heldBy == null && Math.hypot(o.x - wx, o.y - wy) < 0.8), { x: wx, y: wy }); if (v) { openVillager(v.id); return; }
    const h = hoverInfo(t.x, t.y); if (h) { const r = cv.getBoundingClientRect(); showTip(h, r.left + p.x * r.width / cv.width, r.top + p.y * r.height / cv.height); clearTimeout(handleTap._t); handleTap._t = setTimeout(() => showTip(null), 4000); } return; } // ketuk ladang/kolam (layar sentuh) -> tooltip 4 detik
  const d = C.BUILDINGS[placing];
  if (d.monumen) { if (validSpot(placing, mouse.x, mouse.y) && monStart(placing, mouse.x, mouse.y)) { placing = null; buildBuildBar(); } return; } // P1: fondasi monumen (biaya tahap 1 dibayar di monStart)
  const free = placing === 'ladang' && S.freeFields > 0; // ladang_gratis (dilema buka_hutan): lahan sudah dibuka
  if (!free && !canAfford(d.cost)) return log(`Bahan tidak cukup untuk ${d.nama}.`);
  if (!validSpot(placing, mouse.x, mouse.y)) return;
  if (free) S.freeFields--; else for (const [k, n] of Object.entries(d.cost)) S.res[k] -= n;
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
  // bilah atas ringkas (label disembunyikan, ikon saja): di bawah TOPBAR_COMPACT_W, ATAU bila bilah penuh lebih tinggi dari ~2 baris (mis. 1500-1599px dgn banyak tombol)
  document.body.classList.remove('compact', 'compact2'); if (!mob && (window.innerWidth < (C.TOPBAR_COMPACT_W || 1500) || $('top').offsetHeight > (C.TOPBAR_MAX_H || 80))) document.body.classList.add('compact');
  // masih > TOPBAR_MAX_H (font perangkat lebih lebar, banyak sumber daya): tombol bangun pindah ke baris sendiri selebar layar (bukan 3 baris sempit di pojok)
  if (!mob && $('top').offsetHeight > (C.TOPBAR_MAX_H || 80)) document.body.classList.add('compact2');
  const topH = $('top').offsetHeight; document.documentElement.style.setProperty('--topH', topH + 'px');
  let w = C.VIEW_W, h = Math.max(C.VIEW_MIN_H || 360, Math.min(C.VIEW_H, window.innerHeight - topH)); // tinggi kanvas mengikuti viewport (tanpa gulir halaman)
  if (mob) { w = window.innerWidth; h = Math.max(240, window.innerHeight - topH); }
  // layar sedang (900–1560px): kanvas menyusut agar panel samping tetap selebar SIDE_MIN_W
  else { w = Math.max(C.VIEW_MIN_W, Math.min(C.VIEW_W, window.innerWidth - C.SIDE_MIN_W)); $('side').style.width = Math.max(C.SIDE_MIN_W, Math.min(C.SIDE_MAX_W, window.innerWidth - w)) + 'px'; $('side').style.height = h + 'px'; }
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; ctx.imageSmoothingEnabled = false; clampCam(); }
  if (!mob) document.body.classList.remove('drawer-open'); }
$('drawerbtn').onclick = () => document.body.classList.toggle('drawer-open');
window.addEventListener('resize', fitCanvas); if (window.ResizeObserver) { let lastTopH = 0; new ResizeObserver(() => { const th = $('top').offsetHeight; if (th !== lastTopH) { lastTopH = th; fitCanvas(); } }).observe($('top')); } window.addEventListener('orientationchange', () => setTimeout(fitCanvas, 200)); fitCanvas(); // bilah atas berubah tinggi (sumber daya/bangunan baru) -> kanvas & panel ikut
cv.addEventListener('contextmenu', e => { e.preventDefault(); placing = null; });
// save/load: referensi node/bangunan di task tidak diserialisasi, task direset saat muat
const KEY = 'desaMandiriSave';
// QC S-10: simpanan membawa versi & tema; autosave tiap AUTOSAVE_DAYS hari ke slot terpisah; muat = simpanan terbaru dari kedua slot
const KEY_AUTO = KEY + '_auto', SAVE_V = 2, themeId = () => C.THEME || 'indonesia';
const temaNama = id => (window.THEMES && THEMES[id] && THEMES[id].nama) || id; // nama ramah tema (THEMES.*.nama), bukan id mentah
function saveGame(auto) { try { localStorage.setItem(auto ? KEY_AUTO : KEY, JSON.stringify({ ...S, _floodSet: undefined, _v: SAVE_V, _tema: themeId(), _at: Date.now(), villagers: S.villagers.map(v => ({ ...v, task: null, path: null, pathKey: null })) }));
    if (!auto) log(TX('menu.simpan_berhasil', {}, 'Permainan disimpan.')); return true; }
  catch (e) { console.warn(e); if (!auto) log(TX('menu.simpan_gagal', {}, 'Gagal menyimpan: penyimpanan peramban penuh atau diblokir.')); return false; } }
function autosaveDaily() { const n = C.AUTOSAVE_DAYS == null ? 1 : C.AUTOSAVE_DAYS; if (n > 0 && S.villagers.length && S.day % n === 0) saveGame(true); }
const readSave = k => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
function latestSave() { const a = readSave(KEY), b = readSave(KEY_AUTO); if (!a) return b; if (!b) return a; return (b._at || 0) > (a._at || 0) ? b : a; }
$('save').onclick = () => saveGame(false);
$('load').onclick = () => loadGame(true);
$('reset').onclick = () => { if (confirm('Mulai permainan baru?')) { S = null; newGame(); lastDay = S.day; buildPrioUI(); buildBuildBar(); tutorialUI(); } };
function loadGame(verbose) { const L0 = latestSave(); if (!L0) { if (verbose) log('Belum ada simpanan.'); return false; }
  if (L0._tema && L0._tema !== themeId()) { log('⚠️ ' + TX('menu.simpan_tema_beda', { tema: temaNama(L0._tema) }, `Simpanan ini dibuat di tema ${temaNama(L0._tema)}. Buka tema itu untuk melanjutkannya.`)); return false; }
  try { const L = L0; delete L._v; delete L._tema; delete L._at; if (!L.tiles || L.tiles.length !== C.MAP_H || L.tiles[0].length !== C.MAP_W) { if (verbose) log('Simpanan versi lama tidak cocok dengan peta baru.'); return false; } S = L; delete S._floodSet; S.rel = S.rel || {}; storyInit(); S.lombaOn = !!S.lombaOn; S.villagers.forEach(v => { if (!v.traits) v.traits = newcomerTraits(v.name); }); S.villagers.forEach(v => relInitFor(v, (v.joined ?? 1) <= 1)); /* cache Set, tidak bisa di-JSON-kan */ lastDay = S.day; S.prio = { ...C.DEFAULT_PRIO, ...S.prio }; S.techDone = S.techDone || []; S.research = S.research || null; marketInit(); S.gathered = S.gathered || {}; S.era |= 0; for (const [k, n] of Object.entries(C.START_RES)) if (!(k in S.res)) S.res[k] = 0; if (!S.banks) computeBanks(); if (!S.fish) foodSourcesDaily(); if (S.foodDayStart == null) S.foodDayStart = foodTotal(); S.villagers.forEach(v => { v.skills.bertani = v.skills.bertani || 0; if (v.health == null) v.health = 100; }); S.questIdx |= 0; S.tutorialStep |= 0; S.restUntil = S.restUntil || 0; buildPrioUI(); buildBuildBar(); tutorialUI(); $('modal').style.display = 'none'; if (S.event) showEvent(); log('Permainan dimuat.'); return true; } catch (e) { console.warn(e); return false; } }

// ---------- loop ----------
let prev = performance.now();
function frame(now) { const real = Math.min(0.25, (now - prev) / 1000); prev = now;
  for (const n of notes) n.life -= real; while (notes.length && notes[0].life <= 0) notes.shift();
  let sim = menuOpen ? 0 : real * speed; while (sim > 0) { const d = Math.min(0.1, sim); step(d); sim -= d; }
  render(); ui(); requestAnimationFrame(frame); }
window.DESA = { get state() { return S; }, v18: { goalJ: g => goalJ(g), flavorReal: s => flavorReal(s), temaNama: id => temaNama(id) }, v17: { achHidden: () => achHidden(), achList: () => achList().map(a => a.id), harapanWarga: () => harapanWarga(), harapanDaily: () => harapanDaily() }, v16: { nodesRegrowDaily, nodeTileFree, showPanitia, doFireAction, griefDaily, saveGame, latestSave, autosaveDaily, memSkill, memSifat, sendAway, killVillager, loadGame, chooseEvent }, p1: { monkeyDaily, buildTip, textNotes: () => notes.filter(n => n.txt).map(n => n.label), hensOf, hensStep, coopSpot, coopInfo, foodTask, hariJadiSummary, hariJadiDaily, hariJadiHTML, showHariJadi, placeScarecrow, scarecrowMonkeyMult, chainStart, chainDaily, chainEligible, chainDueCard, chooseChain, monStart, monNext, monStageDone, bWork, kbStatus, startKerjaBakti, kbOn, kbTask, pentasReog, monDaily, tujuanDaily, teladanDaily, teladanReq, goalsDaily, goalProg, tujuanPanelUI, openTujuan, validSpot, nearRiver, irrigated, FX, griefM, view: (tx, ty, z) => { if (z) setZoom(z); centerCam(tx, ty); }, wishDaily, wishStart, wishPay, wishFulfil, wishFail, wishEligible, wishAuto, wishNeed, sendAway, awayDaily, canGoAway, wishUI, drawWishBubble, monFxSum, monFxLast, monStage }, v13: { __lokal: on => { if (!TEXT) return; if (on == null) { if (TEXT.__lokalSave != null) TEXT.__lokalEv = TEXT.__lokalSave; delete TEXT.__lokalSave; return; } if (TEXT.__lokalSave == null) TEXT.__lokalSave = TEXT.__lokalEv; TEXT.__lokalEv = on && TEXT.__lokalSave; }, allEvents, eventAllowed, maybeEvent, showEvent, chooseEvent, fireEvent }, v12: { windStrike, windDaily, windSheltered, themeHasWind, buildTask, chooseEvent }, v11: { get placing() { return placing; }, mapEvent, activeMarkers, warnPos, panTo, logAt, spawnRaider, updateRaiders, wreckField, cam: () => ({ x: cam.x, y: cam.y, zoom: cam.zoom, w: cv.width, h: cv.height }), buildCatOf, buildLockWhy, openBuildCat, buildMenuHTML }, v9c: { autoBuildDaily, bedHintOn, bedHintText, bareFloor, famineLevel, famineDaily, popEventOk, sniffGoal, notify, noteRise, get notes() { return notes; }, spawnWolf, updateWolf, endOfDaySummary, foodDayIO, ioText, applyEffects, chooseTask }, pangan: { foodTask, foodWork, foodAvail, foodSourcesDaily, srcMult, srcOn, panganLabel, panganBadge, fieldInfo, hoverInfo, attraction, attractionHTML, foodDayIO, forestTrees, deposit, render: () => render(), ui: () => ui() }, storeBuilding, storeFillLevel, pilesVisible: () => !storeBuilding(), story: { directorTick, firePending, runLomba, openDilemma, openMomen, pickDilemma, pickMomen, dilemmaAllowed, applyStoryEffects, storyNewDay, agustusStep, buffMult, surplusSink, takeFood, monkeyDaily, ratDaily, syaratOk, optEffects, chooseStory, dayOfYear, defaultLomba, lombaCost, storyInit, payDebts, relGrief }, get text() { return TEXT; }, exitHouse, TT, TX, mergeTextOverlay, openVillager, houseLit, rel: { traitMult, traitAdd, traitWorkMult, traitDaily, traitTick, traitOnArrive, nearInfo, cookBonus, relGet, relAdd, relSet, relLevel, relKey, relInitFor, relTick, relDaily, relGrief, isFamily, pickTraits, founderTraits, newcomerTraits, babyTraits, revealTraits, traitsVisible, pairingDaily }, life: { stageOf, ageOf, isKid, isBaby, canWork, childHelper, partnerOf, childrenOf, houses, capacity, chooseTask, inSleepWindow, pastLate, lateAllowed, pregnancyOk, giveBirth, pairUp, assignHomes, lifeDaily, oldAgeDaily, foodPerDay, updateVillager, spawnVillager }, bindThemeText, hutEmergencyTask, buildTask, sicknessDaily, sawahDry, drySawahImg, popBadge, maybeEvent, waterNeed, wellYieldNow, riverYieldNow, canGrow, growDaysOf, cropId, seasonInfo, isHardSeason, yearDays, eventAllowed, chooseTask, wreckField, fieldTarget, foodPerDay, hungerMultNow, RES_LABEL, isY2, updateVillager, loadGame, biteVillager, updateWolf, wolfCost, seasonDaily, stockpiles, pileTier, pileSpots, notify, get notes() { return notes; }, killVillager, makeSick, ignite, spawnWolf, startFlood, famineLevel, warnings, threatDaily, seasonStep, wolfDaily, leaveDaily, spoilDaily, year, foodDays, floodTiles, isFlooded, fitCanvas, get placing() { return placing; }, setPlacing(b) { placing = b; }, get ach() { return ACH; }, checkAch, achProgress, unlockAch, endOfDaySummary, newDay, toast, applyEffects, allEvents, eventEraOk, fill, marketNewDay, priceOf, tradeQuote, doTrade, spawnMerchant, marketOpen, quota, foodSellMult, openMarket, startResearch, techVal, techNodes, openTech, showEvent, validSpot, canAfford, addBuilding, season, isRaining,  step, cam, findPath, setZoom, centerCam };
// tambalan teks tema di memori (TEKS-GAME.json tidak diubah): 'event:<id>.<path>' atau '<path>'
// TEKS meta.txt_tema_nusantara: isi path TEKS untuk THEMES.indonesia.TXT (cadangan di tema.js tetap dipakai bila path tidak ada)
function bindThemeText(t) { const M = t && t.meta && t.meta.txt_tema_nusantara; if (!M || C.THEME === 'sedang') return;
  for (const [k, path] of Object.entries(M)) { if (k[0] === '_' || !path) continue; let o = t; for (const x of path.split('.')) o = o && o[x];
    if (!o) continue; const e = (C.TXT[k] = C.TXT[k] || [null, '']); if (!e[0]) e[0] = path; } }
function applyTextPatch(t) { if (!t) return; for (const [k, val] of Object.entries(C.TEXT_PATCH || {})) { let o, path;
    if (k.startsWith('event:')) { const [id, ...rest] = k.slice(6).split('.'); o = ['event_acak', 'event_era_lanjut', 'event_musiman', 'event_lokal'].flatMap(x => t[x] || []).find(e => e.id === id); path = rest; } else { o = t; path = k.split('.'); }
    for (let i = 0; o && i < path.length - 1; i++) o = o[path[i]]; if (o && path.length) o[path[path.length - 1]] = val; } }
// tema bisa menimpa sebagian teks (C.TEXT_OVERLAY): objek digabung rekursif, {__byId:[..]} digabung ke larik per id, {__byIdx:{i:..}} per indeks
function mergeTextOverlay(base, ov) { if (!base || !ov || typeof ov !== 'object' || Array.isArray(ov)) return ov === undefined ? base : ov;
  if (ov.__byId) { if (!Array.isArray(base)) return base; for (const o of ov.__byId) { const i = base.findIndex(x => x && (x.id ?? x.kode) === o.id); if (i >= 0) { const { id, ...rest } = o; base[i] = mergeTextOverlay(base[i], rest); } } return base; }
  if (ov.__byIdx) { if (!Array.isArray(base)) return base; for (const [i, o] of Object.entries(ov.__byIdx)) if (+i < base.length) base[+i] = mergeTextOverlay(base[+i], o); return base; }
  if (typeof base !== 'object' || Array.isArray(base)) return ov;
  for (const k of Object.keys(ov)) base[k] = k in base ? mergeTextOverlay(base[k], ov[k]) : ov[k]; return base; }
const getJSON = f => fetch(f).then(r => r.ok ? r.json() : null).catch(() => null);
Promise.all([getJSON(C.TEXT_FILE || 'TEKS-GAME.json'), C.TEXT_OVERLAY ? getJSON(C.TEXT_OVERLAY) : null]).then(([t, ov]) => { const m = t && ov ? mergeTextOverlay(t, ov) : t; if (m) { m.__localNames = !ov || !!ov.bangunan_lokal; m.__lokalEv = !ov || !!ov.event_lokal; } return m; }).then(t => { TEXT = t; applyTextPatch(t); bindThemeText(t); tujuanNames(t);
  if (!t) console.warn('TEKS-GAME.json tidak dapat dimuat; memakai teks bawaan.');
  loadAssets(() => { newGame(); lastDay = S.day; buildPrioUI(); buildBuildBar(); centerCam(CAMP.x, CAMP.y); applyMenuText(); openMenu(); requestAnimationFrame(frame); window.DESA_READY = true; }); }); // sinyal siap untuk tes (ganti tunggu tetap 900-1500 ms)
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
function hasSave() { try { const L = latestSave(); return !!(L && L.tiles && L.tiles.length === C.MAP_H); } catch (e) { return false; } }
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
