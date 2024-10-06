import mongoose from "mongoose";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import { sanitizeInput } from "../utils/SanitizeInput.js";
import JobCategory from "../models/job_categories.model.js";

/**
 * Create a Job
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const postJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      company,
      location,
      experience,
      salary,
      jobOpenings,
      requirements,
      jobType,
      categories,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !company ||
      !experience ||
      !location ||
      !jobOpenings ||
      !jobType ||
      !categories ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Sanitize input
    const sanitizedInputs = sanitizeInput({
      title,
      description,
      company,
      location,
      experience,
      salary,
      jobOpenings,
      requirements,
      jobType,
      categories,
      postedBy: userId,
    });

    // Validate company ID
    const validCompany = await Company.findById(sanitizedInputs.company);
    if (!validCompany) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    // Validate categories
    const validCategories = await JobCategory.find({
      _id: { $in: sanitizedInputs.categories },
    });
    if (validCategories.length !== sanitizedInputs.categories.length) {
      return res.status(400).json({
        success: false,
        message: "One or more job categories are invalid",
      });
    }

    // Create job
    const newJob = await Job.create(sanitizedInputs);

    // Update categories with new job references
    await JobCategory.updateMany(
      { _id: { $in: sanitizedInputs.categories } },
      { $push: { jobs: newJob._id } }
    );

    // Update company with new job reference
    await Company.findByIdAndUpdate(sanitizedInputs.company, {
      $push: { jobs: newJob._id },
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: newJob,
    });
  } catch (error) {
    // Log the error for debugging
    // console.error("Error creating job:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Update a Job
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    // Sanitize and prepare updates
    const updates = sanitizeInput(req.body);

    // Update the job document
    const updatedJob = await Job.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    // Check if job was found and updated
    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Return successful response with updated job data
    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error updating job:", error.message);

    // Return error respons
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Job By ID
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const jobById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    // Fetch job by ID
    const job = await Job.findById(id);

    // Check if job exists
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Job found successfully",
      job,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching job by ID:", error.message);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Get All Jobs
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    // Fetch jobs based on query and populate the company field
    const jobs = await Job.find(query)
      .populate("company")
      .sort({ createdAt: -1 });

    // Check if jobs were found
    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No jobs found.",
      });
    }

    // Return successful response with jobs data
    return res.status(200).json({
      success: true,
      message: "All jobs fetched successfully.",
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching jobs:", error.message);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Get All Jobs Based on  User Id
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const getJobsByUserID = async (req, res) => {
  try {
    const userId = req.user._id;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    // Fetch jobs posted by the user
    const jobs = await Job.find({ postedBy: userId });

    // Check if jobs were found
    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No jobs found for the user",
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Jobs found successfully.",
      totalJobs: jobs.length,
      jobs: jobs,
    });
  } catch (error) {
    //   console.error("Error fetching jobs by user ID:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Delete a Job by ID
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    // Find and delete the job
    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Remove job reference from JobCategory documents
    await JobCategory.updateMany({ jobs: id }, { $pull: { jobs: id } });

    // Remove job reference from Company documents
    await Company.updateMany({ jobs: id }, { $pull: { jobs: id } });

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting job:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/*
Creation of job - 

1. Get the fields - req.body
2. Get the id - req.user._id(isAuthenticated via Token)
3. company - exist or not exist in database
4. If company exist - proceed to create a job with posted by
5. created - return create success


Note: (Company id is not required - will search the company is available then only we can create a job)
*/

/*

Linked with each other. Whatever will update that will come under all
User - Company - Job - Category


Company - Job - Category

Job - Company (Data Created) - include Job[], 
      Category (Data Created) - inlcude Job[]


Job Creation

Company - search via id
Category - search via id

exist 


created



---> UserID - req.user._id via token

Company - userID
Job - userID

seperately define - job use


1. userId
2. fields - req.body
3. Mandatory fields
4. two fields - company and categories are ref
 we have to check there is something or not
5. Company and Categories Validation
6. if exist - create job



job create
company - category - update - push


job delete
company - category - remove - pull



*/
