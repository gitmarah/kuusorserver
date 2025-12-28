import passport from "passport";
import { Router } from "express";
import { getUserAndAccessToken, googleCallback, refresh, signin, signout, verifyEmail } from "../controllers/auth.js";
import { forgotPassword } from "../controllers/recoverPassword.js";
import { resetPassword } from "../controllers/recoverPassword.js";

const router = Router();

router.post("/", signin);
router.post("/signout", signout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);
router.get("/refresh", refresh);
router.get("/verify/:token", verifyEmail);
router.get("/google", (req, res, next) => {
    const role = req.query.role;
    if(!role) return res.status(400).json({ message: "Role is required!" });
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: JSON.stringify({ role })
    })(req, res, next); });
router.get("/google/callback", passport.authenticate("google", { session: false }), googleCallback);
router.get("/getuserandaccesstoken", getUserAndAccessToken);


export default router;