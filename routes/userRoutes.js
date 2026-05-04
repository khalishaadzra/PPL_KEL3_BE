const router = require("express").Router();
const { registerUser, getUsers, getUserById, updateUser, changePassword } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.post("/:id/change-password", changePassword);

module.exports = router;