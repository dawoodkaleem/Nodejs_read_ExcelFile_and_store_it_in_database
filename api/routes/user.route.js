// import express from "express";
// const router = express.Router();
// // import mongoose from "mongoose";
// // import { User } from "../models/user.model.js";
// import passport from "passport";
// // const passport = require('passport')
// // require('../../passport.js');
// import "../../passport.js";

// import {
//   userLogin,
//   userSignup,
//   deleteUser,
//   loadAuth,
//   successGoogleLogin,
//   failureGoogleLogin,
// } from "../controller/user.controller.js";

// router.post("/signup", userSignup);

// router.delete("/:userId", deleteUser);

// // router.post("/login", async (req, res, next) => {
// //   try {
// //     const user = await User.findOne({ email: req.body.email });
// //     if (!user) {
// //       return res.status(401).json({
// //         message: "Invalid Crediantials Auth fail",
// //       });
// //     }
// //     bcrypt.compare(req.body.password, user.password, (err, result) => {
// //       if (err) {
// //         return res.status(401).json({
// //           message: " Auth fail",
// //         });
// //       }
// //       if (result) {
// //         return res.status(200).json({ message: "Auth successful" });
// //       }
// //       res.status(401).json({
// //         message: " Auth fail",
// //       });
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     res.status(500).json({ error });
// //   }
// // });

// router.post("/login", userLogin);

// router.use(passport.initialize());
// router.use(passport.session());

// // const userController = require("../controllers/userController");

// router.get("/", loadAuth);

// // Auth
// router.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

// // Auth Callback
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "/success",
//     failureRedirect: "/failure",
//   })
// );

// // Success
// router.get("/success", successGoogleLogin);

// // failure
// router.get("/failure", failureGoogleLogin);

// export default router;



import express from 'express';
import passport from 'passport';
import {
  userLogin,
  userSignup,
  deleteUser,
  loadAuth,
  successGoogleLogin,
  failureGoogleLogin,
} from '../controller/user.controller.js'; // Adjust path as needed

const router = express.Router();

router.get('/', loadAuth);
// Google login route
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// Google login callback route
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/success',
    failureRedirect: '/failure',
  })
);

// Success and failure routes
router.get('/success', successGoogleLogin);
router.get('/failure', failureGoogleLogin);

// Other user-related routes
router.post('/signup', userSignup);
router.delete('/:userId', deleteUser);
router.post('/login', userLogin);
router.get('/', loadAuth);

export default router;
