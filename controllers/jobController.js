// ============================================================
// controllers/jobController.js - JOB APPLICATION LOGIC
// ============================================================

const Job = require('../models/Job');
const { extractJobInfo } = require('../utils/gemini');

// ============================================================
// GET ALL JOBS (for logged-in user)
// GET /api/jobs
// ============================================================

const getJobs = async (req, res) => {
  try {
    // Find all jobs WHERE user = the logged-in user's ID
    // req.user._id comes from the authMiddleware
    // .sort({ createdAt: -1 }) = newest first (-1 = descending)
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Also calculate stats for the dashboard
    // We count jobs by status using MongoDB aggregation
    // But for simplicity, let's just count in JavaScript:
    const stats = {
      total: jobs.length,
      Applied: jobs.filter(j => j.status === 'Applied').length,
      Interview: jobs.filter(j => j.status === 'Interview').length,
      Rejected: jobs.filter(j => j.status === 'Rejected').length,
      Offer: jobs.filter(j => j.status === 'Offer').length,
    };

    res.json({ jobs, stats });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// ============================================================
// CREATE A JOB
// POST /api/jobs
// Body: { company, role, skills, jobUrl, notes, followUpDate }
// ============================================================

const createJob = async (req, res) => {
  try {
    // Destructure what we need from req.body
    const { company, role, skills, jobUrl, jobDescription, notes, followUpDate } = req.body;

    if (!company || !role) {
      return res.status(400).json({ message: 'Company and role are required' });
    }

    // Create a new job document
    // Spread the req.body fields and ADD the user ID
    const job = await Job.create({
      user: req.user._id, // Link this job to the logged-in user
      company,
      role,
      skills: skills || [],
      jobUrl,
      jobDescription,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    });

    res.status(201).json(job);

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
};

// ============================================================
// UPDATE A JOB
// PUT /api/jobs/:id
// Body: fields to update (e.g., { status: 'Interview' })
// ============================================================

const updateJob = async (req, res) => {
  try {
    // req.params.id = the :id part of the URL
    // e.g., PUT /api/jobs/64abc123 → req.params.id = '64abc123'
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // SECURITY CHECK: Make sure this job belongs to the logged-in user!
    // job.user is the user ID stored in the job
    // req.user._id is the logged-in user's ID
    // .toString() converts MongoDB ObjectId to plain string for comparison
    if (job.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Update the job with new data
    // { new: true } = return the UPDATED document (not the old one)
    // { runValidators: true } = run schema validation on the update
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body, // Update with whatever was sent in the request body
      { new: true, runValidators: true }
    );

    res.json(updatedJob);

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
};

// ============================================================
// DELETE A JOB
// DELETE /api/jobs/:id
// ============================================================

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Security check (same as update)
    if (job.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
};

// ============================================================
// AI EXTRACT FROM JOB DESCRIPTION
// POST /api/jobs/extract
// Body: { jobDescription }
// ============================================================

const extractFromJD = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ 
        message: 'Please provide a job description (at least 50 characters)' 
      });
    }

    // Call our Gemini AI utility function
    const extractedData = await extractJobInfo(jobDescription);

    res.json(extractedData);

  } catch (error) {
    console.error('AI extraction error:', error);
    res.status(500).json({ message: 'AI extraction failed. Please fill manually.' });
  }
};

module.exports = { getJobs, createJob, updateJob, deleteJob, extractFromJD };
