const LegalPage = require('../models/legalPage.model');
const mongoose = require('mongoose');

exports.getLegalPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await LegalPage.findOne({ slug, deletedAt: null });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found', data: null });
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.upsertLegalPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content, structure } = req.body;

        const page = await LegalPage.findOneAndUpdate(
            { slug },
            { title, content, structure },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, message: 'Page saved successfully', data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const { fileupload } = require('../helper/awsUploder');
        const filedata = await fileupload(req.file.path, "legalPages");

        if (filedata.message) {
            // fileupload returns object with message property on error? usage in blog.controller suggests !filedata.message means success. 
            // Actually checking blog.controller: if (!filedata.message) { success }
            // Let's assume fileupload returns useful data on success and maybe an error object or throws on failure.
            // Wait, blog.controller says: if (!filedata.message). This implies if message exists, it's an error? 
            // Or maybe it returns { message: "error" }?
        }

        // Re-reading blog.controller usage:
        // const filedata = await fileupload(req.files.photo[0].path, "blogImage");
        // if (!filedata.message) { photo = { url: filedata.Location, ... } }

        // So let's stick to that pattern.

        if (filedata.Location) {
            return res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                url: filedata.Location
            });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to upload image' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.softDeleteLegalPage = async (req, res) => {
    try {
        const { slug, id } = req.params;

        const page = await LegalPage.findOneAndUpdate(
            { slug, _id: id },
            { deletedAt: new Date() },
            { new: true }
        );

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        res.status(200).json({ success: true, message: 'Page deleted successfully', data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
