const User = require("../models/User");
const bcrypt = require("bcrypt");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    console.log("Data pendaftaran masuk:", req.body);
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET ALL USERS
exports.getUsers = async (req, res) => {
  const data = await User.find();
  res.json(data);
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, alamat } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { nama, email, alamat },
      { new: true },
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { passwordLama, passwordBaru } = req.body;

    // Cek user ada atau tidak
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Verifikasi password lama (simple check untuk saat ini)
    if (user.password !== passwordLama) {
      return res.status(401).json({ message: 'Password lama tidak sesuai' });
    }

    // Update password baru
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: passwordBaru },
      { new: true }
    );

    res.json({ message: 'Password berhasil diubah', user: updatedUser });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Gagal mengubah password', error: err.message });
  }
};