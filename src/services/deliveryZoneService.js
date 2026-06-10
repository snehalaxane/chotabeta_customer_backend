// services/deliveryZoneService.js

const prisma = require("../config/database");

class DeliveryZoneService {

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371;

    const latDiff = this.deg2rad(lat2 - lat1);
    const lonDiff = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(latDiff / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(lonDiff / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }

  static deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  static validateCoordinates(latitude, longitude) {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  static isPointInRadius(zone, latitude, longitude) {
    const distance = this.calculateDistance(
      zone.center_latitude,
      zone.center_longitude,
      latitude,
      longitude
    );

    return distance <= zone.radius_km;
  }

  static isPointInPolygon(zone, latitude, longitude) {
    let polygon = zone.boundary_json;

    let coordinates;

    if (polygon?.coordinates?.[0]) {
      coordinates = polygon.coordinates[0];
    } else if (
      polygon?.[0]?.lat ||
      polygon?.[0]?.latitude
    ) {
      coordinates = polygon;
    } else {
      return this.isPointInRadius(
        zone,
        latitude,
        longitude
      );
    }

    let intersections = 0;
    const vertexCount = coordinates.length;

    for (let i = 0; i < vertexCount; i++) {
      const j = (i + 1) % vertexCount;

      const xi =
        coordinates[i].lat ??
        coordinates[i].latitude ??
        coordinates[i][1] ??
        0;

      const yi =
        coordinates[i].lng ??
        coordinates[i].longitude ??
        coordinates[i][0] ??
        0;

      const xj =
        coordinates[j].lat ??
        coordinates[j].latitude ??
        coordinates[j][1] ??
        0;

      const yj =
        coordinates[j].lng ??
        coordinates[j].longitude ??
        coordinates[j][0] ??
        0;

      if (
        (yi > longitude) !== (yj > longitude) &&
        latitude <
          ((xj - xi) * (longitude - yi)) /
            (yj - yi) +
            xi
      ) {
        intersections++;
      }
    }

    return intersections % 2 === 1;
  }

  static containsPoint(zone, latitude, longitude) {
    if (zone.boundary_json) {
      return this.isPointInPolygon(
        zone,
        latitude,
        longitude
      );
    }

    return this.isPointInRadius(
      zone,
      latitude,
      longitude
    );
  }

  static async getZonesAtPoint(latitude, longitude) {
    const zones = await deliveryZone.findMany({
      where: {
        status: "active",
      },
    });

    const matchedZones = zones.filter((zone) =>
      this.containsPoint(
        zone,
        latitude,
        longitude
      )
    );

    const zone = matchedZones[0];

    return {
      exists: !!zone,
      zone: zone?.name ?? null,
      zone_id: zone?.id ?? null,
      handling_charges:
        zone?.handling_charges ?? 0,
      delivery_time_per_km:
        zone?.delivery_time_per_km ?? 0,
      buffer_time:
        zone?.buffer_time ?? 0,
    };
  }
}

export default DeliveryZoneService;