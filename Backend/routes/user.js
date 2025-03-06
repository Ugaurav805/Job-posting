import express from "express";
import User from "../models/user.js"; // Ensure the model is imported correctly
import bcrypt from "bcrypt";
import { errorLogger } from "../middleware/log.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
    try {
        const { name, username, email, phone, password } = req.body;

        // Check for existing user via email or username
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email is already taken" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            phone,
        });

        // Save the user to the database
        await newUser.save();

        // Return success response
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        errorLogger(error, req, res);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// User Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Compare the provided password with the hashed password
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            {
                id: existingUser._id,
                username: existingUser.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Return success response with the token
        res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
        errorLogger(error, req, res);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;