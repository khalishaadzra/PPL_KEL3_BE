const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  pesan: {
    type: String,
    required: true,
  },
  tipe_pesan: {
    type: String,
    enum: ["text", "image"],
    default: "text",
  },
  dibaca: {
    type: Boolean,
    default: false,
  },
  tanggal: {
    type: Date,
    default: Date.now,
  },
});

// Index untuk query percakapan
ChatSchema.index({ sender_id: 1, receiver_id: 1 });
ChatSchema.index({ receiver_id: 1, dibaca: 1 });

module.exports = mongoose.model("Chat", ChatSchema);
