const axios = require("axios");

exports.getWeather = async (req, res) => {
  try {
    const city = "Banda Aceh";
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
    );

    const data = response.data;

    res.json({
      lokasi: data.name,
      waktu: new Date(data.dt * 1000).toLocaleString(),

      suhu: data.main.temp.toFixed(1), // 29.3
      kelembapan: data.main.humidity,

      angin: data.wind.speed.toFixed(1), // 2.7
      pressure: data.main.pressure,

      kondisi: data.weather[0].main,

      deskripsi:
        data.weather[0].description.charAt(0).toUpperCase() +
        data.weather[0].description.slice(1),

      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data cuaca",
      error: error.message,
    });
  }
};
