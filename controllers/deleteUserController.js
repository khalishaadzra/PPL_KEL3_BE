// Tambahan endpoint untuk hapus user (khusus admin)
const User = require("../models/User");

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res.status(500).json(err);
  }
};
