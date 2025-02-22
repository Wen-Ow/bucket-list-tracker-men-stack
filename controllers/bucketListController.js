const BucketListItem = require("../models/bucketListItem");
const User = require("../models/user");

// I = Index - Method to display all bucket list items
const bucketList = async (req, res) => {
  try {
    const items = await BucketListItem.find({ user: req.session.userId }); // Find items for the logged-in user
    const user = await User.findById(req.session.userId); // Find the user
    res.render("bucketList/index", { items, user });
  } catch (error) {
    res.status(500).send("Error retrieving bucket list items.");
  }
};

// N = New - Method to show the form to create a new bucket list item
const createBucketListItemPage = (req, res) => {
  res.render("bucketList/new");
};

// D = Delete - Method to delete a specific bucket list item
const deleteBucketListItem = async (req, res) => {
  try {
    await BucketListItem.findOneAndDelete({
      _id: req.params.id,
      user: req.session.userId,
    }); // Ensure only the owner can delete it
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error deleting bucket list item.");
  }
};

// U = Update - Method to update a specific bucket list item
const updateBucketListItem = async (req, res) => {
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
};

// C = Create - Method to handle creating a new bucket list item
const createBucketListItem = async (req, res) => {
  try {
    await BucketListItem.create({ ...req.body, user: req.session.userId });
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error creating bucket list item.");
  }
};

// E = Edit - Method to show the form to edit an existing bucket list item
const updateBucketListItemPage = async (req, res) => {
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
};

// S = Show - Method to display details of a specific bucket list item
const showBucketListItem = async (req, res) => {
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
};

module.exports = {
  bucketList,
  createBucketListItem,
  createBucketListItemPage,
  deleteBucketListItem,
  showBucketListItem,
  updateBucketListItem,
  updateBucketListItemPage,
};
