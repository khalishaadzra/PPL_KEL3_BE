const router = require("express").Router();
const upload = require("../config/multer");
const {
  createPanen,
  getPanen,
  getPanenGradeC,
  getPanenRecovery,
  getPanenById,
  updatePanen,
  updatePanenRecovery,
  deletePanen
} = require("../controllers/hasilPanenController");

router.post("/", upload.single('gambar'), createPanen);
router.get("/", getPanen);
router.get("/grade-c", getPanenGradeC);
router.get("/recovery", getPanenRecovery);
router.get("/:id", getPanenById);
router.put("/:id", updatePanen);
router.put("/:id/recovery", updatePanenRecovery);
router.delete("/:id", deletePanen);

module.exports = router;