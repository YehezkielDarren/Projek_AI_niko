const axios = require("axios");
const Message = require("../models/message.model");
const CityAlias = require("../models/cityAlias.model");

function detectIntent(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("gempa") || lowerText.includes("lindu"))
    return "earthquake";
  if (
    lowerText.includes("cuaca") ||
    lowerText.includes("hujan") ||
    lowerText.includes("panas") ||
    lowerText.includes("suhu") ||
    lowerText.includes("berawan")
  )
    return "weather";
  if (
    lowerText.includes("hai") ||
    lowerText.includes("halo") ||
    lowerText.includes("selamat pagi")
  )
    return "greeting";
  return "weather"; // Default ke cuaca jika tidak jelas
}

// tambahkan untuk query db
async function extractCity(text) {
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, " ");
  const words = cleanText.split(" ");

  for (const word of words) {
    const foundAlias = await CityAlias.findOne({ alias: word });
    if (foundAlias) {
      return foundAlias.cityName;
    }
  }

  // Fallback: Jika tidak ada alias yang cocok, coba cari nama kota resmi secara langsung
  const allAliases = await CityAlias.find({});
  for (const aliasDoc of allAliases) {
    if (cleanText.includes(aliasDoc.cityName)) {
      return aliasDoc.cityName;
    }
  }

  return null;
}

function translateCondition(condition) {
  const translations = {
    sunny: "cerah",
    clear: "cerah",
    "partly cloudy": "berawan sebagian",
    cloudy: "berawan",
    overcast: "mendung",
    mist: "berkabut",
    "patchy rain possible": "kemungkinan hujan ringan",
    "light rain": "hujan ringan",
    "moderate rain": "hujan sedang",
    "heavy rain": "hujan lebat",
    thunderstorm: "badai petir",
    "light drizzle": "gerimis ringan",
    fog: "berkabut",
  };
  return translations[condition.toLowerCase()] || condition;
}

// Fungsi untuk menangani permintaan info gempa
async function handleEarthquakeQuery(location) {
  // Jika user menyebutkan lokasi spesifik dan itu BUKAN Indonesia
  if (location && location.toLowerCase() !== "indonesia") {
    // Cek apakah lokasi ada di daftar alias kita (artinya kota di Indonesia)
    const isIndonesianCity = Object.values(cityAliases).includes(
      location.toLowerCase()
    );
    if (!isIndonesianCity) {
      return `Maaf, saat ini saya hanya memiliki akses ke data gempa dari BMKG untuk wilayah Indonesia. Saya tidak bisa memeriksa data untuk ${location}.`;
    }
  }

  // Jika tidak ada lokasi atau lokasinya Indonesia, lanjutkan seperti biasa
  try {
    const response = await axios.get(
      "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json"
    );
    const gempa = response.data.Infogempa.gempa[0];
    return `Menurut data BMKG, gempa terbaru di wilayah Indonesia adalah: ${gempa.Magnitude} SR di ${gempa.Wilayah}, pada ${gempa.Tanggal} ${gempa.Jam}.`;
  } catch (error) {
    console.error("BMKG API Error:", error);
    return "Maaf, gagal mengambil data gempa dari BMKG saat ini.";
  }
}

// Fungsi untuk menangani permintaan info cuaca
async function handleWeatherQuery(city) {
  if (!city) {
    return "Mohon sebutkan nama kota untuk mengetahui cuacanya.";
  }
  try {
    const weatherResponse = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}&lang=id`
    );
    const weatherData = weatherResponse.data;
    const condition = translateCondition(weatherData.current.condition.text);
    return `Cuaca di ${weatherData.location.name} saat ini ${condition} dengan suhu ${weatherData.current.temp_c}°C.`;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return `Maaf, saya tidak dapat menemukan kota "${city}". Mohon coba nama kota lain.`;
    }
    console.error("Weather API Error:", error);
    return "Maaf, terjadi kesalahan saat mengambil data cuaca.";
  }
}

exports.processMessage = async (req, res) => {
  try {
    // Kita butuh message dan sessionId dari frontend
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
      return res
        .status(400)
        .json({ error: "Message and sessionId are required" });
    }

    // 2. SIMPAN PESAN PENGGUNA KE DATABASE
    const userMessage = new Message({
      sessionId: sessionId,
      isUser: true,
      text: message,
    });
    await userMessage.save();

    // --- Logika untuk menentukan balasan bot (tetap sama) ---
    const intent = detectIntent(message);
    let botReplyText = "";
    const location = await extractCity(message);

    switch (intent) {
      case "greeting":
        botReplyText =
          "Halo! Ada yang bisa saya bantu terkait cuaca atau gempa?";
        break;
      case "earthquake":
        botReplyText = await handleEarthquakeQuery(location);
        break;
      case "weather":
        botReplyText = await handleWeatherQuery(location);
        break;
      default:
        botReplyText =
          "Maaf, saya tidak mengerti. Anda bisa bertanya tentang cuaca atau gempa.";
        break;
    }

    // 3. SIMPAN BALASAN BOT KE DATABASE
    const botMessage = new Message({
      sessionId: sessionId,
      isUser: false,
      text: botReplyText,
    });
    await botMessage.save();

    // Kirim balasan ke frontend
    res.json({ reply: botReplyText });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ reply: "Maaf, terjadi kesalahan di server." });
  }
};
