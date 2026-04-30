const router = require("express").Router();
const { registerUser, getUsers } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/", getUsers);

module.exports = router;