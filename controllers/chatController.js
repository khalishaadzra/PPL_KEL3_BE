// controllers/chatController.js
const Chat = require("../models/Chat");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * 1. GET CHAT LIST (daftar percakapan unik dengan contact info)
 */
exports.getChatList = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      console.warn(`Invalid user_id format: ${user_id}`);
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const userId = new mongoose.Types.ObjectId(user_id);
    console.log(`Fetching chat list for user: ${user_id}`);

    // Cari semua chat yang melibatkan user ini (sender atau receiver)
    const allChats = await Chat.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    })
      .populate("sender_id", "nama alamat role email")
      .populate("receiver_id", "nama alamat role email")
      .sort({ tanggal: -1 });

    console.log(`Found ${allChats.length} chats`);

    // Group by conversation (unique pair)
    const conversations = new Map();

    for (const chat of allChats) {
      try {
        const otherUserId =
          chat.sender_id._id.toString() === user_id
            ? chat.receiver_id._id.toString()
            : chat.sender_id._id.toString();
        const otherUser =
          chat.sender_id._id.toString() === user_id
            ? chat.receiver_id
            : chat.sender_id;

        // Skip if otherUser is not populated
        if (!otherUser || !otherUser.nama) {
          console.warn(`Skipping chat - missing otherUser data`);
          continue;
        }

        if (!conversations.has(otherUserId)) {
          // Hitung belum dibaca untuk percakapan ini
          const unreadCount = await Chat.countDocuments({
            receiver_id: userId,
            sender_id: new mongoose.Types.ObjectId(otherUserId),
            dibaca: false,
          });

          conversations.set(otherUserId, {
            id: otherUserId,
            nama: otherUser.nama,
            pesanTerakhir: chat.pesan || "",
            waktu: formatWaktu(chat.tanggal),
            belumDibaca: unreadCount,
            online: true, // TODO: implement real online status
            role: otherUser.role,
            alamat: otherUser.alamat,
          });
        }
      } catch (chatErr) {
        console.error(`Error processing chat:`, chatErr);
        continue;
      }
    }

    console.log(`Returning ${conversations.size} conversations`);
    res.json(Array.from(conversations.values()));
  } catch (err) {
    console.error("Get Chat List Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

/**
 * 2. GET CHAT MESSAGES (detail chat dengan contact tertentu)
 */
exports.getChatMessages = async (req, res) => {
  try {
    const { user_id, contact_id } = req.params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(contact_id)) {
      return res.status(400).json({ error: "Invalid user ID or contact ID format" });
    }

    const userId = new mongoose.Types.ObjectId(user_id);
    const contactId = new mongoose.Types.ObjectId(contact_id);

    const messages = await Chat.find({
      $or: [
        { sender_id: userId, receiver_id: contactId },
        { sender_id: contactId, receiver_id: userId },
      ],
    })
      .populate("sender_id", "nama email")
      .sort({ tanggal: 1 });

    // Mark as read
    await Chat.updateMany(
      {
        receiver_id: userId,
        sender_id: contactId,
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

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(sender_id) || !mongoose.Types.ObjectId.isValid(receiver_id)) {
      return res.status(400).json({ error: "Invalid sender ID or receiver ID format" });
    }

    const newChat = new Chat({
      sender_id: new mongoose.Types.ObjectId(sender_id),
      receiver_id: new mongoose.Types.ObjectId(receiver_id),
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const userId = new mongoose.Types.ObjectId(user_id);

    const count = await Chat.countDocuments({
      receiver_id: userId,
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
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Waktu tidak valid';
    }

    const now = new Date();
    const diff = now - dateObj;
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

    return dateObj.toLocaleDateString("id-ID");
  } catch (error) {
    console.error('Error formatting waktu:', error);
    return 'Waktu tidak valid';
  }
}
