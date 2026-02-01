/**
 * deep work depot – timer + calendar deep work (local, fără login)
 * Când rulezi prin server (node server.js): datele se salvează în data.json pe disc.
 * Când deschizi direct index.html: datele rămân în localStorage.
 */

const STORAGE_DAYS = "deepWorkDepot_days";   // { "YYYY-MM-DD": nr sesiuni }
const STORAGE_SETTINGS = "deepWorkDepot_settings";
const STORAGE_ACTIVE_TIMER = "deepWorkDepot_activeTimer"; // { endTimestamp, mode }

const DEFAULT_WORK_MIN = 60;
const DEFAULT_REST_MIN = 5;

let useFileStorage = false;
let memory = { days: {}, settings: {} };

// --- State
let mode = "work";
let remainingSeconds = 60 * 60;
let intervalId = null;
let workDurationMin = DEFAULT_WORK_MIN;
let restDurationMin = DEFAULT_REST_MIN;

// --- DOM
const timerDisplay = document.getElementById("timer-display");
const btnStart = document.getElementById("btn-start");
const tabs = document.querySelectorAll(".tab");
const calendarGrid = document.getElementById("calendar-grid");
const legendSquares = document.getElementById("legend-squares");
const userBadge = document.getElementById("user-badge");
const istoricModal = document.getElementById("istoric-modal");
const istoricList = document.getElementById("istoric-list");
const btnIstoric = document.getElementById("btn-istoric");
const istoricClose = document.getElementById("istoric-close");
const settingsModal = document.getElementById("settings-modal");
const btnSettings = document.getElementById("btn-settings");
const modalClose = document.getElementById("modal-close");
const workDurationInput = document.getElementById("work-duration");
const restDurationInput = document.getElementById("rest-duration");
const userNameInput = document.getElementById("user-name");
const wipApiKeyInput = document.getElementById("wip-api-key");
const btnReset = document.getElementById("btn-reset");

// --- Helpers
function pad(n) {
  return n < 10 ? "0" + n : String(n);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return pad(m) + ":" + pad(s);
}

function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function loadDays() {
  if (useFileStorage) return memory.days || {};
  try {
    const raw = localStorage.getItem(STORAGE_DAYS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDays(days) {
  if (useFileStorage) {
    memory.days = days;
    postData();
    return;
  }
  localStorage.setItem(STORAGE_DAYS, JSON.stringify(days));
}

function postData() {
  if (!useFileStorage) return;
  fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ days: memory.days, settings: memory.settings, activeTimer: memory.activeTimer }),
  }).catch(() => {});
}

const LUNI_RO = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
function formatDataRo(date) {
  return date.getDate() + " " + LUNI_RO[date.getMonth()] + " " + date.getFullYear();
}

function applySettings(s) {
  if (!s) return;
  workDurationMin = s.workMin ?? DEFAULT_WORK_MIN;
  restDurationMin = s.restMin ?? DEFAULT_REST_MIN;
  workDurationInput.value = workDurationMin;
  restDurationInput.value = restDurationMin;
  userNameInput.value = s.userName ?? "eric cosulea";
  userBadge.textContent = s.userName ?? "eric cosulea";
  wipApiKeyInput.value = s.wipApiKey ?? "";
}

function loadSettings() {
  if (useFileStorage) {
    applySettings(memory.settings);
    return;
  }
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS);
    if (!raw) return;
    const s = JSON.parse(raw);
    applySettings(s);
  } catch (_) {}
}

function saveSettings() {
  const userName = userNameInput.value.trim() || "eric cosulea";
  const settings = {
    workMin: Number(workDurationInput.value) || DEFAULT_WORK_MIN,
    restMin: Number(restDurationInput.value) || DEFAULT_REST_MIN,
    userName,
    wipApiKey: (wipApiKeyInput && wipApiKeyInput.value) ? wipApiKeyInput.value.trim() : "",
  };
  workDurationMin = settings.workMin;
  restDurationMin = settings.restMin;
  userBadge.textContent = userName;
  if (useFileStorage) {
    memory.settings = settings;
    postData();
    return;
  }
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
}

function getWipApiKey() {
  if (useFileStorage) return (memory.settings && memory.settings.wipApiKey) || "";
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS);
    const s = raw ? JSON.parse(raw) : {};
    return s.wipApiKey || "";
  } catch {
    return "";
  }
}

function postToWip(body) {
  const apiKey = getWipApiKey();
  if (!apiKey) return;
  if (useFileStorage) {
    fetch("/api/wip-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, apiKey }),
    }).catch(() => {});
    return;
  }
  const url = "https://api.wip.co/v1/todos?api_key=" + encodeURIComponent(apiKey);
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  }).catch(() => {});
}

// --- Timer
function getDurationSeconds() {
  return mode === "work" ? workDurationMin * 60 : restDurationMin * 60;
}

function saveActiveTimer() {
  const endTimestamp = Date.now() + remainingSeconds * 1000;
  const payload = { endTimestamp, mode };
  if (useFileStorage) {
    memory.activeTimer = payload;
    postData();
    return;
  }
  try {
    localStorage.setItem(STORAGE_ACTIVE_TIMER, JSON.stringify(payload));
  } catch (_) {}
}

function clearActiveTimer() {
  if (useFileStorage) {
    memory.activeTimer = null;
    postData();
    return;
  }
  try {
    localStorage.removeItem(STORAGE_ACTIVE_TIMER);
  } catch (_) {}
}

function loadActiveTimer() {
  let data = null;
  if (useFileStorage) {
    data = memory.activeTimer || null;
  } else {
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVE_TIMER);
      data = raw ? JSON.parse(raw) : null;
    } catch (_) {}
  }
  if (!data || !data.endTimestamp || !data.mode) return false;
  const now = Date.now();
  if (data.endTimestamp <= now) {
    clearActiveTimer();
    return false;
  }
  remainingSeconds = Math.ceil((data.endTimestamp - now) / 1000);
  mode = data.mode;
  tabs.forEach((t) => t.classList.remove("active"));
  const activeTab = document.querySelector(`.tab[data-mode="${mode}"]`);
  if (activeTab) activeTab.classList.add("active");
  timerDisplay.textContent = formatTime(remainingSeconds);
  updateTabTitle();
  btnStart.textContent = "stop";
  intervalId = setInterval(tick, 1000);
  return true;
}

const TAB_TITLE_BASE = "deep work depot";
function updateTabTitle() {
  document.title = formatTime(remainingSeconds) + " – " + TAB_TITLE_BASE;
}

function resetDisplay() {
  remainingSeconds = getDurationSeconds();
  timerDisplay.textContent = formatTime(remainingSeconds);
  updateTabTitle();
}

function tick() {
  remainingSeconds--;
  timerDisplay.textContent = formatTime(remainingSeconds);
  updateTabTitle();
  if (remainingSeconds <= 0) {
    stopTimer();
    clearActiveTimer();
    if (mode === "work") {
      const days = loadDays();
      const key = todayKey();
      const sesiuni = (days[key] || 0) + 1;
      days[key] = sesiuni;
      saveDays(days);
      renderCalendar();
      const today = new Date();
      const shortMonth = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const dateStr = " - " + pad(today.getDate()) + " " + shortMonth[today.getMonth()] + " '" + String(today.getFullYear()).slice(-2);
      const body = workDurationMin + " mins deep work sesh " + sesiuni + dateStr + " #life";
      postToWip(body);
    }
    mode = mode === "work" ? "rest" : "work";
    document.querySelector(".tab.active").classList.remove("active");
    document.querySelector(`.tab[data-mode="${mode}"]`).classList.add("active");
    resetDisplay();
  }
}

function startTimer() {
  if (intervalId) return;
  btnStart.textContent = "stop";
  intervalId = setInterval(tick, 1000);
  saveActiveTimer();
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  clearActiveTimer();
  btnStart.textContent = "start";
}

// --- Calendar: doar luna curentă; nivel = nr sesiuni în zi (0–5)
// gri=0, roșu1=1, roșu2=2, verde1=3, verde2=4, verde3=5 sesiuni
function getLevel(sesiuni) {
  return Math.min(Number(sesiuni) || 0, 5);
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/** Zilele lunii curente (1 .. lastDay), cu sesiuni. Datele din luni trecute rămân în localStorage. */
function getCurrentMonthDays() {
  const days = loadDays();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = getDaysInMonth(year, month);
  const list = [];
  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    const key = year + "-" + pad(month + 1) + "-" + pad(day);
    list.push({ key, sesiuni: days[key] || 0, date: d });
  }
  return list;
}

/** Zile de la 1 ale lunii curente până azi (pentru istoric). */
function getIstoricDays() {
  const days = loadDays();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const list = [];
  for (let d = new Date(first); d <= today; d.setDate(d.getDate() + 1)) {
    const key = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    list.push({ key, sesiuni: days[key] || 0, date: new Date(d) });
  }
  return list.reverse();
}

const CALENDAR_ROWS = 3;
function renderCalendar() {
  const list = getCurrentMonthDays();
  const cols = Math.ceil(list.length / CALENDAR_ROWS);
  calendarGrid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
  calendarGrid.innerHTML = "";
  list.forEach(({ key, sesiuni }) => {
    const level = getLevel(sesiuni);
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.setAttribute("data-level", level);
    cell.setAttribute("title", key + (sesiuni ? ` – ${sesiuni} sesiuni` : " – 0 sesiuni"));
    calendarGrid.appendChild(cell);
  });
}

function renderIstoric() {
  const list = getIstoricDays();
  istoricList.innerHTML = "";
  list.forEach(({ date, sesiuni }) => {
    const li = document.createElement("li");
    const cuv = sesiuni === 1 ? "sesiune" : "sesiuni";
    const sufix = sesiuni ? " deep work" : "";
    li.textContent = formatDataRo(date) + " – " + (sesiuni || 0) + " " + cuv + sufix;
    istoricList.appendChild(li);
  });
}

function renderLegend() {
  legendSquares.innerHTML = "";
  for (let i = 0; i <= 5; i++) {
    const cell = document.createElement("div");
    cell.className = "legend-cell";
    cell.setAttribute("data-level", i);
    legendSquares.appendChild(cell);
  }
}

// --- Event listeners
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (intervalId) return;
    mode = tab.getAttribute("data-mode");
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    resetDisplay();
  });
});

btnStart.addEventListener("click", () => {
  if (intervalId) stopTimer();
  else startTimer();
});

if (btnReset) {
  btnReset.addEventListener("click", () => {
    stopTimer();
    clearActiveTimer();
    mode = "work";
    tabs.forEach((t) => t.classList.remove("active"));
    const workTab = document.querySelector('.tab[data-mode="work"]');
    if (workTab) workTab.classList.add("active");
    resetDisplay();
  });
}

btnIstoric.addEventListener("click", () => {
  renderIstoric();
  istoricModal.showModal();
});
istoricClose.addEventListener("click", () => istoricModal.close());
istoricModal.addEventListener("cancel", () => istoricModal.close());

btnSettings.addEventListener("click", () => settingsModal.showModal());
modalClose.addEventListener("click", () => {
  saveSettings();
  settingsModal.close();
});
settingsModal.addEventListener("cancel", () => settingsModal.close());

// --- Init: dacă suntem pe server, încarcă din fișier; altfel localStorage
async function init() {
  try {
    const r = await fetch("/api/data");
    if (r.ok) {
      const data = await r.json();
      memory.days = data.days || {};
      memory.settings = data.settings || {};
      memory.activeTimer = data.activeTimer || null;
      useFileStorage = true;
    }
  } catch (_) {}
  loadSettings();
  resetDisplay();
  renderLegend();
  renderCalendar();
  loadActiveTimer();
}
init();
