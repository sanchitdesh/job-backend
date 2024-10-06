import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import { sanitizeInput } from "../utils/SanitizeInput.js";
import mongoose from "mongoose";

//======================================================
/**
 * @author [Your Name]
 * @description Controller to apply for a job
 * @route POST /api/jobs/:jobId/apply
 * @access Private (Requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status, message, and application data
 */

export const applyJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.jobId;

    // Step 1: Validate Job Existence
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Step 2: Check if the User has Already Applied for this Job
    const existingApplication = await Application.findOne({
      applicant: userId,
      job: jobId,
    });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    // Step 3: Validate and Sanitize Input
    const { resume, coverLetter } = req.body;
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "Resume is required.",
      });
    }

    const sanitizedInputs = sanitizeInput({
      resume,
      coverLetter,
      job: jobId,
      applicant: userId,
    });

    // Step 4: Create a New Application
    const newApplication = await Application.create(sanitizedInputs);

    // Step 5: Update Job Document to Include the New Applicant
    await Job.findByIdAndUpdate(
      jobId,
      { $push: { applicants: newApplication._id } },
      { new: true, runValidators: true }
    );

    // Step 6: Send Success Response
    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: newApplication,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error applying for job:", error.message);

    // Step 7: Handle Errors
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//======================================

//Get All Applied Jobs

/**
 * @author [Your Name]
 * @description Controller to get all jobs applied by the logged-in user
 * @route GET /api/applications/applied-jobs
 * @access Private (Requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status, message, and application data
 */

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Find applications by the user, sorted by creation date
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job", // Populate the 'job' field
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "company", // Populate the 'company' field within the 'job' field
          options: { sort: { createdAt: -1 } },
        },
      });

    // Step 2: Check if any applications were found
    if (!applications || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applications found.",
      });
    }

    // Step 3: Send success response with application data
    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully.",
      data: applications,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching applied jobs:", error.message);
    // Send error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//=========================================================
//Get All Applicants

/**
 * @author [Your Name]
 * @description Controller to get all applicants for a specific job
 * @route GET /api/jobs/:jobId/applicants
 * @access Private (Requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status, message, and applicant data
 */

export const getAllApplicants = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID.",
      });
    }

    // Fetch applications for the job
    const applications = await Application.find({ job: jobId })
      .sort({ createdAt: -1 }) // Sort applications by creation date (most recent first)
      .populate({
        path: "applicant", // Populate the 'applicant' field with user details
        select: "-password -__v", // Exclude sensitive fields like password and __v
      });

    // Check if applications exist
    if (!applications || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applications found for this job.",
      });
    }

    // Send success response with data
    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully.",
      data: applications,
    });
  } catch (error) {
    // Log error for debugging
    // console.error("Error fetching applicants:", error.message);

    // Send error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//==========================================================
// Update Status of application

/**
 * @author [Your Name]
 * @description Controller to update the status of a job application
 * @route PATCH /api/applications/:applicationId/status
 * @access Private (Requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status, message, and updated application data
 */

export const updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const { status } = req.body;

    // Validate Application ID
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    // Validate status field
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    // Validate if the status is within the allowed enum values
    const validStatuses = [
      "Applied",
      "Reviewed",
      "Interview",
      "Offered",
      "Rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    // Update the application status
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true, runValidators: true }
    );

    // Check if the application exists
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // Send success response with updated application data
    return res.status(200).json({
      success: true,
      message: "Application status updated successfully.",
      data: application,
    });
  } catch (error) {
    // Log error for debugging
    // console.error("Error updating application status:", error.message);

    // Send error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/*
1. job ID = userID - yes or no
2. if yes - then already applied
3. if not - then that job exist or not
4. if exist - then create application
5. if not - then job not found
6. if created - then return success message
*/
