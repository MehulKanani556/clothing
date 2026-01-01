const User = require('../models/user.model');
const Otp = require('../models/otp.model');
const Session = require('../models/session.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes
const MAX_OTP_SEND_LIMIT = 5; // 5 OTPs per 5 minutes

const generateToken = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        const accessToken = await jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const refreshToken = await jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); // Matching session expiry

        // user.refreshToken = refreshToken; // No longer storing in User model
        // await user.save();

        // Create Session
        await Session.create({
            userId: id,
            token: refreshToken
        });

        return { accessToken, refreshToken };
    } catch (error) {
        throw error;
    }
}

exports.generateNewToken = async (req, res) => {
    try {
        let token = req?.cookie?.refreshToken || req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Verify if session exists
        const session = await Session.findOne({ token });
        if (!session) {
            return res.status(401).json({ message: "Session expired or invalid" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Rotate tokens? For now, we can just issue new access token and keep session or refresh session.
        // Let's create a NEW session and remove old one to keep it clean 'Rotate'
        await Session.findByIdAndDelete(session._id);

        const { accessToken, refreshToken } = await generateToken(user._id);

        return res
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 7 * 60 * 60 * 1000, sameSite: "Strict" })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "Strict",
            })
            .status(200).json({ user, accessToken, refreshToken });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        // const photo = req.file.location; // Commented out as file upload might be optional or handled elsewhere in some tests
        const photo = req.file ? req.file.location : "https://via.placeholder.com/150";

        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check recent OTPs
        const recentOtps = await Otp.countDocuments({ email: email });
        if (recentOtps >= MAX_OTP_SEND_LIMIT) {
            return res.status(429).json({ message: "Too many attempts. Please wait a few minutes." });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        let otp = Math.floor(100000 + Math.random() * 900000);

        // Save temporarily in Otp collection
        await Otp.create({
            email,
            otp: otp.toString(),
            userData: { firstName, lastName, email, password: hashPassword, role, photo }
        });

        const transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify Account",
            text: `Your account verification code is: ${otp} `
        }

        transport.sendMail(mailOptions, (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ status: 500, success: false, message: error.message })
            }
            return res.status(200).json({ status: 200, success: true, message: "Verification code sent to email." });
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

exports.verifyRegistration = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(404).json({ message: "OTP not found or expired" });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            if (otpRecord.attempts >= 3) {
                await Otp.findByIdAndDelete(otpRecord._id);
                return res.status(400).json({ message: "Too many invalid attempts. Please try again." });
            }
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (!otpRecord.userData) {
            return res.status(400).json({ message: "Invalid registration session." });
        }

        // Create User
        const { firstName, lastName, password, role, photo } = otpRecord.userData;

        // Final check if user exists (edge case)
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            await Otp.findByIdAndDelete(otpRecord._id);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ firstName, lastName, email, password, role, photo });

        // Clean up OTP
        await Otp.findByIdAndDelete(otpRecord._id);

        const { accessToken, refreshToken } = await generateToken(user._id);

        return res
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 7 * 60 * 60 * 1000, sameSite: "Strict" })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "Strict",
            })
            .status(201).json({ user, message: 'Account created successfully', accessToken, refreshToken });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}


exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.header("Authorization")?.split(" ")[1];

        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (refreshToken) {
            await Session.findOneAndDelete({ token: refreshToken });
        }

        return res
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .status(200)
            .json({ message: "Logged out successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const checkUser = await User.findOne({ email });

        if (!checkUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check Lock
        if (checkUser.lockUntil && checkUser.lockUntil > Date.now()) {
            return res.status(403).json({
                message: `Account is temporarily locked. Please try again later.`
            });
        }

        let comparePass = await bcrypt.compare(password, checkUser.password);
        if (!comparePass) {
            // Increment attempts
            checkUser.loginAttempts += 1;
            if (checkUser.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                checkUser.lockUntil = Date.now() + LOCK_TIME;
            }
            await checkUser.save();
            return res.status(404).json({ status: 404, message: "Password Not Match" })
        }

        // Reset attempts on success
        checkUser.loginAttempts = 0;
        checkUser.lockUntil = undefined;
        await checkUser.save();
        const { accessToken, refreshToken } = await generateToken(checkUser._id);

        const user = await User.findOne({ email }).select("-password -__v -loginAttempts -lockUntil -createdAt -updatedAt")
        return res
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 7 * 60 * 60 * 1000, sameSite: "Strict" })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: "Strict",
            })
            .status(200).json({
                user: user,
                message: "User Login successfully",
                token: accessToken
            })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        let checkEmail = await User.findOne({ email });

        if (!checkEmail) {
            return res.status(404).json({ status: 404, message: "Email Not Found" })
        }

        // Check OTP Send Limit
        const recentOtps = await Otp.countDocuments({ email: email });
        if (recentOtps >= MAX_OTP_SEND_LIMIT) {
            return res.status(429).json({ message: "Too many OTPs sent. Please wait a few minutes." });
        }

        const transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let otp = Math.floor(100000 + Math.random() * 900000);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset Password",
            text: `Your code is: ${otp} `
        }

        // Create OTP doc
        await Otp.create({
            email,
            otp: otp.toString()
        });

        transport.sendMail(mailOptions, (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ status: 500, success: false, message: error.message })
            }
            return res.status(200).json({ status: 200, success: true, message: "Email Sent SuccessFully..." });
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body

        // Find latest OTP (or we could require matching specific, but typically last one)
        const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(404).json({ status: 404, message: "OTP not found or expired" });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 3) {
                await Otp.findByIdAndDelete(otpRecord._id);
                return res.status(400).json({ message: "Too many invalid attempts. OTP invalidated." });
            }

            return res.status(400).json({ status: 400, message: "Invalid Otp" })
        }

        // Valid OTP
        await Otp.findByIdAndDelete(otpRecord._id);

        // Fetch user to return
        const user = await User.findOne({ email });
        return res.status(200).json({ status: 200, message: "Otp Verify SuccessFully...", user })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.changePassword = async (req, res) => {
    try {
        let { newPassword, email } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 404, message: "User Not Found" })
        }

        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashPassword;
        await user.save();

        // Optional: Expire all sessions on password change
        await Session.deleteMany({ userId: user._id });

        return res.json({ status: 200, message: "Password Changed SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}
