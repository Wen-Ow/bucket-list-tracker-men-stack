// ---- Custom Middleware for Protecting Routes ---- //
const isAuthenticated = (req, res, next) => {
  // Ensures only authenticated users can access certain routes
  if (req.session.userId) return next();
  res.redirect("/signin"); // Redirect to sign-in page if the user is not authenticated
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500) // Set the status code
    .render("error", { message: err.message || "Internal Server Error" }); // Render the error page
};

module.exports = { isAuthenticated, errorHandler };
