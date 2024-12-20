const express = require("express")
const {handleSignup,handleAutoLogin,handleLogin,handleLogout,handleOtp} = require("../controllers/auth")
const router = express.Router()

router.post("/signup",handleSignup)
router.post("/login",handleLogin)
router.get("/logout",handleLogout)
router.get("/autoLogin",handleAutoLogin)
router.post("/verifyOtp",handleOtp)

module.exports = router