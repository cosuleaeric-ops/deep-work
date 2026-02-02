const { getStore } = require("@netlify/blobs");

const DEFAULT_PAYLOAD = { days: {}, settings: {}, activeTimer: null };

exports.handler = async () => {
  try {
    const store = getStore("deep-work-depot");
    const data = await store.get("data", { type: "json" });
    const payload = data || DEFAULT_PAYLOAD;
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DEFAULT_PAYLOAD),
    };
  }
};
