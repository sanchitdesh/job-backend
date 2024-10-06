import express from "express";
import {
  deleteJob,
  getAllJobs,
  getJobsByUserID,
  jobById,
  postJob,
  updateJob,
} from "../controllers/job.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  createJobCategory,
  deleteJobCategory,
  getAllCategories,
  getJobCategoryById,
  updateJobCategory,
} from "../controllers/job_categories.controller.js";

export const jobRoute = express.Router();

jobRoute.post("/category/create", isAuthenticated, createJobCategory);
jobRoute.get("/category/all", isAuthenticated, getAllCategories);
jobRoute.put("/category/update/:id", isAuthenticated, updateJobCategory);
jobRoute
  .route("/category/:id")
  .get(isAuthenticated, getJobCategoryById)
  .delete(isAuthenticated, deleteJobCategory);

jobRoute.post("/post", isAuthenticated, postJob);
jobRoute.put("/update/:id", isAuthenticated, updateJob);
jobRoute.get("/all", isAuthenticated, getAllJobs);
jobRoute.get("/all/:id", isAuthenticated, getJobsByUserID);
jobRoute
  .route("/:id")
  .get(isAuthenticated, jobById)
  .delete(isAuthenticated, deleteJob);

/*

#Logic to use the routes for same route

jobRoute.route('/:id')
.get(getJob)
.put(updateJob)


#Routes:


1. Job Post -
http://localhost:3000/api/v1/job/post
*/
