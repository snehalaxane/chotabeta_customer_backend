const prisma = require("../config/database");
const DeliveryZoneService = require("../services/deliveryZoneService").default;

class StoreController {
  /**
   * Get specific store details by slug.
   * GET /api/stores/:slug
   */
  async showBySlug(req, res) {
    try {
      const { slug } = req.params;
      const userLat = parseFloat(req.query.latitude);
      const userLng = parseFloat(req.query.longitude);

      // 1. Fetch store by slug
      const store = await prisma.store.findFirst({
        where: {
          slug,
          visibility_status: "visible",
          verification_status: "approved",
        },
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
          data: null,
        });
      }

      // 2. Fetch media (logo, banner, etc.) polymorphically for this store
      const mediaList = await prisma.$queryRawUnsafe(
        `SELECT * FROM media WHERE model_type = 'App\\\\Models\\\\Store' AND model_id = ${store.id}`
      );

      // Map media
      const storeMedia = {};
      mediaList.forEach((media) => {
        if (!storeMedia[media.collection_name]) {
          const superadminUrl = process.env.SUPERADMIN_URL || "https://superadmin.chotabeta.com";
          storeMedia[media.collection_name] = `${superadminUrl}/storage/${media.id}/${media.file_name}`;
        }
      });

      // 3. Calculate distance if user lat/lng are provided
      let distance = null;
      if (!isNaN(userLat) && !isNaN(userLng) && DeliveryZoneService.validateCoordinates(userLat, userLng)) {
        distance = DeliveryZoneService.calculateDistance(
          Number(store.latitude),
          Number(store.longitude),
          userLat,
          userLng
        );
        distance = Number(distance.toFixed(2));
      }

      // 4. Determine if open
      const isOnline = store.status === "online";

      // 5. Format store response to match StoreResource exactly
      const formattedStore = {
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
        distance: distance,
        timing: store.timing || "",
        logo: storeMedia.logo || null,
        banner: storeMedia.banner || null,
        same_location: distance !== null ? distance < 0.1 : false,
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

      return res.json({
        success: true,
        message: "Store details fetched successfully",
        data: formattedStore,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new StoreController();
