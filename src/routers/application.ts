import { Router } from "express";
import { getApplicationsByInternship, getApplicationsByStudent, internshipApplication, removeApplications, shortlistApplicants } from "../controllers/application.js";

const router = Router();

router.route("/")
    .post(internshipApplication);

router.route("/shortlist/:id")
    .post(shortlistApplicants);

router.route("/:id")
    .post(removeApplications);

router.route("/student/:id")
    .get(getApplicationsByStudent);

router.route("/internship/:id")
    .get(getApplicationsByInternship);


export default router;