require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const chatRoutes = require("./routes/chat.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/chat", chatRoutes);

const clientOptions = {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

// Connect to MongoDB
// Pola koneksi untuk server yang berjalan terus-menerus
async function startServer() {
  try {
    // Gunakan URI dari file .env Anda
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    console.log("Successfully connected to MongoDB!");

    // Jalankan server HANYA SETELAH koneksi DB berhasil
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  } catch (err) {
    console.error("Could not connect to MongoDB", err);
    process.exit(1); // Keluar dari proses jika koneksi DB gagal
  }
}

startServer();
