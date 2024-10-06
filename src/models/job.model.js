import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: { type: String, required: true },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    location: { type: String, required: true },

    salary: { type: Number },

    jobOpenings: {
      type: Number,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    requirements: {
      type: String,
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true,
    },

    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobCategory" }],

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
