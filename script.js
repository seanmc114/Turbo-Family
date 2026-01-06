/* Turbo: Family — script.js
   - 10 levels
   - Each level: 10 randomized questions
   - Timed
   - Score = timeElapsed + (30s × count of wrong OR blank answers)
   - Local best SCORE per level shown as "Best Score: ___s"
   - Quiet
*/

const PENALTY_PER_WRONG_OR_BLANK = 30;

const LEVELS = {
  1: ["mother", "father", "sister", "brother", "parents", "mum", "dad", "family", "child", "baby", "children"],
  2: ["aunt", "uncle", "cousin", "grandmother", "grandfather", "grandparents", "niece", "nephew", "relative", "twins"],
  3: ["stepmother", "stepfather", "stepbrother", "stepsister", "half-brother", "half-sister", "only child", "grandson", "granddaughter", "in-laws"],
  4: ["husband", "wife", "son", "daughter", "spouse", "siblings", "engaged", "married", "widow", "widower"],
  5: ["father-in-law", "mother-in-law", "brother-in-law", "sister-in-law", "son-in-law", "daughter-in-law", "fiancé", "fiancée", "partner", "couple"],
  6: ["godfather", "godmother", "godson", "goddaughter", "family tree", "ancestor", "descendant", "related", "adopted", "guardian"],
  7: ["great-grandmother", "great-grandfather", "great-uncle", "great-aunt", "great-grandson", "great-granddaughter", "stepfamily", "household", "foster parents", "foster child"],
  8: ["extended family", "close relative", "distant relative", "second cousin", "distant cousin", "family reunion", "generation", "heritage", "lineage", "roots"],
  9: ["close-knit family", "nuclear family", "family gathering", "relatives abroad", "family branch", "blood relative", "bloodline", "forefathers", "descendants", "ancestral home"],
  10: ["generational gap", "ancestry", "dynasty", "kinship", "to be related", "family ties", "ancestral homeland", "heritage line", "family origin", "lineage"]
};

const TRANSLATIONS = {
  // L1
  "mother": "madre",
  "father": "padre",
  "sister": "hermana",
  "brother": "hermano",
  "parents": "padres",
  "mum": "mamá",
  "dad": "papá",
  "family": "familia",
  "child": "niño",
  "children": "niños",
  "baby": "bebé",

  // L2
  "aunt": "tía",
  "uncle": "tío",
  "cousin": "primo",
  "grandmother": "abuela",
  "grandfather": "abuelo",
  "grandparents": "abuelos",
  "niece": "sobrina",
  "nephew": "sobrino",
  "relative": "pariente",
  "twins": "gemelos",

  // L3
  "stepmother": "madrastra",
  "stepfather": "padrastro",
  "stepbrother": "hermanastro",
  "stepsister": "hermanastra",
  "half-brother": "medio hermano",
  "half-sister": "media hermana",
  "only child": "hijo único",
  "grandson": "nieto",
  "granddaughter": "nieta",
  "in-laws": "familia política",

  // L4
  "husband": "esposo",
  "wife": "esposa",
  "son": "hijo",
  "daughter": "hija",
  "spouse": "cónyuge",
  "siblings": "hermanos",
  "engaged": "prometido",
  "married": "casado",
  "widow": "viuda",
  "widower": "viudo",

  // L5
  "father-in-law": "suegro",
  "mother-in-law": "suegra",
  "brother-in-law": "cuñado",
  "sister-in-law": "cuñada",
  "son-in-law": "yerno",
  "daughter-in-law": "nuera",
  "fiancé": "prometido",
  "fiancée": "prometida",
  "partner": "pareja",
  "couple": "pareja",

  // L6
  "godfather": "padrino",
  "godmother": "madrina",
  "godson": "ahijado",
  "goddaughter": "ahijada",
  "family tree": "árbol genealógico",
  "ancestor": "ancestro",
  "descendant": "descendiente",
  "related": "emparentado",
  "adopted": "adoptado",
  "guardian": "tutor",

  // L7
  "great-grandmother": "bisabuela",
  "great-grandfather": "bisabuelo",
  "great-uncle": "tío abuelo",
  "great-aunt": "tía abuela",
  "great-grandson": "bisnieto",
  "great-granddaughter": "bisnieta",
  "stepfamily": "familia reconstituida",
  "household": "hogar",
  "foster parents": "padres de acogida",
  "foster child": "niño de acogida",

  // L8
  "extended family": "familia extensa",
  "close relative": "pariente cercano",
  "distant relative": "pariente lejano",
  "second cousin": "primo segundo",
  "distant cousin": "primo lejano",
  "family reunion": "reunión familiar",
  "generation": "generación",
  "heritage": "herencia",
  "lineage": "linaje",
  "roots": "raíces",

  // L9
  "close-knit family": "familia unida",
  "nuclear family": "familia nuclear",
  "family gathering": "reunión familiar",
  "relatives abroad": "parientes en el extranjero",
  "family branch": "rama familiar",
  "blood relative": "pariente consanguíneo",
  "bloodline": "linaje de sangre",
  "forefathers": "antepasados",
  "descendants": "descendientes",
  "ancestral home": "hogar ancestral",

  // L10
  "generational gap": "brecha generacional",
  "ancestry": "ascendencia",
  "dynasty": "dinastía",
  "kinship": "parentesco",
  "to be related": "estar emparentado",
  "family ties": "lazos familiares",
  "ancestral homeland": "patria ancestral",
  "heritage line": "línea de herencia",
  "family origin": "origen familiar",
  "lineage": "linaje"
};

// DOM
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const results = document.getElementById("results");
const questionContainer = document.getElementById("question-container");
const submitBtn = document.getElementById("submit-btn");
const timerEl = document.getElementById("timer");
const feedbackEl = document.getElementById("feedback");
const finalTimeEl = document.getElementById("final-time");
const tryAgainBtn = document.getElementById("try-again-btn");
const backBtn = document.getElementById("back-btn");
const levelButtons = document.getElementById("level-buttons");

// State
let currentLevel = 1;
let timer = null;
let timeElapsed = 0;

function bestKey(level) {
  return `turboFamily_best_${level}`;
}

function normalize(s) {
  return (s || "").trim().toLowerCase();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startTimer() {
  clearInterval(timer);
  timeElapsed = 0;
  timerEl.textContent = "Time: 0s";
  timer = setInterval(() => {
    timeElapsed += 1;
    timerEl.textContent = `Time: ${timeElapsed}s`;
  }, 1000);
}

function generateQuestions(level) {
  questionContainer.innerHTML = "";
  const pool = LEVELS[level] || [];
  const selection = shuffle(pool).slice(0, 10);

  selection.forEach((prompt) => {
    const row = document.createElement("div");
    row.innerHTML = `<label>${prompt} → </label><input type="text" data-word="${prompt}" autocomplete="off" />`;
    questionContainer.appendChild(row);
  });
}

function startLevel(level) {
  currentLevel = level;

  menu.classList.add("hidden");
  results.classList.add("hidden");
  game.classList.remove("hidden");

  startTimer();
  generateQuestions(level);
}

function renderMenu() {
  levelButtons.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement("button");
    const best = localStorage.getItem(bestKey(i));
    btn.textContent = best ? `Level ${i} — Best Score: ${best}s` : `Level ${i}`;
    btn.addEventListener("click", () => startLevel(i));
    levelButtons.appendChild(btn);
  }
}

submitBtn.addEventListener("click", () => {
  clearInterval(timer);

  const inputs = questionContainer.querySelectorAll("input");
  let penalties = 0;
  let feedbackHTML = "";
  let wrongOrBlankCount = 0;

  inputs.forEach((input) => {
    const word = input.dataset.word;
    const answer = normalize(input.value);
    const correct = normalize(TRANSLATIONS[word]);

    const isCorrect = answer && answer === correct;

    if (isCorrect) {
      feedbackHTML += `<p>✅ ${word} = ${correct}</p>`;
    } else {
      feedbackHTML += `<p>❌ ${word} → ${answer || "(blank)"} (correct: ${correct})</p>`;

      // THIS is the key: this runs for EACH and ALL wrong/blank answers
      wrongOrBlankCount += 1;
      penalties += PENALTY_PER_WRONG_OR_BLANK; // +30 every time through here
    }
  });

  const totalScore = timeElapsed + penalties;

  // Save best (lowest) TOTAL SCORE
  const key = bestKey(currentLevel);
  const bestRaw = localStorage.getItem(key);
  const bestNum = bestRaw === null ? null : Number(bestRaw);

  if (bestNum === null || Number.isNaN(bestNum) || totalScore < bestNum) {
    localStorage.setItem(key, String(totalScore));
  }

  feedbackEl.innerHTML = feedbackHTML;
  finalTimeEl.textContent =
    `Your time: ${timeElapsed}s + (${wrongOrBlankCount} × 30s) = ${penalties}s penalties → Total Score: ${totalScore}s`;

  game.classList.add("hidden");
  results.classList.remove("hidden");
});

tryAgainBtn.addEventListener("click", () => startLevel(currentLevel));

backBtn.addEventListener("click", () => {
  results.classList.add("hidden");
  menu.classList.remove("hidden");
  renderMenu();
});

// Init
renderMenu();
