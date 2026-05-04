// controllers/permintaanController.js
const Permintaan = require("../models/Permintaan");
const HasilPanen = require("../models/HasilPanen");

/**
 * 1. FUNGSI CREATE (Untuk InputKebutuhan.tsx)
 * Menyimpan permintaan awal dari pedagang.
 */
exports.createPermintaan = async (req, res) => {
  try {
    const { user_id, nama_komoditas, jumlah, kualitas, tanggal } = req.body;

    // Generate nomor permintaan unik (Contoh: TKR-AGR-1234)
    const nomor_permintaan = `TKR-AGR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPermintaan = new Permintaan({
      user_id,
      nomor_permintaan,
      nama_komoditas,
      jumlah: Number(jumlah),
      kualitas,
      tanggal,
      status: "Diajukan", // Status awal
    });

    const saved = await newPermintaan.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Create Permintaan Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2. FUNGSI GET ALL (Untuk RiwayatPedagang.tsx)
 */
exports.getPermintaan = async (req, res) => {
  try {
    const data = await Permintaan.find().populate("user_id", "nama alamat");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3. FUNGSI GET BY ID (Untuk HasilMatching.tsx)
 */
exports.getPermintaanById = async (req, res) => {
  try {
    const data = await Permintaan.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4. FUNGSI MATCHING
 * Mencari stok petani dan menyimpannya ke record permintaan.
 */
exports.matchPermintaan = async (req, res) => {
  try {
    const { id } = req.params;
    const permintaan = await Permintaan.findById(id);

    if (!permintaan)
      return res.status(404).json({ message: "Permintaan tidak ditemukan" });

    // 1. Bersihkan data input (Hapus spasi liar)
    const namaCari = permintaan.nama_komoditas.trim();
    const kualitasCari = permintaan.kualitas.trim();
    const tglButuh = new Date(permintaan.tanggal);

    console.log(
      `Mencari: ${namaCari} | Grade: ${kualitasCari} | Sebelum: ${tglButuh}`,
    );

    // 2. Query ke Koleksi HasilPanen
    const stokTersedia = await HasilPanen.find({
      // Cari nama yang mirip (Wortel/wortel/WORTEL)
      nama_komoditas: { $regex: new RegExp("^" + namaCari + "$", "i") },
      // Cari grade yang sama persis (A/B/C)
      kualitas: { $regex: new RegExp("^" + kualitasCari + "$", "i") },
      // Stok harus masih ada
      jumlah: { $gt: 0 },
      // Logika Tanggal: Panen Petani harus sudah ada sebelum/pada tanggal butuh pedagang
      tanggal: { $lte: tglButuh },
    }).populate("user_id", "nama alamat");

    console.log("Stok ditemukan di DB:", stokTersedia.length);

    let totalTerkumpul = 0;
    let matches = [];
    const targetKebutuhan = permintaan.jumlah;

    // 3. Looping Alokasi
    for (let stok of stokTersedia) {
      if (totalTerkumpul < targetKebutuhan) {
        let sisaKebutuhan = targetKebutuhan - totalTerkumpul;
        let diambil = Math.min(stok.jumlah, sisaKebutuhan);

        totalTerkumpul += diambil;
        matches.push({
          hasil_panen_id: stok._id,
          petani_nama: stok.user_id?.nama || "Petani",
          jumlah_diambil: diambil,
          lokasi: stok.lokasi || stok.user_id?.alamat || "Lokasi tidak set",
          harga_per_kg: stok.harga || 0,
        });
      }
    }

    // 4. Update Status Permintaan
    // Jika tidak ada petani ditemukan sama sekali, baru Dibatalkan
    permintaan.status =
      matches.length > 0 ? "Menunggu Konfirmasi" : "Dibatalkan";
    permintaan.matches = matches;
    await permintaan.save();

    res.json({
      success: true,
      message: matches.length > 0 ? "Match Berhasil" : "Stok tidak ditemukan",
      data: {
        nomor_permintaan: permintaan.nomor_permintaan,
        total_ditemukan: totalTerkumpul,
        status: permintaan.status,
        list_petani: matches,
        kualitas: permintaan.kualitas,
        biaya: {
          harga_dasar: matches.length > 0 ? matches[0].harga_per_kg : 0,
          logistik: 200,
        },
      },
    });
  } catch (err) {
    console.error("Match Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5. FUNGSI KONFIRMASI (Untuk Tombol di HasilMatching.tsx)
 * Mengubah status ke Selesai/Batal dan MEMOTONG STOK PETANI.
 */
exports.konfirmasiPesanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { tindakan } = req.body; // 'setuju' atau 'batal'

    console.log(`[KONFIRMASI] ID: ${id}, Tindakan: ${tindakan}`);

    const permintaan = await Permintaan.findById(id);
    if (!permintaan) {
      console.log(`[KONFIRMASI] Pesanan ${id} tidak ditemukan`);
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    console.log(`[KONFIRMASI] Pesanan ditemukan: ${permintaan.nomor_permintaan}, Matches: ${permintaan.matches?.length || 0}`);

    const statusAkhir = tindakan === "setuju" ? "Selesai" : "Dibatalkan";

    // JIKA SETUJU: Potong stok di database petani (HasilPanen)
    if (tindakan === "setuju") {
      const matchesArray = Array.isArray(permintaan.matches) ? permintaan.matches : [];
      console.log(`[KONFIRMASI] Processing ${matchesArray.length} matches`);

      if (matchesArray.length > 0) {
        for (let item of matchesArray) {
          if (!item || !item.hasil_panen_id) {
            console.log(`[KONFIRMASI] WARN: Invalid match item`);
            continue;
          }

          console.log(`[KONFIRMASI] Mengurangi stok: Panen ID ${item.hasil_panen_id}, Jumlah: -${item.jumlah_diambil} Kg`);
          
          const beforeUpdate = await HasilPanen.findById(item.hasil_panen_id);
          console.log(`[KONFIRMASI] Stok sebelum: ${beforeUpdate?.jumlah || 0} Kg`);

          const result = await HasilPanen.findByIdAndUpdate(
            item.hasil_panen_id,
            { $inc: { jumlah: -item.jumlah_diambil } },
            { new: true }
          );

          console.log(`[KONFIRMASI] Stok sesudah: ${result?.jumlah || 0} Kg`);
        }
      } else {
        console.log(`[KONFIRMASI] WARN: Tidak ada matches, stok tidak dikurangi`);
      }
    }

    permintaan.status = statusAkhir;
    const savedPermintaan = await permintaan.save();
    console.log(`[KONFIRMASI] Status permintaan diubah menjadi: ${statusAkhir}`);

    res.json({ 
      message: `Pesanan berhasil ${statusAkhir}`, 
      data: savedPermintaan 
    });
  } catch (err) {
    console.error("Konfirmasi Error:", err);
    res.status(500).json({ error: err.message });
  }
};
