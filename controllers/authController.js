const bcrypt = require("bcrypt");
const User = require("../models/user");

// Method to render the sign-up page
const signUpPage = (req, res) => res.render("auth/signUp");

// Method to handle user sign-up
const signUp = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      // Create a new user
      username: req.body.username,
      password: hashedPassword,
    }); // Save the user

    // Compare password
    req.session.userId = user._id; // Store user ID in session
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error registering user. Please try again.");
  }
};

// Method to render the sign-in page
const signInPage = (req, res) => res.render("auth/signIn");

// Method to handle user sign-in
const signIn = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username }); // Find user by username
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      // Compare password
      req.session.userId = user._id; // Store user ID in session
      res.redirect("/bucketList");
    } else {
      res.status(400).send("Invalid username or password.");
    }
  } catch (error) {
    res.status(500).send("Error logging in. Please try again.");
  }
};

// Method to handle user sign-out
const signOut = (req, res) => {
  req.session.destroy(() => res.redirect("/signin")); // Destroy session and redirect to sign-in page
};

module.exports = {
  signUpPage,
  signUp,
  signInPage,
  signIn,
  signOut,
};
