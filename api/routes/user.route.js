import express from "express";
const router = express.Router();
// import mongoose from "mongoose";
// import { User } from "../models/user.model.js";

import {
  userLogin,
  userSignup,
  deleteUser,
} from "../controller/user.controller.js";

router.post("/signup", userSignup);

router.delete("/:userId", deleteUser);

// router.post("/login", async (req, res, next) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       return res.status(401).json({
//         message: "Invalid Crediantials Auth fail",
//       });
//     }
//     bcrypt.compare(req.body.password, user.password, (err, result) => {
//       if (err) {
//         return res.status(401).json({
//           message: " Auth fail",
//         });
//       }
//       if (result) {
//         return res.status(200).json({ message: "Auth successful" });
//       }
//       res.status(401).json({
//         message: " Auth fail",
//       });
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error });
//   }
// });

router.post("/login", userLogin);

export default router;
