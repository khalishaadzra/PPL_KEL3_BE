const mongoose = require("mongoose");

const PermintaanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  nomor_permintaan: String, // Contoh: TKR-AGR-1234
  nama_komoditas: String,
  jumlah: Number,
  kualitas: String,
  tanggal: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: [
      "Diajukan",
      "Matching",
      "Menunggu Konfirmasi",
      "Selesai",
      "Dibatalkan",
    ],
    default: "Diajukan",
  },

  matches: [
    {
      hasil_panen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HasilPanen",
      },
      petani_nama: String,
      jumlah_diambil: Number,
      lokasi: String,
      harga_per_kg: Number,
    },
  ],
});

module.exports = mongoose.model("Permintaan", PermintaanSchema);
