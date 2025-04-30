import mongoose from "mongoose";

// const userSchema = mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
//   },
//   password: { type: String, default: null },
//   accessToken: { type: String, default: null }
// });
// export const User = mongoose.model("User", userSchema);


// models/user.model.js


const userSchema = new mongoose.Schema({
  // Common fields
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },

  // For email/password login
  password: {
    type: String,
    default: null, // Not required for OAuth users
  },

  // For Google OAuth id return from google
  googleId: {
    type: String,
    default: null,
  },

  // For HubSpot OAuth
  hubspotId: {
    type: String,
    default: null,
  },
  hubspotAccessToken: {
    type: String,
    default: null,
  },

  hubspotTokenExpiresAt: {
    type: Date,
    default: null,
  },

  // Optional fields
  name: String,
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
