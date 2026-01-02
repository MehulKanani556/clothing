const Settings = require('../models/settings.model');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.find();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key, value, description } = req.body;
        const setting = await Settings.findOneAndUpdate(
            { key },
            { key, value, description },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
