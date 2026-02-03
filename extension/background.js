const RULESET_ID = "block_social";

async function applyBlocking(block) {
  try {
    await chrome.storage.local.set({ deepWorkBlockActive: block });
    if (block) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: [RULESET_ID] });
    } else {
      await chrome.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: [RULESET_ID] });
    }
  } catch (_) {}
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "DEEP_WORK_ACTIVE") {
    const block = msg.block === true;
    applyBlocking(block).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }
});

chrome.runtime.onStartup.addListener(async () => {
  try {
    const { deepWorkBlockActive } = await chrome.storage.local.get("deepWorkBlockActive");
    if (deepWorkBlockActive) await applyBlocking(true);
  } catch (_) {}
});
