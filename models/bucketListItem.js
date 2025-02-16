const mongoose = require("mongoose");

const bucketListItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        "goals",
        "travel",
        "movies",
        "music",
        "food",
        "games",
        "sports",
        "books",
        "hobbies",
        "events",
        "education",
        "experience",
        "skill",
        "other",
      ],
      required: true,
    },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    targetDate: { type: Date },
    budget: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["not started", "in progress", "completed", "on hold", "cancelled"],
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Links item to a specific user
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt timestamps
);

module.exports = mongoose.model("BucketListItem", bucketListItemSchema);
