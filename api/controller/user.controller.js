import {
  signupService,
  loginService,
  deleteUserService,
} from "../services/user.services.js";

export const userSignup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await signupService(email, password);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if (error.message === "User already exists") {
      return res.status(409).json({ message: error.message });
    }

    if (error.name === "ValidationError" && error.errors?.email) {
      return res
        .status(400)
        .json({ message: "Email should be a valid format", field: "email" });
    }

    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginService(email, password);
    res.status(200).json({ message: "Auth successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User deletion error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

// Google OAuth Views
export const loadAuth = (req, res) => {
  res.render("auth");
};

export const successGoogleLogin = (req, res) => {
  if (!req.user) return res.redirect("/failure");
  console.log("Google Login Success:", req.user);
  res.send("Welcome " + req.user.email);
};

export const failureGoogleLogin = (req, res) => {
  res.send("Error");
};


// export const loadAuth = (req, res) => {
//   console.log(req.profile);
//   res.render("auth", req.profile);
// };

// export const loadAuth = (req, res) => {
//   res.render("auth");
// };

// export const successGoogleLogin = (req, res) => {
//   if (!req.user) res.redirect("/failure");
//   console.log(req.user);
//   console.log("i am here")
//   res.send("Welcome " + req.user.email);
// };

// export const failureGoogleLogin = (req, res) => {
//   res.send("Error");
// };
