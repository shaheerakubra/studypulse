require("dotenv").config();
const { createStore } = require("./data/store");
const { createApp } = require("./app");

const PORT = Number(process.env.PORT || 3000);
const store = createStore();
const app = createApp(store);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`StudyPulse API listening on http://localhost:${PORT}`);
});
