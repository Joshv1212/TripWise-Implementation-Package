const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// RouteWise Compass is fully functional as a static frontend.
// This backend is included as a clean expansion point for live APIs:
// Google Maps, Google Places, Amtrak, airline APIs, bus APIs, hotel APIs, weather APIs, and attractions APIs.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "RouteWise Compass" });
});

app.post("/api/plan", (req, res) => {
  res.json({
    message: "Received trip planning request.",
    input: req.body,
    note: "The current static frontend performs the full recommendation logic. Future production version should move calculations and live API calls here."
  });
});

app.listen(PORT, () => {
  console.log(`RouteWise Compass backend running at http://localhost:${PORT}`);
});
