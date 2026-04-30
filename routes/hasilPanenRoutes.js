const router = require("express").Router();
const {
  createPanen,
  getPanen,
  updatePanen,
  deletePanen
} = require("../controllers/hasilPanenController");

router.post("/", createPanen);
router.get("/", getPanen);
router.put("/:id", updatePanen);
router.delete("/:id", deletePanen);

module.exports = router;