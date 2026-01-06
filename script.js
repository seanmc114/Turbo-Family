// TURBO · Family (EN → ES) · FAMILY_FINAL1
// Modes: Classic, Survival (1 mistake = fail), Sprint (60s cap), Team Relay
// Same Match Code => same 10 prompts across devices.
// Short Result Code (teacher-friendly).
//
// Rules preserved:
// - 10 prompts per round
// - +30s per wrong/blank
// - unlock thresholds 200→40
// - best saved per (mode, level)
// - global ES reads tokens cap 7 (commit-on-finish), +1 token on perfect
//
// Accents required; capitals ignored; ñ counts as n.

(() => {
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const QUESTIONS_PER_ROUND = 10;
  const PENALTY_PER_WRONG   = 30;
  const SPRINT_CAP_SECONDS  = 60;

  const BASE_THRESH = { 1:200, 2:180, 3:160, 4:140, 5:120, 6:100, 7:80, 8:60, 9:40 };

  const GLOBAL_READS_MAX = 7;
  const GLOBAL_READS_KEY = "turboFamily:globalReads:FAMILY_FINAL1";

  const STORAGE_PREFIX = "turboFamily:FAMILY_FINAL1";
  const bestKey = (mode, lvl) => `${STORAGE_PREFIX}:best:${canonMode(mode)}:L${lvl}`;

  function canonMode(m){
    const x = (m || "").toLowerCase();
    if (x === "survival") return "survival";
    if (x === "sprint") return "sprint";
    if (x === "team") return "team";
    return "classic";
  }

  const MODE_LABELS = {
    classic: "Classic",
    survival: "Survival",
    sprint: "Sprint (60s)",
    team: "Team Relay"
  };

  // ===================== DATASET (Levels 1–10) =====================
  // NOTE: Answers list can include multiple acceptable variants (e.g. with/without article).
  const FAMILY = {
    1: [
      { en: "mother", answers: ["madre"] },
      { en: "father", answers: ["padre"] },
      { en: "brother", answers: ["hermano"] },
      { en: "sister", answers: ["hermana"] },
      { en: "son", answers: ["hijo"] },
      { en: "daughter", answers: ["hija"] },
      { en: "parents", answers: ["padres", "los padres"] },
      { en: "children", answers: ["hijos", "los hijos"] },
      { en: "family", answers: ["familia"] },
      { en: "husband", answers: ["marido", "esposo"] },
      { en: "wife", answers: ["esposa", "mujer"] },
      { en: "my mother", answers: ["mi madre"] },
      { en: "my father", answers: ["mi padre"] },
      { en: "my family", answers: ["mi familia"] },
      { en: "my parents", answers: ["mis padres"] }
    ],
    2: [
      { en: "grandfather", answers: ["abuelo"] },
      { en: "grandmother", answers: ["abuela"] },
      { en: "grandparents", answers: ["abuelos", "los abuelos"] },
      { en: "uncle", answers: ["tío"] },
      { en: "aunt", answers: ["tía"] },
      { en: "cousin (male)", answers: ["primo"] },
      { en: "cousin (female)", answers: ["prima"] },
      { en: "siblings", answers: ["hermanos", "los hermanos"] },
      { en: "relative", answers: ["pariente", "familiar"] },
      { en: "nephew", answers: ["sobrino"] },
      { en: "niece", answers: ["sobrina"] },
      { en: "my uncle", answers: ["mi tío"] },
      { en: "my aunt", answers: ["mi tía"] },
      { en: "my cousins", answers: ["mis primos"] },
      { en: "my grandparents", answers: ["mis abuelos"] }
    ],
    3: [
      { en: "stepfather", answers: ["padrastro"] },
      { en: "stepmother", answers: ["madrastra"] },
      { en: "stepson", answers: ["hijastro"] },
      { en: "stepdaughter", answers: ["hijastra"] },
      { en: "half-brother", answers: ["medio hermano"] },
      { en: "half-sister", answers: ["media hermana"] },
      { en: "fiancé", answers: ["prometido"] },
      { en: "fiancée", answers: ["prometida"] },
      { en: "partner (romantic)", answers: ["pareja"] },
      { en: "single (relationship status)", answers: ["soltero", "soltera"] },
      { en: "engaged", answers: ["comprometido", "comprometida"] },
      { en: "widower", answers: ["viudo"] },
      { en: "widow", answers: ["viuda"] },
      { en: "divorced (m)", answers: ["divorciado"] },
      { en: "divorced (f)", answers: ["divorciada"] }
    ],
    4: [
      { en: "father-in-law", answers: ["suegro"] },
      { en: "mother-in-law", answers: ["suegra"] },
      { en: "parents-in-law", answers: ["suegros", "los suegros"] },
      { en: "brother-in-law", answers: ["cuñado"] },
      { en: "sister-in-law", answers: ["cuñada"] },
      { en: "son-in-law", answers: ["yerno"] },
      { en: "daughter-in-law", answers: ["nuera"] },
      { en: "godfather", answers: ["padrino"] },
      { en: "godmother", answers: ["madrina"] },
      { en: "godson", answers: ["ahijado"] },
      { en: "goddaughter", answers: ["ahijada"] },
      { en: "my partner", answers: ["mi pareja"] },
      { en: "my husband", answers: ["mi marido", "mi esposo"] },
      { en: "my wife", answers: ["mi esposa"] },
      { en: "my in-laws", answers: ["mis suegros"] }
    ],
    5: [
      { en: "grandson", answers: ["nieto"] },
      { en: "granddaughter", answers: ["nieta"] },
      { en: "great-grandfather", answers: ["bisabuelo"] },
      { en: "great-grandmother", answers: ["bisabuela"] },
      { en: "great-grandparents", answers: ["bisabuelos", "los bisabuelos"] },
      { en: "twin (male)", answers: ["gemelo"] },
      { en: "twin (female)", answers: ["gemela"] },
      { en: "twins", answers: ["gemelos"] },
      { en: "only child", answers: ["hijo único", "hija única"] },
      { en: "triplets", answers: ["trillizos"] },
      { en: "my grandson", answers: ["mi nieto"] },
      { en: "my granddaughter", answers: ["mi nieta"] },
      { en: "my nephew", answers: ["mi sobrino"] },
      { en: "my niece", answers: ["mi sobrina"] },
      { en: "my brother-in-law", answers: ["mi cuñado"] }
    ],
    6: [
      { en: "ancestor", answers: ["antepasado"] },
      { en: "descendant", answers: ["descendiente"] },
      { en: "adopted (child)", answers: ["adoptado", "adoptada"] },
      { en: "adoptive parents", answers: ["padres adoptivos", "los padres adoptivos"] },
      { en: "to adopt", answers: ["adoptar"] },
      { en: "to raise (children)", answers: ["criar"] },
      { en: "to take care of", answers: ["cuidar"] },
      { en: "to support (family)", answers: ["apoyar"] },
      { en: "relationship", answers: ["relación"] },
      { en: "family member", answers: ["miembro de la familia"] },
      { en: "to get married", answers: ["casarse"] },
      { en: "to divorce", answers: ["divorciarse"] },
      { en: "to be born", answers: ["nacer"] },
      { en: "to die", answers: ["morir"] },
      { en: "to grow up", answers: ["crecer"] }
    ],
    7: [
      { en: "close-knit family", answers: ["familia unida"] },
      { en: "single-parent family", answers: ["familia monoparental"] },
      { en: "extended family", answers: ["familia extensa"] },
      { en: "family gathering", answers: ["reunión familiar"] },
      { en: "family tree", answers: ["árbol genealógico"] },
      { en: "household", answers: ["hogar"] },
      { en: "guardian", answers: ["tutor", "tutora"] },
      { en: "to argue", answers: ["discutir"] },
      { en: "to get along (with)", answers: ["llevarse bien con"] },
      { en: "to fall out (with)", answers: ["llevarse mal con"] },
      { en: "to miss (someone)", answers: ["echar de menos"] },
      { en: "to look after", answers: ["cuidar de"] },
      { en: "to spend time together", answers: ["pasar tiempo juntos"] },
      { en: "to share (chores)", answers: ["compartir"] },
      { en: "to trust", answers: ["confiar"] }
    ],
    8: [
      { en: "generation", answers: ["generación"] },
      { en: "teenager", answers: ["adolescente"] },
      { en: "adult", answers: ["adulto", "adulta"] },
      { en: "elderly person", answers: ["persona mayor"] },
      { en: "pregnant", answers: ["embarazada"] },
      { en: "to become", answers: ["llegar a ser", "convertirse en"] },
      { en: "to move in together", answers: ["irse a vivir juntos"] },
      { en: "to separate", answers: ["separarse"] },
      { en: "to reconcile", answers: ["reconciliarse"] },
      { en: "to forgive", answers: ["perdonar"] },
      { en: "responsibility", answers: ["responsabilidad"] },
      { en: "to respect", answers: ["respetar"] },
      { en: "to obey", answers: ["obedecer"] },
      { en: "to advise", answers: ["aconsejar"] },
      { en: "to argue (noun)", answers: ["discusión"] }
    ],
    9: [
      { en: "to support financially", answers: ["mantener"] },
      { en: "to provide for", answers: ["proveer", "mantener"] },
      { en: "inheritance", answers: ["herencia"] },
      { en: "to inherit", answers: ["heredar"] },
      { en: "to bring up (children)", answers: ["educar", "criar"] },
      { en: "to attend (a wedding)", answers: ["asistir a"] },
      { en: "wedding", answers: ["boda"] },
      { en: "anniversary", answers: ["aniversario"] },
      { en: "engagement", answers: ["compromiso"] },
      { en: "to propose (marriage)", answers: ["pedir matrimonio"] },
      { en: "to introduce (someone)", answers: ["presentar"] },
      { en: "to take care of (formal)", answers: ["hacerse cargo de"] },
      { en: "to depend on", answers: ["depender de"] },
      { en: "to be proud of", answers: ["estar orgulloso de", "estar orgullosa de"] },
      { en: "to be worried about", answers: ["estar preocupado por", "estar preocupada por"] }
    ],
    10: [
      { en: "to have a close relationship", answers: ["tener una relación cercana"] },
      { en: "to have a strained relationship", answers: ["tener una relación tensa"] },
      { en: "to set boundaries", answers: ["poner límites"] },
      { en: "to compromise", answers: ["llegar a un acuerdo"] },
      { en: "to take responsibility", answers: ["asumir la responsabilidad"] },
      { en: "to be responsible for", answers: ["ser responsable de"] },
      { en: "to rely on", answers: ["contar con"] },
      { en: "to cope with", answers: ["afrontar"] },
      { en: "to overcome", answers: ["superar"] },
      { en: "to maintain (a relationship)", answers: ["mantener"] },
      { en: "mutual respect", answers: ["respeto mutuo"] },
      { en: "trust", answers: ["confianza"] },
      { en: "well-being", answers: ["bienestar"] },
      { en: "to be supportive", answers: ["ser comprensivo", "ser comprensiva"] },
      { en: "to have empathy", answers: ["tener empatía"] }
    ]
  };

  // ===================== Normalisation =====================
  function norm(s){
    let t = (s || "").trim().toLowerCase();
    t = t.replace(/ñ/g, "n");       // allow ñ ≡ n
    t = t.replace(/\s+/g, " ");
    t = t.replace(/^[¿¡"“”'().,;:]+|[¿¡"“”'().,;:]+$/g, "");
    return t;
  }
  function isCorrect(user, answers){
    const u = norm(user);
    if (!u) return false;
    return answers.some(a => norm(a) === u);
  }

  // ===================== TTS =====================
  function speak(text, lang){
    try{
      if(!("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }catch{}
  }

  // ===================== Global reads tokens =====================
  const clampReads = n => Math.max(0, Math.min(GLOBAL_READS_MAX, n|0));
  function getGlobalReads(){
    const v = localStorage.getItem(GLOBAL_READS_KEY);
    if (v == null){
      localStorage.setItem(GLOBAL_READS_KEY, String(GLOBAL_READS_MAX));
      return GLOBAL_READS_MAX;
    }
    const n = parseInt(v,10);
    return Number.isFinite(n) ? clampReads(n) : GLOBAL_READS_MAX;
  }
  function setGlobalReads(n){
    localStorage.setItem(GLOBAL_READS_KEY, String(clampReads(n)));
    updateReadsPill();
  }
  function updateReadsPill(){
    const now = getGlobalReads();
    const pill = $("#reads-pill");
    if (pill) pill.textContent = `${now}/${GLOBAL_READS_MAX}`;
  }

  // ===================== Best / unlocks =====================
  function getBest(mode, lvl){
    const v = localStorage.getItem(bestKey(mode,lvl));
    const n = v == null ? null : parseInt(v,10);
    return Number.isFinite(n) ? n : null;
  }
  function saveBest(mode, lvl, score){
    const prev = getBest(mode,lvl);
    if (prev == null || score < prev) localStorage.setItem(bestKey(mode,lvl), String(score));
  }
  function isUnlocked(mode, lvl){
    const m = canonMode(mode);
    if (lvl === 1) return true;
    const need = BASE_THRESH[lvl - 1];
    const prev = getBest(m, lvl - 1);
    return prev != null && (need == null || prev <= need);
  }

  // ===================== Seeded same-10 selection =====================
  function xmur3(str){
    let h = 1779033703 ^ str.length;
    for (let i=0; i<str.length; i++){
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function(){
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }
  function mulberry32(a){
    return function(){
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(arr, seedInt){
    const r = mulberry32(seedInt);
    const a = arr.slice();
    for (let i=a.length-1; i>0; i--){
      const j = Math.floor(r() * (i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function makeMatchCode(){
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i=0;i<6;i++) out += chars[Math.floor(Math.random()*chars.length)];
    return out;
  }

  // ===================== SHORT Result Code =====================
  // Example: 07P-4K02F-91QH
  // LL = level (2 digits)
  // M  = mode letter: C classic, V survival, P sprint, T team
  // FF = match fingerprint (2 base36)
  // SSS = score base36 (3)
  // C = correct base36 (1)
  // W = wrong base36 (1)
  // CC = checksum base36 (2)
  function b36(n){ return Math.max(0, n|0).toString(36).toUpperCase(); }
  function b36pad(n, len){ return b36(n).padStart(len, "0"); }
  function simpleHash32(str){
    let h = 2166136261;
    for (let i=0;i<str.length;i++){
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }
  function modeLetter(modeCanon){
    const m = canonMode(modeCanon);
    if (m === "classic") return "C";
    if (m === "survival") return "V";
    if (m === "sprint") return "P";
    if (m === "team") return "T";
    return "C";
  }
  function modeFromLetter(ch){
    const c = (ch || "").toUpperCase();
    if (c === "C") return "classic";
    if (c === "V") return "survival";
    if (c === "P") return "sprint";
    if (c === "T") return "team";
    return "classic";
  }
  function matchFinger(matchCode){
    const h = simpleHash32((matchCode || "") + "|MF|FAMILY_FINAL1");
    const v = h % (36*36);
    return b36pad(v, 2);
  }
  function makeShortResultCode({ lvl, mode, match, score, correct, wrong }){
    const LL = String(lvl).padStart(2, "0").slice(-2);
    const M  = modeLetter(mode);
    const FF = matchFinger(match);
    const SSS = b36pad(score, 3).slice(-3);
    const C = b36pad(correct, 1).slice(-1);
    const W = b36pad(wrong, 1).slice(-1);

    const body = `${LL}${M}-${FF}${SSS}-${C}${W}`;
    const sigNum = simpleHash32(body + "|SIG|TURBO_FAMILY_FINAL1") % (36*36);
    const CC = b36pad(sigNum, 2);
    return `${body}${CC}`;
  }
  function parseShortResultCode(code){
    try{
      const s = (code || "").trim().toUpperCase();
      if (!/^\d{2}[CVPT]-[0-9A-Z]{5}-[0-9A-Z]{4}$/.test(s)){
        return { ok:false, error:"Invalid short code format." };
      }
      const body = s.slice(0, -2);
      const CC   = s.slice(-2);
      const sigNum = simpleHash32(body + "|SIG|TURBO_FAMILY_FINAL1") % (36*36);
      const expected = b36pad(sigNum, 2);
      if (CC !== expected) return { ok:false, error:"Checksum mismatch (typo likely)." };

      const LL = parseInt(s.slice(0,2), 10);
      const M  = modeFromLetter(s.slice(2,3));
      const FF = s.slice(4,6);
      const SSS = s.slice(6,9);
      const C  = s.slice(10,11);
      const W  = s.slice(11,12);

      return {
        ok:true,
        data:{
          lvl: LL,
          mode: M,
          mf: FF,
          score: parseInt(SSS, 36),
          correct: parseInt(C, 36),
          wrong: parseInt(W, 36),
          died: (M==="survival" && parseInt(W,36)>0)
        }
      };
    }catch{
      return { ok:false, error:"Could not parse short code." };
    }
  }

  // ===================== Celebration =====================
  function showPerfectCelebration(){
    const overlay = document.createElement("div");
    overlay.className = "tq-celebrate-overlay";
    document.body.appendChild(overlay);

    const banner = document.createElement("div");
    banner.className = "tq-perfect-banner";
    banner.textContent = "PERFECT!";
    document.body.appendChild(banner);

    const COLORS = ["#3b82f6","#22c55e","#a855f7","#f59e0b","#ef4444","#06b6d4","#84cc16"];
    const W = window.innerWidth;

    for (let i=0; i<120; i++){
      const c = document.createElement("div");
      c.className = "tq-confetti";
      const size = 6 + Math.random()*8;
      c.style.width  = `${size}px`;
      c.style.height = `${size*1.4}px`;
      c.style.left   = `${Math.random()*W}px`;
      c.style.top    = `${-20 - Math.random()*120}px`;
      c.style.background = COLORS[i % COLORS.length];
      c.style.animationDelay = `${Math.random()*200}ms`;
      c.style.transform = `rotate(${Math.random()*360}deg)`;
      overlay.appendChild(c);
    }

    setTimeout(()=>{ overlay.remove(); banner.remove(); }, 2200);
  }

  // ===================== State =====================
  let currentLevel = null;
  let currentMode = "classic";
  let currentMatchCode = "";
  let teamSize = 4;

  let quiz = [];
  let t0 = 0;
  let timerId = null;
  let submitted = false;

  let readsUsedThisRound = 0;
  let globalSnapshotAtStart = 0;
  const attemptReadsLeft = () => Math.max(0, globalSnapshotAtStart - readsUsedThisRound);

  function clampInt(v, min, max, fallback){
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function modeChanged(){
    currentMode = canonMode($("#mode").value);
    $("#teamSizeField").style.display = (currentMode === "team") ? "block" : "none";
  }

  function levelDesc(lvl){
    const map = {
      1: "Immediate family basics.",
      2: "Extended family basics.",
      3: "Step/half + relationship status.",
      4: "In-laws + godfamily.",
      5: "Generations + twins etc.",
      6: "Family verbs (useful LC phrases).",
      7: "Family structures + feelings.",
      8: "Life stages + relationship dynamics.",
      9: "Advanced relationship language.",
      10:"High-level nuance & abstract ideas."
    };
    return map[lvl] || "Family";
  }

  function renderLevels(){
    const host = $("#level-list");
    host.innerHTML = "";

    for (let lvl=1; lvl<=10; lvl++){
      const unlocked = isUnlocked(currentMode, lvl);
      const best = getBest(currentMode, lvl);

      const btn = document.createElement("button");
      btn.className = "level-btn";
      btn.disabled = !unlocked;

      const title = unlocked ? `Level ${lvl}` : `🔒 Level ${lvl}`;
      const bestTxt = best == null ? "Best: —" : `Best: ${best}s`;

      btn.innerHTML = `
        <div class="level-top">
          <div class="level-title">${title}</div>
          <div class="best">${bestTxt}</div>
        </div>
        <div class="level-desc">${levelDesc(lvl)}</div>
      `;

      if (unlocked) btn.addEventListener("click", () => startLevel(lvl));
      host.appendChild(btn);
    }

    $("#menu").style.display = "block";
    $("#game").style.display = "none";
    updateReadsPill();
  }

  function startTimer(){
    t0 = Date.now();
    clearInterval(timerId);
    timerId = setInterval(() => {
      const t = Math.floor((Date.now() - t0) / 1000);
      $("#timer").textContent = `Time: ${t}s`;
      if (currentMode === "sprint" && t >= SPRINT_CAP_SECONDS){
        if (!submitted) finishAndCheck(true);
      }
    }, 200);
  }
  function stopTimer(){
    clearInterval(timerId);
    timerId = null;
    return Math.floor((Date.now() - t0) / 1000);
  }

  function buildQuiz(lvl, mode, matchCode){
    const pool = FAMILY[lvl] || [];
    const m = canonMode(mode);

    const seedStr = `${matchCode}|L${lvl}|M${m}`;
    const seedInt = xmur3(seedStr)();
    const shuffled = seededShuffle(pool, seedInt);

    const selected = shuffled.slice(0, Math.min(QUESTIONS_PER_ROUND, shuffled.length));
    while (selected.length < QUESTIONS_PER_ROUND){
      selected.push(shuffled[selected.length % shuffled.length]);
    }

    return selected.map((it, idx) => ({
      prompt: it.en,
      answers: it.answers.slice(),
      user: "",
      playerNo: (m === "team") ? ((idx % teamSize) + 1) : null
    }));
  }

  function startLevel(lvl){
    currentLevel = lvl;
    currentMode = canonMode($("#mode").value);
    teamSize = clampInt($("#teamSize").value, 2, 8, 4);

    const rawCode = ($("#matchCode").value || "").trim().toUpperCase();
    currentMatchCode = rawCode || makeMatchCode();
    $("#matchCode").value = currentMatchCode;

    submitted = false;
    readsUsedThisRound = 0;
    globalSnapshotAtStart = getGlobalReads();
    $("#reads-left").textContent = String(attemptReadsLeft());

    $("#speedCap").style.display = (currentMode === "sprint") ? "block" : "none";

    $("#game-title").textContent = `Level ${lvl}`;
    $("#modeLabel").textContent = MODE_LABELS[currentMode] || currentMode;
    $("#matchLabel").textContent = currentMatchCode;

    const subtitleMap = {
      classic: "Translate the family word into Spanish.",
      survival: "Survival: one mistake = fail (but you still get full feedback).",
      sprint: "Sprint: 60 seconds. Auto-submits at 60s.",
      team: "Pass the device! Each question assigns Player 1…N."
    };
    $("#game-subtitle").textContent = subtitleMap[currentMode] || "Translate the family word into Spanish.";

    quiz = buildQuiz(lvl, currentMode, currentMatchCode);

    $("#results").innerHTML = "";
    $("#menu").style.display = "none";
    $("#game").style.display = "block";

    renderQuiz();
    startTimer();
  }

  function updateSpanishButtonsState(container){
    const left = attemptReadsLeft();
    $("#reads-left").textContent = String(left);
    container.querySelectorAll('button[data-role="es-tts"]').forEach(btn => {
      btn.disabled = left <= 0;
      btn.title = left > 0 ? `Read Spanish target (uses 1; left: ${left})` : "No Spanish reads left for this attempt";
    });
  }

  function renderQuiz(){
    const qwrap = $("#questions");
    qwrap.innerHTML = "";

    quiz.forEach((q, i) => {
      const row = document.createElement("div");
      row.className = "q";

      const prompt = document.createElement("div");
      prompt.className = "prompt";

      const leftSide = document.createElement("span");
      const teamTag = (currentMode === "team") ? ` · <small>Player ${q.playerNo}</small>` : "";
      leftSide.innerHTML = `${i+1}. ${q.prompt}${teamTag}`;

      const tools = document.createElement("div");
      tools.className = "tools";

      const enBtn = document.createElement("button");
      enBtn.type = "button";
      enBtn.className = "toolbtn";
      enBtn.textContent = "🔈 EN";
      enBtn.title = "Read English prompt";
      enBtn.addEventListener("click", () => speak(q.prompt, "en-GB"));

      const esBtn = document.createElement("button");
      esBtn.type = "button";
      esBtn.className = "toolbtn";
      esBtn.textContent = "🔊 ES";
      esBtn.dataset.role = "es-tts";
      esBtn.addEventListener("click", () => {
        if (attemptReadsLeft() <= 0) { updateSpanishButtonsState(qwrap); return; }
        speak(q.answers[0], "es-ES");
        readsUsedThisRound += 1;
        updateSpanishButtonsState(qwrap);
      });

      tools.appendChild(enBtn);
      tools.appendChild(esBtn);

      prompt.appendChild(leftSide);
      prompt.appendChild(tools);

      const ans = document.createElement("div");
      ans.className = "answer";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = (currentMode === "team") ? `Player ${q.playerNo} types here…` : "Type the Spanish…";
      input.addEventListener("input", (e) => { quiz[i].user = e.target.value; });

      ans.appendChild(input);
      row.appendChild(prompt);
      row.appendChild(ans);
      qwrap.appendChild(row);
    });

    updateSpanishButtonsState(qwrap);

    $("#submit").disabled = false;
    $("#submit").textContent = "Finish & Check";
    $("#submit").onclick = () => finishAndCheck(false);

    $("#back-button").onclick = backToMenu;
  }

  function finishAndCheck(isAuto=false){
    if (submitted) return;
    submitted = true;

    const elapsed = stopTimer();
    const cappedElapsed = (currentMode === "sprint") ? Math.min(elapsed, SPRINT_CAP_SECONDS) : elapsed;

    const inputs = $$("#questions input");
    inputs.forEach((inp, i) => { quiz[i].user = inp.value; });

    let correct = 0;
    let wrong = 0;
    const perQ = [];

    quiz.forEach((q, i) => {
      const ok = isCorrect(q.user, q.answers);
      perQ.push(ok);
      if (ok) correct++;
      else wrong++;

      inputs[i].classList.remove("good","bad");
      inputs[i].classList.add(ok ? "good" : "bad");
      inputs[i].readOnly = true;
      inputs[i].disabled = true;
    });

    const died = (currentMode === "survival") && (wrong > 0);
    const penalties = wrong * PENALTY_PER_WRONG;
    const finalScore = cappedElapsed + penalties;

    $("#submit").disabled = true;
    $("#submit").textContent = isAuto ? "Auto-checked" : "Checked";

    // Commit global reads
    let after = clampReads(globalSnapshotAtStart - readsUsedThisRound);
    const perfect = (correct === quiz.length);
    if (perfect && after < GLOBAL_READS_MAX) after = clampReads(after + 1);
    setGlobalReads(after);

    // Unlock message
    let unlockMsg = "";
    if (currentLevel < 10){
      const need = BASE_THRESH[currentLevel];
      if (typeof need === "number"){
        if (died){
          unlockMsg = `💀 Survival: failed (wrong/blank detected). No unlock.`;
        } else {
          unlockMsg = (finalScore <= need)
            ? `🎉 Next level unlocked! (Needed ≤ ${need}s)`
            : `🔓 Need ${finalScore - need}s less to unlock Level ${currentLevel + 1} (Target ≤ ${need}s).`;
        }
      }
    } else {
      unlockMsg = died ? "💀 Survival failed on the final level." : "🏁 Final level — brilliant work.";
    }

    if (!died) saveBest(currentMode, currentLevel, finalScore);

    const resultCode = makeShortResultCode({
      lvl: currentLevel,
      mode: currentMode,
      match: currentMatchCode,
      score: finalScore,
      correct,
      wrong
    });

    const results = $("#results");
    results.innerHTML = "";

    const summary = document.createElement("div");
    summary.className = "result-summary";
    summary.innerHTML = `
      <div class="line" style="font-size:1.35rem; font-weight:950; color: var(--text);">
        ${died ? "💀 SURVIVAL: FAILED" : "🏁 FINAL SCORE"}: ${finalScore}s
      </div>
      <div class="line">⏱️ Time: <strong>${cappedElapsed}s</strong>${currentMode==="sprint" ? " (cap 60s)" : ""}</div>
      <div class="line">➕ Penalties: <strong>${wrong} × ${PENALTY_PER_WRONG}s = ${penalties}s</strong></div>
      <div class="line">✅ Correct: <strong>${correct}/${quiz.length}</strong></div>
      <div class="line" style="margin-top:8px;"><strong>${unlockMsg}</strong></div>
      <div class="line" style="margin-top:8px;">🔊 Spanish reads used: <strong>${readsUsedThisRound}</strong> · Global after commit: <strong>${after}/${GLOBAL_READS_MAX}</strong></div>
    `;

    if (perfect && !died){
      showPerfectCelebration();
      summary.classList.add("tq-shake");
    }

    const codeBoxMatch = document.createElement("div");
    codeBoxMatch.className = "codebox";
    codeBoxMatch.innerHTML = `
      <div class="label">Match Code (same prompts across devices)</div>
      <div>${currentMatchCode}</div>
    `;

    const codeBox = document.createElement("div");
    codeBox.className = "codebox";
    codeBox.innerHTML = `
      <div class="label">Short Result Code (say this out loud)</div>
      <div>${resultCode}</div>
    `;

    const ul = document.createElement("ul");
    quiz.forEach((q, idx) => {
      const ok = perQ[idx];
      const li = document.createElement("li");
      li.className = ok ? "correct" : "incorrect";
      const accepted = q.answers.join(" / ");
      const teamLine = (currentMode === "team") ? `<div>👤 Player ${q.playerNo}</div>` : "";
      li.innerHTML = `
        ${teamLine}
        <div><strong>${q.prompt}</strong></div>
        <div>✅ Answer: <strong>${accepted}</strong></div>
        ${ok ? `<div>🎯 You: <strong>${q.user}</strong></div>`
             : `<div>❌ You: <strong>${q.user || "(blank)"}</strong></div>`}
      `;
      ul.appendChild(li);
    });

    const again = document.createElement("button");
    again.className = "btn primary";
    again.style.marginTop = "14px";
    again.textContent = "Try Again (same match code)";
    again.onclick = () => startLevel(currentLevel);

    results.appendChild(summary);
    results.appendChild(codeBoxMatch);
    results.appendChild(codeBox);
    results.appendChild(ul);
    results.appendChild(again);

    // Update menu unlocks (but keep results visible)
    renderLevels();
    $("#menu").style.display = "none";
    $("#game").style.display = "block";
    summary.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function backToMenu(){
    try{ stopTimer(); }catch{}
    submitted = true;
    $("#menu").style.display = "block";
    $("#game").style.display = "none";
    renderLevels();
  }

  // ===================== Compare =====================
  function compareCodes(){
    const out = $("#compareOut");
    out.innerHTML = "";

    const a = parseShortResultCode($("#codeA").value);
    const b = parseShortResultCode($("#codeB").value);

    if (!a.ok || !b.ok){
      out.innerHTML = `
        <div class="warn">
          <div><strong>Could not verify codes.</strong></div>
          <div>${!a.ok ? "A: " + a.error : ""}</div>
          <div>${!b.ok ? "B: " + b.error : ""}</div>
        </div>
      `;
      return;
    }

    const A = a.data, B = b.data;
    const sameLevel = A.lvl === B.lvl;
    const sameMode  = canonMode(A.mode) === canonMode(B.mode);
    const sameMatch = A.mf === B.mf;

    if (!(sameLevel && sameMode && sameMatch)){
      out.innerHTML = `
        <div class="warn">
          <div><strong>Not comparable (must match level + mode + same match).</strong></div>
          <div>Player A: level ${A.lvl}, mode ${MODE_LABELS[canonMode(A.mode)]}, match-fp ${A.mf}</div>
          <div>Player B: level ${B.lvl}, mode ${MODE_LABELS[canonMode(B.mode)]}, match-fp ${B.mf}</div>
        </div>
      `;
      return;
    }

    const m = canonMode(A.mode);
    let winner = "Tie";

    if (m === "survival"){
      const aAlive = !A.died, bAlive = !B.died;
      if (aAlive && !bAlive) winner = "Player A";
      else if (!aAlive && bAlive) winner = "Player B";
      else if (A.correct !== B.correct) winner = (A.correct > B.correct) ? "Player A" : "Player B";
      else if (A.score !== B.score) winner = (A.score < B.score) ? "Player A" : "Player B";
    } else if (m === "sprint"){
      if (A.correct !== B.correct) winner = (A.correct > B.correct) ? "Player A" : "Player B";
      else if (A.wrong !== B.wrong) winner = (A.wrong < B.wrong) ? "Player A" : "Player B";
      else if (A.score !== B.score) winner = (A.score < B.score) ? "Player A" : "Player B";
    } else {
      if (A.score !== B.score) winner = (A.score < B.score) ? "Player A" : "Player B";
    }

    out.innerHTML = `
      <div class="win">
        <div style="font-weight:950; font-size:16px;">🏆 Winner: ${winner}</div>
        <div style="margin-top:6px;">Level <strong>${A.lvl}</strong> · Mode <strong>${MODE_LABELS[m]}</strong> · Match-fp <strong>${A.mf}</strong></div>
      </div>
      <div class="win">
        <div><strong>Player A</strong> — Score: ${A.score}s · Correct: ${A.correct}/10 · Wrong: ${A.wrong} ${A.died ? "· 💀 died" : ""}</div>
        <div style="margin-top:6px;"><strong>Player B</strong> — Score: ${B.score}s · Correct: ${B.correct}/10 · Wrong: ${B.wrong} ${B.died ? "· 💀 died" : ""}</div>
      </div>
    `;
  }

  // ===================== Init =====================
  document.addEventListener("DOMContentLoaded", () => {
    console.log("TURBO Family loaded: FAMILY_FINAL1");

    setGlobalReads(getGlobalReads());
    updateReadsPill();

    $("#mode").addEventListener("change", () => {
      modeChanged();
      renderLevels();
    });

    $("#teamSize").addEventListener("change", () => {
      teamSize = clampInt($("#teamSize").value, 2, 8, 4);
    });

    $("#genCode").addEventListener("click", () => {
      $("#matchCode").value = makeMatchCode();
    });

    $("#compareBtn").addEventListener("click", compareCodes);
    $("#clearCompare").addEventListener("click", () => {
      $("#codeA").value = "";
      $("#codeB").value = "";
      $("#compareOut").innerHTML = "";
    });

    modeChanged();
    renderLevels();
  });
})();
