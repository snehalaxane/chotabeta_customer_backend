// controllers/setting.controller.js

const settingService = require("../services/setting.service");

exports.getAllSettings = async (req, res) => {
  try {
    const data = await settingService.getAllSettings();

    return res.json({
      success: true,
      message: "Settings Fetched Successfully",
      data,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.getSetting = async (req, res) => {
  try {
    const { variable } = req.params;

    const data = await settingService.getSettingByVariable(variable);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    return res.json({
      success: true,
      message: "Setting fetched successfully",
      data,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};