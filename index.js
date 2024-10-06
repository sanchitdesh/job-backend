import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { applicationRoute } from "./src/routes/application.routes.js";
import { companyRoute } from "./src/routes/company.routes.js";
import { jobRoute } from "./src/routes/job.routes.js";
import { userRoute } from "./src/routes/user.routes.js";
import { dbConnect } from "./src/utils/dbConnect.js";


dotenv.config({ path: "./.env" });

const port = process.env.PORT || 5000;
const app = express();

//middleware
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Database Connection
dbConnect();

//Main Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use('/api/v1/application', applicationRoute)

// Testing route
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
