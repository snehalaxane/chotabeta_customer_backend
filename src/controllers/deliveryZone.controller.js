const prisma = require("../config/database");
const DeliveryZoneService = require("../services/deliveryZoneService");

class DeliveryZoneController {
  /**
   * Get all delivery zones with pagination and search.
   */
  async index(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.per_page) || 15;
      const searchTerm = req.query.search || "";

      const whereClause = { status: "active" };
      if (searchTerm) {
        whereClause.OR = [
          { name: { contains: searchTerm } },
          { slug: { contains: searchTerm } },
        ];
      }

      const total = await prisma.deliveryZone.count({ where: whereClause });
      const zones = await prisma.deliveryZone.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
      });

      const lastPage = Math.ceil(total / perPage);

      // Format zones to match superadmin response
      const formattedZones = zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        slug: zone.slug,
        center_latitude: zone.center_latitude ? zone.center_latitude.toString() : null,
        center_longitude: zone.center_longitude ? zone.center_longitude.toString() : null,
        radius_km: zone.radius_km,
        boundary_json: zone.boundary_json || [],
        rush_delivery_enabled: zone.rush_delivery_enabled,
        delivery_time_per_km: zone.delivery_time_per_km,
        rush_delivery_time_per_km: zone.rush_delivery_time_per_km,
        rush_delivery_charges: zone.rush_delivery_charges,
        regular_delivery_charges: zone.regular_delivery_charges,
        free_delivery_amount: zone.free_delivery_amount,
        distance_based_delivery_charges: zone.distance_based_delivery_charges,
        per_store_drop_off_fee: zone.per_store_drop_off_fee,
        handling_charges: zone.handling_charges,
        buffer_time: zone.buffer_time,
        status: zone.status,
        delivery_boy_base_fee: zone.delivery_boy_base_fee ? zone.delivery_boy_base_fee.toString() : null,
        delivery_boy_per_store_pickup_fee: zone.delivery_boy_per_store_pickup_fee ? zone.delivery_boy_per_store_pickup_fee.toString() : null,
        delivery_boy_distance_based_fee: zone.delivery_boy_distance_based_fee ? zone.delivery_boy_distance_based_fee.toString() : null,
        delivery_boy_per_order_incentive: zone.delivery_boy_per_order_incentive ? zone.delivery_boy_per_order_incentive.toString() : null,
        created_at: zone.createdAt,
        updated_at: zone.updatedAt,
      }));

      const response = {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total: total,
        data: formattedZones,
      };

      return res.json({
        success: true,
        message: "Delivery zones retrieved successfully.",
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get a specific delivery zone by ID.
   */
  async show(req, res) {
    try {
      const id = parseInt(req.params.id);
      const zone = await prisma.deliveryZone.findFirst({
        where: { id, status: "active" },
      });

      if (!zone) {
        return res.json({
          success: false,
          message: "Delivery zone not found",
          data: [],
        });
      }

      return res.json({
        success: true,
        message: "Delivery zone found",
        data: zone, // DeliveryZoneResource
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Check if a location is deliverable.
   */
  async checkDelivery(req, res) {
    try {
      // Support both validated query (from Zod middleware) and raw query params
      const latitude = req.validatedQuery?.latitude ?? parseFloat(req.query.latitude);
      const longitude = req.validatedQuery?.longitude ?? parseFloat(req.query.longitude);

      if (isNaN(latitude) || isNaN(longitude) || !DeliveryZoneService.validateCoordinates(latitude, longitude)) {
        return res.json({
          success: false,
          message: "Invalid coordinates. latitude and longitude are required.",
          data: [],
        });
      }

      const isDeliverable = await DeliveryZoneService.existsAtPoint(latitude, longitude);
      const zoneInfo = await DeliveryZoneService.getZonesAtPoint(latitude, longitude);

      const response = {
        is_deliverable: isDeliverable,
        zone_count: zoneInfo.zone_count,
        zone: zoneInfo.zone,
        zone_id: zoneInfo.zone_id,
        coordinates: { latitude, longitude },
      };

      const message = isDeliverable
        ? "Delivery is available at this location"
        : "Delivery is not available at this location";

      return res.json({
        success: true,
        message: message,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get stores by map bounds
   */
  async storesByMap(req, res) {
    try {
      const { ne_lat, ne_lng, sw_lat, sw_lng, latitude, longitude } = req.validatedQuery;

      const stores = await DeliveryZoneService.getStoresByBounds(
        ne_lat,
        ne_lng,
        sw_lat,
        sw_lng,
        latitude,
        longitude
      );

      return res.json(stores);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Store a newly created resource in storage.
   */
  async store(req, res) {
    try {
      const validatedData = req.validatedData; // From Zod middleware

      const is_overlap = await DeliveryZoneService.checkZoneOverlap(validatedData);
      if (is_overlap.has_overlap) {
        return res.json({
          success: false,
          message: "Delivery zone overlap error",
          data: {
            overlapping_zones: is_overlap.overlapping_zones.map((o) => o.zone.name),
            overlap_count: is_overlap.overlap_count,
            details: is_overlap.overlapping_zones,
          },
        });
      }

      const slug = await DeliveryZoneService.generateUniqueSlug(validatedData.name);

      const deliveryZone = await prisma.deliveryZone.create({
        data: {
          ...validatedData,
          slug,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Delivery zone created successfully",
        data: deliveryZone,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error creating delivery zone",
        data: error.message,
      });
    }
  }

  /**
   * Update the specified resource in storage.
   */
  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = req.validatedData;

      const existingZone = await prisma.deliveryZone.findUnique({ where: { id } });
      if (!existingZone) {
        return res.status(404).json({ success: false, message: "Delivery zone not found", data: [] });
      }

      const is_overlap = await DeliveryZoneService.checkZoneOverlap(validatedData, id);
      if (is_overlap.has_overlap) {
        return res.json({
          success: false,
          message: "Delivery zone overlap error",
          data: {
            overlapping_zones: is_overlap.overlapping_zones.map((o) => o.zone.name),
            overlap_count: is_overlap.overlap_count,
            details: is_overlap.overlapping_zones,
          },
        });
      }

      let slug = existingZone.slug;
      if (validatedData.name && validatedData.name !== existingZone.name) {
        slug = await DeliveryZoneService.generateUniqueSlug(validatedData.name);
      }

      const deliveryZone = await prisma.deliveryZone.update({
        where: { id },
        data: { ...validatedData, slug },
      });

      return res.json({
        success: true,
        message: "Delivery zone updated successfully",
        data: deliveryZone,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error updating delivery zone",
        data: error.message,
      });
    }
  }

  /**
   * Remove the specified resource from storage.
   */
  async destroy(req, res) {
    try {
      const id = parseInt(req.params.id);

      const existingZone = await prisma.deliveryZone.findUnique({ where: { id } });
      if (!existingZone) {
        return res.status(404).json({ success: false, message: "Delivery zone not found", data: [] });
      }

      await prisma.deliveryZone.delete({ where: { id } });

      return res.json({
        success: true,
        message: "Delivery zone deleted successfully",
        data: [],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error deleting delivery zone",
        data: error.message,
      });
    }
  }

  /**
   * Search delivery zones for select2 dropdown
   */
  async search(req, res) {
    try {
      const query = req.query.q || "";
      const exceptId = req.query.exceptId ? parseInt(req.query.exceptId) : null;
      const findId = req.query.find_id ? parseInt(req.query.find_id) : null;

      let zones = [];

      if (findId) {
        zones = await prisma.deliveryZone.findMany({
          where: { id: findId },
          select: { id: true, name: true },
        });
      } else {
        const whereClause = { name: { contains: query } };
        if (exceptId) {
          whereClause.id = { not: exceptId };
        }

        zones = await prisma.deliveryZone.findMany({
          where: whereClause,
          select: { id: true, name: true },
          take: 10,
        });
      }

      const results = zones.map((zone) => ({
        id: zone.id,
        value: zone.id,
        text: zone.name,
      }));

      return res.json(results);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get distinct cities from stores.
   * GET /api/stores/cities
   */
  async getCities(req, res) {
    try {
      const stores = await prisma.store.findMany({
        where: {
          city: { not: null },
        },
        select: {
          city: true,
          latitude: true,
          longitude: true,
        },
        distinct: ["city"],
        orderBy: { city: "asc" },
      });

      const cities = stores.map((store) => ({
        name: store.city,
        latitude: store.latitude ? store.latitude.toString() : null,
        longitude: store.longitude ? store.longitude.toString() : null,
      }));

      return res.json({
        success: true,
        message: "Cities fetched successfully",
        data: cities,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get stores that can deliver to a location (covering delivery zones).
   * GET /api/delivery-zone/stores?latitude=...&longitude=...
   */
  async getStoresByLocation(req, res) {
    try {
      // Support both validated query (from Zod middleware) and raw query params
      const latitude = req.validatedQuery?.latitude ?? parseFloat(req.query.latitude);
      const longitude = req.validatedQuery?.longitude ?? parseFloat(req.query.longitude);
      const page = req.validatedQuery?.page ?? (parseInt(req.query.page) || 1);
      const perPage = req.validatedQuery?.per_page ?? (parseInt(req.query.per_page) || 15);

      if (isNaN(latitude) || isNaN(longitude) || !DeliveryZoneService.validateCoordinates(latitude, longitude)) {
        return res.json({
          success: false,
          message: "Invalid coordinates. latitude and longitude are required.",
          data: {
            current_page: page,
            data: [],
            last_page: 1,
            per_page: perPage,
            total: 0
          },
        });
      }

      // 1. Get all active delivery zones
      const activeZones = await prisma.deliveryZone.findMany({
        where: { status: "active" },
      });

      // 2. Filter zones that contain the coordinate
      const matchingZones = activeZones.filter((zone) =>
        DeliveryZoneService.containsPoint(zone, latitude, longitude)
      );

      const matchingZoneIds = matchingZones.map((zone) => zone.id);

      if (matchingZoneIds.length === 0) {
        return res.json({
          success: true,
          message: "Stores fetched successfully",
          data: {
            current_page: page,
            data: [],
            last_page: 1,
            per_page: perPage,
            total: 0
          }
        });
      }

      // 3. Find stores associated with matching delivery zone IDs
      // Filter stores by visibility_status and verification_status
      const totalStoresCount = await prisma.store.count({
        where: {
          visibility_status: "visible",
          verification_status: "approved",
          storeZones: {
            some: {
              zone_id: { in: matchingZoneIds }
            }
          }
        }
      });

      const stores = await prisma.store.findMany({
        where: {
          visibility_status: "visible",
          verification_status: "approved",
          storeZones: {
            some: {
              zone_id: { in: matchingZoneIds }
            }
          }
        },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { id: "asc" }
      });

      const lastPage = Math.ceil(totalStoresCount / perPage);

      if (stores.length === 0) {
        return res.json({
          success: true,
          message: "Stores fetched successfully",
          data: {
            current_page: page,
            data: [],
            last_page: lastPage,
            per_page: perPage,
            total: totalStoresCount
          }
        });
      }

      const storeIds = stores.map((store) => store.id);

      // 4. Fetch media (logo, banner, etc.) polymorphically for these stores
      const mediaList = await prisma.$queryRawUnsafe(
        `SELECT * FROM media WHERE model_type = 'App\\\\Models\\\\Store' AND model_id IN (${storeIds.join(',')})`
      );
      
      // Map media to storeId
      const mediaMap = {};
      mediaList.forEach((media) => {
        const storeId = Number(media.model_id);
        if (!mediaMap[storeId]) {
          mediaMap[storeId] = {};
        }
        // Save the first file for each collection name
        if (!mediaMap[storeId][media.collection_name]) {
          // Construct Spatie URL
          const superadminUrl = process.env.SUPERADMIN_URL || "https://superadmin.chotabeta.com";
          mediaMap[storeId][media.collection_name] = `${superadminUrl}/storage/${media.id}/${media.file_name}`;
        }
      });

      // 5. Transform stores to match the required Laravel StoreResource format
      const formattedStores = stores.map((store) => {
        const storeId = store.id;
        const storeMedia = mediaMap[storeId] || {};

        // Calculate distance in km
        const distance = DeliveryZoneService.calculateDistance(
          Number(store.latitude),
          Number(store.longitude),
          latitude,
          longitude
        );

        // Determine if open
        const isOnline = store.status === "online";

        return {
          id: store.id,
          name: store.name,
          slug: store.slug || "",
          product_count: 0,
          description: store.description || "",
          contact_number: store.contact_number || "",
          contact_email: store.contact_email || "",
          seller_id: store.seller_id,
          tax_name: store.tax_name || "",
          tax_number: store.tax_number || "",
          bank_name: store.bank_name || "",
          bank_branch_code: store.bank_branch_code || "",
          account_holder_name: store.account_holder_name || "",
          account_number: store.account_number || "",
          routing_number: store.routing_number || "",
          bank_account_type: store.bank_account_type || "",
          currency_code: store.currency_code || "INR",
          max_delivery_distance: Number(store.max_delivery_distance || 0),
          order_preparation_time: Number(store.order_preparation_time || 0),
          promotional_text: store.promotional_text || null,
          about_us: store.about_us || "",
          return_replacement_policy: store.return_replacement_policy || "",
          refund_policy: store.refund_policy || "",
          terms_and_conditions: store.terms_and_conditions || "",
          delivery_policy: store.delivery_policy || "",
          domestic_shipping_charges: store.domestic_shipping_charges ? store.domestic_shipping_charges.toString() : null,
          international_shipping_charges: store.international_shipping_charges ? store.international_shipping_charges.toString() : null,
          metadata: store.metadata || null,
          fulfillment_type: store.fulfillment_type || "hyperlocal",
          address: store.address || "",
          city: store.city || "",
          landmark: store.landmark || "",
          state: store.state || "",
          country: store.country || "",
          country_code: store.country_code || "",
          zipcode: store.zipcode || "",
          latitude: store.latitude ? store.latitude.toString() : null,
          longitude: store.longitude ? store.longitude.toString() : null,
          distance: Number(distance.toFixed(2)),
          timing: store.timing || "",
          logo: storeMedia.logo || null,
          banner: storeMedia.banner || null,
          same_location: distance < 0.1,
          address_proof: storeMedia.address_proof || null,
          voided_check: storeMedia.voided_check || null,
          avg_products_rating: "0.00",
          avg_store_rating: "0.00",
          total_store_feedback: 0,
          created_at: store.createdAt,
          updated_at: store.updatedAt,
          verification_status: store.verification_status,
          visibility_status: store.visibility_status,
          status: {
            is_open: isOnline,
            status: store.status || "online",
            manual_status: store.status || "online",
            timing: store.timing || ""
          }
        };
      });

      return res.json({
        success: true,
        message: "Stores fetched successfully",
        data: {
          current_page: page,
          data: formattedStores,
          last_page: lastPage,
          per_page: perPage,
          total: totalStoresCount
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DeliveryZoneController();
