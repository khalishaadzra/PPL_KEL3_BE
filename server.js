const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Serve folder uploads sebagai static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.send("Backend Smart Harvest running");
});

app.use("/api/users", require("./routes/userRoutes.js"));
app.use("/api/panen", require("./routes/hasilPanenRoutes"));
app.use("/api/permintaan", require("./routes/permintaanRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});