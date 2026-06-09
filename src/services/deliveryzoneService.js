const prisma = require("../config/database");

class DeliveryZoneService {
  /**
   * Check if a point exists inside a delivery zone
   */
  static containsPoint(zone, latitude, longitude) {
    if (zone.boundary_json && Object.keys(zone.boundary_json).length > 0) {
      return this.isPointInPolygon(zone, latitude, longitude);
    }
    return this.isPointInRadius(zone, latitude, longitude);
  }

  /**
   * Check if point is within radius
   */
  static isPointInRadius(zone, latitude, longitude) {
    const distance = this.calculateDistance(
      Number(zone.center_latitude),
      Number(zone.center_longitude),
      latitude,
      longitude
    );
    return distance <= zone.radius_km;
  }

  /**
   * Point in polygon check using ray casting algorithm
   */
  static isPointInPolygon(zone, latitude, longitude) {
    let polygon = zone.boundary_json;
    if (typeof polygon === "string") {
      try {
        polygon = JSON.parse(polygon);
      } catch (e) {
        return this.isPointInRadius(zone, latitude, longitude);
      }
    }

    let coordinates;
    if (polygon?.coordinates && polygon.coordinates[0]) {
      coordinates = polygon.coordinates[0];
    } else if (polygon && (polygon[0]?.lat || polygon[0]?.latitude)) {
      coordinates = polygon;
    } else {
      return this.isPointInRadius(zone, latitude, longitude);
    }

    let intersections = 0;
    const vertexCount = coordinates.length;

    for (let i = 0; i < vertexCount; i++) {
      const j = (i + 1) % vertexCount;

      const xi = coordinates[i].lat ?? coordinates[i].latitude ?? coordinates[i][1] ?? 0;
      const yi = coordinates[i].lng ?? coordinates[i].longitude ?? coordinates[i][0] ?? 0;
      const xj = coordinates[j].lat ?? coordinates[j].latitude ?? coordinates[j][1] ?? 0;
      const yj = coordinates[j].lng ?? coordinates[j].longitude ?? coordinates[j][0] ?? 0;

      if (
        (yi > longitude !== yj > longitude) &&
        latitude < ((xj - xi) * (longitude - yi)) / (yj - yi) + xi
      ) {
        intersections++;
      }
    }

    return intersections % 2 === 1;
  }

  /**
   * Calculate the distance between two points using Haversine formula
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Earth's radius in kilometers
    const toRad = (value) => (value * Math.PI) / 180;

    const latDiff = toRad(lat2 - lat1);
    const lonDiff = toRad(lon2 - lon1);

    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(lonDiff / 2) *
        Math.sin(lonDiff / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  /**
   * Get zones that contain the given coordinates
   */
  static async getZonesAtPoint(latitude, longitude) {
    const activeZones = await prisma.deliveryZone.findMany({
      where: { status: "active" },
    });

    const matchingZones = activeZones.filter((zone) =>
      this.containsPoint(zone, latitude, longitude)
    );

    const zone = matchingZones.length > 0 ? matchingZones[0] : null;

    return {
      exists: matchingZones.length > 0,
      zone: zone ? zone.name : null,
      zone_count: zone ? 1 : 0,
      zone_id: zone ? zone.id : null,
      handling_charges: zone?.handling_charges || 0,
      delivery_time_per_km: zone?.delivery_time_per_km || 0,
      rush_delivery_enabled: zone?.rush_delivery_enabled || false,
      rush_delivery_time_per_km: zone?.rush_delivery_time_per_km || 0,
      rush_delivery_charges: zone?.rush_delivery_charges || 0,
      regular_delivery_charges: zone?.regular_delivery_charges || 0,
      free_delivery_amount: zone?.free_delivery_amount || 0,
      distance_based_delivery_charges: zone?.distance_based_delivery_charges || 0,
      per_store_drop_off_fee: zone?.per_store_drop_off_fee || 0,
      buffer_time: zone?.buffer_time || 0,
    };
  }

  /**
   * Check if delivery exists at coordinates
   */
  static async existsAtPoint(latitude, longitude) {
    const result = await this.getZonesAtPoint(latitude, longitude);
    return result.exists;
  }

  /**
   * Get the nearest delivery zone to a point
   */
  static async getNearestZone(latitude, longitude) {
    const zones = await prisma.deliveryZone.findMany({ where: { status: "active" } });

    let nearestZone = null;
    let shortestDistance = Number.MAX_VALUE;

    for (const zone of zones) {
      const distance = this.calculateDistance(
        Number(zone.center_latitude),
        Number(zone.center_longitude),
        latitude,
        longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestZone = zone;
      }
    }

    return nearestZone;
  }

  /**
   * Get all zones within a certain distance from a point
   */
  static async getZonesWithinDistance(latitude, longitude, maxDistance) {
    const zones = await prisma.deliveryZone.findMany({ where: { status: "active" } });

    const withinDistance = zones
      .map((zone) => {
        zone.distance = this.calculateDistance(
          Number(zone.center_latitude),
          Number(zone.center_longitude),
          latitude,
          longitude
        );
        return zone;
      })
      .filter((zone) => zone.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    return withinDistance;
  }

  /**
   * Validate coordinates
   */
  static validateCoordinates(latitude, longitude) {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Calculate estimated delivery time for a product
   */
  static async calculateEstimatedDeliveryTime(productId, userLat, userLon, storeLat, storeLon) {
    if (!this.validateCoordinates(userLat, userLon) || !this.validateCoordinates(storeLat, storeLon)) {
      return { success: false, message: "Invalid coordinates", estimated_time: null, details: null };
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return { success: false, message: "Product not found", estimated_time: null, details: null };
    }

    const basePrepTime = product.base_prep_time || 0;
    const distance = this.calculateDistance(userLat, userLon, storeLat, storeLon);

    const zoneInfo = await this.getZonesAtPoint(userLat, userLon);
    if (!zoneInfo.exists) {
      return { success: false, message: "Delivery not available at this location", estimated_time: null, details: null };
    }

    const deliveryTimePerKm = zoneInfo.delivery_time_per_km || 0;
    const bufferTime = zoneInfo.buffer_time || 0;

    let estimatedTime = basePrepTime + distance * deliveryTimePerKm + bufferTime;
    estimatedTime = Math.ceil(estimatedTime);

    return {
      success: true,
      message: "Estimated delivery time calculated successfully",
      estimated_time: estimatedTime,
      details: {
        base_prep_time: basePrepTime,
        distance_km: Math.round(distance * 100) / 100,
        delivery_time_per_km: deliveryTimePerKm,
        buffer_time: bufferTime,
        zone_id: zoneInfo.zone_id,
        zone_name: zoneInfo.zone,
      },
    };
  }

  /**
   * Get delivery zones formatted for select options
   */
  static async getZonesForSelect() {
    const zones = await prisma.deliveryZone.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return zones.map((zone) => ({
      id: zone.id,
      value: zone.id,
      text: zone.name,
    }));
  }

  /**
   * Check if multiple points are within any delivery zone
   */
  static async checkMultiplePoints(coordinates) {
    const results = {};
    for (const [index, coord] of coordinates.entries()) {
      if (coord.latitude === undefined || coord.longitude === undefined) continue;
      results[index] = await this.getZonesAtPoint(coord.latitude, coord.longitude);
    }
    return results;
  }

  /**
   * Get zones coverage statistics
   */
  static async getCoverageStats() {
    const totalZones = await prisma.deliveryZone.count();
    const activeZones = await prisma.deliveryZone.count({ where: { status: "active" } });
    const inactiveZones = await prisma.deliveryZone.count({ where: { status: "inactive" } });

    const activeZoneRecords = await prisma.deliveryZone.findMany({ where: { status: "active" }, select: { radius_km: true } });
    let totalRadius = 0;
    activeZoneRecords.forEach((z) => { totalRadius += z.radius_km; });
    const averageRadius = activeZoneRecords.length > 0 ? totalRadius / activeZoneRecords.length : 0;

    return {
      total_zones: totalZones,
      active_zones: activeZones,
      inactive_zones: inactiveZones,
      average_radius_km: Math.round(averageRadius * 100) / 100,
    };
  }

  /**
   * Check if a zone would overlap with existing zones
   */
  static async checkZoneOverlap(zoneData, excludeId = null) {
    const whereClause = { status: "active" };
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }
    const existingZones = await prisma.deliveryZone.findMany({ where: whereClause });

    const overlappingZones = [];

    for (const existingZone of existingZones) {
      if (zoneData.id && zoneData.id === existingZone.id) continue;

      if (this.doZonesOverlap(zoneData, existingZone)) {
        const distance = this.calculateDistance(
          Number(zoneData.center_latitude),
          Number(zoneData.center_longitude),
          Number(existingZone.center_latitude),
          Number(existingZone.center_longitude)
        );

        const combinedRadius = zoneData.radius_km + existingZone.radius_km;
        const overlapPercentage = Math.round(((combinedRadius - distance) / combinedRadius) * 100 * 100) / 100;

        overlappingZones.push({
          zone: existingZone,
          distance_km: Math.round(distance * 100) / 100,
          overlap_percentage: overlapPercentage,
        });
      }
    }

    return {
      has_overlap: overlappingZones.length > 0,
      overlapping_zones: overlappingZones,
      overlap_count: overlappingZones.length,
    };
  }

  /**
   * Check if two zones overlap
   */
  static doZonesOverlap(zone1, zone2) {
    if (
      zone1.boundary_json &&
      Object.keys(zone1.boundary_json).length > 0 &&
      zone2.boundary_json &&
      Object.keys(zone2.boundary_json).length > 0
    ) {
      return this.doPolygonsOverlap(zone1, zone2);
    }

    const distance = this.calculateDistance(
      Number(zone1.center_latitude),
      Number(zone1.center_longitude),
      Number(zone2.center_latitude),
      Number(zone2.center_longitude)
    );

    const combinedRadius = zone1.radius_km + zone2.radius_km;
    return distance < combinedRadius;
  }

  /**
   * Check if two polygon zones overlap
   */
  static doPolygonsOverlap(zone1, zone2) {
    let polygon1 = zone1.boundary_json;
    let polygon2 = zone2.boundary_json;

    let coordinates1 = polygon1?.coordinates?.[0] || polygon1;
    let coordinates2 = polygon2?.coordinates?.[0] || polygon2;

    if (typeof coordinates1 === "string") coordinates1 = JSON.parse(coordinates1);
    if (typeof coordinates2 === "string") coordinates2 = JSON.parse(coordinates2);

    for (const point of coordinates1) {
      const lat = point.lat ?? point.latitude ?? point[1] ?? 0;
      const lng = point.lng ?? point.longitude ?? point[0] ?? 0;
      if (this.isPointInPolygon(zone2, lat, lng)) return true;
    }

    for (const point of coordinates2) {
      const lat = point.lat ?? point.latitude ?? point[1] ?? 0;
      const lng = point.lng ?? point.longitude ?? point[0] ?? 0;
      if (this.isPointInPolygon(zone1, lat, lng)) return true;
    }

    return false;
  }

  /**
   * Check if store can deliver to given location
   */
  static canStoreDeliverToLocation(store, userLat, userLng) {
    const deliveryZones = store.zones || store.storeZones?.map(sz => sz.zone).filter(Boolean) || [];
    if (deliveryZones.length === 0) return false;

    for (const zone of deliveryZones) {
      if (this.containsPoint(zone, userLat, userLng)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get stores within map viewport (bounding box)
   */
  static async getStoresByBounds(neLat, neLng, swLat, swLng, userLat = null, userLng = null, limit = 200) {
    if (!this.validateCoordinates(neLat, neLng) || !this.validateCoordinates(swLat, swLng)) {
      return {
        success: false,
        message: "Invalid coordinates",
        data: { stores: [] },
      };
    }

    const stores = await prisma.store.findMany({
      where: {
        latitude: { gte: swLat, lte: neLat },
        longitude: { gte: swLng, lte: neLng },
        visibility_status: "visible",
        verification_status: "approved",
      },
      include: {
        storeZones: {
          include: {
            zone: true
          }
        },
      },
      take: limit,
    });

    const transformedStores = stores.map((store) => {
      return {
        id: store.id,
        name: store.name,
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
        user_latitude: userLat,
        user_longitude: userLng,
        // map other resource fields here
      };
    });

    return {
      success: true,
      message: "Stores found",
      data: {
        count: transformedStores.length,
        stores: transformedStores,
      },
    };
  }

  /**
   * Generates a unique slug
   */
  static async generateUniqueSlug(name) {
    let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let count = 1;

    while (await prisma.deliveryZone.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    return slug;
  }
}

module.exports = DeliveryZoneService;
