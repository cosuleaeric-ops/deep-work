(function () {
  const FLAG_KEY = "eliteDeepWork_timerActive";
  const MODE_KEY = "eliteDeepWork_timerMode";

  function shouldBlock() {
    try {
      const active = localStorage.getItem(FLAG_KEY) === "1";
      const mode = localStorage.getItem(MODE_KEY) || "work";
      return active && mode === "work"; // blochează doar în modul work, nu în pauza rest
    } catch (_) {
      return false;
    }
  }

  function sendToBackground(block) {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage({ type: "DEEP_WORK_ACTIVE", block }, () => {});
    }
  }

  // Nu trimitem block: false din polling imediat – aplicația poate restaura timerul după load.
  // block: true îl trimitem mereu; block: false doar după 2 secunde de shouldBlock() === false.
  let falseCount = 0;
  const POLL_MS = 500;
  const FALSE_POLLS_BEFORE_SEND = 4; // 4 × 500ms = 2 secunde

  function check() {
    if (!document.body || document.body.getAttribute("data-app") !== "elite-deep-work") return;
    const block = shouldBlock();
    if (block) {
      falseCount = 0;
      sendToBackground(true);
    } else {
      falseCount += 1;
      if (falseCount >= FALSE_POLLS_BEFORE_SEND) sendToBackground(false);
    }
  }

  function onTimerChange(e) {
    if (!e.detail) return;
    const active = e.detail.active === true;
    const mode = e.detail.mode || "work";
    const block = active && mode === "work";
    falseCount = block ? 0 : FALSE_POLLS_BEFORE_SEND; // ca la următorul poll să nu retrimitem false
    sendToBackground(block);
  }

  if (document.body) {
    check();
    document.addEventListener("eliteDeepWorkTimerChange", onTimerChange);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      check();
      document.addEventListener("eliteDeepWorkTimerChange", onTimerChange);
    });
  }
  setInterval(check, POLL_MS);
})();
