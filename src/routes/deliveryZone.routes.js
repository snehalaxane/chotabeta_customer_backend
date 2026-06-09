const express = require("express");
const router = express.Router();

const deliveryZoneController = require("../controllers/deliveryZone.controller");
const {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
  checkDeliverySchema,
  storesByMapSchema,
  validateBody,
  validateQuery,
} = require("../validations/deliveryZone.validation");

// ─── Public / Customer API Routes ────────────────────────────────────────────

/**
 * GET /api/delivery-zones
 * Get all active delivery zones with pagination and optional search.
 * Query params: page, per_page, search
 */
router.get("/", deliveryZoneController.index);

/**
 * GET /api/delivery-zones/:id
 * Get a single active delivery zone by ID.
 */
router.get("/:id", deliveryZoneController.show);

/**
 * GET /api/delivery-zones/check/delivery
 * Check if delivery is available at a specific lat/lng.
 * Query params: latitude, longitude
 */
router.get(
  "/check/delivery",
  validateQuery(checkDeliverySchema),
  deliveryZoneController.checkDelivery
);

/**
 * GET /api/delivery-zones/stores/map
 * Get stores within a given map bounding box.
 * Query params: ne_lat, ne_lng, sw_lat, sw_lng, latitude (optional), longitude (optional)
 */
router.get(
  "/stores/map",
  validateQuery(storesByMapSchema),
  deliveryZoneController.storesByMap
);

/**
 * GET /api/delivery-zones/search
 * Search delivery zones for a dropdown/select.
 * Query params: q, exceptId, find_id
 */
router.get("/search/list", deliveryZoneController.search);

// ─── Admin / Management Routes ────────────────────────────────────────────────

/**
 * POST /api/delivery-zones
 * Create a new delivery zone.
 */
router.post(
  "/",
  validateBody(createDeliveryZoneSchema),
  deliveryZoneController.store
);

/**
 * PUT /api/delivery-zones/:id
 * Update an existing delivery zone.
 */
router.put(
  "/:id",
  validateBody(updateDeliveryZoneSchema),
  deliveryZoneController.update
);

/**
 * DELETE /api/delivery-zones/:id
 * Delete a delivery zone.
 */
router.delete("/:id", deliveryZoneController.destroy);

module.exports = router;
