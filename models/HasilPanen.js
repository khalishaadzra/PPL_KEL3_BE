const mongoose = require("mongoose");

// models/HasilPanen.js
const HasilPanenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  },
  nama_komoditas: String,
  jumlah: Number,
  harga: Number,
  kualitas: String,
  status: String,
  tanggal: Date,
  deskripsi: String,
  foto: [{ path: String }],
  recovery: { jenis: String }
});

module.exports = mongoose.model("HasilPanen", HasilPanenSchema);