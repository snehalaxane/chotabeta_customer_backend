const express = require("express");
const prisma = require("./config/database");
const app = express();



const authRoutes = require("./routes/auth.routes");
const deliveryZoneRoutes = require("./routes/deliveryZone.routes");
const deliveryZoneController = require("./controllers/deliveryZone.controller");
const { getStoresByLocationSchema, validateQuery } = require("./validations/deliveryZone.validation");
const settingsRoutes = require("./routes/settings.routes");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/delivery-zones", deliveryZoneRoutes);
app.use("/api/settings", settingsRoutes);

// Singular route to match superadmin URL: /api/delivery-zone/check?latitude=...&longitude=...
app.get("/api/delivery-zone/check", deliveryZoneController.checkDelivery);

// Get stores by location: /api/delivery-zone/stores?latitude=...&longitude=...
app.get(
  "/api/delivery-zone/stores",
  validateQuery(getStoresByLocationSchema),
  deliveryZoneController.getStoresByLocation
);

// Store cities route: /api/stores/cities
app.get("/api/stores/cities", deliveryZoneController.getCities);

prisma.$connect()
  .then(() => {
    console.log("✅ Database Connected (Prisma)");
  })
  .catch((err) => {
    console.error("❌ Database Error:", err.message);
  });

  app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Working"
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    res.json({ success: true, db_connection: "OK" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = app;