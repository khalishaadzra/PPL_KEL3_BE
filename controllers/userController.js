const User = require("../models/User");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
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