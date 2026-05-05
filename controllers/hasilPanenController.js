const HasilPanen = require("../models/HasilPanen");

// TAMBAH PANEN (Oleh Petani)
exports.createPanen = async (req, res) => {
  try {
    const { user_id, nama_komoditas, jumlah, kualitas, status, tanggal, deskripsi, harga, lokasi } = req.body;
    
    const panenData = {
      user_id,
      nama_komoditas,
      jumlah: Number(jumlah),
      harga: Number(harga), // Simpan Harga
      lokasi: lokasi,       // Simpan Lokasi
      kualitas,
      status: status || "Tersedia", // Jika kosong, set default Tersedia
      tanggal: tanggal || new Date(),
      deskripsi,
      foto: [],
    };

    // Debug logging: tampilkan informasi file yang diterima (jika ada)
    if (req.file) {
      console.log("Received single file:", req.file.filename, req.file.path);
      panenData.foto = [{ path: `/uploads/${req.file.filename}` }];
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log("Received multiple files:", req.files.map(f=>f.filename));
      panenData.foto = req.files.map((f) => ({ path: `/uploads/${f.filename}` }));
    } else if (req.body && req.body.foto) {
      // Jika client mengirim path/URL langsung di body
      try {
        const parsed = typeof req.body.foto === 'string' ? JSON.parse(req.body.foto) : req.body.foto;
        if (Array.isArray(parsed)) {
          panenData.foto = parsed.map((p) => (typeof p === 'string' ? { path: p } : p));
        } else if (typeof parsed === 'string') {
          panenData.foto = [{ path: parsed }];
        }
      } catch (e) {
        // bukan JSON, anggap string path
        panenData.foto = [{ path: req.body.foto }];
      }
    } else {
      console.warn('No file received in createPanen request (req.file/req.files missing)');
    }

    const data = await HasilPanen.create(panenData);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// GET SEMUA PANEN
exports.getPanen = async (req, res) => {
  try {
    const data = await HasilPanen.find().populate("user_id");
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET PANEN DENGAN KUALITAS GRADE C (UNTUK PEMULIHAN)
exports.getPanenGradeC = async (req, res) => {
  try {
    const data = await HasilPanen.find({
      $or: [
        { kualitas: { $regex: /grade c/i } },
        { kualitas: { $regex: /rusak/i } }
      ]
    }).populate("user_id");
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET PANEN DENGAN RECOVERY (UNTUK PEDAGANG)
exports.getPanenRecovery = async (req, res) => {
  try {
    const data = await HasilPanen.find({
      "recovery.jenis": { $exists: true, $ne: null }
    }).populate("user_id");
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET SATU PANEN BY ID
exports.getPanenById = async (req, res) => {
  try {
    const data = await HasilPanen.findById(req.params.id).populate("user_id");
    if (!data) {
      return res.status(404).json({ message: "Panen tidak ditemukan" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE PANEN (TERMASUK RECOVERY)
exports.updatePanen = async (req, res) => {
  try {
    const data = await HasilPanen.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("user_id");
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE RECOVERY PANEN
exports.updatePanenRecovery = async (req, res) => {
  try {
    const { recovery } = req.body;
    const data = await HasilPanen.findByIdAndUpdate(
      req.params.id,
      { recovery },
      { new: true }
    ).populate("user_id");
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// DELETE PANEN
exports.deletePanen = async (req, res) => {
  try {
    await HasilPanen.findByIdAndDelete(req.params.id);
    res.json({ message: "Panen dihapus" });
  } catch (err) {
    res.status(500).json(err);
  }
};