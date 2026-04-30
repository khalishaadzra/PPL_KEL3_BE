const HasilPanen = require("../models/HasilPanen");

// TAMBAH PANEN
exports.createPanen = async (req, res) => {
  try {
    const data = await HasilPanen.create(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET SEMUA PANEN
exports.getPanen = async (req, res) => {
  const data = await HasilPanen.find().populate("user_id");
  res.json(data);
};

// UPDATE PANEN
exports.updatePanen = async (req, res) => {
  try {
    const data = await HasilPanen.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// DELETE PANEN
exports.deletePanen = async (req, res) => {
  await HasilPanen.findByIdAndDelete(req.params.id);
  res.json({ message: "Panen dihapus" });
};