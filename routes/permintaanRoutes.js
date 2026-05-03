const router = require("express").Router();
const {
  createPermintaan,
  getPermintaan,
  getPermintaanById, 
  matchPermintaan,
  konfirmasiPesanan, 
} = require("../controllers/permintaanController");

router.post("/", createPermintaan);
router.get("/", getPermintaan);
router.get("/:id", getPermintaanById); // Link untuk Detail Matching
router.post("/match/:id", matchPermintaan);
router.put("/konfirmasi/:id", konfirmasiPesanan); // Link untuk tombol Setuju/Batal

module.exports = router;
