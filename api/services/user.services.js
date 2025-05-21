import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

export const signupService = async (email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();

  return newUser;
};

export const loginService = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials - user not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials - password incorrect");
  }

  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id,
    },
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );

  return token;
};

export const deleteUserService = async (userId) => {
  const result = await User.deleteOne({ _id: userId });
  if (result.deletedCount === 0) {
    throw new Error("User not found");
  }
  return true;
};
