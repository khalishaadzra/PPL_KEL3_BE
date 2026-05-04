// controllers/chatController.js
const Chat = require("../models/Chat");
const User = require("../models/User");

/**
 * 1. GET CHAT LIST (daftar percakapan unik dengan contact info)
 */
exports.getChatList = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Cari semua chat yang melibatkan user ini (sender atau receiver)
    const allChats = await Chat.find({
      $or: [{ sender_id: user_id }, { receiver_id: user_id }],
    })
      .populate("sender_id", "nama alamat role email")
      .populate("receiver_id", "nama alamat role email")
      .sort({ tanggal: -1 });

    // Group by conversation (unique pair)
    const conversations = new Map();

    for (const chat of allChats) {
      const otherUserId =
        chat.sender_id._id.toString() === user_id
          ? chat.receiver_id._id.toString()
          : chat.sender_id._id.toString();
      const otherUser =
        chat.sender_id._id.toString() === user_id
          ? chat.receiver_id
          : chat.sender_id;

      if (!conversations.has(otherUserId)) {
        // Hitung belum dibaca untuk percakapan ini
        const unreadCount = await Chat.countDocuments({
          receiver_id: user_id,
          sender_id: otherUserId,
          dibaca: false,
        });

        conversations.set(otherUserId, {
          id: otherUserId,
          nama: otherUser.nama,
          pesanTerakhir: chat.pesan,
          waktu: formatWaktu(chat.tanggal),
          belumDibaca: unreadCount,
          online: true, // TODO: implement real online status
          role: otherUser.role,
          alamat: otherUser.alamat,
        });
      }
    }

    res.json(Array.from(conversations.values()));
  } catch (err) {
    console.error("Get Chat List Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2. GET CHAT MESSAGES (detail chat dengan contact tertentu)
 */
exports.getChatMessages = async (req, res) => {
  try {
    const { user_id, contact_id } = req.params;

    const messages = await Chat.find({
      $or: [
        { sender_id: user_id, receiver_id: contact_id },
        { sender_id: contact_id, receiver_id: user_id },
      ],
    })
      .populate("sender_id", "nama email")
      .sort({ tanggal: 1 });

    // Mark as read
    await Chat.updateMany(
      {
        receiver_id: user_id,
        sender_id: contact_id,
        dibaca: false,
      },
      { dibaca: true }
    );

    res.json(messages);
  } catch (err) {
    console.error("Get Chat Messages Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3. SEND CHAT MESSAGE
 */
exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, pesan } = req.body;

    const newChat = new Chat({
      sender_id,
      receiver_id,
      pesan,
      tipe_pesan: "text",
    });

    const saved = await newChat.save();
    await saved.populate("sender_id", "nama email");

    res.status(201).json(saved);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4. GET UNREAD COUNT
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const { user_id } = req.params;

    const count = await Chat.countDocuments({
      receiver_id: user_id,
      dibaca: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error("Get Unread Count Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function
function formatWaktu(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const hari = diff / (1000 * 60 * 60 * 24);

  if (hari < 1) {
    const jam = Math.floor(diff / (1000 * 60 * 60));
    if (jam === 0) {
      const menit = Math.floor(diff / (1000 * 60));
      return menit <= 0 ? "Baru saja" : `${menit} menit lalu`;
    }
    return `${jam} jam lalu`;
  }

  if (hari < 7) {
    return Math.floor(hari) === 1 ? "Kemarin" : `${Math.floor(hari)}d lalu`;
  }

  return date.toLocaleDateString("id-ID");
}
