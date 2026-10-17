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
    health: 100, joined: S.day, skills: { menebang: 0, menambang: 0, meramu: 0, membangun: 0, bertani: 0, meneliti: 0 }, task: null, carry: null, color: S.villagers.length });
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
const TT = (k, ex = {}, fb = '') => { const e = (C.TXT || {})[k]; if (!e) return fill(fb, ex); return e[0] ? TX(e[0], ex, fill(e[1], ex)) : fill(e[1], ex); };
const TERM = k => (C.TERMS || {})[k] || k;
// tanaman: data di C.FIELD.crops (tema). Simpanan lama dengan tanaman tema lain dipetakan (gandum<->padi, wortel<->jagung).
const CROP_ALIAS = { gandum: 'padi', wortel: 'jagung', padi: 'gandum', jagung: 'wortel', singkong: 'wortel', ubi: 'wortel' };
const cropId = b => C.FIELD.crops[b.crop] ? b.crop : C.FIELD.crops[CROP_ALIAS[b.crop]] ? CROP_ALIAS[b.crop] : Object.keys(C.FIELD.crops)[0];
const cropOf = b => C.FIELD.crops[cropId(b)];
const CROP_NAME = { gandum: 'gandum', wortel: 'wortel', padi: 'padi', jagung: 'jagung', singkong: 'singkong', ubi: 'ubi', kopi: 'kopi' };
const cropName = b => CROP_NAME[cropId(b)] || cropId(b);
const irrigated = () => (S.techDone || []).includes('T04');
// boleh tumbuh/ditanam sekarang? musim sulit: empat musim -> semua berhenti; Nusantara -> padi berhenti kecuali irigasi, tegalan tetap jalan
function canGrow(b) { const F = FX(), cr = cropOf(b); if (cr.seasons && !cr.seasons.includes(season())) return false;
  if (F.fieldsStop) return false; if (F.padiStops && cr.hardStops) return !!(cr.irrigatedInHard && irrigated()); return true; }
// hari tumbuh efektif petak ini
function growDaysOf(b) { const F = FX(), cr = cropOf(b); let g = (cr.growDays ?? C.FIELD.growDays) + techVal('ladang_tumbuh', 0, { b });
  if (F.growDaysAdd && (!F.growAddCrops || F.growAddCrops.includes(cropId(b)))) g += F.growDaysAdd;
  if (F.padiGrowAdd && (F.growAddCrops || []).includes(cropId(b))) g += F.padiGrowAdd;
  if (isHardSeason() && cr.hardGrowMult) g *= cr.hardGrowMult;
  if (F.padiStops && cr.hardStops && irrigated()) g *= F.padiIrrigatedGrowMult || 1;
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
const workMult = (v, sk) => (1 + (v.skills[sk] || 0) * 0.5 + (S.res.alat >= 1 ? C.TOOLS.bonus : 0)) * (v.sick ? C.SICKNESS.workMult : 1) * ageWorkMult(v) * (C.SCHEDULE.dayWorkMult || 1); // dayWorkMult: kompensasi jam tidur 21-05
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
const foodMultOf = v => { const st = stageOf(v); return C.AGE.foodMult[st === 'remaja' ? 'dewasa' : st] ?? 1; };
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
  return k === 'bangun' && t.b && !t.b.done && (1 - t.b.progress / C.BUILDINGS[t.b.type].work) * 100 < SCH().finishBuildBelowPct; }
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
    v.mood = Math.max(0, Math.min(100, v.mood + dm)); v.lastSleep = t.where; }
  if (v.inside != null) exitHouse(v); v.task = null; }
function sleepOutsideLog(v) { const L = S.schedLog = S.schedLog || {}, key = dayFrac() >= 0.5 ? S.day : S.day - 1; if (L.outside === key) return; L.outside = key;
  log('🍂 ' + TX(isWinter() && C.HARD_COLD ? 'log_jadwal.tidur_di_luar_dingin' : 'log_jadwal.tidur_di_luar', { nama: v.name }, `Tidak ada tempat di rumah untuk ${v.name}. Ia tidur di luar.`)); }
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
function eatNow(v) { const per = C.EAT_RESTORE_PER_FOOD * (done('dapur').length ? 1 + techVal('dapur_bonus', C.KITCHEN_EAT_BONUS) : 1);
  let need = Math.ceil((100 - v.hunger) / per); const a = Math.min(need, S.res.makanan); S.res.makanan -= a; need -= a;
  const g = Math.min(need, S.res.gandum || 0); S.res.gandum -= g;
  v.hunger = Math.min(100, v.hunger + (a + g) * per); if (a) dstat('eaten', 'makanan', a); if (g) dstat('eaten', 'gandum', g); }
const cradlePos = h => { const p = doorPos(h); return { x: p.x + (C.BUILDINGS[h.type].w >= 3 ? 1.1 : 1), y: p.y + 0.15 }; };
function updateBaby(v, dt) { const perSec = 1 / C.DAY_LENGTH_SEC;
  growUp(v, dt);
  v.hunger = Math.max(0, v.hunger - C.HUNGER_PER_DAY * foodMultOf(v) * (isWinter() ? hungerMultNow() : 1) * perSec * dt);
  if (v.hunger <= C.HUNGER_CRIT && foodTotal() > 0) eatNow(v);
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
  const now = stageOf(v); if (now !== before) onStage(v, now); }
function onStage(v, st) { const ex = famEx(v);
  if (st === 'anak') log('🧒 ' + TX('tumbuh_kembang.menjadi_anak', ex, `${v.name} bukan bayi lagi.`));
  else if (st === 'remaja') log('🧑 ' + TX('tumbuh_kembang.menjadi_remaja', ex, `${v.name} kini remaja.`));
  else if (st === 'dewasa') log('🎉 ' + TX('tumbuh_kembang.menjadi_dewasa', ex, `${v.name} kini dewasa dan siap bekerja penuh.`));
  else if (st === 'lansia') log('👴 ' + TX('tumbuh_kembang.menjadi_lansia', ex, `${v.name} kini berusia ${v.age} tahun dan menjadi sesepuh desa.`));
  if (st !== 'bayi') assignHomes(); }
// ---- berpasangan ----
function pairingDaily() { const P = C.PAIRING;
  for (const v of S.villagers) v.goodMoodDays = v.mood >= P.minMood ? (v.goodMoodDays || 0) + 1 : 0;
  const elig = v => v.partnerId == null && ageOf(v) >= P.minAge && ageOf(v) <= P.maxAge && (v.goodMoodDays || 0) >= P.moodDays && !(v.widowDay != null && S.day - v.widowDay < P.rematchDays);
  const singles = S.villagers.filter(v => v.partnerId == null && ageOf(v) >= P.minAge && ageOf(v) <= P.maxAge && !(v.widowDay != null && S.day - v.widowDay < P.rematchDays));
  for (const h of houses()) { const occ = S.villagers.filter(v => v.homeId === h.id && elig(v));
    for (const a of occ) for (const b of occ) { if (a.id >= b.id || a.sex === b.sex || a.partnerId != null || b.partnerId != null) continue;
      if (!a.closeTo) { a.closeTo = b.id; b.closeTo = a.id; log('💞 ' + TX('log_hubungan.menjadi_dekat', { nama: a.name, pasangan: b.name }, `${a.name} dan ${b.name} mulai akrab.`)); continue; }
      if (Math.random() < P.chancePerDay) pairUp(a, b); } }
  // dua lajang beda jenis kelamin tapi tidak serumah karena tidak ada tempat
  const L = singles.filter(v => v.sex === 'L'), Pp = singles.filter(v => v.sex === 'P');
  if (L.length && Pp.length && !L.some(a => Pp.some(b => a.homeId != null && a.homeId === b.homeId)) && S.day - (S.needHouseLog || -99) >= 7) { S.needHouseLog = S.day;
    log('🏠 ' + TX('log_hubungan.butuh_rumah', { nama: L[0].name, pasangan: Pp[0].name }, `${L[0].name} dan ${Pp[0].name} ingin tinggal bersama, tapi belum ada rumah kosong.`)); } }
function pairUp(a, b) { a.partnerId = b.id; b.partnerId = a.id; a.pairedDay = b.pairedDay = S.day; a.heartUntil = b.heartUntil = S.t + C.DAY_LENGTH_SEC; S.pairs = (S.pairs || 0) + 1;
  log('💍 ' + TX(Math.random() < 0.5 ? 'log_hubungan.menikah' : 'log_hubungan.menjadi_pasangan', { nama: a.name, pasangan: b.name }, `${a.name} dan ${b.name} kini resmi berpasangan.`));
  vhist(a, `Berpasangan dengan ${b.name}`); vhist(b, `Berpasangan dengan ${a.name}`); assignHomes(); }
// ---- kehamilan & kelahiran ----
function pregnancyOk(m, f) { const P = C.PREGNANCY, pop = S.villagers.length, carrying = S.villagers.filter(v => v.pregnantUntil).length;
  const si = (Math.floor((S.day - 1) / yearDays()) * 8 + seasonInfo(S.day).idx), cap = Math.ceil(pop / P.perSeasonCapDiv);
  return (S.era | 0) >= eraIndex(P.minEra) && m.sex === 'P' && !!f && !m.pregnantUntil && ageOf(m) >= P.motherAge[0] && ageOf(m) <= P.motherAge[1] && m.mood >= P.minMood && f.mood >= P.minMood
    && foodDays() >= P.minFoodDays && P.famineLevels.includes(famineLevel()) && capacity() >= pop + carrying + 1 && (m.health ?? 100) >= P.minHp && (f.health ?? 100) >= P.minHp
    && !m.sick && !f.sick && !(m.lastBirthDay != null && S.day - m.lastBirthDay < P.cooldownDays) && ((S.seasonBirths || {})[si] || 0) < cap; }
function pregnancyDaily() { const P = C.PREGNANCY;
  for (const m of S.villagers.slice()) { const f = partnerOf(m);
    if (m.pregnantUntil) { const left = m.pregnantUntil - S.day, ex = { ...famEx(m), ibu: m.name, ayah: f ? f.name : (m.formerPartner || 'ayahnya') };
      if (left <= 0) { giveBirth(m); continue; }
      if (left <= 2 && (['kritis', 'kolaps'].includes(famineLevel()) || m.sick && m.sick.lvl === 'parah')) log('⚠️ ' + `${m.name} akan segera melahirkan, tapi desa sedang kesulitan. Jaga stok makanan dan kesehatannya!`);
      else if (left === 1) log('🤰 ' + TX('kehamilan.menjelang_lahir', ex, `Sebentar lagi si kecil akan lahir. ${m.name} beristirahat di rumah.`));
      else if (Math.random() < 0.25) log('🤰 ' + TX('kehamilan.masa_kehamilan', ex, `${m.name} sedang hamil. ${ex.ayah} selalu menemaninya.`));
      continue; }
    if (!pregnancyOk(m, f) || Math.random() >= P.chancePerDay * (isWinter() ? P.winterMult : 1)) continue;
    m.pregnantUntil = S.day + P.lengthDays; const si = (Math.floor((S.day - 1) / yearDays()) * 8 + seasonInfo(S.day).idx); S.seasonBirths = S.seasonBirths || {}; S.seasonBirths[si] = (S.seasonBirths[si] || 0) + 1;
    log('🤰 ' + TX('kehamilan.kabar', { ...famEx(m), ibu: m.name, ayah: f.name }, `Kabar bahagia! ${m.name} dan ${f.name} sedang menanti buah hati.`)); vhist(m, 'Menanti buah hati'); } }
function babyName(sex) { const N = TEXT && TEXT.kelahiran && TEXT.kelahiran.nama_bayi, list = (N && N[sex === 'L' ? 'laki_laki' : 'perempuan']) || (sex === 'L' ? ['Arya', 'Bima', 'Raka', 'Dimas'] : ['Anisa', 'Laras', 'Putri', 'Sekar']);
  const used = new Set([...S.villagers.map(v => v.name), ...(S.memorials || []).map(m => m.name)]); const free = list.filter(n => !used.has(n)); return free.length ? pick(free) : pick(list) + ' ' + (S.births || 0); }
function giveBirth(m) { const P = C.PREGNANCY, f = partnerOf(m); m.pregnantUntil = null; m.lastBirthDay = S.day;
  const ayah = f ? f.name : (m.formerPartner || 'ayahnya');
  if ((['kritis', 'kolaps'].includes(famineLevel()) || m.sick && m.sick.lvl === 'parah') && Math.random() < P.birthRiskCritical) {
    S.deaths = (S.deaths || 0) + 1; S.babyLost = (S.babyLost || 0) + 1; S.lastDeathDay = S.day; m.mood = Math.max(0, m.mood - 25); if (f) f.mood = Math.max(0, f.mood - 25);
    log('🕯️ ' + `Bayi ${m.name} dan ${ayah} tidak tertolong. Desa ikut berduka.`); return; }
  const sex = Math.random() < 0.5 ? 'L' : 'P', name = babyName(sex), h = bById(m.homeId), p = h ? cradlePos(h) : { x: m.x, y: m.y };
  const b = { id: S.nextId++, name, sex, age: 0, ageF: 0, born: S.day, ms: 0, x: p.x, y: p.y, hunger: 90, energy: 100, mood: 80, health: 100, joined: S.day,
    skills: { menebang: 0, menambang: 0, meramu: 0, membangun: 0, bertani: 0, meneliti: 0 }, task: null, carry: null, color: (m.color + (f ? f.color : 1)) % 4, motherId: m.id, fatherId: f ? f.id : null, homeId: m.homeId };
  S.villagers.push(b); S.births = (S.births || 0) + 1; dstat('births', name, 1);
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
function lifeDaily() { if (S.syukuran && S.syukuran.day === S.day) { log('🎊 ' + TX('kelahiran.syukuran', S.syukuran.ex, `Desa mengadakan syukuran kecil untuk ${S.syukuran.name}.`)); S.syukuran = null; }
  assignHomes(); pairingDaily(); pregnancyDaily(); oldAgeDaily(); }
// ---------- AI ----------
function chooseTask(v) {
  const st = storage(v);
  // 1. Lapar kritis
  if (v.hunger <= C.HUNGER_CRIT && foodTotal() > 0 && st) return { kind: 'makan', target: stPos(st) };
  // 2. Tidur kritis, sakit parah (istirahat), lalu tugas darurat (padam/rawat/jaga/makam), baru tidur malam biasa
  if (v.energy <= C.ENERGY_CRIT || v.sick && v.sick.lvl === 'parah') return bedTask(v);
  // darurat: anak tidak ikut; ibu hamil tidak jaga; setelah 21:00 hanya darurat jadwal, setelah 22:30 hanya padam/jaga
  if (!isKid(v)) { const only = pastLate() ? ['padam', 'jaga'] : inSleepWindow() ? SCH().urgentJobs : null, em = emergencyTask(v, v.pregnantUntil ? (only || EMERG).filter(k => k !== 'jaga') : only); if (em) return em; }
  if (v.goHome && isNight() && houses().length) return bedTask(v);
  if (inSleepWindow()) return bedTask(v);
  if (!canWork(v)) return playTask(v);
  if (S.t < S.restUntil) return { kind: 'diam', target: { ...CAMP }, timer: 5 };
  // 3. Darurat desa: makanan menipis
  const pop = S.villagers.length;
  if (foodTotal() < pop * 3) { const t = (childHelper(v) ? null : farmTask(v, true)) || gatherTask(v, 'makanan'); if (t) return t; }
  if (S.res.air < pop * C.WATER.perDayPerPop) { const t = waterTask(v); if (t) return t; }
  // 3b. Pengaman: hari >= 6 tanpa gubuk jadi -> bangun gubuk yang sudah ditaruh, atau kumpulkan kayu/batu yang kurang untuk biayanya (Asisten Analisa)
  { const t = hutEmergencyTask(v); if (t) return t; }
  // 4. Prioritas kerja (utility: prioritas, jarak, skill)
  let best = null, bs = -1e9;
  for (const job of Object.keys(S.prio)) { const p = S.prio[job]; if (!p || EMERG.includes(job) || childHelper(v) && !C.AGE.childJobs.includes(job)) continue;
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
function hutEmergencyTask(v) { if (S.day < 6 || houses().length || childHelper(v)) return null;
  const site = nearest(S.buildings.filter(b => b.type === 'gubuk' && !b.done), v, center); if (site) return { kind: 'bangun', b: site, target: center(site) };
  const need = Object.entries(C.BUILDINGS.gubuk.cost).find(([k, n]) => (k === 'kayu' || k === 'batu') && S.res[k] < n);
  return need ? gatherTask(v, need[0]) : null; }
function buildTask(v) { const b = nearest(S.buildings.filter(b => !b.done || (b.hp ?? 100) < C.BUILDING_DAMAGE.repairBelow), v, center); return b ? { kind: 'bangun', b, target: center(b) } : null; }
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
  if (!(v.task && v.task.kind === 'tidur' && v.task.asleep)) v.energy = Math.max(0, v.energy - C.ENERGY_PER_DAY * (stageOf(v) === 'lansia' ? C.AGE.elderEnergyDecayMult : 1) * perSec * dt);
  const fire = nearest(done('apiunggun'), v, center);
  if (fire && campfireLit() && dist(center(fire), v) < 4 * techVal('api_radius', 1)) v.mood = Math.min(100, v.mood + C.MOOD_CAMPFIRE_BONUS * dt); else if (inHut(v)) v.mood = Math.min(100, v.mood + C.MOOD_HOME_BONUS * dt); else v.mood -= C.MOOD_DECAY * dt * (isWinter() && S.res.kulit < S.villagers.length ? C.WINTER_MOOD_DECAY_MULT_NO_HIDE : 1);
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
    case 'makan': eatNow(v); v.task = null; break;
    case 'tidur': sleepTick(v, t, dt); break;
    case 'kumpul': { const n = t.node; if (n.amount <= 0) { v.task = null; break; }
      v.dir = 2; v.working = true; t.work += dt * workMult(v, SKILL_OF[t.res]);
      if (t.work >= C.GATHER_TIME[t.res] * (t.res === 'kayu' && isRaining() ? FX().chopTimeMultRain : 1) / (t.res === 'makanan' ? FX().forageMult || 1 : 1)) { v.working = false; if (S.res.alat > 0) S.res.alat = Math.max(0, S.res.alat - C.TOOLS.wearPerHaul); const amt = Math.min(Math.max(1, Math.round((C.CARRY[t.res] + Math.round(techVal('carry_' + t.res, 0))) * (childHelper(v) ? C.AGE.childCarryMult : 1))), n.amount); n.amount -= amt;
        if (n.amount <= 0) n.regrow = n.type === 'semak' ? C.BUSH_REGROW_SEC : 0;
        v.skills[SKILL_OF[t.res]] += C.SKILL_GAIN * (isKid(v) && S.villagers.some(o => o.homeId === v.homeId && v.homeId != null && stageOf(o) === 'lansia') ? C.AGE.mentorSkillMult : 1); v.carry = { res: t.res, n: amt }; sfx(t.res === 'kayu' ? 'tebang' : t.res === 'batu' ? 'tambang' : 'klik');
        const st = storage(v); v.task = st ? { kind: 'setor', target: stPos(st) } : null; } break; }
    case 'bangun': { const b = t.b; if (!S.buildings.includes(b) || b.done && (b.hp ?? 100) >= 100) { v.task = null; break; } // bangunan rusak (hp<100) tetap diperbaiki (Asisten Analisa: dulu tugas langsung dibuang)
      if (b.done) { b.hp = Math.min(100, (b.hp ?? 100) + C.BUILDING_DAMAGE.repairPerSec * dt * workMult(v, 'membangun')); v.working = true;
        if (b.hp >= 100) { log(`${v.name} selesai memperbaiki ${C.BUILDINGS[b.type].nama}.`); v.working = false; v.task = null; } break; }
      v.working = true; b.progress += dt * workMult(v, 'membangun');
      if (b.progress >= C.BUILDINGS[b.type].work) { b.done = true; v.skills.membangun += C.SKILL_GAIN * 5;
        log(`${v.name} selesai membangun ${C.BUILDINGS[b.type].nama}.`); if (isHouse(b)) assignHomes(); vhist(v, `Selesai membangun ${C.BUILDINGS[b.type].nama}`); sfx('bangun'); dstat('built', C.BUILDINGS[b.type].nama, 1); v.working = false; v.task = null; } break; }
    case 'tani': { const b = t.b; if (!S.buildings.includes(b) || (t.harvest ? b.stage !== 'siap' : b.stage !== 'kosong')) { v.task = null; break; }
      v.working = true; t.work += dt * workMult(v, 'bertani');
      if (t.work >= (t.harvest ? C.FIELD.harvestTime : C.FIELD.plantTime * (FX().plantTimeMult || 1)) * techVal('tani_waktu', 1)) { v.working = false; v.skills.bertani += C.SKILL_GAIN;
        if (t.harvest) { const F = C.FIELD, cr = cropOf(b), res = cr.res, y = cr.yield || [F.yieldMin, F.yieldMax], n = Math.round((y[0] + Math.random() * (y[1] - y[0]) + techVal('ladang_hasil', 0)) * (FX().yieldMult || 1));
          b.stage = 'kosong'; b.grow = 0; b.harvested = true; S.harvests = (S.harvests || 0) + 1; v.carry = { res, n }; vhist(v, `Memanen ${n} ${RES_LABEL[res].toLowerCase()}`); sfx('panen'); log(`${v.name} memanen ${n} ${RES_LABEL[res].toLowerCase()} dari ladang ${cropName(b)}.`);
          const st = storage(v); v.task = { kind: 'setor', target: stPos(st) }; }
        else { b.stage = 'tumbuh'; b.grow = 0; b.harvested = false; v.task = null; } } break; }
    case 'air': { v.working = true; t.work += dt * workMult(v, 'meramu');
      if (t.work >= (t.src === 'sumur' ? C.WATER.wellTime : C.WATER.riverTime)) { v.working = false;
        v.carry = { res: 'air', n: Math.max(1, Math.round((t.src === 'sumur' ? wellYieldNow() : riverYieldNow()) * (childHelper(v) ? C.AGE.childCarryMult : 1))) }; v.task = { kind: 'setor', target: stPos(storage(v)) }; } break; }
    case 'diam': case 'main': t.timer -= dt; if (t.timer <= 0) v.task = null; break;
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
    teknologi: S.research ? (techNodes().find(n => n.id === S.research.id) || {}).nama : 'ilmu baru', pencapaian: '', pedagang: (S.merchant && S.merchant.name) || 'Pedagang', hewan: TERM('hewan'), sifat: 'yang baik hati', lama_tinggal: S.day - (a.joined ?? 1), tahun: Math.floor((S.day - 1) / C.YEAR_SCALE.daysPerYear) + 1, ...extra };
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
function eventAllowed(e) { const r = (C.EVENT_RULES || {})[e.id] || {}, year = yearIdx();
  if ((C.EVENT_DISABLE || []).includes(e.id)) return false; // tidak cocok dengan tema
  if (r.hariJadi) return false; // hanya lewat anniversaryEvent()
  if (r.musim && !r.musim.includes(season())) return false;
  if (e.musim && ![].concat(e.musim).map(m => (C.EVENT_SEASON_ALIAS || {})[m] || m).includes(season())) return false;
  if (r.maksPerTahun && ((S.eventYearCount || {})[e.id + '@' + year] || 0) >= r.maksPerTahun) return false;
  if (r.cooldownHari && S.day - ((S.eventLastDay || {})[e.id] ?? -999) < r.cooldownHari) return false;
  return true; }
const eventWeight = e => { const r = (C.EVENT_RULES || {})[e.id]; return (r && r.bobot != null ? r.bobot : e.bobot ?? 1) * (e.id === 'panen_raya' ? FX().panenRayaWeightMult || 1 : 1); };
const allEvents = () => !TEXT ? [] : [...(TEXT.event_acak || []), ...(TEXT.event_era_lanjut || []), ...(TEXT.event_musiman || [])];
const eventEraOk = e => !e.era || eraIndex(e.era) <= (S.era | 0);
// Hari Jadi Desa (EVENT_RULES[id].hariJadi): bukan event acak; muncul tepat di awal tahun ke-2, ke-3, ... (hari 29, 57, ...), sekali per tahun
function anniversaryEvent() { const yr = yearIdx(); if (yr < 1 || (S.annivDone || {})[yr]) return null;
  const ev = allEvents().find(e => ((C.EVENT_RULES || {})[e.id] || {}).hariJadi); if (!ev) return null; (S.annivDone = S.annivDone || {})[yr] = S.day; return ev; }
function maybeEvent() { if (!TEXT || !TEXT.event_acak) return; const anniv = anniversaryEvent(); if (anniv) return fireEvent(anniv);
  if (S.day < C.EVENT_MIN_DAY || Math.random() > ((S.era | 0) >= 1 ? C.EVENT_CHANCE_PER_DAY_DUSUN : C.EVENT_CHANCE_PER_DAY)) return;
  const pool = allEvents().filter(e => eventEraOk(e) && eventAllowed(e)), total = pool.reduce((a, e) => a + eventWeight(e), 0); if (!total) return;
  let r = Math.random() * total, ev = pool[pool.length - 1]; for (const e of pool) { r -= eventWeight(e); if (r <= 0) { ev = e; break; } }
  fireEvent(ev); }
function fireEvent(ev) {
  const year = yearIdx();
  S.eventLastDay = S.eventLastDay || {}; S.eventYearCount = S.eventYearCount || {}; S.eventCount = S.eventCount || {};
  S.eventLastDay[ev.id] = S.day; S.eventYearCount[ev.id + '@' + year] = (S.eventYearCount[ev.id + '@' + year] || 0) + 1; S.eventCount[ev.id] = (S.eventCount[ev.id] || 0) + 1;
  const em = M().eventMods[ev.id]; if (em) for (const [side, items] of Object.entries(em)) for (const [res, pct] of Object.entries(items)) addPriceEvent(side, [res], pct, M().eventDays);
  S.event = ev.id; showEvent(); }
const addsPop = ef => (ef && ef.penduduk) > 0;
// 👥 penduduk/tempat tidur; sebelum ada rumah: "2 (belum ada rumah)" alih-alih "2/0"
function popBadge() { const n = S.villagers.length, cap = capacity(), U = (TEXT && TEXT.ui) || {};
  return cap > 0 ? `<span id="popBadge" title="${U.penduduk_tempat || 'Penduduk / tempat tidur di rumah'}">👥 <b>${n}/${cap}</b></span>`
    : `<span id="popBadge" title="${U.penduduk_tanpa_rumah_tip || 'Bangun Gubuk agar penduduk punya tempat tidur'}">👥 <b>${n}</b> <small>(${U.penduduk_tanpa_rumah || 'belum ada rumah'})</small></span>`; }
const housingOk = ef => !addsPop(ef) || capacity() >= S.villagers.length + ef.penduduk;
function showEvent() { const e = allEvents().find(x => x.id === S.event); if (!e) { S.event = null; return; }
  // event pendatang: siapkan nama baru yang belum dipakai untuk {nama}
  if (e.pilihan.some(p => addsPop(p.efek)) && !S.eventName) { const keep = S.nameIdx; S.eventName = freshName(); S.nameIdx = keep; }
  const box = $('modal'); box.style.display = 'block'; sfx('event'); const nm = S.eventName ? { nama: S.eventName } : {};
  const noHouse = e.pilihan.some(p => addsPop(p.efek) && !housingOk(p.efek)) ? '<p style="color:#ffb36b">🏠 Tidak ada tempat kosong di gubuk — bangun Gubuk untuk menerima pendatang.</p>' : '';
  box.innerHTML = `<h3>${e.judul}</h3><p>${fill(e.deskripsi, nm)}</p>${noHouse}` + e.pilihan.map((p, i) => { const can = q => affordable(q.efek) && housingOk(q.efek), ok = can(p) || !e.pilihan.some(can) && i === e.pilihan.length - 1 && !addsPop(p.efek);
    const cost = Object.entries(p.efek || {}).map(([k, n]) => `${n > 0 ? '+' : ''}${n} ${resIcon(resKeyOf(k))} ${RES_LABEL[resKeyOf(k)] || k.replace(/_/g, ' ')}`).join(', ');
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
  const s = typeof o === 'string' ? o : fb; return s && (S.villagers.length || Object.keys(extra).length) ? fill(s, extra) : s.replace(/^Hari \{hari\}:\s*/, ''); } // isi {nama} juga saat penduduk terakhir meninggal
const FX = () => C.SEASON_FX[season()] || {};
// kebutuhan air harian (kemarau x1.5, empat musim: panas x1.35)
const waterNeed = () => S.villagers.length * C.WATER.perDayPerPop * (FX().waterMult || 1);
// hasil sumur/sungai per angkut (kemarau: sumur surut, sungai menyusut)
const wellYieldNow = () => Math.max(1, C.WATER.wellYield + (FX().wellYieldAdd || 0));
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
const hungerMultNow = () => !isHardSeason() ? 1 : isExtreme() ? FX().extremeHungerMult : (done('lumbung').length ? C.GRANARY_HARD_HUNGER_MULT : C.HARD_HUNGER_MULT);
const inHut = v => v.inside != null;
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
  else if (FX().hardWarnFromDay && foodDays() < winterBuffer() && seasonInfo().day >= FX().hardWarnFromDay) W.push({ k: 'hunger', c: 'yellow', t: `Stok ${C.SEASON_NAMES[C.HARD_SEASON].replace(/^Musim /, '').toLowerCase()} ${d}/${winterBuffer()} hari` });
  const wf = S.wolf; if (wf && wf.phase && wf.phase !== 'usai') W.push({ k: 'howl', c: { jejak: 'yellow', mendekat: 'orange', serang: 'red' }[wf.phase], t: C.NIGHT_THREAT === 'wolf' ? { jejak: 'Jejak serigala', mendekat: 'Auman mendekat!', serang: 'Serigala menyerang!' }[wf.phase] : { jejak: 'Jejak babi hutan', mendekat: 'Dengusan mendekat!', serang: 'Babi hutan masuk desa!' }[wf.phase] });
  if (S.buildings.some(b => b.burning)) W.push({ k: 'fire', c: 'red', t: 'Kebakaran! Padamkan dengan air' });
  else if (S.fireRisk && S.fireRisk.phase === 'asap') W.push({ k: 'fire', c: 'yellow', t: 'Bau asap dari ' + C.BUILDINGS[(S.buildings.find(b => b.id === S.fireRisk.b) || { type: 'dapur' }).type].nama });
  if (S.flood) W.push({ k: 'flood', c: S.t >= S.flood.start ? 'orange' : 'yellow', t: S.t >= S.flood.start ? 'Air meluap di tepi sungai' : 'Sungai naik' });
  if (S.extremeDay === S.day + 1 && FX().extremeChance || isExtreme()) W.push({ k: 'cold', c: isExtreme() ? 'orange' : 'yellow', t: isExtreme() ? 'Dingin ekstrem hari ini' : 'Angin membeku malam ini…' });
  if (S.fireOut && FX().campfireWoodPerDay) W.push({ k: C.HARD_COLD ? 'cold' : 'fire', c: 'orange', t: 'Api unggun padam: kayu bakar habis' });
  if (S.drought && S.day <= S.drought.until) W.push({ k: 'flood', c: 'yellow', t: 'Kekeringan', ic: 'thermometer_hot' });
  return W; }
const fillSafe = (s, x) => S.villagers.length ? fill(s, x) : s.replace(/\{(\w+)\}/g, (_, k) => x[k] ?? k);
function warnUI() { const W = warnings();
  setHTML('warnbar', W.map(w => { const ic = w.k === 'cold' ? `${ASSETS.STATUS_DIR}status_thermometer_cold_16.png` : w.ic ? `${ASSETS.STATUS_DIR}status_${w.ic}_16.png` : `${ASSETS.WARN_DIR}warn_${w.k}_${w.c}.png`;
    return `<div class="warn w-${w.c}" title="${w.tip || ''}" data-warn="${w.k}"><img src="${ic}" alt="">${w.t}${w.lv === 'kritis' ? ' <small>(jeda & atur prioritas)</small>' : ''}</div>`; }).join('')); }
// ---- cuaca harian & musim ----
// teks musim: tema empat musim memakai kunci TEKS lama; tema lain memakai C.TXT (tema.js)
const STX = (kOld, kTheme, ex, fb) => C.THEME === 'sedang' ? TX(kOld, ex, fb) : TT(kTheme, ex, fb);
// efek harian musim, digerakkan oleh isi SEASON_FX (lihat tema.js), bukan nama musim
function seasonDaily() { const si = seasonInfo(), se = si.id, dis = si.day, F = FX(), pop = S.villagers.length, ic = (C.SEASON_ICONS || {})[se] || '';
  if (dis === 1) { if (F.newYear && S.day > 1) log('🌱 ' + STX('musim_pembuka.musim_tahun_baru', 'tahun_baru', { tahun: year() }, `Tahun ke-${year()} dimulai.`));
    const oldFb = { semi: 'Musim semi — saatnya menanam sebelum hujan deras.', panas: 'Musim panas datang. Jaga stok air!', gugur: 'Musim gugur tiba. Waktunya panen dan menyimpan bekal.', dingin: 'Musim dingin datang. Api unggun butuh kayu bakar.' }[se];
    log(ic + ' ' + (C.THEME === 'sedang' ? TX('musim_pembuka.musim_' + se, { tahun: year() }, oldFb) : se === C.HARD_SEASON ? TT('sulit_mulai') : (C.TXT || {})['musim_' + se] ? TT('musim_' + se, { musim: C.SEASON_NAMES[se], tahun: year() }) : TT('musim_mulai', { musim: C.SEASON_NAMES[se] })));
    if (F.newYear) S.droughtDone = false; S.floodDone = false; S.floodN = 0; S.firstRainDone = false; }
  // hujan (+ banjir)
  if (F.rainChance) { if (Math.random() < F.rainChance) { S.rainDay = S.day;
      if (F.rainMoodPerDay) S.villagers.forEach(v => v.mood = Math.min(100, v.mood + F.rainMoodPerDay));
      if (F.rainNoRoofMood) S.villagers.forEach(v => { if (v.homeId == null && !houseFor(v)) v.mood = Math.max(0, v.mood + F.rainNoRoofMood); });
      if (F.firstRainMood && !S.firstRainDone) { S.firstRainDone = true; S.villagers.forEach(v => v.mood = Math.min(100, v.mood + F.firstRainMood)); log('🌦️ ' + TT('hujan_pertama', {}, 'Hujan pertama turun.')); }
      else log('🌧️ ' + STX('musim_pembuka.musim_semi_hujan', 'hujan', {}, 'Hujan rintik turun.')); }
    if (F.floodChance && !S.floodDone && (S.floodN || 0) < (F.floodMax || 1) && Math.random() < F.floodChance * threatMult()) { S.floodN = (S.floodN || 0) + 1; startFlood(); if (S.floodN < (F.floodMax || 1)) S.floodDone = false; } }
  // kekeringan & risiko api
  if (F.droughtChance && !S.droughtDone && Math.random() < F.droughtChance * threatMult()) { S.droughtDone = true; S.drought = { until: S.day + F.droughtDays - 1 };
    const safe = S.res.air >= pop * C.WATER.perDayPerPop * (F.waterMult || 1) * F.droughtWaterSafeDays;
    log('☀️ ' + TX('peringatan_dini.ancaman_kekeringan.tingkat.' + (safe ? 'waspada' : 'bahaya') + '.teks', { hari_sisa: Math.floor(S.res.air / Math.max(1, pop)) }, 'Kekeringan! Stok air menipis.'));
    if (!safe) { const fs = S.buildings.filter(b => b.type === 'ladang' && b.stage === 'tumbuh'); fs.forEach(b => b.grow -= F.droughtGrowDelay);
      if (fs.length) log(TX('log_ancaman.kekeringan_ladang', {}, 'Ladang kehausan. Tanaman tumbuh lebih lambat.')); } }
  if (F.fireNightChance) { const risky = S.buildings.filter(b => b.done && (b.type === 'dapur' || b.type === 'bengkel') && !b.burning && (b.hp ?? 100) > 0);
    if (risky.length && !S.fireRisk && Math.random() < F.fireNightChance * threatMult()) S.fireRisk = { day: S.day, b: pick(risky).id, phase: 'menunggu' }; }
  // hitung mundur ke musim sulit & syukur panen
  if (F.hardWarnFromDay) { const d = Math.floor(foodDays()), buf = winterBuffer(), left = si.len - dis + 1;
    if (dis >= F.hardWarnFromDay) log((d >= buf ? ic + ' ' : '⚠️ ') + STX('musim_pembuka.musim_gugur_menuju_dingin', 'menuju_sulit', { hari_sisa: left, jumlah: d, jumlah2: buf }, `Sisa ${left} hari. Stok ${d}/${buf} hari.`) + (d < buf ? ' ' + STX('musim_pembuka.musim_gugur_stok_kurang', 'stok_kurang', {}, '') : ''));
    if (dis === si.len && d >= F.thanksFoodDays) { S.villagers.forEach(v => v.mood = Math.min(100, v.mood + F.thanksMood)); log('🙏 ' + STX('musim_pembuka.musim_gugur_syukur', 'syukur', {}, 'Lumbung penuh. Syukuran kecil!')); } }
  // kayu bakar (empat musim: dingin; Nusantara: malam lembap musim hujan)
  if (F.campfireWoodPerDay) { const fires = done('apiunggun').length, need = Math.ceil(fires * F.campfireWoodPerDay * techVal('api_kayu_bakar', 1) * 10) / 10;
    if (fires) { if (S.res.kayu >= need) { S.res.kayu -= need; if (S.fireOut) log('🔥 Api unggun menyala lagi.'); S.fireOut = false; if (dis === 1) log('{ikon:kayu} ' + STX('musim_pembuka.musim_dingin_kayu_bakar', 'kayu_bakar', { jumlah: need }, `Api unggun memakai ${need} kayu bakar per hari.`)); }
      else { S.res.kayu = 0; if (!S.fireOut) log('⚠️ ' + STX('log_ancaman.kayu_bakar_habis', 'api_padam', {}, 'Kayu bakar habis! Api unggun meredup.')); S.fireOut = true; } }
    if (S.extremeDay === S.day - 1) log('🌤️ ' + TX('peringatan_dini.ancaman_dingin_ekstrem.tingkat.reda.teks', {}, 'Angin beku sudah reda.')); }
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
      log('🥶 ' + TX('peringatan_dini.ancaman_dingin_ekstrem.tingkat.waspada.teks', {}, 'Angin membeku malam ini… Besok akan sangat dingin.')); } }
  // paparan cuaca (empat musim: dingin tanpa pakaian; Nusantara: terik kemarau tanpa caping) — mood turun saat di luar
  if (F.exposureMood && (!F.exposureDayOnly || !isNight())) { const covered = (C.HARD_COLD && S.res.kulit >= S.villagers.length) || (S.techDone || []).includes('T13'), r = F.exposureMood[covered ? 'dengan' : 'tanpa'] / C.DAY_LENGTH_SEC;
    for (const v of S.villagers) if (!inHut(v) && !(F.exposureNearFire && campfireLit() && done('apiunggun').some(b => dist(center(b), v) < 4))) v.mood = Math.max(0, v.mood + r * dt); }
  if (isExtreme()) for (const v of S.villagers) { const warm = inHut(v) || done('apiunggun').some(b => dist(center(b), v) < 4) && campfireLit();
    if (!warm) v.mood = Math.max(0, v.mood - C.MOOD_DECAY * (F.extremeMoodDecayMult - 1) * dt); }
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
// ---- ancaman malam (serigala / babi hutan; C.NIGHT_THREAT dari tema) ----
const TH = () => C.THREAT[C.NIGHT_THREAT || 'wolf'];
const TLX = (kOld, kNew, ex, fb) => C.NIGHT_THREAT === 'wolf' ? TX(kOld, ex, fb) : TT(kNew, ex, fb);
function wolfDaily() { const W = TH(); if (S.wolf && ['mendekat', 'serang'].includes(S.wolf.phase)) return;
  S.wolf = null; let ch = W.baseNightChance * threatMult() * (isHardSeason() ? W.hardMult || 1 : 1);
  if (Math.random() < ch) S.wolf = { day: S.day, phase: null, tracksOnly: (S.era | 0) < eraIndex(W.minEra), spawned: false, scared: {} }; }
function wolfStep(dt) { const W = TH(), w = S.wolf; S.wolves = S.wolves || [];
  if (w) { const f = dayFrac(), eve = w.day === S.day, morn = S.day === w.day + 1;
    if (eve && !w.phase && f >= C.NIGHT_START - W.warnHoursBefore) { w.phase = 'jejak'; placeTracks();
      log('🐾 ' + TLX('log_ancaman.serigala_jejak', 'jejak', {}, 'Ada jejak serigala di tepi hutan. Auman jauh terdengar…')); }
    if (eve && w.phase === 'jejak' && f >= C.NIGHT_START) { w.phase = 'mendekat'; if (C.NIGHT_THREAT === 'wolf') sfx('lolong');
      log((C.NIGHT_THREAT === 'wolf' ? '🐺 ' : '🐗 ') + TLX('log_ancaman.serigala_mendekat', 'mendekat', {}, 'Lolongan serigala makin dekat. Penduduk bergegas pulang.'));
      // penduduk di luar cenderung pulang (60%)
      if (houses().length) S.villagers.forEach(v => { if (!(v.task && v.task.kind === 'tidur') && !EMERG.includes(v.task && v.task.kind) && Math.random() < 0.6) { deposit(v, false); v.goHome = true; v.task = null; } }); }
    if (eve && w.phase === 'mendekat' && f >= W.attackFrac[0] && f < W.attackFrac[1] && !w.spawned) { w.spawned = true;
      if (w.tracksOnly) { log('🐾 ' + TLX('', 'mengintai', {}, 'Serigala hanya mengintai dari jauh malam ini.')); }
      else { w.phase = 'serang'; const n = rndInt(W.count[0], W.count[1]); for (let i = 0; i < n; i++) spawnWolf(); } }
    if (morn && f >= C.NIGHT_END && w.phase !== 'usai') { w.phase = 'usai'; S.wolves.forEach(o => o.mode = 'pergi'); S.villagers.forEach(v => v.goHome = false);
      log('🌅 ' + TLX('log_ancaman.serigala_usai', 'usai', {}, 'Fajar menyingsing. Serigala sudah kembali ke hutan.')); }
    if (S.day > w.day + 1) S.wolf = null; }
  for (const o of S.wolves) updateWolf(o, dt);
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
  o.plots = (o.plots || 0) + 1; b.stage = 'kosong'; b.grow = 0; b.wrecked = S.day; S.fieldsWrecked = (S.fieldsWrecked || 0) + 1; sfx('event');
  log('🐗 ' + TT('rusak_ladang', { tanaman: cropName(b) }, `Babi hutan merusak ladang ${cropName(b)}.`)); }
function updateWolf(o, dt) { const W = TH();
  if (o.mode === 'serang') { o.t += dt; if (o.t >= 0.5 && !o.bit) { o.bit = true; biteVillager(o, vById(o.target)); } if (o.t >= 0.9) o.mode = 'pergi'; return; }
  let goal;
  // menara jaga / pos ronda yang dijaga mengusir hewan dalam radius (maks towerScarePerNight per malam per menara)
  if (o.mode !== 'pergi') for (const tw of done('menara_jaga')) { const c = center(tw); if (dist(c, o) > W.towerRadius || (S.wolf && (S.wolf.scared[tw.id] || 0) >= W.towerScarePerNight)) continue;
    const guard = S.villagers.find(g => g.task && g.task.kind === 'jaga' && g.task.b === tw && g.task.arrived); if (!guard) continue;
    tw.kentAt = performance.now(); if (S.wolf) S.wolf.scared[tw.id] = (S.wolf.scared[tw.id] || 0) + 1; o.mode = 'pergi'; S.scaredOff = (S.scaredOff || 0) + 1;
    log('📯 ' + TLX('bangunan_ancaman.bangunan_menara_jaga.usir', 'menara', { nama: guard.name }, `Dari Menara jaga, ${guard.name} meniup terompet. Serigala lari ke hutan.`)); return; }
  if (o.mode === 'pergi') goal = o.home;
  else if (W.fieldFirst && (o.plots || 0) < (o.maxPlots ?? (o.maxPlots = rndInt(W.plotsDamaged[0], W.plotsDamaged[1]))) && fieldTarget(o)) { const b = fieldTarget(o); goal = { x: b.x, y: b.y };
    if (dist(o, goal) <= 0.8) { wreckField(o, b); return; } }
  else if (W.injureFromEra && (S.era | 0) < eraIndex(W.injureFromEra)) { o.mode = 'pergi'; goal = o.home; }
  else { const cands = S.villagers.filter(v => outside(v) && (!W.fieldFirst || dist(v, o) < 6)); if (!cands.length) { o.mode = 'pergi'; goal = o.home; }
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
function biteVillager(o, v) { const W = TH(); if (!v || !S.villagers.includes(v) || !outside(v)) return;
  if (W.injureFromEra && (S.era | 0) < eraIndex(W.injureFromEra)) return;
  let hit = 1; const torch = S.buildings.some(b => torchLit(b) && dist(center(b), v) <= W.torchSafeRadius); if (torch) hit *= W.torchHitMult;
  if (Math.random() >= hit) { log('🔥 ' + TLX('log_ancaman.diusir', 'diusir', { nama: v.name }, 'Cahaya obor membuat serigala ragu. Mereka berbalik ke hutan.')); return; }
  const dmg = Math.round(rnd(W.damage[0], W.damage[1])); v.health = Math.max(isY2() ? 0.5 : 1, (v.health ?? 100) - dmg); v.mood = Math.max(0, v.mood - W.moodHit); v.lastHurt = 'serangan'; v.injured = S.day;
  S.wolfBites = (S.wolfBites || 0) + 1; sfx('event');
  log((C.NIGHT_THREAT === 'wolf' ? '🐺 ' : '🐗 ') + TLX('log_ancaman.serangan_serigala', 'serang', { nama: v.name, jumlah: dmg }, `Seekor serigala menerkam ${v.name}! Kesehatannya turun ${dmg}.`));
  if (Math.random() < W.traumaChance) { v.traumaUntil = S.day + W.traumaDays; log(TX('log_ancaman.trauma', { nama: v.name }, `${v.name} masih teringat malam serangan itu.`)); }
  const guarded = near('menara_jaga', v, W.killSafeRadius) || near('pagar', v, W.killSafeRadius);
  if (isY2() && v.health < W.killHpBelow && !guarded && Math.random() < W.killChanceIfLowHp) { killVillager(v, 'serangan'); return; }
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
        const tended = S.villagers.some(c => c.task && c.task.kind === 'rawat' && c.task.pid === v.id) || s.since === S.day;
        if (!s.cared && !tended && !(s.cause === 'serangan' && !isY2()) && Math.random() < K.severeDeathPerDay) { killVillager(v, s.cause === 'serangan' ? 'serangan' : 'sakit'); continue; }
        if (!s.cared && !tended) log(TX('penduduk_sakit.parah.memburuk', { nama: v.name }, `Kondisi ${v.name} memburuk. Ia butuh perawatan.`)); s.cared = false; }
      else if (S.day >= s.until) { if (foodTotal() > 0) { v.sick = null; log('😊 ' + TX('penduduk_sakit.ringan.sembuh', { nama: v.name }, `${v.name} sudah sehat kembali!`)); } else s.until++; }
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
  if (!p || !canAfford(C.SICKNESS.careCost)) return null; return { kind: 'rawat', pid: p.id, target: { x: p.x, y: p.y }, work: 0 }; }
function finishCare(v, t) { const p = vById(t.pid); if (!p || !p.sick) return; for (const [k, n] of Object.entries(C.SICKNESS.careCost)) S.res[k] = Math.max(0, S.res[k] - n);
  p.sick = { lvl: 'ringan', until: S.day + 2, cause: p.sick.cause, cared: true };
  log('💊 ' + TX('penduduk_sakit.parah.dirawat', { nama: p.name, nama2: v.name }, `${v.name} merawat ${p.name} seharian. Ia mulai pulih.`)); }
// ---- pergi ----
function leaveDaily() { const L = C.LEAVE;
  for (const v of S.villagers.slice()) { if (isKid(v)) { v.lowMoodDays = 0; continue; }
    v.lowMoodDays = v.mood < L.moodBelow ? (v.lowMoodDays || 0) + 1 : 0; v.starveDays = v.hunger <= 0 ? (v.starveDays || 0) + 1 : 0;
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
function killVillager(v, cause) { const D = C.DEATH; if (!S.villagers.includes(v)) return;
  S.villagers.splice(S.villagers.indexOf(v), 1); if (selVid === v.id) closeVillager();
  S.deaths = (S.deaths || 0) + 1; S.lastDeathDay = S.day; dstat('deaths', v.name, 1); if (cause === 'tua') S.deathsOld = (S.deathsOld || 0) + 1;
  if (v.inside != null) { const h = bById(v.inside); if (h) { const p = doorPos(h); v.x = p.x; v.y = p.y; } v.inside = null; }
  const old = cause === 'tua', partner = partnerOf(v), gm = old ? C.AGE.oldDeathGriefMult : 1;
  const ex = { nama: v.name, umur: v.age, hewan: TERM('hewan'), nama2: (S.villagers[0] || v).name, pasangan: partner ? partner.name : '' };
  log('💀 ' + (old ? TX(partner ? 'lansia_berpulang.meninggal_berpasangan' : 'lansia_berpulang.meninggal', ex, `${v.name} berpulang dengan tenang di usia ${v.age} tahun.`) : TX('penduduk_meninggal.per_penyebab.' + cause, ex, `${v.name} meninggal (${cause}).`)));
  (S.memorials = S.memorials || []).push({ id: v.id, name: v.name, age: v.age, day: S.day, cause, since: v.joined ?? 1 });
  (S.bodies = S.bodies || []).push({ id: v.id, name: v.name, x: v.x, y: v.y, cause, day: S.day });
  S.villagers.forEach(o => o.mood = Math.max(0, o.mood + D.griefMoodInstant * gm));
  if (partner) { partner.partnerId = null; partner.formerPartner = v.name; partner.widowDay = S.day; partner.closeTo = null;
    partner.mood = Math.max(0, partner.mood + D.griefMoodInstant * gm * (C.PAIRING.widowGriefMult - 1)); vhist(partner, `Ditinggal ${v.name}`); }
  S.villagers.forEach(o => { if (o.closeTo === v.id) o.closeTo = null; });
  S.grief = { name: v.name, until: S.day + D.griefDays, mult: gm, old }; S.mourningUntil = S.t + C.DAY_LENGTH_SEC;
  if (S.villagers.length) log('🕯️ ' + (old ? TX('lansia_berpulang.duka.duka_mulai', ex, `Desa berduka atas kepergian sesepuh ${v.name}.`) : TX('duka.duka_mulai', ex, `Desa berduka atas kepergian ${v.name}.`)));
  const N = (TEXT && (old ? TEXT.lansia_berpulang : TEXT.penduduk_meninggal) && (old ? TEXT.lansia_berpulang : TEXT.penduduk_meninggal).notifikasi) || {};
  toast(ASSETS.STATUS_DIR + 'status_mourning.png', fillSafe(N.judul || 'Selamat Jalan, {nama}', ex), old ? fillSafe(N.teks || '{nama} berpulang di usia {umur} tahun.', ex) : TX('penduduk_meninggal.kenangan_panel', { ...ex, sifat: 'penduduk yang baik', lama_tinggal: S.day - (v.joined ?? 1) }, ''));
  assignHomes(); }
function griefDaily() { const G = S.grief; if (!G) return;
  const pre = G.old ? 'lansia_berpulang.duka.' : 'duka.';
  if (S.day > G.until) { log('🌅 ' + TX(pre + 'duka_berakhir', { nama: G.name }, `Masa berkabung untuk ${G.name} usai.`)); S.grief = null; return; }
  S.villagers.forEach(o => o.mood = Math.max(0, o.mood + C.DEATH.griefPerDay * (G.mult ?? 1))); log(TX(pre + 'duka_harian', { nama: G.name }, `Desa masih merindukan ${G.name}.`)); }
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
function emergencyTask(v, only) { const P = S.prio, ok = k => P[k] && (!only || only.includes(k));
  if (ok('padam')) { const t = fireTask(v); if (t) return t; }
  if (ok('rawat')) { const t = careTask(v); if (t) return t; }
  if (ok('jaga')) { const t = guardTask(v); if (t) return t; }
  if (ok('makam')) { const t = graveTask(v); if (t) return t; }
  return null; }
function threatDaily() { spoilDaily(); famineDaily(); seasonDaily(); wolfDaily(); sicknessDaily(); leaveDaily(); griefDaily(); }
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
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) { const n = S.nodes[(i * 37) % S.nodes.length]; if (!n) break; const t = now / 1000 + i * 1.7;
    const x = (n.x + 0.5 + Math.sin(t * 0.6 + i) * 0.8) * T, y = (n.y + Math.cos(t * 0.45 + i * 2) * 0.7) * T;
    ctx.drawImage(a.image, (Math.floor(now / 200 + i) % 4) * 8, 0, 8, 8, Math.round((x - cam.x) * z), Math.round((y - cam.y) * z), 8 * z, 8 * z); }
  ctx.globalCompositeOperation = 'source-over'; }
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
const _stImg = {}; const statusImg = n => { if (!_stImg[n]) { _stImg[n] = new Image(); _stImg[n].src = ASSETS.STATUS_DIR + 'status_' + n + '_16.png'; } return _stImg[n]; };
function villagerStatus(v) { const s = [];
  if (v.sick) s.push('sick'); if (v.injured) s.push('injured');
  if (C.HARD_COLD && isHardSeason() && (isExtreme() || S.fireOut) && !inHut(v)) s.push('cold'); if (v.lowMoodDays >= 2 || v.mood < 30) s.push('sad'); if (S.grief) s.push('mourning'); return s; }
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
  const r = { day, from, gathered: d.gathered || {}, eaten: d.eaten || {}, built: d.built || {}, events: d.events || {}, deaths: d.deaths || {} };
  S.lastSummary = r; if (day < 1) return r;
  const parts = [];
  if (Object.keys(r.gathered).length) parts.push('dikumpulkan ' + fmt(r.gathered));
  if (Object.keys(r.eaten).length) parts.push('dimakan ' + fmt(r.eaten));
  if (Object.keys(r.built).length) parts.push('dibangun ' + Object.entries(r.built).map(([k, n]) => n > 1 ? `${k} ×${n}` : k).join(', '));
  if (Object.keys(r.events).length) parts.push('kejadian: ' + Object.keys(r.events).join(', '));
  if (Object.keys(r.deaths).length) parts.push('berpulang: ' + Object.keys(r.deaths).join(', '));
  log(`📊 Ringkasan hari ${from < day ? from + '–' + day : day}: ${parts.length ? parts.join('; ') : 'hari yang tenang'}.`); return r; }
function summaryUI() { const r = S.lastSummary; if (!r || r.day < 1) return '<i>Belum ada hari yang lewat.</i>';
  const row = (lbl, o) => { const e = Object.entries(o); return `<div><b>${lbl}:</b> ${e.length ? e.map(([k, n]) => `${RES_LABEL[k] || k} ${Math.floor(n)}`).join(', ') : '-'}</div>`; };
  return `<div style="opacity:.8">Hari ${r.from != null && r.from < r.day ? r.from + '–' + r.day : r.day}</div>` + row('Dikumpulkan', r.gathered) + row('Dimakan', r.eaten) + row('Dibangun', r.built) + `<div><b>Kejadian:</b> ${Object.keys(r.events).join(', ') || '-'}</div>`; }
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
    ${familyHTML(v)}<h3>Keahlian</h3>${Object.entries(SK).map(([k, l]) => `<div class="row"><span>${uiIco('ikon_skill_' + k)}${l}</span><span>${'★'.repeat(Math.min(5, Math.floor((v.skills[k] || 0) * 2)))}${'☆'.repeat(5 - Math.min(5, Math.floor((v.skills[k] || 0) * 2)))} ${(v.skills[k] || 0).toFixed(2)}</span></div>`).join('')}
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
  if (S.event) return;
  for (const v of S.villagers) updateVillager(v, dt);
  checkQuest();
  updateMerchant(dt);
  for (const v of S.villagers.slice()) if (v.health <= 0) killVillager(v, v.lastHurt === 'serangan' && v.injured ? 'serangan' : v.hunger <= 0 ? (isHardSeason() && C.HARD_COLD ? 'dingin' : 'kelaparan') : 'sakit');
  seasonStep(dt); scheduleStep();
  const winter = isHardSeason() && !!FX().fieldsStop;
  for (const b of S.buildings) if (b.type === 'ladang' && b.done && b.stage === 'tumbuh' && canGrow(b) && (b.grow += dt / C.DAY_LENGTH_SEC) >= growDaysOf(b)) b.stage = 'siap';
  if (!winter) for (const n of S.nodes) if (n.type === 'semak' && n.amount <= 0 && (n.regrow -= dt / (isRaining() ? FX().rainBushRegrowMult : 1)) <= 0) n.amount = C.NODE_AMOUNT.makanan;
  S.nodes = S.nodes.filter(n => n.amount > 0 || n.type === 'semak');
  if (S.day !== lastDay) { lastDay = S.day; newDay(); }
  if (isHardSeason() && S.villagers.some(v => v.hunger <= 5)) S.winterStarve = true;
}
function newDay() {
  endOfDaySummary();
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
  const sp = C.SPAWN, foodOk = foodTotal() >= pop * sp.foodDaysPerPop * sp.foodPerDayPerPop;
  const cd = sp.cooldownDays * ((S.era | 0) >= eraIndex(C.PREGNANCY.minEra) ? C.PREGNANCY.newcomerCooldownMult : 1);
  if (foodOk && capacity() > pop + S.villagers.filter(v => v.pregnantUntil).length && S.moodGoodDays >= sp.moodDays && S.day - S.lastSpawnDay >= cd - (done('balai').length ? C.TOWN_HALL_SPAWN_COOLDOWN_CUT : 0)) {
    const h = houses()[0], c = h ? doorPos(h) : CAMP; spawnVillager(c.x, c.y + 0.5); S.lastSpawnDay = S.day;
  }
  const need = pop * C.SPAWN.foodPerDayPerPop;
  if (S.villagers.some(v => v.hunger <= 5)) log('⚠️ Ada penduduk kelaparan parah!');
  threatDaily(); if (!S.villagers.length) return; lifeDaily(); if (!S.villagers.length) return;
  // pelacak pencapaian: beruntun hari pangan & musim dingin yang terlewati
  const fdays = foodTotal() / foodPerDay(); S.foodStreak = fdays >= 5 ? (S.foodStreak || 0) + 1 : 0; S.foodStreakMax = Math.max(S.foodStreakMax || 0, S.foodStreak);
  if (S.prevSeason === C.HARD_SEASON && se !== C.HARD_SEASON) { if (!S.winterStarve) S.wintersOk = (S.wintersOk || 0) + 1; S.winterStarve = false; } S.prevSeason = se;
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
  for (const v of S.villagers) { if (v.inside != null) continue;
    if (isBaby(v)) { if (v.heldBy == null) list.push({ y: v.y + 0.9, draw: () => drawBaby(v) }); else { const h = bById(v.homeId); if (h) { const p = cradlePos(h); list.push({ y: p.y + 0.9, draw: () => sprite('buaian_kosong', p.x, p.y, 1, 1, frameAt(ASSETS.buaian_kosong, 2)) }); } } continue; }
    const k = Math.round(v.x * 2) + ',' + Math.round(v.y * 2); (groups[k] = groups[k] || []).push(v); }
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
    for (const b of S.buildings) { const d = C.BUILDINGS[b.type]; if (!b.done || !d.light || (b.hp ?? 100) <= 0 || b.type === 'obor' && b.unlit || b.type === 'apiunggun' && !campfireLit() || isHouse(b) && !houseLit(b)) continue;
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
function drySawahImg() { if (_drySawah) return _drySawah; const src = ASSETS.sawah.image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d'); g.drawImage(src, 0, 0); const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let k = 0; k < p.length; k += 4) { const r = p[k], gg = p[k + 1], bl = p[k + 2]; if (p[k + 3] < 8 || bl <= r + 10) continue; // hanya piksel air (kebiruan)
    const x = (k / 4) % c.width, y = Math.floor(k / 4 / c.width), crack = (x * 7 + y * 13) % 17 === 0 || (x + y * 3) % 23 === 0, lite = bl > 200;
    const col = crack ? [96, 66, 40] : lite ? [196, 160, 110] : (x + y) % 5 === 0 ? [160, 124, 82] : [176, 140, 94]; p[k] = col[0]; p[k + 1] = col[1]; p[k + 2] = col[2]; }
  g.putImageData(d, 0, 0); return (_drySawah = c); }
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
    hasImg = sprite(key, b.x, b.y, 1, 1, fr);
    if (!hasImg) { ctx.fillStyle = ['#8a5a32', '#8a7a32', '#7a9a3a', '#5aa03a', '#e0c040'][fr] || '#8a5a32'; ctx.fillRect(b.x * T + 2, b.y * T + 2, T - 4, T - 4); }
    if (b.done && (fr === 2 || fr === 3) && canGrow(b)) sprite('kilau', b.x, b.y, 1, 1, animFrame(ASSETS.kilau, ASSETS.kilau.fps));
  } else if (b.done && (b.hp ?? 100) <= 0 && b.type !== 'makam') { // hangus -> puing
    hasImg = (ASSETS[b.type + '_hangus'] && ASSETS[b.type + '_hangus'].image) ? sprite(b.type + '_hangus', b.x, b.y, d.w, d.h) : sprite(d.w >= 2 ? 'puing_besar' : 'puing_kecil', b.x, b.y, d.w, d.h);
  } else if (b.type === 'pagar') { const a = ASSETS.pagar, nb = (x, y) => S.buildings.some(o => o.type === 'pagar' && o.x === x && o.y === y);
    const i = (nb(b.x, b.y - 1) ? 1 : 0) + (nb(b.x + 1, b.y) ? 2 : 0) + (nb(b.x, b.y + 1) ? 4 : 0) + (nb(b.x - 1, b.y) ? 8 : 0);
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
  if (!b.done) { bar(b.progress / d.work, '#ffd27a'); ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.fillText(d.nama, b.x * T + 1, b.y * T + d.h * T - 2); }
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
function drawVillager(v, off = 0) {
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
  return true; }
// ---------- UI ----------
const $ = id => document.getElementById(id);
const _html = {};
function setHTML(id, h) { if (_html[id] !== h) { _html[id] = h; $(id).innerHTML = h; } }
function ui() {
  const f = dayFrac(), h = Math.floor(f * 24), m = Math.floor((f * 24 % 1) * 60);
  $('res').innerHTML = Object.keys(RES_LABEL).filter(k => k in S.res && (S.res[k] >= 1 || ['kayu', 'batu', 'makanan', 'air'].includes(k)))
    .map(k => `<span title="${RES_LABEL[k]}">${resIcon(k)} ${RES_LABEL[k]}: <b>${Math.floor(S.res[k])}</b></span>`).join(' &nbsp; ') + ` &nbsp; ` + popBadge();
  const si = seasonInfo(), se = si.id;
  $('time').innerHTML = `${(C.SEASON_ICONS || {})[se] || ''} ${C.SEASON_NAMES[se]} (${si.day}/${si.len}) · Hari <b>${S.day}</b> — ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isNight() ? '🌙 Malam' : '☀️ Siang'}`;
  const TL = { makan: 'Makan', tidur: 'Tidur', kumpul: 'Mengumpulkan', setor: 'Menyetor', bangun: 'Membangun', diam: 'Santai', tani: 'Bertani', air: 'Mengambil air', riset: 'Meneliti', padam: 'Memadamkan api', rawat: 'Merawat', makam: 'Makam', jaga: 'Berjaga' };
  setHTML('vil', S.villagers.map(v => `<div class="v" data-vid="${v.id}"><b>${v.name}</b> (${v.age} th, ${role(v)}) — ${v.task ? TL[v.task.kind] + (v.task.kind === 'kumpul' ? ' ' + v.task.res : v.task.kind === 'tani' ? (v.task.harvest ? ' (panen)' : ' (tanam)') : '') : '-'}<br>
    Lapar ${v.hunger | 0} · Energi ${v.energy | 0} · Hati ${v.mood | 0} · Sehat ${(v.health ?? 100) | 0}</div>`).join(''));
  const warn = foodTotal() < foodPerDay() * 2, wwarn = (FX().hardWarnFromDay || isHardSeason()) && foodTotal() < foodPerDay() * C.HARD_BUFFER_DAYS;
  $('res').innerHTML += (warn ? ' &nbsp; <b style="color:#ff6b6b">⚠️ Makanan menipis!</b>' : wwarn ? ` &nbsp; <b style="color:#ffb36b">${C.SEASON_ICONS[C.HARD_SEASON]} Stok ${C.SEASON_NAMES[C.HARD_SEASON].toLowerCase()} kurang</b>` : '') + (S.res.air < S.villagers.length ? ' &nbsp; <b style="color:#6bc6ff">💧 Air menipis!</b>' : '');
  const era = C.ERAS[S.era | 0], next = C.ERAS[(S.era | 0) + 1];
  setHTML('era', `<b>${era.nama}</b>` + (next ? `<br>Menuju <b>${next.nama}</b>:<br>` + eraReqStatus(next).map(([t, ok]) => `${ok ? '✅' : '▫️'} ${t}`).join('<br>') : '<br>Era tertinggi tercapai!'));
  document.querySelectorAll('[data-b]').forEach(bt => { const k = bt.dataset.b; if (k) bt.disabled = !unlocked(k) || !canAfford(C.BUILDINGS[k].cost); });
  warnUI(); setHTML('quest', questUI()); setHTML('summary', summaryUI()); villagerPanelUI(); techPanelUI(); marketUI(); $('marketbtn').classList.toggle('on', marketOpen());
  setHTML('log', S.log.slice(0, 15).map(l => `<div>${withIcons(l)}</div>`).join(''));
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
    const v = nearest(S.villagers.filter(o => o.inside == null && o.heldBy == null && Math.hypot(o.x - wx, o.y - wy) < 0.8), { x: wx, y: wy }); if (v) openVillager(v.id); return; }
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
  // layar sedang (900–1560px): kanvas menyusut agar panel samping tetap selebar SIDE_MIN_W
  else { w = Math.max(C.VIEW_MIN_W, Math.min(C.VIEW_W, window.innerWidth - C.SIDE_MIN_W)); $('side').style.width = Math.max(C.SIDE_MIN_W, Math.min(C.SIDE_MAX_W, window.innerWidth - w)) + 'px'; }
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; ctx.imageSmoothingEnabled = false; clampCam(); }
  if (!mob) document.body.classList.remove('drawer-open'); }
$('drawerbtn').onclick = () => document.body.classList.toggle('drawer-open');
window.addEventListener('resize', fitCanvas); window.addEventListener('orientationchange', () => setTimeout(fitCanvas, 200)); fitCanvas();
cv.addEventListener('contextmenu', e => { e.preventDefault(); placing = null; });
// save/load: referensi node/bangunan di task tidak diserialisasi, task direset saat muat
const KEY = 'desaMandiriSave';
$('save').onclick = () => { localStorage.setItem(KEY, JSON.stringify({ ...S, _floodSet: undefined, villagers: S.villagers.map(v => ({ ...v, task: null, path: null, pathKey: null })) })); log('Permainan disimpan.'); };
$('load').onclick = () => loadGame(true);
$('reset').onclick = () => { if (confirm('Mulai permainan baru?')) { S = null; newGame(); lastDay = S.day; buildPrioUI(); buildBuildBar(); tutorialUI(); } };
function loadGame(verbose) { const s = localStorage.getItem(KEY); if (!s) { if (verbose) log('Belum ada simpanan.'); return false; }
  try { const L = JSON.parse(s); if (!L.tiles || L.tiles.length !== C.MAP_H || L.tiles[0].length !== C.MAP_W) { if (verbose) log('Simpanan versi lama tidak cocok dengan peta baru.'); return false; } S = L; delete S._floodSet; /* cache Set, tidak bisa di-JSON-kan */ lastDay = S.day; S.prio = { ...C.DEFAULT_PRIO, ...S.prio }; S.techDone = S.techDone || []; S.research = S.research || null; marketInit(); S.gathered = S.gathered || {}; S.era |= 0; for (const [k, n] of Object.entries(C.START_RES)) if (!(k in S.res)) S.res[k] = 0; if (!S.banks) computeBanks(); S.villagers.forEach(v => { v.skills.bertani = v.skills.bertani || 0; if (v.health == null) v.health = 100; }); S.questIdx |= 0; S.tutorialStep |= 0; S.restUntil = S.restUntil || 0; buildPrioUI(); buildBuildBar(); tutorialUI(); $('modal').style.display = 'none'; if (S.event) showEvent(); log('Permainan dimuat.'); return true; } catch (e) { console.warn(e); return false; } }

// ---------- loop ----------
let prev = performance.now();
function frame(now) { const real = Math.min(0.25, (now - prev) / 1000); prev = now;
  for (const n of notes) n.life -= real; while (notes.length && notes[0].life <= 0) notes.shift();
  let sim = menuOpen ? 0 : real * speed; while (sim > 0) { const d = Math.min(0.1, sim); step(d); sim -= d; }
  render(); ui(); requestAnimationFrame(frame); }
window.DESA = { get state() { return S; }, life: { stageOf, ageOf, isKid, isBaby, canWork, childHelper, partnerOf, childrenOf, houses, capacity, chooseTask, inSleepWindow, pastLate, lateAllowed, pregnancyOk, giveBirth, pairUp, assignHomes, lifeDaily, oldAgeDaily, foodPerDay, updateVillager, spawnVillager }, bindThemeText, hutEmergencyTask, buildTask, sicknessDaily, sawahDry, drySawahImg, popBadge, maybeEvent, waterNeed, wellYieldNow, riverYieldNow, canGrow, growDaysOf, cropId, seasonInfo, isHardSeason, yearDays, eventAllowed, chooseTask, wreckField, fieldTarget, foodPerDay, hungerMultNow, RES_LABEL, isY2, updateVillager, loadGame, biteVillager, updateWolf, wolfCost, seasonDaily, stockpiles, pileTier, pileSpots, notify, get notes() { return notes; }, killVillager, makeSick, ignite, spawnWolf, startFlood, famineLevel, warnings, threatDaily, seasonStep, wolfDaily, leaveDaily, sicknessDaily, spoilDaily, year, foodDays, floodTiles, isFlooded, fitCanvas, get placing() { return placing; }, setPlacing(b) { placing = b; }, get ach() { return ACH; }, checkAch, achProgress, unlockAch, endOfDaySummary, newDay, toast, applyEffects, allEvents, eventEraOk, fill, marketNewDay, priceOf, tradeQuote, doTrade, spawnMerchant, marketOpen, quota, foodSellMult, openMarket, startResearch, techVal, techNodes, openTech, showEvent, validSpot, canAfford, addBuilding, season,  step, cam, findPath, setZoom, centerCam };
// tambalan teks tema di memori (TEKS-GAME.json tidak diubah): 'event:<id>.<path>' atau '<path>'
// TEKS meta.txt_tema_nusantara: isi path TEKS untuk THEMES.indonesia.TXT (cadangan di tema.js tetap dipakai bila path tidak ada)
function bindThemeText(t) { const M = t && t.meta && t.meta.txt_tema_nusantara; if (!M || C.THEME === 'sedang') return;
  for (const [k, path] of Object.entries(M)) { if (k[0] === '_' || !path) continue; let o = t; for (const x of path.split('.')) o = o && o[x];
    if (!o) continue; const e = (C.TXT[k] = C.TXT[k] || [null, '']); if (!e[0]) e[0] = path; } }
function applyTextPatch(t) { if (!t) return; for (const [k, val] of Object.entries(C.TEXT_PATCH || {})) { let o, path;
    if (k.startsWith('event:')) { const [id, ...rest] = k.slice(6).split('.'); o = ['event_acak', 'event_era_lanjut', 'event_musiman'].flatMap(x => t[x] || []).find(e => e.id === id); path = rest; } else { o = t; path = k.split('.'); }
    for (let i = 0; o && i < path.length - 1; i++) o = o[path[i]]; if (o && path.length) o[path[path.length - 1]] = val; } }
fetch(C.TEXT_FILE || 'TEKS-GAME.json').then(r => r.ok ? r.json() : null).catch(() => null).then(t => { TEXT = t; applyTextPatch(t); bindThemeText(t);
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
