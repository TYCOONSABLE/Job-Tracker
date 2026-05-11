// ============================================================
// models/Job.js - JOB APPLICATION DATA BLUEPRINT
// ============================================================

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    // Which user owns this job application?
    // ref: 'User' creates a "foreign key" relationship
    // This stores the user's MongoDB _id here
    user: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB document ID type
      ref: 'User',
      required: true,
    },

    // ─── Job Details (filled manually or by AI) ───────────────

    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },

    // Skills extracted from the job description
    // This is an ARRAY of strings: ['React', 'Node.js', 'MongoDB']
    skills: {
      type: [String],
      default: [], // If not provided, start with empty array
    },

    // Job URL (optional - link to the job posting)
    jobUrl: {
      type: String,
      trim: true,
    },

    // Store the raw job description (optional)
    jobDescription: {
      type: String,
    },

    // ─── Application Status ───────────────────────────────────

    // Status must be one of these specific values (using enum)
    // enum = enumeration = "only these values are allowed"
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Interview', 'Rejected', 'Offer'],
        message: 'Status must be: Applied, Interview, Rejected, or Offer',
      },
      default: 'Applied', // New jobs start as "Applied"
    },

    // ─── Dates ────────────────────────────────────────────────

    // When did you apply?
    appliedDate: {
      type: Date,
      default: Date.now, // Automatically set to current date
    },

    // When should we send a follow-up email reminder?
    followUpDate: {
      type: Date,
    },

    // Has the follow-up email already been sent?
    // Prevents sending the same reminder multiple times
    followUpSent: {
      type: Boolean,
      default: false,
    },

    // ─── Notes ────────────────────────────────────────────────

    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ============================================================
// INDEX
// ============================================================
// An index makes queries faster.
// We'll frequently query "get all jobs for this user"
// so we index the user field.
jobSchema.index({ user: 1 });

module.exports = mongoose.model('Job', jobSchema);
