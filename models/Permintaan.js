const mongoose = require("mongoose");

const PermintaanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  },
  nama_komoditas: String,
  jumlah: Number,
  kualitas: String,
  status: String,
  tanggal: Date,

  matches: [
    {
      hasil_panen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HasilPanen"
      },
      jumlah: Number
    }
  ]
});

module.exports = mongoose.model("Permintaan", PermintaanSchema);