const { getStore } = require("@netlify/blobs");

exports.handler = async () => {
  const store = getStore("deep-work-depot");
  const data = await store.get("data", { type: "json" });
  const payload = data || { days: {}, settings: {}, activeTimer: null };
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
};
