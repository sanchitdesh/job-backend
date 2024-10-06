import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sanitizeInput } from "../utils/SanitizeInput.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";

/**
 * Creates a new user and saves it to the database.
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, profile } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    let cloudResponse;
    const file = req.file;

    if (file) {
      const fileUri = getDataUri(file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "profile_pictures", // Define a specific folder for clarity
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      profile: {
        profileImage: cloudResponse ? cloudResponse.secure_url : "", // Save image URL if available
        ...profile, // Include other profile data if any
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong",
      });
    }

    console.log("File:", req.file);
    console.log("Cloudinary Response:", cloudResponse);

    return res.json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * Login a user and returns the user object in the response.
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // const isMatch = await  user.comparePassword(password);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (role !== user.role) {
      return res.status(400).json({
        success: false,
        message: "Role does not match",
      });
    }

    const userToken = {
      _id: user._id,
    };

    const token = jwt.sign(userToken, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        success: true,
        message: `Welcome, ${user.name}`,
        user: user,
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Logout a user and returns the user object in the response.
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const logoutUser = (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, please try again",
      error: error.message,
    });
  }
};

/**
 * Update a user and returns the user object in the response.
 *
 * @param {Object} req - The request object, containing user data in req.body.
 * @param {Object} res - The response object.
 * @returns {Object} The created user object or an error message.
 */

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone, profile } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cloudResponse;
    const file = req.file;

    // Handle file upload
    if (file) {
      const fileUri = getDataUri(file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "profile_pictures",
      });
    }

    // Update fields if they are provided and different
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }
      user.email = sanitizeInput(email);
    }

    user.name = sanitizeInput(name) || user.name;
    user.phone = sanitizeInput(phone) || user.phone;

    // Update profile object if it exists, or initialize it
    user.profile = user.profile || {};
    if (profile) {
      user.profile = { ...user.profile, ...sanitizeInput(profile) };
    }

    // Update resume and profile image if file was uploaded
    if (cloudResponse) {
      if (file.mimetype.startsWith('image/')) {
        user.profile.profileImage = cloudResponse.secure_url;
      } else {
        user.profile.resume = cloudResponse.secure_url;
        user.profile.resumeOriginalName = file.originalname;
      }
    }

    // Save updated user profile
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, please try again",
      error: error.message,
    });
  }
};