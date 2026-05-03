const axios = require("axios");

exports.getWeather = async (req, res) => {
  try {
    // Ambil kota dari query parameter, jika tidak ada baru gunakan "Banda Aceh" sebagai default
    const city = req.query.city || "Banda Aceh";
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
    );

    const data = response.data;

    res.json({
      lokasi: data.name, // Nama kota yang ditemukan oleh OpenWeather
      suhu: data.main.temp.toFixed(1),
      kelembapan: data.main.humidity,
      angin: data.wind.speed.toFixed(1),
      kondisi: data.weather[0].main,
      deskripsi:
        data.weather[0].description.charAt(0).toUpperCase() +
        data.weather[0].description.slice(1),
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    });
  } catch (error) {
    // Jika kota tidak ditemukan, kirim error agar frontend bisa pakai fallback
    res.status(404).json({
      message: "Lokasi tidak ditemukan",
    });
  }
};
