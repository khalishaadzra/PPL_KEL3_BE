const Permintaan = require("../models/Permintaan");
const HasilPanen = require("../models/HasilPanen");

// TAMBAH PERMINTAAN
exports.createPermintaan = async (req, res) => {
  try {
    const data = await Permintaan.create({
      ...req.body,
      matches: []
    });

    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET SEMUA PERMINTAAN
exports.getPermintaan = async (req, res) => {
  const data = await Permintaan.find().populate("user_id");
  res.json(data);
};

// MATCH PERMINTAAN (dummy handler, silakan sesuaikan)
exports.matchPermintaan = async (req, res) => {
  res.json({ message: "matchPermintaan endpoint is working!" });
};