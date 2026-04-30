const router = require("express").Router();
const {
  createPermintaan,
  getPermintaan,
  matchPermintaan
} = require("../controllers/permintaanController");

router.post("/", createPermintaan);
router.get("/", getPermintaan);
router.post("/match/:id", matchPermintaan);

module.exports = router;