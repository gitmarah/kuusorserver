import { Router } from "express";
import { deleteInternship, getInternship, getInternships, getInternshipsByCompany, postInternship, updateInternship } from "../controllers/internship.js";

const router = Router();

router.route("/")
    .get(getInternships)
    .post(postInternship);

router.get("/company/:id", getInternshipsByCompany);

router.route("/:id")
    .get(getInternship)
    .patch(updateInternship)
    .delete(deleteInternship);



export default router;