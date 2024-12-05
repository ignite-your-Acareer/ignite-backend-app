require("dotenv").config();
const express = require("express");
const app = express();
const strengthsFinder = require("./botScripts/soren/strengthsFinder.js");

// Middleware to parse JSON bodies
app.use(express.json());

// Route for strength finder
app.post("/soren/strength-finder", async (req, res) => {
  try {
    await careerFilter();
    res.json({ success: true });
  } catch (error) {
    console.error("Error in strength finder:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
