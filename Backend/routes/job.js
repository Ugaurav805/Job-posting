import express from "express";
import { errorLogger } from "../middleware/log.js";
import { authMiddleware } from "../middleware/auth.js";
import Job from "../models/job.js"; // Ensure the model is imported correctly

const router = express.Router();

// List all jobs with filters and pagination
// Example URL: http://localhost:3000/api/jobs?name=ishar&skills=react,node&size=10&offset=20
router.get("/", async (req, res) => {
    try {
        const { name = "", skills = "", size = 10, offset = 0 } = req.query;
        const skillsArray = skills.split(",").map(skill => skill.trim());

        const query = {
            $or: [
                { title: { $regex: name, $options: "i" } },
                { skills: { $in: skillsArray } }
            ]
        };

        const jobs = await Job.find(query)
            .limit(Number(size))
            .skip(Number(offset));

        res.status(200).json(jobs);
    } catch (err) {
        errorLogger(err, req, res);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a job
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, location, salary, company, skills, remote, type } = req.body;
        const jobSkills = skills.split(",").map(skill => skill.trim());

        const newJob = new Job({
            title,
            description,
            location,
            salary,
            company,
            skills: jobSkills,
            remote,
            type,
            createdBy: req.user._id
        });

        await newJob.save();
        res.status(201).json(newJob);
    } catch (err) {
        errorLogger(err, req, res);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get a job by id
router.get("/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                error: {
                    message: "Job not found",
                    status: 404
                }
            });
        }
        res.status(200).json(job);
    } catch (err) {
        errorLogger(err, req, res);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete a job
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                error: {
                    message: "Job not found",
                    status: 404
                }
            });
        }
        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                error: {
                    message: "You are not authorized to delete this job",
                    status: 401
                }
            });
        }
        await job.remove();
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (err) {
        errorLogger(err, req, res);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Edit a job
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                error: {
                    message: "Job not found",
                    status: 404
                }
            });
        }
        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                error: {
                    message: "You are not authorized to edit this job",
                    status: 401
                }
            });
        }

        const { title, description, location, salary, company, skills, remote, type } = req.body;
        const jobSkills = skills.split(",").map(skill => skill.trim());

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                location,
                salary,
                company,
                skills: jobSkills,
                remote,
                type,
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.status(200).json(updatedJob);
    } catch (err) {
        errorLogger(err, req, res);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;