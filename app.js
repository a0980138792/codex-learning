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
    questionTranslation: "這篇文章的主旨是什麼？",
    options: ["Daily review and planning help students learn better.", "Students should never take breaks.", "Tests are not important for students.", "Reading at night is always the best way."],
    optionTranslations: ["每天複習和規劃能幫助學生學得更好。", "學生絕對不應該休息。", "考試對學生不重要。", "晚上閱讀永遠是最好的方法。"],
    answer: "Daily review and planning help students learn better.",
    explanation: "中文解析：文章重點不是讀越久越好，而是每天短時間複習、安排時間並適度休息，能讓學習更有效。"
  },
  {
    title: "Technology in Class",
    level: "Level B1",
    passage: "Technology can make learning more interesting. Students can watch videos, practice listening, and search for information online. However, they also need to use digital tools wisely. A phone can help learning, but it can also take attention away from class.",
    translation: "科技可以讓學習更有趣。學生可以觀看影片、練習聽力，並在線上搜尋資訊。然而，他們也需要明智地使用數位工具。手機可以幫助學習，但也可能讓注意力離開課堂。",
    question: "According to the passage, what should students do?",
    questionTranslation: "根據文章，學生應該怎麼做？",
    options: ["Use technology wisely.", "Stop using all digital tools.", "Only study with videos.", "Bring more phones to class."],
    optionTranslations: ["明智地使用科技。", "停止使用所有數位工具。", "只用影片學習。", "帶更多手機到課堂上。"],
    answer: "Use technology wisely.",
    explanation: "中文解析：文章說科技可以幫助學習，但也可能分散注意力，所以學生應該聰明且適度地使用科技工具。"
  },
  {
    title: "Helping the Community",
    level: "Level B1",
    passage: "Last Saturday, a group of high school students cleaned a park near their school. They picked up trash, planted flowers, and painted old benches. The work was tiring, but the students felt proud because they made their community cleaner and friendlier.",
    translation: "上星期六，一群國中生清理學校附近的公園。他們撿垃圾、種花，並粉刷舊長椅。工作很累，但學生感到驕傲，因為他們讓社區更乾淨也更友善。",
    question: "Why did the students feel proud?",
    questionTranslation: "為什麼學生們覺得驕傲？",
    options: ["They improved their community.", "They skipped school.", "They bought new benches.", "They won a sports game."],
    optionTranslations: ["他們改善了自己的社區。", "他們翹課了。", "他們買了新的長椅。", "他們贏得了一場運動比賽。"],
    answer: "They improved their community.",
    explanation: "中文解析：學生覺得驕傲，是因為他們清理公園、種花、粉刷長椅，讓社區變得更乾淨友善。"
  },
  {
    title: "Learning from Mistakes",
    level: "Level B1",
    passage: "Making mistakes is part of learning a language. If students only feel afraid of mistakes, they may stop trying. A better way is to check the mistake, understand the reason, and practice again. Each mistake can become useful feedback.",
    translation: "犯錯是語言學習的一部分。如果學生只害怕犯錯，他們可能會停止嘗試。更好的方法是檢查錯誤、理解原因，然後再次練習。每個錯誤都可以變成有用的回饋。",
    question: "What does the passage suggest?",
    questionTranslation: "這篇文章建議什麼？",
    options: ["Students should learn from mistakes.", "Students should hide every mistake.", "Language learning must be perfect.", "Feedback is never useful."],
    optionTranslations: ["學生應該從錯誤中學習。", "學生應該隱藏每一個錯誤。", "語言學習一定要完美。", "回饋從來沒有幫助。"],
    answer: "Students should learn from mistakes.",
    explanation: "中文解析：文章建議學生不要害怕錯誤，而是檢查錯誤、理解原因並再次練習，讓錯誤變成有用的回饋。"
  },
  {
    title: "A Helpful Neighbor",
    level: "Level A2",
    passage: "Kevin is a junior high school student. He lives in a small apartment with his parents. Every afternoon after school, he walks home. On the way, he always sees an old woman sitting alone on a bench near the park. One rainy day, Kevin found that the old woman did not have an umbrella. She looked cold and afraid. Kevin walked over and shared his umbrella with her. Then he helped her carry her heavy bag to her apartment. The old woman smiled and thanked Kevin. She said, \"You are a very kind boy. Many people walked by, but only you stopped to help me.\" After that day, Kevin visited her every Saturday. Sometimes he helped clean her house. Sometimes he bought food for her from the market. They often talked together and became good friends. Kevin learned that helping others does not always need a lot of money. A little kindness can make someone's day much happier.",
    translation: "Kevin 是一位國中生。他和父母住在一間小公寓裡。每天下午放學後，他都走路回家。路上，他總是看到一位老婦人獨自坐在公園附近的長椅上。有一個下雨天，Kevin 發現老婦人沒有雨傘。她看起來又冷又害怕。Kevin 走過去和她共用雨傘，然後幫她把沉重的袋子提回公寓。老婦人微笑並感謝 Kevin。她說：「你是一個非常善良的男孩。很多人走過去，但只有你停下來幫助我。」那天之後，Kevin 每個星期六都去拜訪她。有時他幫忙打掃房子，有時他從市場買食物給她。他們常常一起聊天，成為好朋友。Kevin 學到，幫助別人不一定需要很多錢。一點點善意就能讓某人的一天快樂許多。",
    questions: [
      {
        question: "Where did Kevin usually see the old woman?",
        questionTranslation: "Kevin 通常在哪裡看到那位老婦人？",
        options: ["At the library", "Near the park", "At school", "At the hospital"],
        optionTranslations: ["在圖書館", "在公園附近", "在學校", "在醫院"],
        answer: "Near the park",
        explanation: "中文解析：文章第一段說 Kevin 在回家路上總是看到老婦人坐在公園附近的長椅上，所以答案是 Near the park。"
      },
      {
        question: "Why did Kevin stop to help her?",
        questionTranslation: "Kevin 為什麼停下來幫助她？",
        options: ["She was selling food.", "She lost her dog.", "She had no umbrella on a rainy day.", "She wanted to visit the market."],
        optionTranslations: ["她正在賣食物。", "她弄丟了她的狗。", "下雨天她沒有雨傘。", "她想去市場。"],
        answer: "She had no umbrella on a rainy day.",
        explanation: "中文解析：文章提到下雨天 Kevin 發現老婦人沒有雨傘，看起來又冷又害怕，因此他停下來幫忙。"
      },
      {
        question: "What did Kevin do for the old woman?",
        questionTranslation: "Kevin 為那位老婦人做了什麼？",
        options: ["He gave her money.", "He drove her home.", "He shared his umbrella and carried her bag.", "He bought her a new house."],
        optionTranslations: ["他給她錢。", "他開車送她回家。", "他和她共用雨傘並幫她提袋子。", "他買了一棟新房子給她。"],
        answer: "He shared his umbrella and carried her bag.",
        explanation: "中文解析：文章說 Kevin 和老婦人共用雨傘，並幫她把沉重的袋子提回公寓。"
      },
      {
        question: "After that day, Kevin visited the old woman ________.",
        questionTranslation: "那天之後，Kevin ________ 去拜訪那位老婦人。",
        options: ["every day", "every Saturday", "every month", "every summer"],
        optionTranslations: ["每天", "每個星期六", "每個月", "每年夏天"],
        answer: "every Saturday",
        explanation: "中文解析：文章明確說 After that day, Kevin visited her every Saturday。"
      },
      {
        question: "What is the best title for this passage?",
        questionTranslation: "這篇文章最好的標題是什麼？",
        options: ["A Rainy School Day", "Kevin's New Apartment", "A Helpful Neighbor", "A Busy Market"],
        optionTranslations: ["下雨的上學日", "Kevin 的新公寓", "樂於助人的鄰居", "忙碌的市場"],
        answer: "A Helpful Neighbor",
        explanation: "中文解析：文章主要在說 Kevin 幫助附近的老婦人，並持續關心她，所以最好的標題是 A Helpful Neighbor。"
      }
    ]
  },
  {
    title: "A New Hobby",
    level: "Level A2",
    passage: "Amy was a quiet junior high school student. After school, she usually went home and watched TV. She thought her life was a little boring. One day, her teacher asked every student to try a new hobby. Amy decided to learn how to grow flowers. She bought a few small plants and put them on the balcony of her apartment. At first, it was not easy. Some plants became dry because Amy forgot to water them. She felt sad, but she did not give up. She read books, watched videos, and asked her grandmother for advice. A few months later, the flowers became beautiful. Many butterflies and bees came to her balcony. Amy enjoyed taking pictures of the flowers and sharing them with her classmates. Now Amy says that growing flowers has changed her life. She is more patient, happier, and enjoys spending time in nature.",
    translation: "Amy 是一位安靜的國中生。放學後，她通常回家看電視。她覺得自己的生活有點無聊。有一天，老師要每位學生嘗試一個新的嗜好。Amy 決定學習如何種花。她買了幾株小植物，放在公寓的陽台上。一開始，這並不容易。有些植物變乾，因為 Amy 忘了替它們澆水。她覺得難過，但她沒有放棄。她讀書、看影片，並向祖母請教。幾個月後，花變得很漂亮。許多蝴蝶和蜜蜂來到她的陽台。Amy 喜歡拍花的照片，並和同學分享。現在 Amy 說種花改變了她的生活。她變得更有耐心、更快樂，也更喜歡花時間親近大自然。",
    questions: [
      {
        question: "What did Amy usually do after school before she found her new hobby?",
        questionTranslation: "在找到新嗜好以前，Amy 放學後通常做什麼？",
        options: ["She played basketball.", "She watched TV.", "She visited her grandmother.", "She read books."],
        optionTranslations: ["她打籃球。", "她看電視。", "她拜訪祖母。", "她讀書。"],
        answer: "She watched TV.",
        explanation: "中文解析：文章第一段說 Amy 放學後通常回家看電視。"
      },
      {
        question: "Why did Amy begin to grow flowers?",
        questionTranslation: "Amy 為什麼開始種花？",
        options: ["Her parents wanted her to do it.", "She wanted to make money.", "Her teacher asked students to try a new hobby.", "She wanted to win a competition."],
        optionTranslations: ["她的父母希望她這麼做。", "她想賺錢。", "她的老師要學生嘗試新的嗜好。", "她想贏得比賽。"],
        answer: "Her teacher asked students to try a new hobby.",
        explanation: "中文解析：文章說老師要每位學生嘗試新的嗜好，所以 Amy 決定學種花。"
      },
      {
        question: "What problem did Amy have at first?",
        questionTranslation: "Amy 一開始遇到什麼問題？",
        options: ["She had no balcony.", "She forgot to water the plants.", "She bought too many flowers.", "She could not find any books."],
        optionTranslations: ["她沒有陽台。", "她忘記替植物澆水。", "她買了太多花。", "她找不到任何書。"],
        answer: "She forgot to water the plants.",
        explanation: "中文解析：文章提到有些植物變乾，因為 Amy 忘了澆水。"
      },
      {
        question: "Which is TRUE according to the passage?",
        questionTranslation: "根據文章，哪一項是正確的？",
        options: ["Amy gave up after one week.", "Birds ate all the flowers.", "Butterflies and bees came to her flowers.", "Amy sold the flowers to her classmates."],
        optionTranslations: ["Amy 一週後放棄了。", "鳥吃掉了所有的花。", "蝴蝶和蜜蜂來到她的花旁。", "Amy 把花賣給同學。"],
        answer: "Butterflies and bees came to her flowers.",
        explanation: "中文解析：文章說幾個月後，許多蝴蝶和蜜蜂來到 Amy 的陽台。"
      },
      {
        question: "What can we learn from Amy's story?",
        questionTranslation: "我們可以從 Amy 的故事學到什麼？",
        options: ["It is easy to grow flowers.", "Watching TV is the best hobby.", "We should never listen to teachers.", "Learning something new takes time and patience."],
        optionTranslations: ["種花很容易。", "看電視是最好的嗜好。", "我們不應該聽老師的話。", "學習新事物需要時間和耐心。"],
        answer: "Learning something new takes time and patience.",
        explanation: "中文解析：Amy 一開始遇到困難，但她沒有放棄，持續學習後讓花變漂亮，表示學新事物需要時間和耐心。"
      }
    ]
  }
];

const grammarLessons = window.GRAMMAR_LESSONS || [
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
let readingQuestionIndex = 0;
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
  $("prevReading").addEventListener("click", previousReading);
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
  const questionItem = getCurrentReadingQuestion(item);
  $("readingTitle").textContent = item.title;
  $("readingLevel").textContent = item.level;
  $("readingPassage").textContent = item.passage;
  $("readingTranslation").textContent = item.translation;
  $("readingTranslation").classList.toggle("is-hidden", !readingTranslationVisible);
  $("toggleReadingTranslation").textContent = readingTranslationVisible ? "隱藏中文翻譯" : "顯示中文翻譯";
  $("toggleReadingTranslation").setAttribute("aria-expanded", String(readingTranslationVisible));
  $("prevReading").textContent = readingQuestionIndex > 0 ? "上一題" : "上一篇";
  $("nextReading").textContent = item.questions && readingQuestionIndex < item.questions.length - 1 ? "下一題" : "下一篇";
  $("readingQuestion").textContent = questionItem.question;
  $("readingQuestionTranslation").textContent = questionItem.questionTranslation || "請閱讀文章後，選出最符合題意的答案。";
  $("readingFeedback").textContent = "";
  $("readingOptions").innerHTML = questionItem.options.map((option, index) => (
    `<button type="button" data-answer="${escapeAttribute(option)}"><span>${escapeHTML(option)}</span><small hidden>${escapeHTML(questionItem.optionTranslations?.[index] || "")}</small></button>`
  )).join("");
  setReadingQuestionChineseVisibility();
  $("readingOptions").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => answerReading(button.dataset.answer, button));
  });
}

function answerReading(answer, selectedButton) {
  const item = readingPassages[readingIndex];
  const questionItem = getCurrentReadingQuestion(item);
  const correct = answer === questionItem.answer;
  $("readingOptions").querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("correct", button.dataset.answer === questionItem.answer);
  });
  selectedButton.classList.toggle("wrong", !correct);
  const resultMessage = correct ? "閱讀理解答對了！" : "答錯了。";
  $("readingFeedback").textContent = `${resultMessage}\n正確答案：${questionItem.answer}\n${questionItem.explanation || "中文解析：請回到文章找出與題目相關的關鍵句，再比對選項的意思。"}`;
}

function toggleReadingTranslation() {
  readingTranslationVisible = !readingTranslationVisible;
  $("readingTranslation").classList.toggle("is-hidden", !readingTranslationVisible);
  setReadingQuestionChineseVisibility();
  $("toggleReadingTranslation").textContent = readingTranslationVisible ? "隱藏中文翻譯" : "顯示中文翻譯";
  $("toggleReadingTranslation").setAttribute("aria-expanded", String(readingTranslationVisible));
}

function nextReading() {
  const item = readingPassages[readingIndex];
  if (item.questions && readingQuestionIndex < item.questions.length - 1) {
    readingQuestionIndex += 1;
    renderReading();
    return;
  }
  readingIndex = (readingIndex + 1) % readingPassages.length;
  readingQuestionIndex = 0;
  readingTranslationVisible = false;
  renderReading();
}

function previousReading() {
  if (readingQuestionIndex > 0) {
    readingQuestionIndex -= 1;
    renderReading();
    return;
  }
  readingIndex = (readingIndex - 1 + readingPassages.length) % readingPassages.length;
  const item = readingPassages[readingIndex];
  readingQuestionIndex = item.questions?.length ? item.questions.length - 1 : 0;
  readingTranslationVisible = false;
  renderReading();
}

function getCurrentReadingQuestion(item) {
  if (item.questions?.length) {
    return item.questions[readingQuestionIndex] || item.questions[0];
  }
  return item;
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
  $("toggleGrammarChinese").textContent = grammarChineseVisible ? "隱藏中文翻譯" : "顯示中文翻譯";
  $("toggleGrammarChinese").setAttribute("aria-expanded", String(grammarChineseVisible));
  $("grammarQuestion").textContent = item.question;
  $("grammarQuestionTranslation").textContent = getGrammarQuestionTranslation(item.question);
  $("grammarFeedback").textContent = "";
  $("grammarOptions").innerHTML = item.options.map((option) => (
    `<button type="button" data-answer="${escapeAttribute(option)}"><span>${escapeHTML(option)}</span><small hidden>${escapeHTML(getGrammarOptionTranslation(option))}</small></button>`
  )).join("");
  setGrammarQuestionChineseVisibility();
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
  const resultMessage = correct ? "文法答對了！" : "答錯了。";
  $("grammarFeedback").textContent = `${resultMessage}\n正確答案：${item.answer}\n中文解析：${getGrammarOptionTranslation(item.answer)}。${item.explanation}`;
}

function toggleGrammarChinese() {
  grammarChineseVisible = !grammarChineseVisible;
  $("grammarExplanation").classList.toggle("is-hidden", !grammarChineseVisible);
  $("grammarTranslation").classList.toggle("is-hidden", !grammarChineseVisible);
  setGrammarQuestionChineseVisibility();
  $("toggleGrammarChinese").textContent = grammarChineseVisible ? "隱藏中文翻譯" : "顯示中文翻譯";
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

function setReadingQuestionChineseVisibility() {
  $("readingQuestion").closest(".reading-question").classList.toggle("show-chinese", readingTranslationVisible);
  $("readingQuestionTranslation").hidden = !readingTranslationVisible;
  $("readingQuestionTranslation").classList.toggle("is-hidden", !readingTranslationVisible);
  $("readingOptions").querySelectorAll("small").forEach((item) => {
    item.hidden = !readingTranslationVisible;
    item.classList.toggle("is-hidden", !readingTranslationVisible);
  });
}

function setGrammarQuestionChineseVisibility() {
  $("grammarQuestion").closest(".reading-question").classList.toggle("show-chinese", grammarChineseVisible);
  $("grammarQuestionTranslation").hidden = !grammarChineseVisible;
  $("grammarQuestionTranslation").classList.toggle("is-hidden", !grammarChineseVisible);
  $("grammarOptions").querySelectorAll("small").forEach((item) => {
    item.hidden = !grammarChineseVisible;
    item.classList.toggle("is-hidden", !grammarChineseVisible);
  });
}

function escapeHTML(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getGrammarQuestionTranslation(question) {
  const translations = {
    "Choose the correct short answer: Are you busy?": "選出正確的簡答：Are you busy?（你忙嗎？）",
    "Which is a yes/no question?": "哪一句是 Yes/No 問句？",
    "Which sentence is grammatically correct?": "哪一句文法正確？",
    "Which sentence tells a place?": "哪一句是在說明地點？"
  };
  return translations[question] || "請選出最符合文法規則的答案。";
}

function getGrammarOptionTranslation(option) {
  const translations = {
    "Are you can swim?": "錯誤句：不能同時用 are 和 can 形成這種問句。",
    "Are you ready?": "你準備好了嗎？",
    "Can you swim?": "你會游泳嗎？",
    "Can you swims?": "錯誤句：can 後面要接原形動詞 swim。",
    "Do you can swim?": "錯誤句：can 本身就是助動詞，不再加 do。",
    "Friday is it?": "錯誤句：語序不自然。",
    "Her is my friend.": "錯誤句：her 不能當主詞。",
    "Hers is my friend.": "錯誤句：hers 是所有代名詞，不適合這裡。",
    "How is teacher?": "錯誤句：缺少冠詞或所有格。",
    "How is your telephone number?": "錯誤句：詢問電話號碼要用 what。",
    "I am a student.": "我是一位學生。",
    "I am ready.": "我準備好了。",
    "I am thirteen years old.": "我十三歲。",
    "I are a student.": "錯誤句：I 要搭配 am。",
    "I be a student.": "錯誤句：主詞 I 不直接搭配 be。",
    "I have thirteen years old.": "錯誤句：英文年齡不用 have 表達。",
    "I is a student.": "錯誤句：I 要搭配 am。",
    "I is thirteen years old.": "錯誤句：I 要搭配 am。",
    "I thirteen old.": "錯誤句：缺少 be 動詞和 years。",
    "It Friday.": "錯誤句：缺少 be 動詞 is。",
    "It are Friday.": "錯誤句：it 要搭配 is。",
    "It are seven thirty.": "錯誤句：it 要搭配 is。",
    "It is Friday.": "今天是星期五。",
    "It is at seven thirty yesterday.": "錯誤句：時間表達與 yesterday 不自然。",
    "It is seven thirty.": "現在是七點三十分。",
    "It seven thirty.": "錯誤句：缺少 be 動詞 is。",
    "Please open the door.": "請打開門。",
    "Please opened the door.": "錯誤句：祈使句要用原形動詞 open。",
    "Please opening the door.": "錯誤句：祈使句要用原形動詞 open。",
    "Please opens the door.": "錯誤句：祈使句要用原形動詞 open。",
    "She amn't at home.": "錯誤句：amn't 不是標準用法。",
    "She aren't at home.": "錯誤句：she 要搭配 isn't。",
    "She be not at home.": "錯誤句：應使用 isn't 或 is not。",
    "She is my friend.": "她是我的朋友。",
    "She is read a book.": "錯誤句：現在進行式要用 reading。",
    "She is reading a book.": "她正在讀一本書。",
    "She isn't at home.": "她不在家。",
    "She reading a book.": "錯誤句：缺少 be 動詞 is。",
    "She reads a book now.": "句意可通，但不是現在進行式句型。",
    "The cat can run.": "這隻貓會跑。",
    "The cat eats fish.": "這隻貓吃魚。",
    "The cat is cute.": "這隻貓很可愛。",
    "The cat is under the table.": "貓在桌子下面。",
    "The clean is room.": "錯誤句：形容詞位置錯誤。",
    "The room clean is.": "錯誤句：語序錯誤。",
    "The room is clean.": "這個房間很乾淨。",
    "The room is cleans.": "錯誤句：形容詞 clean 不加 s。",
    "There are three pencils.": "有三枝鉛筆。",
    "There be three pencils.": "錯誤句：要用 is 或 are。",
    "There have three pencils.": "錯誤句：there 句型不用 have。",
    "There is three pencils.": "錯誤句：複數 pencils 要搭配 are。",
    "These are my books.": "這些是我的書。",
    "These is my books.": "錯誤句：these 要搭配 are。",
    "They am students.": "錯誤句：they 要搭配 are。",
    "They are students.": "他們是學生。",
    "They be students.": "錯誤句：they 要搭配 are。",
    "They is my friend.": "錯誤句：they 要搭配 are，且 friend 應配合複數。",
    "They is students.": "錯誤句：they 要搭配 are。",
    "This are my books.": "錯誤句：this 是單數，不能搭配 are 和複數 books。",
    "Those is books.": "錯誤句：those 要搭配 are。",
    "Tom bag's": "錯誤寫法：所有格位置錯誤。",
    "Tom is bag": "錯誤寫法：這不是所有格。",
    "Tom's bag": "Tom 的袋子。",
    "Toms bag": "錯誤寫法：缺少所有格 's。",
    "What is your name?": "你的名字是什麼？",
    "What is your telephone number?": "你的電話號碼是什麼？",
    "When is your teacher?": "錯誤句：when 問時間，不適合問老師身分。",
    "Where is your teacher?": "你的老師在哪裡？",
    "Where is your telephone number?": "錯誤句：where 問地點，不適合問電話號碼。",
    "Who is your teacher?": "誰是你的老師？",
    "Who is your telephone number?": "錯誤句：who 問人，不適合問電話號碼。",
    "Yes, I am.": "是的，我是 / 我有。",
    "Yes, I are.": "錯誤句：I 要搭配 am。",
    "Yes, I is.": "錯誤句：I 要搭配 am。",
    "Yes, me am.": "錯誤句：主詞要用 I。",
    "You are ready.": "你準備好了。",
    "a apples": "錯誤片語：複數 apples 前不用 a。",
    "an books": "錯誤片語：複數 books 前不用 an。",
    "twenties-one": "錯誤寫法。",
    "twenty one years": "不完整或不適合此題的寫法。",
    "twenty-one": "二十一。",
    "two book": "錯誤片語：two 後面名詞要用複數 books。",
    "two books": "兩本書。",
    "two ten one": "錯誤數字說法。"
  };
  return translations[option] || "請比對句型、主詞與動詞是否一致。";
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
