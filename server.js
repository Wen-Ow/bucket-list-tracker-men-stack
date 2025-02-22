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

// --- Importing Controllers --- //
const { signUpPage, signUp, signInPage, signIn, signOut } = require("./controllers/authController");

const {
  bucketList,
  createBucketListItem,
  createBucketListItemPage,
  deleteBucketListItem,
  showBucketListItem,
  updateBucketListItem,
  updateBucketListItemPage,
} = require("./controllers/bucketListController");

// ---- User Authentication Routes ---- //
// Show the sign-up page
app.get("/signup", signUpPage);

// Handle user registration
app.post("/signup", signUp);

// Show the sign-in page
app.get("/signin", signInPage);

// Handle user login
app.post("/signin", signIn);

// Handle user logout
app.get("/signout", signOut);

// ---- Bucket List CRUD Routes (I.N.D.U.C.E.S) ---- //
// I. (Index) - GET /bucketList - Display all bucket list items
app.get("/bucketList", isAuthenticated, bucketList);

// N. (New) - GET /bucketList/new - Show the form to create a new bucket list item
app.get("/bucketList/new", isAuthenticated, createBucketListItemPage);

// D. (Delete) - DELETE /bucketList/:id - Delete a specific item from the bucket list
app.delete("/bucketList/:id", isAuthenticated, deleteBucketListItem);

// U. (Update) - PUT /bucketList/:id - Modify a specific item in an existing bucket list
app.put("/bucketList/:id", isAuthenticated, updateBucketListItem);

// C. (Create) - POST /bucketList - Add a new item in the bucket list
app.post("/bucketList", isAuthenticated, createBucketListItem);

// E. (Edit) - GET /bucketList/:id/edit - Show the form to edit an existing item
app.get("/bucketList/:id/edit", isAuthenticated, updateBucketListItemPage);

// S. (Show) - GET /bucketList/:id - Display details of a specific item
app.get("/bucketList/:id", isAuthenticated, showBucketListItem);

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
