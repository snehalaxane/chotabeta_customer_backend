const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings.controller");

router.get("/", settingsController.getSettings);

module.exports = router;
