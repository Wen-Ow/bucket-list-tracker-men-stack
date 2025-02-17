const BucketListItem = require("../models/bucketListItem");

// I. (Index) - Show all bucket list items
exports.getAllItems = async (req, res) => {
  try {
    const items = await BucketListItem.find({ user: req.session.userId }); // Fetch items for the logged-in user
    res.render("bucketList/index", { bucketListItems: items });
  } catch (error) {
    res.status(500).send("Error retrieving bucket list items.");
  }
};

// N. (New) - Show form to create a new item
exports.showNewForm = (req, res) => {
  res.render("bucketList/new");
};

// D. (Delete) - Delete a bucket list item
exports.deleteItem = async (req, res) => {
  try {
    await BucketListItem.findOneAndDelete({
      _id: req.params.id,
      user: req.session.userId,
    });
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error deleting bucket list item.");
  }
};

// U. (Update) - Update an existing bucket list item
exports.updateItem = async (req, res) => {
  try {
    await BucketListItem.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId },
      req.body
    );
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error updating bucket list item.");
  }
};

// C. (Create) - Create a new bucket list item
exports.createItem = async (req, res) => {
  try {
    await BucketListItem.create({ ...req.body, user: req.session.userId });
    res.redirect("/bucketList");
  } catch (error) {
    res.status(500).send("Error creating bucket list item.");
  }
};

// E. (Edit) - Show form to edit an existing item
exports.showEditForm = async (req, res) => {
  try {
    const item = await BucketListItem.findOne({
      _id: req.params.id,
      user: req.session.userId,
    });
    if (!item) return res.status(404).send("Item not found.");
    res.render("bucketList/edit", { bucketListItem: item });
  } catch (error) {
    res.status(500).send("Error retrieving the item for editing.");
  }
};

// S. (Show) - Show details of a specific item
exports.getItemById = async (req, res) => {
  try {
    const item = await BucketListItem.findOne({
      _id: req.params.id,
      user: req.session.userId,
    });
    if (!item) return res.status(404).send("Item not found.");
    res.render("bucketList/show", { bucketListItem: item });
  } catch (error) {
    res.status(500).send("Error retrieving the item.");
  }
};
