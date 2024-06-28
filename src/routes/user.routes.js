import { Router } from "express";
import {loginUser, logoutUser, registerUser, refreshAccessToken, changePassword, getCurrentUser, updateDetails} from '../controllers/user.controller.js'
import {upload} from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxcount: 1
        },
        {
            name: "coverImage",
            maxcount: 1
        }])
    ,registerUser)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/refresh-Token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt, changePassword)
router.route("/current-user").post(verifyJwt, getCurrentUser)
router.route("/update-details").post(verifyJwt, updateDetails)

export default router;