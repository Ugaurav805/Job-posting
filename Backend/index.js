import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js";
import jobRoutes from "./routes/job.js";
import log from "./middleware/log.js";
import { errorLogger } from "./middleware/log.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
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