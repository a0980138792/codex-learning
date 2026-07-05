const STORAGE_KEY = "englishVocabularyProState";
const defaultState = {
  favorites: [],
  familiarity: {},
  learnedWords: [],
  dailyLearned: {},
  quiz: { correct: 0, total: 0, completed: 0 },
  spelling: { correct: 0, total: 0 },
  listening: { correct: 0, total: 0 },
  mistakes: [],
  lastStudyDate: "",
  streak: 0
};

const achievements = [
  { id: "first-study", title: "第一次學習", desc: "完成第一個單字學習", unlocked: (s) => s.learnedWords.length >= 1 },
  { id: "fav-10", title: "收藏 10 個單字", desc: "建立自己的重點單字庫", unlocked: (s) => s.favorites.length >= 10 },
  { id: "quiz-10", title: "完成 10 題測驗", desc: "快速測驗累積 10 題", unlocked: (s) => s.quiz.completed >= 10 },
  { id: "accuracy-80", title: "答對率達 80%", desc: "測驗答對率達 80%", unlocked: (s) => getAccuracy(s) >= 80 && s.quiz.total >= 5 },
  { id: "learn-50", title: "學習 50 個單字", desc: "累積學習 50 個不同單字", unlocked: (s) => s.learnedWords.length >= 50 },
  { id: "streak-3", title: "連續學習 3 天", desc: "連續 3 天開啟學習", unlocked: (s) => s.streak >= 3 },
  { id: "streak-7", title: "連續學習 7 天", desc: "連續 7 天維持節奏", unlocked: (s) => s.streak >= 7 },
  { id: "familiar-30", title: "熟悉 30 個單字", desc: "將 30 個單字標記為熟悉", unlocked: (s) => countFamiliarity("familiar", s) >= 30 }
];

const readingPassages = [
  {
    title: "A Better Study Habit",
    level: "Level B1",
    passage: "Many students study for a long time, but not all of them study effectively. A short review every day can be more useful than reading everything the night before a test. When students plan their time and take short breaks, they usually remember more.",
    translation: "許多學生花很長時間讀書，但不是每個人都讀得有效率。每天短時間複習，可能比考前一晚讀完全部內容更有用。當學生規劃時間並短暫休息時，通常能記得更多。",
    question: "What is the main idea of the passage?",
    options: ["Daily review and planning help students learn better.", "Students should never take breaks.", "Tests are not important for students.", "Reading at night is always the best way."],
    answer: "Daily review and planning help students learn better."
  },
  {
    title: "Technology in Class",
    level: "Level B1",
    passage: "Technology can make learning more interesting. Students can watch videos, practice listening, and search for information online. However, they also need to use digital tools wisely. A phone can help learning, but it can also take attention away from class.",
    translation: "科技可以讓學習更有趣。學生可以觀看影片、練習聽力，並在線上搜尋資訊。然而，他們也需要明智地使用數位工具。手機可以幫助學習，但也可能讓注意力離開課堂。",
    question: "According to the passage, what should students do?",
    options: ["Use technology wisely.", "Stop using all digital tools.", "Only study with videos.", "Bring more phones to class."],
    answer: "Use technology wisely."
  },
  {
    title: "Helping the Community",
    level: "Level B1",
    passage: "Last Saturday, a group of high school students cleaned a park near their school. They picked up trash, planted flowers, and painted old benches. The work was tiring, but the students felt proud because they made their community cleaner and friendlier.",
    translation: "上星期六，一群國中生清理學校附近的公園。他們撿垃圾、種花，並粉刷舊長椅。工作很累，但學生感到驕傲，因為他們讓社區更乾淨也更友善。",
    question: "Why did the students feel proud?",
    options: ["They improved their community.", "They skipped school.", "They bought new benches.", "They won a sports game."],
    answer: "They improved their community."
  },
  {
    title: "Learning from Mistakes",
    level: "Level B1",
    passage: "Making mistakes is part of learning a language. If students only feel afraid of mistakes, they may stop trying. A better way is to check the mistake, understand the reason, and practice again. Each mistake can become useful feedback.",
    translation: "犯錯是語言學習的一部分。如果學生只害怕犯錯，他們可能會停止嘗試。更好的方法是檢查錯誤、理解原因，然後再次練習。每個錯誤都可以變成有用的回饋。",
    question: "What does the passage suggest?",
    options: ["Students should learn from mistakes.", "Students should hide every mistake.", "Language learning must be perfect.", "Feedback is never useful."],
    answer: "Students should learn from mistakes."
  }
];

const grammarLessons = [
  {
    title: "現在完成式",
    pattern: "S + have / has + p.p.",
    explanation: "用來表示從過去開始並和現在有關的經驗、結果或持續狀態，常搭配 ever、never、already、yet、since、for。",
    example: "I have learned English for six years.",
    translation: "我已經學英文六年了。",
    question: "Which sentence uses the present perfect tense?",
    options: ["She has finished her homework.", "She finishes her homework every day.", "She finished her homework yesterday.", "She will finish her homework."],
    answer: "She has finished her homework."
  },
  {
    title: "被動語態",
    pattern: "S + be + p.p. + by ...",
    explanation: "當重點在承受動作的人事物，而不是執行者時，使用被動語態。時態由 be 動詞變化呈現。",
    example: "The report was written by Tina.",
    translation: "這份報告是 Tina 寫的。",
    question: "Which sentence is passive voice?",
    options: ["The window was broken by the boy.", "The boy broke the window.", "The boy is breaking the window.", "The boy will break the window."],
    answer: "The window was broken by the boy."
  },
  {
    title: "關係代名詞",
    pattern: "N + who / which / that + V ...",
    explanation: "關係代名詞用來補充說明前面的名詞。who 指人，which 指事物，that 可指人或事物。",
    example: "The student who won the prize is my classmate.",
    translation: "那位得獎的學生是我的同學。",
    question: "Choose the best relative pronoun: The book ___ is on the desk is mine.",
    options: ["which", "who", "where", "when"],
    answer: "which"
  },
  {
    title: "不定詞",
    pattern: "to + V",
    explanation: "不定詞可作名詞、形容詞或副詞，常用來表示目的、計畫、希望或需要。",
    example: "She went to the library to study.",
    translation: "她去圖書館讀書。",
    question: "What does \"to study\" show in the example?",
    options: ["Purpose", "Past time", "A person", "A place"],
    answer: "Purpose"
  },
  {
    title: "比較級",
    pattern: "A + be + 比較級 + than + B",
    explanation: "比較兩個人事物時使用比較級。短形容詞常加 -er，較長形容詞常用 more。",
    example: "This question is more difficult than the last one.",
    translation: "這一題比上一題更難。",
    question: "Which word completes the sentence: This test is ___ than that one.",
    options: ["easier", "easy", "easiest", "easily"],
    answer: "easier"
  }
];

let state = loadState();
let filteredWords = [...VOCABULARY];
let currentIndex = 0;
let quizWord = null;
let spellingWord = null;
let listeningWord = null;
let readingIndex = 0;
let readingTranslationVisible = false;
let grammarIndex = 0;
let grammarChineseVisible = false;
let matchingWords = [];
let selectedEnglish = null;
let selectedMeaning = null;

const $ = (id) => document.getElementById(id);

const elements = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  searchInput: $("searchInput"),
  categoryFilter: $("categoryFilter"),
  posFilter: $("posFilter"),
  familiarityFilter: $("familiarityFilter"),
  wordCard: $("wordCard"),
  cardCounter: $("cardCounter"),
  currentFamiliarity: $("currentFamiliarity"),
  cardWord: $("cardWord"),
  cardPhonetic: $("cardPhonetic"),
  cardPos: $("cardPos"),
  cardCategory: $("cardCategory"),
  cardMeaning: $("cardMeaning"),
  cardExample: $("cardExample"),
  cardTranslation: $("cardTranslation"),
  wordList: $("wordList"),
  favoriteBtn: $("favoriteBtn"),
  quizWord: $("quizWord"),
  quizOptions: $("quizOptions"),
  quizFeedback: $("quizFeedback"),
  spellingMeaning: $("spellingMeaning"),
  spellingInput: $("spellingInput"),
  spellingFeedback: $("spellingFeedback"),
  listeningOptions: $("listeningOptions"),
  listeningFeedback: $("listeningFeedback"),
  matchingFeedback: $("matchingFeedback"),
  englishMatches: $("englishMatches"),
  meaningMatches: $("meaningMatches")
};

init();

function init() {
  updateStreak();
  setupFilters();
  bindEvents();
  applyFilters();
  startQuiz();
  startSpelling();
  startListening();
  renderReading();
  renderGrammar();
  startMatching();
  updateDashboard();
  renderAchievements();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...structuredClone(defaultState), ...saved };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak() {
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (state.lastStudyDate === today) return;
  state.streak = state.lastStudyDate === yesterday ? state.streak + 1 : 1;
  state.lastStudyDate = today;
  saveState();
}

function setupFilters() {
  const categories = ["全部", ...new Set(VOCABULARY.map((word) => word.category))];
  const parts = ["全部", ...new Set(VOCABULARY.map((word) => word.partOfSpeech))];
  elements.categoryFilter.innerHTML = categories.map((item) => `<option value="${item}">${item}</option>`).join("");
  elements.posFilter.innerHTML = parts.map((item) => `<option value="${item}">${item}</option>`).join("");
}

function bindEvents() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  [elements.searchInput, elements.categoryFilter, elements.posFilter, elements.familiarityFilter].forEach((control) => {
    control.addEventListener("input", applyFilters);
  });

  elements.wordCard.addEventListener("click", () => elements.wordCard.classList.toggle("flipped"));
  $("prevWord").addEventListener("click", () => moveWord(-1));
  $("nextWord").addEventListener("click", () => moveWord(1));
  $("randomWord").addEventListener("click", randomWord);
  $("speakWord").addEventListener("click", () => speak(getCurrentWord().word));
  elements.favoriteBtn.addEventListener("click", toggleFavorite);

  document.querySelectorAll("[data-familiarity]").forEach((button) => {
    button.addEventListener("click", () => setFamiliarity(button.dataset.familiarity));
  });

  $("nextQuiz").addEventListener("click", startQuiz);
  $("checkSpelling").addEventListener("click", checkSpelling);
  $("nextSpelling").addEventListener("click", startSpelling);
  elements.spellingInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkSpelling();
  });
  $("playListening").addEventListener("click", () => speak(listeningWord.word));
  $("nextListening").addEventListener("click", startListening);
  $("toggleReadingTranslation").addEventListener("click", toggleReadingTranslation);
  $("nextReading").addEventListener("click", nextReading);
  $("toggleGrammarChinese").addEventListener("click", toggleGrammarChinese);
  $("nextGrammar").addEventListener("click", nextGrammar);
  $("resetMatching").addEventListener("click", startMatching);
}

function switchTab(tabId) {
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabId));
  elements.panels.forEach((panel) => panel.classList.toggle("active-panel", panel.id === tabId));
  if (tabId === "listening" && listeningWord) setTimeout(() => speak(listeningWord.word), 250);
  updateDashboard();
}

function applyFilters() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const category = elements.categoryFilter.value;
  const pos = elements.posFilter.value;
  const familiarity = elements.familiarityFilter.value;

  filteredWords = VOCABULARY.filter((word) => {
    const matchesQuery = !query || [word.word, word.meaning, word.example, word.translation].some((value) => value.toLowerCase().includes(query));
    const matchesCategory = category === "全部" || word.category === category;
    const matchesPos = pos === "全部" || word.partOfSpeech === pos;
    const status = getWordFamiliarity(word.id);
    const matchesFamiliarity =
      familiarity === "all" ||
      (familiarity === "favorite" && state.favorites.includes(word.id)) ||
      status === familiarity;
    return matchesQuery && matchesCategory && matchesPos && matchesFamiliarity;
  });

  if (filteredWords.length === 0) {
    currentIndex = 0;
    renderEmptyState();
  } else {
    currentIndex = Math.min(currentIndex, filteredWords.length - 1);
    renderCard();
  }
  renderWordList();
}

function renderEmptyState() {
  elements.cardCounter.textContent = "0 / 0";
  elements.currentFamiliarity.textContent = "沒有符合條件";
  elements.cardWord.textContent = "No words";
  elements.cardPhonetic.textContent = "";
  elements.cardPos.textContent = "-";
  elements.cardCategory.textContent = "-";
  elements.cardMeaning.textContent = "請調整搜尋或篩選";
  elements.cardExample.textContent = "";
  elements.cardTranslation.textContent = "";
}

function renderCard() {
  const word = getCurrentWord();
  markLearned(word.id);
  elements.wordCard.classList.remove("flipped");
  elements.cardCounter.textContent = `${currentIndex + 1} / ${filteredWords.length}`;
  elements.currentFamiliarity.textContent = familiarityLabel(getWordFamiliarity(word.id));
  elements.cardWord.textContent = word.word;
  elements.cardPhonetic.textContent = word.phonetic;
  elements.cardPos.textContent = word.partOfSpeech;
  elements.cardCategory.textContent = `${word.category} · ${word.level}`;
  elements.cardMeaning.textContent = word.meaning;
  elements.cardExample.textContent = word.example;
  elements.cardTranslation.textContent = word.translation;
  elements.favoriteBtn.textContent = state.favorites.includes(word.id) ? "取消收藏" : "收藏";
  elements.favoriteBtn.classList.toggle("selected", state.favorites.includes(word.id));
  document.querySelectorAll("[data-familiarity]").forEach((button) => {
    button.classList.toggle("active-choice", button.dataset.familiarity === getWordFamiliarity(word.id));
  });
  renderWordList();
  updateDashboard();
}

function renderWordList() {
  elements.wordList.innerHTML = filteredWords.map((word, index) => {
    const favorite = state.favorites.includes(word.id) ? "★" : "";
    const active = index === currentIndex ? "selected" : "";
    return `
      <button class="word-item ${active}" data-index="${index}" type="button">
        <span>
          <strong>${word.word} ${favorite}</strong>
          <small>${word.meaning} · ${word.category} · ${familiarityLabel(getWordFamiliarity(word.id))}</small>
        </span>
        <small>${word.partOfSpeech}</small>
      </button>
    `;
  }).join("");

  elements.wordList.querySelectorAll(".word-item").forEach((item) => {
    item.addEventListener("click", () => {
      currentIndex = Number(item.dataset.index);
      renderCard();
    });
  });
}

function getCurrentWord() {
  return filteredWords[currentIndex] || VOCABULARY[0];
}

function moveWord(step) {
  if (!filteredWords.length) return;
  currentIndex = (currentIndex + step + filteredWords.length) % filteredWords.length;
  renderCard();
}

function randomWord() {
  if (!filteredWords.length) return;
  currentIndex = Math.floor(Math.random() * filteredWords.length);
  renderCard();
}

function toggleFavorite() {
  const id = getCurrentWord().id;
  state.favorites = state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id];
  saveState();
  renderCard();
  renderAchievements();
}

function setFamiliarity(value) {
  const id = getCurrentWord().id;
  state.familiarity[id] = value;
  saveState();
  renderCard();
  renderAchievements();
}

function getWordFamiliarity(id) {
  return state.familiarity[id] || "normal";
}

function familiarityLabel(value) {
  return { unknown: "不熟", normal: "普通", familiar: "熟悉" }[value] || "普通";
}

function markLearned(id) {
  const today = todayKey();
  state.dailyLearned[today] = state.dailyLearned[today] || [];
  if (!state.learnedWords.includes(id)) state.learnedWords.push(id);
  if (!state.dailyLearned[today].includes(id)) state.dailyLearned[today].push(id);
  saveState();
}

function randomSample(source, count) {
  return [...source].sort(() => Math.random() - 0.5).slice(0, count);
}

function makeOptions(correctWord) {
  return randomSample(VOCABULARY.filter((word) => word.id !== correctWord.id), 3)
    .concat(correctWord)
    .sort(() => Math.random() - 0.5);
}

function startQuiz() {
  quizWord = randomSample(VOCABULARY, 1)[0];
  elements.quizWord.textContent = quizWord.word;
  elements.quizFeedback.textContent = "";
  elements.quizOptions.innerHTML = makeOptions(quizWord).map((word) => (
    `<button type="button" data-id="${word.id}">${word.meaning}</button>`
  )).join("");
  elements.quizOptions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => answerQuiz(Number(button.dataset.id), button));
  });
}

function answerQuiz(id, selectedButton) {
  const correct = id === quizWord.id;
  state.quiz.total += 1;
  state.quiz.completed += 1;
  if (correct) state.quiz.correct += 1;
  if (!correct) addMistake(quizWord.id);
  saveState();

  elements.quizOptions.querySelectorAll("button").forEach((button) => {
    const isCorrectButton = Number(button.dataset.id) === quizWord.id;
    button.disabled = true;
    button.classList.toggle("correct", isCorrectButton);
  });
  selectedButton.classList.toggle("wrong", !correct);
  elements.quizFeedback.textContent = correct ? "答對了！" : `答錯了，正確答案是：${quizWord.meaning}`;
  updateDashboard();
  renderAchievements();
}

function startSpelling() {
  spellingWord = randomSample(VOCABULARY, 1)[0];
  elements.spellingMeaning.textContent = spellingWord.meaning;
  elements.spellingInput.value = "";
  elements.spellingFeedback.textContent = "";
  elements.spellingInput.focus();
}

function checkSpelling() {
  const answer = elements.spellingInput.value.trim().toLowerCase();
  if (!answer) return;
  const correct = answer === spellingWord.word.toLowerCase();
  state.spelling.total += 1;
  if (correct) state.spelling.correct += 1;
  if (!correct) addMistake(spellingWord.id);
  saveState();
  elements.spellingFeedback.textContent = correct ? "拼字正確！" : `正確拼法是：${spellingWord.word}`;
  updateDashboard();
}

function startListening() {
  listeningWord = randomSample(VOCABULARY, 1)[0];
  elements.listeningFeedback.textContent = "";
  elements.listeningOptions.innerHTML = makeOptions(listeningWord).map((word) => (
    `<button type="button" data-id="${word.id}">${word.meaning}</button>`
  )).join("");
  elements.listeningOptions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => answerListening(Number(button.dataset.id), button));
  });
}

function answerListening(id, selectedButton) {
  const correct = id === listeningWord.id;
  state.listening.total += 1;
  if (correct) state.listening.correct += 1;
  if (!correct) addMistake(listeningWord.id);
  saveState();

  elements.listeningOptions.querySelectorAll("button").forEach((button) => {
    const isCorrectButton = Number(button.dataset.id) === listeningWord.id;
    button.disabled = true;
    button.classList.toggle("correct", isCorrectButton);
  });
  selectedButton.classList.toggle("wrong", !correct);
  elements.listeningFeedback.textContent = correct ? "聽力答對了！" : `答錯了，正確答案是：${listeningWord.meaning}`;
  updateDashboard();
}

function renderReading() {
  const item = readingPassages[readingIndex];
  $("readingTitle").textContent = item.title;
  $("readingLevel").textContent = item.level;
  $("readingPassage").textContent = item.passage;
  $("readingTranslation").textContent = item.translation;
  $("readingTranslation").classList.toggle("is-hidden", !readingTranslationVisible);
  $("toggleReadingTranslation").textContent = readingTranslationVisible ? "隱藏中文翻譯" : "顯示中文翻譯";
  $("toggleReadingTranslation").setAttribute("aria-expanded", String(readingTranslationVisible));
  $("readingQuestion").textContent = item.question;
  $("readingFeedback").textContent = "";
  $("readingOptions").innerHTML = item.options.map((option) => (
    `<button type="button" data-answer="${escapeAttribute(option)}">${option}</button>`
  )).join("");
  $("readingOptions").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => answerReading(button.dataset.answer, button));
  });
}

function answerReading(answer, selectedButton) {
  const item = readingPassages[readingIndex];
  const correct = answer === item.answer;
  $("readingOptions").querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("correct", button.dataset.answer === item.answer);
  });
  selectedButton.classList.toggle("wrong", !correct);
  $("readingFeedback").textContent = correct ? "閱讀理解答對了！" : `答錯了，正確答案是：${item.answer}`;
}

function toggleReadingTranslation() {
  readingTranslationVisible = !readingTranslationVisible;
  $("readingTranslation").classList.toggle("is-hidden", !readingTranslationVisible);
  $("toggleReadingTranslation").textContent = readingTranslationVisible ? "隱藏中文翻譯" : "顯示中文翻譯";
  $("toggleReadingTranslation").setAttribute("aria-expanded", String(readingTranslationVisible));
}

function nextReading() {
  readingIndex = (readingIndex + 1) % readingPassages.length;
  readingTranslationVisible = false;
  renderReading();
}

function renderGrammar() {
  const item = grammarLessons[grammarIndex];
  $("grammarTitle").textContent = item.title;
  $("grammarPattern").textContent = item.pattern;
  $("grammarExplanation").textContent = item.explanation;
  $("grammarExample").textContent = item.example;
  $("grammarTranslation").textContent = item.translation;
  $("grammarExplanation").classList.toggle("is-hidden", !grammarChineseVisible);
  $("grammarTranslation").classList.toggle("is-hidden", !grammarChineseVisible);
  $("toggleGrammarChinese").textContent = grammarChineseVisible ? "隱藏中文說明" : "顯示中文說明";
  $("toggleGrammarChinese").setAttribute("aria-expanded", String(grammarChineseVisible));
  $("grammarQuestion").textContent = item.question;
  $("grammarFeedback").textContent = "";
  $("grammarOptions").innerHTML = item.options.map((option) => (
    `<button type="button" data-answer="${escapeAttribute(option)}">${option}</button>`
  )).join("");
  $("grammarOptions").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => answerGrammar(button.dataset.answer, button));
  });
}

function answerGrammar(answer, selectedButton) {
  const item = grammarLessons[grammarIndex];
  const correct = answer === item.answer;
  $("grammarOptions").querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("correct", button.dataset.answer === item.answer);
  });
  selectedButton.classList.toggle("wrong", !correct);
  $("grammarFeedback").textContent = correct ? "文法答對了！" : `答錯了，正確答案是：${item.answer}`;
}

function toggleGrammarChinese() {
  grammarChineseVisible = !grammarChineseVisible;
  $("grammarExplanation").classList.toggle("is-hidden", !grammarChineseVisible);
  $("grammarTranslation").classList.toggle("is-hidden", !grammarChineseVisible);
  $("toggleGrammarChinese").textContent = grammarChineseVisible ? "隱藏中文說明" : "顯示中文說明";
  $("toggleGrammarChinese").setAttribute("aria-expanded", String(grammarChineseVisible));
}

function nextGrammar() {
  grammarIndex = (grammarIndex + 1) % grammarLessons.length;
  grammarChineseVisible = false;
  renderGrammar();
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function startMatching() {
  matchingWords = randomSample(VOCABULARY, 6);
  selectedEnglish = null;
  selectedMeaning = null;
  elements.matchingFeedback.textContent = "";
  elements.englishMatches.innerHTML = matchingWords.map((word) => (
    `<button type="button" data-id="${word.id}" data-side="english">${word.word}</button>`
  )).join("");
  elements.meaningMatches.innerHTML = randomSample(matchingWords, matchingWords.length).map((word) => (
    `<button type="button" data-id="${word.id}" data-side="meaning">${word.meaning}</button>`
  )).join("");

  document.querySelectorAll("[data-side]").forEach((button) => {
    button.addEventListener("click", () => chooseMatch(button));
  });
}

function chooseMatch(button) {
  if (button.classList.contains("completed")) return;
  const side = button.dataset.side;
  const selected = side === "english" ? selectedEnglish : selectedMeaning;
  if (selected) selected.classList.remove("selected");

  button.classList.add("selected");
  if (side === "english") selectedEnglish = button;
  if (side === "meaning") selectedMeaning = button;

  if (selectedEnglish && selectedMeaning) checkMatch();
}

function checkMatch() {
  const correct = selectedEnglish.dataset.id === selectedMeaning.dataset.id;
  if (correct) {
    selectedEnglish.classList.add("completed", "correct");
    selectedMeaning.classList.add("completed", "correct");
    elements.matchingFeedback.textContent = "配對成功！";
  } else {
    selectedEnglish.classList.add("wrong");
    selectedMeaning.classList.add("wrong");
    elements.matchingFeedback.textContent = "再試一次。";
    setTimeout(() => {
      selectedEnglish?.classList.remove("wrong", "selected");
      selectedMeaning?.classList.remove("wrong", "selected");
      selectedEnglish = null;
      selectedMeaning = null;
    }, 650);
    return;
  }
  selectedEnglish = null;
  selectedMeaning = null;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

function addMistake(id) {
  state.mistakes = [id, ...state.mistakes.filter((item) => item !== id)].slice(0, 12);
}

function getAccuracy(s = state) {
  return s.quiz.total ? Math.round((s.quiz.correct / s.quiz.total) * 100) : 0;
}

function countFamiliarity(value, sourceState = state) {
  return Object.values(sourceState.familiarity).filter((item) => item === value).length;
}

function todayLearnedCount() {
  return (state.dailyLearned[todayKey()] || []).length;
}

function updateDashboard() {
  const accuracy = `${getAccuracy()}%`;
  $("todayProgress").textContent = todayLearnedCount();
  $("totalWords").textContent = VOCABULARY.length;
  $("favoriteCount").textContent = state.favorites.length;
  $("quizAccuracy").textContent = accuracy;
  $("streakDays").textContent = state.streak;
  $("headerStreak").textContent = `${state.streak} 天`;
  $("analysisToday").textContent = todayLearnedCount();
  $("analysisTotalLearned").textContent = state.learnedWords.length;
  $("analysisFavorites").textContent = state.favorites.length;
  $("analysisFamiliar").textContent = countFamiliarity("familiar");
  $("analysisUnknown").textContent = countFamiliarity("unknown");
  $("analysisAccuracy").textContent = accuracy;
  $("analysisStreak").textContent = state.streak;
  $("studentProgress").textContent = `今天已學 ${todayLearnedCount()} 個單字，累積學習 ${state.learnedWords.length} 個單字。`;
  renderStudentLists();
}

function renderStudentLists() {
  const favoriteWords = state.favorites.slice(0, 8).map(findWord).filter(Boolean);
  const mistakeWords = state.mistakes.slice(0, 8).map(findWord).filter(Boolean);
  $("studentFavorites").innerHTML = favoriteWords.length
    ? favoriteWords.map((word) => `<span>${word.word} · ${word.meaning}</span>`).join("")
    : "<span>尚未收藏單字</span>";
  $("studentMistakes").innerHTML = mistakeWords.length
    ? mistakeWords.map((word) => `<span>${word.word} · ${word.meaning}</span>`).join("")
    : "<span>目前沒有錯題紀錄</span>";
}

function findWord(id) {
  return VOCABULARY.find((word) => word.id === id);
}

function renderAchievements() {
  const markup = achievements.map((achievement) => {
    const unlocked = achievement.unlocked(state);
    return `
      <article class="badge ${unlocked ? "unlocked" : ""}">
        <strong>${unlocked ? "🏅 " : ""}${achievement.title}</strong>
        <span>${achievement.desc}</span>
      </article>
    `;
  }).join("");
  $("achievementBadges").innerHTML = markup;
  $("studentAchievements").innerHTML = markup;
}
