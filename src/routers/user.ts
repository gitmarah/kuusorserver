import { Router } from "express";
import { getUser, updateProfile, uploadResume } from "../controllers/user.js";
import multerUpload from "../config/multer.js";
import { getStudents } from "../controllers/student.js";

const router = Router();

router.route("/students")
    .get(getStudents);


router.patch("/uploadresume/:id", multerUpload.single("resume"), uploadResume);


router.route("/:id")
    .get(getUser)
    .patch(multerUpload.single("profile") ,updateProfile);


export default router;