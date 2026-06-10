const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DeliveryZoneService = require("../services/deliveryzoneService");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");

const StoreStatusEnum = require("../enums/StoreStatusEnum");

class Store extends Model {

  // Laravel: setNameAttribute()
  static async beforeSaveHook(store) {
    if (store.changed("name")) {
      store.slug = await generateUniqueSlug(
        Store,
        store.name
      );
    }
  }

  // Laravel: getDistanceAttribute()
  getDistance() {
    if (
      this.user_latitude === undefined ||
      this.user_longitude === undefined
    ) {
      return null;
    }

    return DeliveryZoneService.calculateDistance(
      this.user_latitude,
      this.user_longitude,
      this.latitude,
      this.longitude
    );
  }

  /**
   * Laravel checkStoreStatus()
   */
  checkStoreStatus() {
    const isOpen = this.isOnline();

    return {
      is_open: isOpen,
      status: isOpen
        ? StoreStatusEnum.ONLINE
        : StoreStatusEnum.OFFLINE,
      manual_status: this.status,
      timing: this.timing,
    };
  }

  /**
   * Laravel isOnline()
   */
  isOnline() {
    if (
      String(this.status) ===
      StoreStatusEnum.OFFLINE
    ) {
      return false;
    }

    if (
      !this.timing ||
      this.timing.trim() === ""
    ) {
      return true;
    }

    return this.isWithinTiming(new Date());
  }

  /**
   * Laravel isOffline()
   */
  isOffline() {
    return !this.isOnline();
  }

  /**
   * Laravel isWithinTiming()
   */
  isWithinTiming(now) {
    let timing = String(this.timing || "").trim();

    if (!timing) {
      return true;
    }

    if (
      /\b(24\s*\/\s*7|24\s*hours?|always\s+open)\b/i.test(
        timing
      )
    ) {
      return true;
    }

    timing = timing.replace(/\s+to\s+/gi, "-");

    const segments = timing
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const segment of segments) {
      if (this.segmentMatchesNow(segment, now)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Laravel segmentMatchesNow()
   */
  segmentMatchesNow(segment, now) {
    const regex =
      /^(?:(?<days>[A-Za-z]{3,9}(?:\s*-\s*[A-Za-z]{3,9})?|daily|everyday|all days)\s+)?(?<start>\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(?<end>\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;

    const match = segment.match(regex);

    if (!match) {
      return false;
    }

    const days = match.groups.days || "";

    if (!this.dayMatches(days, now)) {
      return false;
    }

    const start = this.timeOnDate(
      match.groups.start,
      now
    );

    const end = this.timeOnDate(
      match.groups.end,
      now
    );

    if (!start || !end) {
      return false;
    }

    if (end <= start) {
      end.setDate(end.getDate() + 1);

      if (now < start) {
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
      }
    }

    return now >= start && now <= end;
  }

  /**
   * Laravel dayMatches()
   */
  dayMatches(days, now) {
    days = String(days || "").trim();

    if (
      !days ||
      /^(daily|everyday|all days)$/i.test(days)
    ) {
      return true;
    }

    const dayMap = {
      mon: 1,
      monday: 1,
      tue: 2,
      tues: 2,
      tuesday: 2,
      wed: 3,
      wednesday: 3,
      thu: 4,
      thur: 4,
      thurs: 4,
      thursday: 4,
      fri: 5,
      friday: 5,
      sat: 6,
      saturday: 6,
      sun: 7,
      sunday: 7,
    };

    const currentDay =
      now.getDay() === 0
        ? 7
        : now.getDay();

    const parts = days
      .toLowerCase()
      .split(/\s*-\s*/);

    if (parts.length === 2) {
      const startDay =
        dayMap[parts[0]];

      const endDay =
        dayMap[parts[1]];

      if (!startDay || !endDay) {
        return false;
      }

      return startDay <= endDay
        ? currentDay >= startDay &&
            currentDay <= endDay
        : currentDay >= startDay ||
            currentDay <= endDay;
    }

    return (
      dayMap[parts[0]] === currentDay
    );
  }

  /**
   * Laravel timeOnDate()
   */
  timeOnDate(time, dateObj) {
    const match = time
      .toLowerCase()
      .replace(/\s+/g, "")
      .match(
        /^(?<hour>\d{1,2})(?::(?<minute>\d{2}))?(?<meridiem>am|pm)?$/
      );

    if (!match) {
      return null;
    }

    let hour = parseInt(
      match.groups.hour
    );

    const minute = parseInt(
      match.groups.minute || 0
    );

    const meridiem =
      match.groups.meridiem;

    if (
      meridiem === "pm" &&
      hour < 12
    ) {
      hour += 12;
    }

    if (
      meridiem === "am" &&
      hour === 12
    ) {
      hour = 0;
    }

    const date = new Date(dateObj);

    date.setHours(
      hour,
      minute,
      0,
      0
    );

    return date;
  }
}

Store.init(
  {
    seller_id: DataTypes.INTEGER,

    name: DataTypes.STRING,

    slug: DataTypes.STRING,

    address: DataTypes.TEXT,

    city: DataTypes.STRING,

    landmark: DataTypes.STRING,

    state: DataTypes.STRING,

    zipcode: DataTypes.STRING,

    country: DataTypes.STRING,

    country_code: DataTypes.STRING,

    latitude: DataTypes.DOUBLE,

    longitude: DataTypes.DOUBLE,

    contact_email: DataTypes.STRING,

    contact_number: DataTypes.STRING,

    description: DataTypes.TEXT,

    timing: DataTypes.TEXT,

    tax_name: DataTypes.STRING,

    tax_number: DataTypes.STRING,

    bank_name: DataTypes.STRING,

    bank_branch_code: DataTypes.STRING,

    account_holder_name: DataTypes.STRING,

    account_number: DataTypes.STRING,

    routing_number: DataTypes.STRING,

    bank_account_type: DataTypes.STRING,

    currency_code: DataTypes.STRING,

    status: DataTypes.STRING,

    max_delivery_distance:
      DataTypes.DOUBLE,

    order_preparation_time:
      DataTypes.INTEGER,

    promotional_text:
      DataTypes.TEXT,

    about_us: DataTypes.TEXT,

    return_replacement_policy:
      DataTypes.TEXT,

    refund_policy: DataTypes.TEXT,

    terms_and_conditions:
      DataTypes.TEXT,

    delivery_policy: DataTypes.TEXT,

    domestic_shipping_charges:
      DataTypes.DECIMAL(10, 2),

    international_shipping_charges:
      DataTypes.DECIMAL(10, 2),

    metadata: DataTypes.JSON,

    verification_status:
      DataTypes.STRING,

    visibility_status:
      DataTypes.STRING,

    fulfillment_type:
      DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "Store",
    tableName: "stores",
    paranoid: true, // SoftDeletes
    timestamps: true,
  }
);

Store.beforeSave(
  Store.beforeSaveHook
);

module.exports = Store;