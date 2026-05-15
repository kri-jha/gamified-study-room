const mongoose = require("mongoose");

const QUEST_RARITIES = ["Common", "Rare", "Epic", "Legendary"];

const QuestSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rarity: {
      type: String,
      enum: QUEST_RARITIES,
      default: "Common",
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

QuestSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Quest", QuestSchema);
