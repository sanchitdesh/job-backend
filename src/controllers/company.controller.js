import mongoose from "mongoose";
import Company from "../models/company.model.js";
// import sanitize from "sanitize-html"; //Sanitize for protection
import { sanitizeInput } from "../utils/SanitizeInput.js"; //Sanitize Method in utils for protection

//===================================================
/**
 * Creates a new Company by user (Get its ID by Authentication via Token) and saves it to the database.
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const createCompany = async (req, res) => {
  try {
    const user = req.user._id;
    const { name, description, website, location, userId } = req.body;

    if (!name || !description || !website || !location || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const sanitizedInputs = sanitizeInput({
      name,
      description,
      website,
      location,
      userId: user,
    });

    /*
 #Just an another way of sanitizing and holding values in one variable

    const sanitizedInputs = {
      name: sanitize(name),
      description: sanitize(description),
      website: sanitize(website),
      location: sanitize(location),
      userId: user,
    };
*/

    const existingCompany = await Company.findOne({
      name: sanitizedInputs.name,
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: `Company with name ${name} already exists.`,
      });
    }

    const company = await Company.create(sanitizedInputs);

    //Another ways through which we can create a company
    /*
   1.
    const company = await Company(sanitizedInputs);
    company.save();


   2. 
    const company = new Company(sanitizedInputs);
    company.save();
   */

    return res.status(201).json({
      success: true,
      message: `Company created successfully`,
      data: company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//=======================================================
/**
 * Get A Company By User ID
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const getCompanyByUserId = async (req, res) => {
  try {
    const userId = req.user._id;
    const companies = await Company.find({ userId });

    if (!companies) {
      return res.status(404).json({
        success: false,
        message: "No companies found for this user",
      });
    }

    /*
    # To get the total of all companies in database for specific userId
    const totalCompanies = await Company.countDocuments({userId});

    # To get the total of all companies in database 
     const totalCompanies = await Company.countDocuments();
   */

    const totalCompanies = companies.length;

    return res.status(200).json({
      success: true,
      message: "Company found successfully",
      totalCompanies: totalCompanies,
      data: companies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//===================================================
/**
 * Get A Company By ID
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const getCompanyById = async (req, res) => {
  try {
    const id = req.params.id;
    // const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid({ id })) {
      return res.status(400).json({
        success: false,
        message: "Invalid Company ID",
      });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company found successfully",
      data: company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//==============================================
/**
 * Get All Companies
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Companies not found",
      });
    }

    const totalCompanies = companies.length;

    /*
    Another way to find the length of company -

    const totalCompanies = await Company.countDocuments();  
    */

    return res.status(200).json({
      success: true,
      message: "Companies found successfully",
      totalCompanies: totalCompanies,
      data: companies,
    });
  } catch (error) {
    // console.error("Error fetching companies:", error.message); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//==============================================
/**
 * Update Company Details
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const updateCompany = async (req, res) => {
  try {
    // const id = req.params.id;
    const { id } = req.params;

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid Company ID",
      });
    }

    const updates = sanitizeInput(req.body);

    const file = req.file;
    // Handle file upload logic if file is present
    //if (req.file) {
    // Your cloudinary logic here, for example:
    // const result = await cloudinary.uploader.upload(req.file.path);
    // updates.logo = result.secure_url;
    // }
    //  Cloudinary Logic

    const updatedCompany = await Company.findByIdAndUpdate(id, updates, {
      new: true, // To return the updated comment
      runValidators: true, // Schema Validator runs on updated data
    });
    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//==============================================
/**
 * Delete Company
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(500).json({
        success: false,
        message: "Invalid Company ID",
        error: error.message,
      });
    }

    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.json({
      success: true,
      message: `${deletedCompany.name} deleted successfully`,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
      error: error.message,
    });
  }
};

//===========================================
/*

Get Company By ID

1. Get company by ID (user ID)
2. Search that ID in database
3. return a result

*/

/*
Company Create

1. field - req.body
2. userId - id we are getting from authentication
3. name - exist or not
4. exist - already exist
5. no exist - create new
6. return
*/
