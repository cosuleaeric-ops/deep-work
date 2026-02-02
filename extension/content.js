(function () {
  const FLAG_KEY = "eliteDeepWork_timerActive";

  function readFlag() {
    try {
      return localStorage.getItem(FLAG_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function sendToBackground(active) {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage({ type: "DEEP_WORK_ACTIVE", active }, () => {});
    }
  }

  function check() {
    if (document.body && document.body.getAttribute("data-app") === "elite-deep-work") {
      sendToBackground(readFlag());
    }
  }

  if (document.body) {
    check();
    document.addEventListener("eliteDeepWorkTimerChange", function (e) {
      if (e.detail && typeof e.detail.active === "boolean") sendToBackground(e.detail.active);
    });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      check();
      document.addEventListener("eliteDeepWorkTimerChange", function (e) {
        if (e.detail && typeof e.detail.active === "boolean") sendToBackground(e.detail.active);
      });
    });
  }
  setInterval(check, 500);
})();
