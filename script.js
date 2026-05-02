const pages = document.querySelectorAll("[data-page]");
const navLinks = document.querySelectorAll("[data-page-link]");
const hamburger = document.getElementById("hamburger");
const navPanel = document.getElementById("navPanel");
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const scrollProgress = document.getElementById("scrollProgress");

const quotes = [
  "Small steps every day build unstoppable momentum.",
  "Focus is a study superpower. Protect it fiercely.",
  "Your future self is built by today's quiet effort.",
  "Study smarter, rest properly, return stronger.",
  "Consistency turns hard chapters into solved chapters.",
  "AI can assist, but your curiosity drives the breakthrough."
];

const codingContent = {
  htmlBasics: [
    {
      title: "Tags",
      text: "HTML tags label parts of a page so the browser understands meaning and structure.",
      code: "<h1>Main title</h1>\n<p>A useful paragraph.</p>"
    },
    {
      title: "Structure",
      text: "A clean document has a head for setup and a body for visible content.",
      code: "<!DOCTYPE html>\n<html>\n  <body>Hello</body>\n</html>"
    },
    {
      title: "Links & Images",
      text: "Links connect pages, while images add helpful visual context.",
      code: "<a href=\"about.html\">About</a>\n<img src=\"photo.jpg\" alt=\"Desk\">"
    },
    {
      title: "Forms",
      text: "Forms collect input with fields, labels, and submit buttons.",
      code: "<label>Email</label>\n<input type=\"email\">\n<button>Send</button>"
    }
  ],
  cssTricks: [
    {
      title: "Flexbox",
      text: "Flexbox makes one-dimensional alignment simple for navbars and button rows.",
      code: ".row {\n  display: flex;\n  gap: 1rem;\n}"
    },
    {
      title: "Grid",
      text: "Grid is ideal for responsive cards, dashboards, and page layouts.",
      code: ".cards {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}"
    },
    {
      title: "Animations",
      text: "Transitions and keyframes make interfaces feel smooth and responsive.",
      code: ".card {\n  transition: transform .2s ease;\n}\n.card:hover { transform: translateY(-4px); }"
    },
    {
      title: "Responsive Design",
      text: "Media queries adapt layouts for phones, tablets, and laptops.",
      code: "@media (max-width: 700px) {\n  .cards { grid-template-columns: 1fr; }\n}"
    }
  ]
};

const aiTools = {
  studyAiTools: [
    ["ChatGPT", "Brainstorm ideas, explain concepts, and create practice questions."],
    ["Notion AI", "Summarize notes, rewrite rough drafts, and organize study pages."],
    ["Quizlet", "Build flashcards and practice with AI-powered study modes."],
    ["Khan Academy AI", "Get guided tutoring support for school subjects."]
  ],
  codingAiTools: [
    ["GitHub Copilot", "Receive coding suggestions directly inside your editor."],
    ["Codeium", "Use AI autocomplete and coding chat for faster development."],
    ["Replit AI", "Prototype, debug, and explain code in a browser workspace."],
    ["Codex", "Plan and implement code changes with an AI coding assistant."]
  ],
  productivityAiTools: [
    ["Grammarly", "Improve grammar, clarity, and tone in writing."],
    ["Canva AI", "Create presentation visuals, layouts, and quick graphics."],
    ["Tome AI", "Draft polished presentation stories from simple prompts."],
    ["Motion AI", "Schedule tasks and manage daily priorities automatically."]
  ]
};

let timerSeconds = 25 * 60;
let timerTotal = 25 * 60;
let isBreak = false;
let timerInterval = null;
let notes = JSON.parse(localStorage.getItem("studentHubNotes") || "[]");
let timetable = JSON.parse(localStorage.getItem("studentHubTimetable") || "[]");
let examDate = localStorage.getItem("studentHubExamDate") || "";

function routeTo(hash) {
  const pageId = (hash || "#home").replace("#", "");
  const targetId = document.querySelector(`[data-page="${pageId}"]`) ? pageId : "home";

  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === targetId);
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === targetId);
  });

  navPanel.classList.remove("open");
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  themeLabel.textContent = theme === "light" ? "Light" : "Dark";
  localStorage.setItem("studentHubTheme", theme);
}

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll <= 0 ? 0 : (window.scrollY / maxScroll) * 100;
  scrollProgress.style.width = `${progress}%`;
}

function showRandomQuote() {
  const quoteText = document.getElementById("quoteText");
  const current = quoteText.textContent;
  let next = quotes[Math.floor(Math.random() * quotes.length)];
  if (quotes.length > 1) {
    while (next === current) next = quotes[Math.floor(Math.random() * quotes.length)];
  }
  quoteText.textContent = next;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function updateTimerUi() {
  document.getElementById("timerDisplay").textContent = formatTime(timerSeconds);
  document.getElementById("timerMode").textContent = isBreak ? "Break" : "Focus";
  document.getElementById("timerHint").textContent = isBreak ? "5 min break" : "25 min focus";
  const elapsed = timerTotal - timerSeconds;
  const degrees = Math.max(0, Math.min(360, (elapsed / timerTotal) * 360));
  document.getElementById("timerRing").style.setProperty("--progress", `${degrees}deg`);
}

function playFinishSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.6);
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    timerSeconds -= 1;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      playFinishSound();
      isBreak = !isBreak;
      timerTotal = isBreak ? 5 * 60 : 25 * 60;
      timerSeconds = timerTotal;
    }
    updateTimerUi();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  isBreak = false;
  timerTotal = 25 * 60;
  timerSeconds = timerTotal;
  updateTimerUi();
}

function saveNotes() {
  localStorage.setItem("studentHubNotes", JSON.stringify(notes));
}

function renderNotes() {
  const notesGrid = document.getElementById("notesGrid");
  notesGrid.innerHTML = notes.length
    ? notes.map((note, index) => `
      <div class="note-item">
        <p>${escapeHtml(note)}</p>
        <button type="button" data-delete-note="${index}">Delete</button>
      </div>
    `).join("")
    : "<p class=\"empty-state\">No notes yet.</p>";
}

function saveTimetable() {
  localStorage.setItem("studentHubTimetable", JSON.stringify(timetable));
}

function renderTimetable() {
  const timetableBody = document.getElementById("timetableBody");
  timetableBody.innerHTML = timetable.length
    ? timetable.map((entry, index) => `
      <tr>
        <td>${escapeHtml(entry.time)}</td>
        <td>${escapeHtml(entry.subject)}</td>
        <td><button class="delete-row" type="button" data-delete-row="${index}">Delete</button></td>
      </tr>
    `).join("")
    : "<tr><td colspan=\"3\">No subjects added yet.</td></tr>";
}

function updateCountdown() {
  const days = document.getElementById("daysLeft");
  const hours = document.getElementById("hoursLeft");
  const minutes = document.getElementById("minutesLeft");
  if (!examDate) {
    days.textContent = "0";
    hours.textContent = "0";
    minutes.textContent = "0";
    return;
  }

  const diff = new Date(examDate).getTime() - Date.now();
  const safeDiff = Math.max(0, diff);
  days.textContent = Math.floor(safeDiff / 86400000);
  hours.textContent = Math.floor((safeDiff % 86400000) / 3600000);
  minutes.textContent = Math.floor((safeDiff % 3600000) / 60000);
}

function renderLearningCards(containerId, items) {
  document.getElementById(containerId).innerHTML = items.map((item) => `
    <article class="learning-card">
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <pre><code>${escapeHtml(item.code)}</code></pre>
    </article>
  `).join("");
}

function renderAiTools(filter = "") {
  const cleanFilter = filter.trim().toLowerCase();
  Object.entries(aiTools).forEach(([containerId, tools]) => {
    const filtered = tools.filter(([name, description]) => {
      return `${name} ${description}`.toLowerCase().includes(cleanFilter);
    });
    document.getElementById(containerId).innerHTML = filtered.map(([name, description]) => `
      <article class="ai-card" data-tool-name="${name.toLowerCase()}">
        <div>
          <h3>${name}</h3>
          <p>${description}</p>
        </div>
        <a class="btn gradient-btn" href="https://example.com" target="_blank" rel="noopener" aria-label="Visit ${name}">Visit</a>
      </article>
    `).join("") || "<p class=\"empty-state\">No tools match your search.</p>";
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

hamburger.addEventListener("click", () => {
  const isOpen = navPanel.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

themeToggle.addEventListener("click", () => {
  setTheme(document.body.classList.contains("light") ? "dark" : "light");
});

document.getElementById("newQuoteBtn").addEventListener("click", showRandomQuote);
document.getElementById("startTimer").addEventListener("click", startTimer);
document.getElementById("pauseTimer").addEventListener("click", pauseTimer);
document.getElementById("resetTimer").addEventListener("click", resetTimer);

document.getElementById("noteForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const noteInput = document.getElementById("noteInput");
  const value = noteInput.value.trim();
  if (!value) return;
  notes.unshift(value);
  noteInput.value = "";
  saveNotes();
  renderNotes();
});

document.getElementById("notesGrid").addEventListener("click", (event) => {
  const index = event.target.dataset.deleteNote;
  if (index === undefined) return;
  notes.splice(Number(index), 1);
  saveNotes();
  renderNotes();
});

document.getElementById("timetableForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const timeInput = document.getElementById("timeInput");
  const subjectInput = document.getElementById("subjectInput");
  timetable.push({ time: timeInput.value, subject: subjectInput.value.trim() });
  timetable.sort((a, b) => a.time.localeCompare(b.time));
  timeInput.value = "";
  subjectInput.value = "";
  saveTimetable();
  renderTimetable();
});

document.getElementById("timetableBody").addEventListener("click", (event) => {
  const index = event.target.dataset.deleteRow;
  if (index === undefined) return;
  timetable.splice(Number(index), 1);
  saveTimetable();
  renderTimetable();
});

document.getElementById("examDate").addEventListener("change", (event) => {
  examDate = event.target.value;
  localStorage.setItem("studentHubExamDate", examDate);
  updateCountdown();
});

document.getElementById("toolSearch").addEventListener("input", (event) => {
  renderAiTools(event.target.value);
});

window.addEventListener("hashchange", () => routeTo(window.location.hash));
window.addEventListener("scroll", updateScrollProgress);

setTheme(localStorage.getItem("studentHubTheme") || "dark");
routeTo(window.location.hash);
updateTimerUi();
renderNotes();
renderTimetable();
renderLearningCards("htmlBasics", codingContent.htmlBasics);
renderLearningCards("cssTricks", codingContent.cssTricks);
renderAiTools();
document.getElementById("examDate").value = examDate;
updateCountdown();
setInterval(updateCountdown, 1000);
