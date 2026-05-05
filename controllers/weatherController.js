const axios = require("axios");

function formatWeatherResponse(data) {
  return {
    lokasi: data.name,
    suhu: data.main.temp.toFixed(1),
    kelembapan: data.main.humidity,
    angin: data.wind.speed.toFixed(1),
    kondisi: data.weather[0].main,
    deskripsi:
      data.weather[0].description.charAt(0).toUpperCase() +
      data.weather[0].description.slice(1),
    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
  };
}

exports.getWeather = async (req, res) => {
  try {
    // Ambil kota dari query parameter, jika tidak ada baru gunakan "Banda Aceh" sebagai default
    const city = req.query.city || "Banda Aceh";
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const fetchWeather = async (targetCity) => axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&appid=${apiKey}&units=metric`,
    );

    let response;
    try {
      response = await fetchWeather(city);
    } catch (primaryError) {
      if (city.toLowerCase() !== "banda aceh") {
        response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=Banda%20Aceh&appid=${apiKey}&units=metric`,
        );
      } else {
        throw primaryError;
      }
    }

    res.json(formatWeatherResponse(response.data));
  } catch (error) {
    // Fallback terakhir agar UI tetap dapat data saat OpenWeather gagal total
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Banda%20Aceh&appid=${apiKey}&units=metric`,
      );

      res.json(formatWeatherResponse(response.data));
    } catch (fallbackError) {
      res.status(500).json({
        message: "Gagal mengambil data cuaca",
      });
    }
  }
};
