const Support = require('../models/support.model');

exports.createTicket = async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        const ticket = await Support.create({ user: req.user?.id, email, subject, message });
        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Support.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body;
        const ticket = await Support.findByIdAndUpdate(id, { status, adminResponse }, { new: true });
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
