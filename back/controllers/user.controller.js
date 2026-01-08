const User = require('../models/user.model');
const bcrypt = require('bcrypt');


exports.getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user, message: "User fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users, message: "All users fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        res.status(200).json({ message: error.message });
    }
}


exports.updateUser = async (req, res) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, email, role, mobileNumber, dateOfBirth, gender, bio } = req.body;
        let updateData = { firstName, lastName, email, role, mobileNumber, dateOfBirth, gender, bio };

        if (req.file) {
            updateData.photo = req.file.location;
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user, message: "User updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.addAddress = async (req, res) => {
    try {
        const { id } = req.user;
        const address = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { $push: { addresses: address } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user, message: "Address added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.user;
        const { addressId } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user, message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.user;
        const { addressId } = req.params;

        // First set all isDefault to false
        await User.updateOne(
            { _id: id },
            { $set: { "addresses.$[].isDefault": false } }
        );

        // Then set the specific one to true
        const user = await User.findOneAndUpdate(
            { _id: id, "addresses._id": addressId },
            { $set: { "addresses.$.isDefault": true } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            status: "success",
            message: "Default address updated",
            user
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
}



