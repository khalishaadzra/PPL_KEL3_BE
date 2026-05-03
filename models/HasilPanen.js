const mongoose = require("mongoose");

const HasilPanenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  nama_komoditas: String,
  jumlah: Number, // dalam Kg
  harga: Number, // Harga per Kg
  kualitas: String, // Grade A, B, C
  lokasi: String, // Contoh: "Aceh Besar"
  deskripsi: String,
  tanggal: { type: Date, default: Date.now },
  foto: [{ path: String }],

  // Status harus dinamis: 'Tersedia', 'Terjual', 'Habis'
  status: {
    type: String,
    default: "Tersedia",
  },

  recovery: {
    jenis: String, // 'pakan' atau 'kompos'
  },
});

module.exports = mongoose.model("HasilPanen", HasilPanenSchema);