require("dotenv").config();
const express = require("express");
const app = express();
const mainController = require("./controllers/mainController.js");

// Middleware to parse JSON bodies
app.use(express.json());

// Root route
app.post("/", async (req, res) => {
  try {
    const response = await mainController(req.body);
    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
