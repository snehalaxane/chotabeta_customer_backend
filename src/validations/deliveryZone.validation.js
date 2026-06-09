const { z } = require("zod");

// Helper schema for boundary JSON to ensure it is valid JSON if provided as string
const jsonString = z
  .string()
  .refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Invalid JSON format" }
  )
  .transform((val) => JSON.parse(val))
  .optional()
  .nullable();

const createDeliveryZoneSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255, "Name too long"),
    center_latitude: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    center_longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    radius_km: z.number().min(0.1, "Radius must be at least 0.1 km"),
    delivery_time_per_km: z.number().min(0).default(0),
    buffer_time: z.number().min(0).default(0),
    boundary_json: z.any().optional(), // Can be string or object
    status: z.enum(["active", "inactive"]).default("active"),
    rush_delivery_enabled: z.boolean().default(false),
    rush_delivery_time_per_km: z.number().min(0).nullable().optional(),
    rush_delivery_charges: z.number().min(0).nullable().optional(),
    regular_delivery_charges: z.number().min(0).default(0),
    free_delivery_amount: z.number().min(0).nullable().optional(),
    distance_based_delivery_charges: z.number().min(0).nullable().optional(),
    per_store_drop_off_fee: z.number().min(0).nullable().optional(),
    handling_charges: z.number().min(0).nullable().optional(),
    delivery_boy_base_fee: z.number().min(0).nullable().optional(),
    delivery_boy_per_store_pickup_fee: z.number().min(0).nullable().optional(),
    delivery_boy_distance_based_fee: z.number().min(0).nullable().optional(),
    delivery_boy_per_order_incentive: z.number().min(0).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.rush_delivery_enabled) {
        return data.rush_delivery_time_per_km !== undefined && data.rush_delivery_time_per_km !== null;
      }
      return true;
    },
    {
      message: "rush_delivery_time_per_km is required when rush_delivery_enabled is true",
      path: ["rush_delivery_time_per_km"],
    }
  )
  .refine(
    (data) => {
      if (data.rush_delivery_enabled) {
        return data.rush_delivery_charges !== undefined && data.rush_delivery_charges !== null;
      }
      return true;
    },
    {
      message: "rush_delivery_charges is required when rush_delivery_enabled is true",
      path: ["rush_delivery_charges"],
    }
  );

// For update, the shape is similar, but perhaps fields are optional,
// however Laravel rules don't mark most as nullable except the ones that are naturally nullable.
const updateDeliveryZoneSchema = createDeliveryZoneSchema;

const validateBody = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.validatedData = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path.join(".")] = [err.message];
      });
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        data: formattedErrors,
      });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const checkDeliverySchema = z.object({
  latitude: z.preprocess(
    (val) => parseFloat(val),
    z.number().min(-90).max(90)
  ),
  longitude: z.preprocess(
    (val) => parseFloat(val),
    z.number().min(-180).max(180)
  ),
});

const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.validatedQuery = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path.join(".")] = [err.message];
      });
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        data: formattedErrors,
      });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const storesByMapSchema = z.object({
  ne_lat: z.preprocess((val) => parseFloat(val), z.number()),
  ne_lng: z.preprocess((val) => parseFloat(val), z.number()),
  sw_lat: z.preprocess((val) => parseFloat(val), z.number()),
  sw_lng: z.preprocess((val) => parseFloat(val), z.number()),
  latitude: z.preprocess((val) => (val ? parseFloat(val) : undefined), z.number().optional()),
  longitude: z.preprocess((val) => (val ? parseFloat(val) : undefined), z.number().optional()),
});

const getStoresByLocationSchema = z.object({
  latitude: z.preprocess(
    (val) => parseFloat(val),
    z.number().min(-90).max(90)
  ),
  longitude: z.preprocess(
    (val) => parseFloat(val),
    z.number().min(-180).max(180)
  ),
  page: z.preprocess(
    (val) => (val ? parseInt(val) : 1),
    z.number().int().min(1).optional().default(1)
  ),
  per_page: z.preprocess(
    (val) => (val ? parseInt(val) : 15),
    z.number().int().min(1).optional().default(15)
  ),
});

module.exports = {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
  checkDeliverySchema,
  storesByMapSchema,
  getStoresByLocationSchema,
  validateBody,
  validateQuery,
};
