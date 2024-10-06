import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the project schema
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Project title is required"],
  },
  description: {
    type: String,
    trim: true,
  },
  technologies: {
    type: [String],
    validate: {
      validator: Array.isArray,
      message: "Technologies must be an array of strings",
    },
  },
  link: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?.*$/, "Please fill a valid URL"],
  },
});

// Define the profile schema
const profileSchema = new mongoose.Schema({
  bio: {
    type: String,
    trim: true,
  },
  skills: {
    type: [String],
    validate: {
      validator: Array.isArray,
      message: "Skills must be an array of strings",
    },
  },
  resume: {
    type: [String],
    validate: {
      validator: Array.isArray,
      message: "Resume must be an array of strings",
    },
  },
  resumeOriginalName: {
    type: String,
  },
  education: [
    {
      degree: {
        type: String,
        required: [true, "Degree is required"],
      },
      institution: {
        type: String,
        required: [true, "Institution is required"],
      },
      startDate: {
        type: Date,
        required: [true, "Start date is required"],
      },
      endDate: {
        type: Date,
      },
    },
  ],
  experience: [
    {
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: [true, "Company is required"],
      },
      profilePhoto: {
        type: String,
        default: "",
      },
      position: {
        type: String,
        required: [true, "Position is required"],
      },
      startDate: {
        type: Date,
        required: [true, "Start date is required"],
      },
      endDate: {
        type: Date,
      },
      description: {
        type: String,
        trim: true,
      },
    },
  ],
  projects: [projectSchema], // Add the projects field here
  socialLinks: {
    linkedIn: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
        "Please fill a valid LinkedIn URL",
      ],
    },
    github: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?github\.com\/.*$/,
        "Please fill a valid GitHub URL",
      ],
    },
    twitter: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?twitter\.com\/.*$/,
        "Please fill a valid Twitter URL",
      ],
    },
  },

  profileImage: {
    type: String,
    default: "",
  },
});

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      match: [/^\d{10}$/, "Please fill a valid phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "recruiter"],
      required: true,
      default: "user",
    },
    profile: profileSchema,
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
