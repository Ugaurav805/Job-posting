import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js";
import jobRoutes from "./routes/job.js";
import log, { errorLogger } from "./middleware/log.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(log);
app.use(errorLogger);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err : {}, // Send error details in development mode
    });
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if MongoDB connection fails
    }
};

connectDB();

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Default route
app.get("/", (req, res) => {
    res.send("Hello World!");
});
