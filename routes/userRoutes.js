
const router = require("express").Router();
const { registerUser, getUsers, getUserById, updateUser, changePassword } = require("../controllers/userController");
const { deleteUser } = require("../controllers/deleteUserController");
const { verifyAdmin } = require("../middleware/auth");


router.post("/register", registerUser);
router.get("/", verifyAdmin, getUsers);
router.get("/:id", verifyAdmin, getUserById);
router.put("/:id", verifyAdmin, updateUser);
router.post("/:id/change-password", changePassword);
router.delete("/:id", verifyAdmin, deleteUser);

module.exports = router;