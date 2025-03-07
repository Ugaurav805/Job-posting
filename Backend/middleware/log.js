import fs from 'fs';
import path from 'path';

// Middleware to log request data
export default function log(req, res, next) {
    const date = new Date();
    const logFile = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`;

    // Fix for __dirname not being defined in ES modules
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const logDir = path.resolve(__dirname, 'logs');  // Log directory
    const logFilePath = path.resolve(logDir, logFile);  // Full path to the log file

    // Check if the logs directory exists, create it if it doesn't
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Append log entry to the file
    fs.appendFile(logFilePath, `${req.method} ${req.url} ${req.ip}\n`, (err) => {
        if (err) {
            console.error('Error writing log:', err);
            return next(err);  // Pass the error to the next middleware
        }
    });
    next();
}

// Error logging middleware
export function errorLogger(err, req, res, next) {
    const date = new Date();
    const logFile = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-error.log`;

    // Fix for __dirname not being defined in ES modules
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const logDir = path.resolve(__dirname, 'logs');  // Log directory
    const logFilePath = path.resolve(logDir, logFile);  // Full path to the error log file

    // Check if the logs directory exists, create it if it doesn't
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const errorLog = `[${date.toISOString()}] ${err.stack || err.message}\n`;

    // Append error log to the file
    fs.appendFile(logFilePath, errorLog, (writeErr) => {
        if (writeErr) console.error('Error writing to error log:', writeErr);
    });

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
}
