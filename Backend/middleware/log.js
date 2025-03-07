import fs from 'fs';
import path from 'path';

export default function log(req, res, next) {
    const date = new Date();
    const logFile = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`;
    const logFilePath = path.resolve(__dirname, 'logs', logFile); // Resolve to absolute path
    
    fs.appendFile(logFilePath, `${req.method} ${req.url} ${req.ip}\n`, (err) => {
        if (err) throw err;
    });
    next();
}

export function errorLogger(err, req, res, next) {
    const date = new Date();
    const logFile = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-error.log`;
    const logFilePath = path.resolve(__dirname, 'logs', logFile); // Resolve to absolute path

    const errorLog = `[${date.toISOString()}] ${err.stack || err.message}\n`;

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
