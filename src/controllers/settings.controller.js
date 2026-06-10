const prisma = require("../config/database");

class SettingsController {
  async getSettings(req, res) {
    try {
      const settings = await prisma.setting.findMany();
      
      const formattedData = settings.map(setting => {
        let parsedValue = {};
        try {
          parsedValue = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
        } catch (e) {
          parsedValue = setting.value;
        }
        return {
          variable: setting.variable,
          value: parsedValue
        };
      });

      // Fallback to empty array or we could return a default static payload if needed,
      // but returning what is in the DB is fully dynamic.
      return res.json({
        success: true,
        message: "Settings Fetched Successfully",
        data: formattedData
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

module.exports = new SettingsController();
