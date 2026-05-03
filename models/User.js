const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nama: String,
  email: String,
  password: String,
  role: String,
  alamat: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Users", UserSchema);