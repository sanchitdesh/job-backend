import express from "express";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompanyById,
  getCompanyByUserId,
  updateCompany,
} from "../controllers/company.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

export const companyRoute = express.Router();

companyRoute.post("/create", isAuthenticated, createCompany);
companyRoute.get("/all", isAuthenticated, getCompanies);
companyRoute.get("/user/:id", isAuthenticated, getCompanyByUserId);
companyRoute.put("/update/:id", isAuthenticated, updateCompany);
companyRoute.get("/:id", isAuthenticated, getCompanyById);
companyRoute.delete("/:id", isAuthenticated, deleteCompany);
