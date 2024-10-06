import mongoose from "mongoose";
import JobCategory from "../models/job_categories.model.js";
import { sanitizeInput } from "../utils/SanitizeInput.js";

export const createJobCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Sanitize input
    const sanitizedInputs = sanitizeInput({ name });

    // Check if category already exists
    const existingCategory = await JobCategory.findOne({
      name: sanitizedInputs.name,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: `Category with name "${name}" already exists.`,
      });
    }

    // Create a new job category
    const newJobCategory = await JobCategory.create(sanitizedInputs);

    return res.status(201).json({
      success: true,
      message: "Job category created successfully",
      data: newJobCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please, try again later.",
      error: error.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    // Fetch all categories
    const allCategories = await JobCategory.find();

    // Check if categories were fetched successfully
    if (!allCategories || allCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }

    // Return successful response with categories data
    return res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching all categories:", error.message);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

export const getJobCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Find the job category by ID
    const jobCategory = await JobCategory.findById(id);

    // Check if job category exists
    if (!jobCategory) {
      return res.status(404).json({
        success: false,
        message: "Job category not found",
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Job category found successfully",
      data: jobCategory,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching job category by ID:", error.message);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

export const updateJobCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Sanitize input
    const sanitizedInputs = sanitizeInput(req.body);

    // Update the job category document
    const updatedJobCategory = await JobCategory.findByIdAndUpdate(
      id,
      sanitizedInputs,
      {
        new: true,
        runValidators: true,
      }
    );

    // Check if job category was found and updated
    if (!updatedJobCategory) {
      return res.status(404).json({
        success: false,
        message: "Job category not found",
      });
    }

    // Return successful response with updated job category data
    return res.status(200).json({
      success: true,
      message: "Job category updated successfully",
      data: updatedJobCategory,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error updating job category:", error.message);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

export const deleteJobCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Find and delete the job category
    const deletedJobCategory = await JobCategory.findByIdAndDelete(id);

    // Check if the job category was found and deleted
    if (!deletedJobCategory) {
      return res.status(404).json({
        success: false,
        message: "Job category not found",
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      message: `${deletedJobCategory.name} deleted successfully.`,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting job category:", error.message);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};
/*
Create a category

1. categoryName - req. body
2. categoryName - exist or not in database
3. If exist - then already exist 
4. If not exist - then create a new category
5. return the response
*/
