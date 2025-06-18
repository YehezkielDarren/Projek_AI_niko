require("dotenv").config();
const mongoose = require("mongoose");
const CityAlias = require("./models/cityAlias.model");

const initialAliases = {
  jogja: "yogyakarta",
  joga: "yogyakarta",
  jogjakarta: "yogyakarta",
  jkt: "jakarta",
  dki: "jakarta",
  ibukota: "jakarta",
  bdg: "bandung",
  "kota kembang": "bandung",
  sby: "surabaya",
  "kota pahlawan": "surabaya",
  makasar: "makassar",
  medan: "medan",
  mdn: "medan",
  pekalongan: "pekalongan",
  "kota batik": "pekalongan",
  semarang: "semarang",
  smg: "semarang",
  solo: "surakarta",
  malang: "malang",
  "kota apel": "malang",
  denpasar: "denpasar",
  bali: "denpasar",
  palembang: "palembang",
  pempek: "palembang",
  batam: "batam",
  kepri: "batam",
  balikpapan: "balikpapan",
  bpp: "balikpapan",
  pontianak: "pontianak",
  "kota khatulistiwa": "pontianak",
  indonesia: "indonesia",
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully connected to MongoDB!");

    // Hapus data lama untuk menghindari duplikat
    await CityAlias.deleteMany({});
    console.log("Old aliases deleted.");

    const aliasArray = Object.entries(initialAliases).map(([key, value]) => ({
      alias: key,
      cityName: value,
    }));

    await CityAlias.insertMany(aliasArray);
    console.log("Database has been seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    // Tutup koneksi setelah selesai
    await mongoose.connection.close();
  }
}

seedDatabase();
