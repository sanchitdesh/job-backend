import express from "express";
import {isAuthenticated} from "../middleware/isAuthenticated.js";
import {
  applyJob,
  getAllApplicants,
  getAppliedJobs,
  updateApplicationStatus,
} from "../controllers/application.controller.js";

// Create a router instance
export const applicationRoute = express.Router();

applicationRoute.post("/apply/:jobId", isAuthenticated, applyJob);
applicationRoute.put(
  "/status/:applicationId/update",
  isAuthenticated,
  updateApplicationStatus
);
applicationRoute.get("/:jobId/applicants", isAuthenticated, getAllApplicants);
applicationRoute.get("/:userId", isAuthenticated, getAppliedJobs);
