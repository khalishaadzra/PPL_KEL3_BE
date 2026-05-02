const router = require("express").Router();
const upload = require("../config/multer");
const {
  createPanen,
  getPanen,
  getPanenById,
  updatePanen,
  deletePanen
} = require("../controllers/hasilPanenController");

router.post("/", upload.single('gambar'), createPanen);
router.get("/", getPanen);
router.get("/:id", getPanenById);
router.put("/:id", updatePanen);
router.delete("/:id", deletePanen);

module.exports = router;