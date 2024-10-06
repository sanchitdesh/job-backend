import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true, // Index for faster querying
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster querying
    },
    resume: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Reviewed", "Interview", "Offered", "Rejected"],
      default: "Applied",
    },
    coverLetter: {
      type: String,
      trim: true, // Ensure no leading/trailing whitespace
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
