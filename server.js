// ---- Dependencies ---- //
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

// ---- Initialize the Express App ---- //
const app = express();

// ---- Connect to MongoDB ---- //
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB Bucket List Database");
});

// ---- Middleware Configuration ---- //
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // Parse the form data into req.body
app.use(methodOverride("_method")); // Enables PUT and DELETE requests
app.use(express.static("public")); // Serve static files from the public directory (i.e. CSS, JS, images)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yolosecretlog", // Secret key for signing the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't save uninitialized sessions
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // Store sessions in MongoDB
  })
);

// ---- Custom Middleware for Protecting Routes ---- //
const isAuthenticated = (req, res, next) => {
  // Ensures only authenticated users can access certain routes
  if (req.session.userId) return next();
  res.redirect("/signin"); // Redirect to sign-in page if the user is not authenticated
};

// ---- Import Models ---- //
const User = require("./models/user"); // User model for authentication
const BucketListItem = require("./models/bucketListItem"); // Bucket List Item model

// ---- User Authentication Routes ---- //
// Show the sign-up page
app.get("/signup", (req, res) => res.render("auth/signUp"));

// Handle user registration
app.post("/signup", async (req, res) => {
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
});

// Show the sign-in page
app.get("/signin", (req, res) => res.render("auth/signIn"));

// Handle user login
app.post("/signin", async (req, res) => {
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
});

// Handle user logout
app.get("/signout", (req, res) => {
  req.session.destroy(() => res.redirect("/signin")); // Destroy session and redirect to sign-in page
});

// ---- Bucket List CRUD Routes (I.N.D.U.C.E.S) ---- //
// I. (Index) - GET /bucketList - Display all bucket list items
app.get("/bucketList", isAuthenticated, async (req, res) => {
  try {
    const items = await BucketListItem.find({ user: req.session.userId }); // Find items for the logged-in user
    const user = await User.findById(req.session.userId); // Find the user
    res.render("bucketList/index", { items, user });
  } catch (error) {
    res.status(500).send("Error retrieving bucket list items.");
  }
});

// N. (New) - GET /bucketList/new - Show the form to create a new bucket list item
app.get("/bucketList/new", isAuthenticated, (req, res) => {
  res.render("bucketList/new");
});

// D. (Delete) - DELETE /bucketList/:id - Delete a specific item from the bucket list
app.delete("/bucketList/:id", isAuthenticated, async (req, res) => {
  try {
    await BucketListItem.findOneAndDelete({
      _id: req.params.id,
      user: req.session.userId,
    }); // Ensure only the owner can delete it
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error deleting bucket list item.");
  }
});

// U. (Update) - PUT /bucketList/:id - Modify a specific item in an existing bucket list
app.put("/bucketList/:id", isAuthenticated, async (req, res) => {
  try {
    await BucketListItem.findOneAndUpdate(
      // Ensure only the owner can update it
      { _id: req.params.id, user: req.session.userId }, // Find the item
      req.body // Update the item
    );
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error updating bucket list item.");
  }
});

// C. (Create) - POST /bucketList - Add a new item in the bucket list
app.post("/bucketList", isAuthenticated, async (req, res) => {
  try {
    await BucketListItem.create({ ...req.body, user: req.session.userId });
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error creating bucket list item.");
  }
});

// E. (Edit) - GET /bucketList/:id/edit - Show the form to edit an existing item
app.get("/bucketList/:id/edit", isAuthenticated, async (req, res) => {
  try {
    const item = await BucketListItem.findOne({
      // Ensure only the owner can edit it
      _id: req.params.id,
      user: req.session.userId,
    });
    if (!item) return res.status(404).send("Item not found."); // Handle not found
    res.render("bucketList/edit", { item });
  } catch (error) {
    res.status(500).send("Error retrieving the item for editing.");
  }
});

// S. (Show) - GET /bucketList/:id - Display details of a specific item
app.get("/bucketList/:id", isAuthenticated, async (req, res) => {
  try {
    const item = await BucketListItem.findOne({
      // Ensure only the owner can view it
      _id: req.params.id,
      user: req.session.userId,
    });
    if (!item) return res.status(404).send("Item not found.");
    res.render("bucketList/show", { item });
  } catch (error) {
    res.status(500).send("Error retrieving the item.");
  }
});

// ---- Error Handling Middleware ---- //
// Catch all errors and display the error page
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500) // Set the status code
    .render("error", { message: err.message || "Internal Server Error" }); // Render the error page
});

// ---- Port Configuration ---- //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
