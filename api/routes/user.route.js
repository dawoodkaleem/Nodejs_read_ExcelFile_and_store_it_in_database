import express from "express";
const router = express.Router();
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

router.post("/signup", async (req, res, next) => {
  try {
    const checkIfUserExits = await User.findOne({ email: req.body.email });
    if (checkIfUserExits) {
      return res.status(409).json({ message: "User already exists" });
    }
    //Hash password for security
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hash,
    });

    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Check if email caused the error
      if (error.errors && error.errors.email) {
        return res.status(400).json({
          message: "Email should be a valid format",
          field: "email",
        });
      }
    }

    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
});

router.delete("/:userId", async (req, res, next) => {
  try {
    const result = await User.deleteOne({ _id: req.params.userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User deletion error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
});

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

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials - user not found",
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials - password incorrect",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      "secretkey", // ideally use process.env.JWT_SECRET
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Auth successful",
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
