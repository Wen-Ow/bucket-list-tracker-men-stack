document.addEventListener("DOMContentLoaded", () => {
  // When the DOM is fully loaded
  const form = document.querySelector("form"); // Get the form on the page

  form.addEventListener("submit", (e) => {
    // When the user tries to submit the form after filling it
    const title = document.querySelector("#title").value.trim(); // Get the title input value or required field

    if (!title) {
      // Checks if the title is empty or only spaces
      alert("Title cannot be empty!"); // Show an alert
      e.preventDefault(); // Stop the form from being submitted
    }
  });
});

