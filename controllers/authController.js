const bcrypt = require("bcrypt");
const User = require("../models/user");

// Show the sign-up page
exports.showSignUp = (req, res) => {
  res.render("auth/signUp");
};

// Handle user registration
exports.registerUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      username: req.body.username,
      password: hashedPassword,
    });
    res.redirect("/signin");
  } catch (error) {
    res.status(500).send("Error registering user. Please try again.");
  }
};

// Show the sign-in page
exports.showSignIn = (req, res) => {
  res.render("auth/signIn");
};

// Handle user login
exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      req.session.userId = user._id;
      res.redirect("/bucketList");
    } else {
      res.status(400).send("Invalid username or password.");
    }
  } catch (error) {
    console.error("Error logging in user", error);
    res.status(500).send("Error logging in. Please try again.");
  }
};

// Handle user logout
exports.logoutUser = (req, res) => {
  req.session.destroy(() => res.redirect("/signin"));
};
