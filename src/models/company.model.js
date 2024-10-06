import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    website: { type: String, trim: true },
    location: { type: String },
    logo: { type: String, trim: true },
    jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    userId: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;