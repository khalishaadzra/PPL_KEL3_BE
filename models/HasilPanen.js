const mongoose = require("mongoose");

const HasilPanenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  },
  nama_komoditas: String,
  jumlah: Number,
  kualitas: String,
  status: String,
  tanggal: Date,

  foto: [
    {
      path: String
    }
  ],

  recovery: {
    jenis: String // kompos / pakan ternak
  }
});

module.exports = mongoose.model("HasilPanen", HasilPanenSchema);