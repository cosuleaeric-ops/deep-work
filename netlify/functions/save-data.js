const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (_) {
    return { statusCode: 400, body: "Invalid JSON" };
  }
  const store = getStore("deep-work-depot");
  await store.setJSON("data", {
    days: body.days || {},
    settings: body.settings || {},
    activeTimer: body.activeTimer !== undefined ? body.activeTimer : null,
  });
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};
