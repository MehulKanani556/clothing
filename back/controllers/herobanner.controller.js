const heroBanner = require('../models/herobanner.model');

// Create heroBanner
exports.createheroBanner = async (req, res) => {
    try {
        const heroBannerData = req.body;
        if (req.file) {
            heroBannerData.image = req.file.location || req.file.path;
        }

        const heroBannerrr = await heroBanner.create(heroBannerData);
        res.status(201).json({ success: true, data: heroBannerrr });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All HeroBanners (Public - only active)
exports.getHeroBanners = async (req, res) => {
    try {
        const banners = await heroBanner.find({ isActive: true, deletedAt: null }).sort({ createdAt: -1 });
        res.json({ success: true, data: banners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All HeroBanners (Admin - all)
exports.getAdminHeroBanners = async (req, res) => {
    try {
        const banners = await heroBanner.find({ deletedAt: null }).sort({ createdAt: -1 });
        res.json({ success: true, data: banners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update heroBanner
exports.updateheroBanner = async (req, res) => {
    try {
        const updateData = req.body;
        if (req.file) {
            updateData.image = req.file.location || req.file.path;
        }

        const banner = await heroBanner.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        res.json({ success: true, data: banner });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete heroBanner
exports.deleteheroBanner = async (req, res) => {
    try {
        const banner = await heroBanner.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};