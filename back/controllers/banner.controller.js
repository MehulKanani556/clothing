const Banner = require('../models/banner.model');

// Create Banner
exports.createBanner = async (req, res) => {
    try {
        const bannerData = req.body;
        if (req.file) {
            bannerData.image = req.file.location || req.file.path;
        }

        const banner = await Banner.create(bannerData);
        res.status(201).json({ success: true, data: banner });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All Banners (Public - only active)
exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true, deletedAt: null }).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: banners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Banners (Admin - all)
exports.getAdminBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ deletedAt: null }).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: banners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Banner
exports.updateBanner = async (req, res) => {
    try {
        const updateData = req.body;
        if (req.file) {
            updateData.image = req.file.location || req.file.path;
        }

        const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        res.json({ success: true, data: banner });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle Banner Status
exports.toggleBannerStatus = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        banner.isActive = !banner.isActive;
        await banner.save();

        res.json({ success: true, data: banner });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update Banner Order
exports.updateBannerOrder = async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of banner IDs in the new order

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const updates = orderedIds.map((id, index) => {
            return Banner.findByIdAndUpdate(id, { order: index });
        });

        await Promise.all(updates);

        res.json({ success: true, message: 'Banner order updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
