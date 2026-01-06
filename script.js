const LEVELS = {
  1: ["mother", "father", "sister", "brother", "parents", "mum", "dad", "family", "child", "baby"],
  2: ["aunt", "uncle", "cousin", "grandmother", "grandfather", "grandparents", "niece", "nephew", "relatives", "twins"],
  3: ["stepmother", "stepfather", "stepbrother", "stepsister", "half-brother", "half-sister", "only child", "grandson", "granddaughter", "in-laws"],
  4: ["husband", "wife", "son", "daughter", "marriage", "spouse", "parents-in-law", "siblings", "uncle’s wife", "aunt’s husband"],
  5: ["godfather", "godmother", "godson", "goddaughter", "stepchild", "family tree", "ancestor", "descendant", "blood relative", "kinship"],
  6: ["extended family", "close relative", "distant cousin", "second cousin", "family reunion", "generation", "heritage", "relatives", "family member", "family ties"],
  7: ["great-grandmother", "great-grandfather", "great-uncle", "great-aunt", "great-grandson", "great-granddaughter", "brother-in-law", "sister-in-law", "father-in-law", "mother-in-law"],
  8: ["adoptive parents", "adoptive child", "adopted son", "adopted daughter", "foster parents", "foster child", "guardian", "ward", "stepfamily", "household"],
  9: ["distant relative", "family gathering", "close-knit family", "nuclear family", "extended family", "relatives abroad", "ancestor’s homeland", "heritage line", "family branch", "descendants"],
  10: ["family roots", "generational gap", "ancestral home", "lineage", "descendants", "forefathers", "bloodline", "family origin", "dynasty", "heritage"]
};

const TRANSLATIONS = {
  "mother": "madre", "father": "padre", "sister": "hermana", "brother": "hermano", "parents": "padres", "mum": "mamá", "dad": "papá", "family": "familia", "child": "niño", "baby": "bebé",
  "aunt": "tía", "uncle": "tío", "cousin": "primo", "grandmother": "abuela", "grandfather": "abuelo", "grandparents": "abuelos", "niece": "sobrina", "nephew": "sobrino", "relatives": "parientes", "twins": "gemelos",
  "stepmother": "madrastra", "stepfather": "padrastro", "stepbrother": "hermanastro", "stepsister": "hermanastra", "half-brother": "medio hermano", "half-sister": "media hermana", "only child": "hijo único", "grandson": "nieto", "granddaughter": "nieta", "in-laws": "suegros",
  "husband": "esposo", "wife": "esposa", "son": "hijo", "daughter": "hija", "marriage": "matrimonio", "spouse": "cónyuge", "parents-in-law": "suegros", "siblings": "hermanos", "uncle’s wife": "tía política", "aunt’s husband": "tío político",
  "godfather": "padrino", "godmother": "madrina", "godson": "ahijado", "goddaughter": "ahijada", "stepchild": "hijastro", "family tree": "árbol genealógico", "ancestor": "ancestro", "descendant": "descendiente", "blood relative": "pariente consanguíneo", "kinship": "parentesco",
  "extended family": "familia extensa", "close relative": "pariente cercano", "distant cousin": "primo lejano", "second cousin": "primo segundo", "family reunion": "reunión familiar", "generation": "generación", "heritage": "herencia", "family member": "miembro de la familia", "family ties": "lazos familiares",
  "great-grandmother": "bisabuela", "great-grandfather": "bisabuelo", "great-uncle": "tío abuelo", "great-aunt": "tía abuela", "great-grandson": "bisnieto", "great-granddaughter": "bisnieta", "brother-in-law": "cuñado", "sister-in-law": "cuñada", "father-in-law": "suegro", "mother-in-law": "suegra",
  "adoptive parents": "padres adoptivos", "adoptive child": "hijo adoptivo", "adopted son": "hijo adoptado", "adopted daughter": "hija adoptada", "foster parents": "padres de acogida", "foster child": "niño de acogida", "guardian": "tutor", "ward": "pupilo", "stepfamily": "familia reconstituida", "household": "hogar",
  "distant relative": "pariente lejano", "family gathering": "reunión familiar", "close-knit family": "familia unida", "nuclear family": "familia nuclear", "relatives abroad": "parientes en el extranjero", "ancestor’s homeland": "patria ancestral", "heritage line": "línea de herencia", "family branch": "rama familiar", "descendants": "descendientes",
  "family roots": "raíces familiares", "generational gap": "brecha generacional", "ancestral home": "hogar ancestral", "lineage": "linaje", "forefathers": "antepasados", "bloodline": "linaje de sangre", "family origin": "origen familiar", "dynasty": "dinastía", "heritage": "patrimonio"
};

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

let currentLevel = 1;
let timer, timeElapsed = 0;
let currentSet = [];

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startLevel(level) {
  currentLevel = level;
  menu.classList.add("hidden");
  results.classList.add("hidden");
  game.classList.remove("hidden");
  timeElapsed = 0;
  timerEl.textContent = "Time: 0s";
  clearInterval(timer);
  timer = setInterval(() => {
    timeElapsed++;
    timerEl.textContent = `Time: ${timeElapsed}s`;
  }, 1000);

  generateQuestions(level);
}

function generateQuestions(level) {
  questionContainer.innerHTML = "";
  const words = shuffle([...LEVELS[level]]).slice(0, 10);
  currentSet = words;
  words.forEach(word => {
    const div = document.createElement("div");
    div.innerHTML = `<label>${word} → </label><input data-word="${word}" type="text" />`;
    questionContainer.appendChild(div);
  });
}

submitBtn.addEventListener("click", () => {
  clearInterval(timer);
  let penalties = 0;
  let feedbackHTML = "";
  const inputs = questionContainer.querySelectorAll("input");

  inputs.forEach(input => {
    const word = input.dataset.word;
    const answer = input.value.trim().toLowerCase();
    const correct = TRANSLATIONS[word]?.toLowerCase() || "";
    if (answer === correct) {
      feedbackHTML += `<p>✅ ${word} = ${correct}</p>`;
    } else {
      feedbackHTML += `<p>❌ ${word} → ${answer || "(blank)"} (correct: ${correct})</p>`;
      penalties += 5;
    }
  });

  const total = timeElapsed + penalties;
  const bestKey = `turboFamily_best_${currentLevel}`;
  const best = localStorage.getItem(bestKey);
  if (!best || total < best) {
    localStorage.setItem(bestKey, total);
  }

  feedbackEl.innerHTML = feedbackHTML;
  finalTimeEl.textContent = `Your time: ${timeElapsed}s + ${penalties}s penalties = ${total}s total.`;
  game.classList.add("hidden");
  results.classList.remove("hidden");
});

tryAgainBtn.addEventListener("click", () => startLevel(currentLevel));
backBtn.addEventListener("click", () => {
  results.classList.add("hidden");
  menu.classList.remove("hidden");
  renderMenu();
});

function renderMenu() {
  levelButtons.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement("button");
    const best = localStorage.getItem(`turboFamily_best_${i}`);
    btn.textContent = best ? `Level ${i} — Best: ${best}s` : `Level ${i}`;
    btn.addEventListener("click", () => startLevel(i));
    levelButtons.appendChild(btn);
  }
}

renderMenu();

