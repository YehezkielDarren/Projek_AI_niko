const express = require("express");
const router = express.Router();

const { processMessage } = require("../controllers/chat.controller");

router.post("/message", processMessage);

module.exports = router;
