const BLOCK_RULE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const BLOCK_RULES = [
  { id: 1, priority: 1, action: { type: "block" }, condition: { urlFilter: "||facebook.com", resourceTypes: ["main_frame"] } },
  { id: 2, priority: 1, action: { type: "block" }, condition: { urlFilter: "||twitter.com", resourceTypes: ["main_frame"] } },
  { id: 3, priority: 1, action: { type: "block" }, condition: { urlFilter: "||x.com", resourceTypes: ["main_frame"] } },
  { id: 4, priority: 1, action: { type: "block" }, condition: { urlFilter: "||reddit.com", resourceTypes: ["main_frame"] } },
  { id: 5, priority: 1, action: { type: "block" }, condition: { urlFilter: "||instagram.com", resourceTypes: ["main_frame"] } },
  { id: 6, priority: 1, action: { type: "block" }, condition: { urlFilter: "||linkedin.com", resourceTypes: ["main_frame"] } },
  { id: 7, priority: 1, action: { type: "block" }, condition: { urlFilter: "||tiktok.com", resourceTypes: ["main_frame"] } },
  { id: 8, priority: 1, action: { type: "block" }, condition: { urlFilter: "||t.co", resourceTypes: ["main_frame"] } },
  { id: 9, priority: 2, action: { type: "block" }, condition: { regexFilter: "^https?://([^/]*\\.)?(twitter\\.com|x\\.com)(/.*)?$", resourceTypes: ["main_frame"] } },
  { id: 10, priority: 2, action: { type: "block" }, condition: { urlFilter: "|https://x.com", resourceTypes: ["main_frame"] } },
  { id: 11, priority: 2, action: { type: "block" }, condition: { urlFilter: "|https://twitter.com", resourceTypes: ["main_frame"] } },
];

async function applyBlocking(active) {
  await chrome.storage.local.set({ deepWorkBlockActive: active });
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: BLOCK_RULE_IDS,
    addRules: active ? BLOCK_RULES : [],
  });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "DEEP_WORK_ACTIVE") {
    applyBlocking(msg.active).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const { deepWorkBlockActive } = await chrome.storage.local.get("deepWorkBlockActive");
  if (deepWorkBlockActive) await applyBlocking(true);
});
