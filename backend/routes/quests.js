const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Quest = require("../models/Quest");
const User = require("../models/User");

const QUEST_RARITIES = ["Common", "Rare", "Epic", "Legendary"];
const getQuestXp = (rarity) => (rarity === "Legendary" ? 50 : 10);

const sanitizePercentage = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
};

// @route   GET /api/quests
// @desc    Get quests owned by the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const quests = await Quest.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(quests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/quests
// @desc    Create a quest for the authenticated user
router.post("/", auth, async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) return res.status(400).json({ error: "Quest title is required" });

    const rarity = QUEST_RARITIES.includes(req.body.rarity) ? req.body.rarity : "Common";
    const percentage = sanitizePercentage(req.body.percentage);

    const quest = new Quest({
      owner: req.user.id,
      title,
      description: typeof req.body.description === "string" ? req.body.description.trim() : "",
      percentage,
      rarity,
      completedAt: percentage === 100 ? new Date() : null,
    });

    await quest.save();
    res.status(201).json(quest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PATCH /api/quests/:id
// @desc    Update a quest owned by the authenticated user
router.patch("/:id", auth, async (req, res) => {
  try {
    const fields = {};

    if (req.body.title !== undefined) {
      const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
      if (!title) return res.status(400).json({ error: "Quest title is required" });
      fields.title = title;
    }

    if (req.body.description !== undefined) {
      fields.description = typeof req.body.description === "string" ? req.body.description.trim() : "";
    }

    if (req.body.rarity !== undefined) {
      if (!QUEST_RARITIES.includes(req.body.rarity)) {
        return res.status(400).json({ error: "Invalid quest rarity" });
      }
      fields.rarity = req.body.rarity;
    }

    if (req.body.percentage !== undefined) {
      const percentage = sanitizePercentage(req.body.percentage);
      fields.percentage = percentage;
      fields.completedAt = percentage === 100 ? new Date() : null;
    }

    const quest = await Quest.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: fields },
      { new: true, runValidators: true }
    );

    if (!quest) return res.status(404).json({ error: "Quest not found" });
    res.json(quest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   DELETE /api/quests/:id
// @desc    Delete a quest owned by the authenticated user
router.delete("/:id", auth, async (req, res) => {
  try {
    const quest = await Quest.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!quest) return res.status(404).json({ error: "Quest not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/quests/claim-xp
// @desc    Claim XP for completed, unclaimed quests owned by the authenticated user
router.post("/claim-xp", auth, async (req, res) => {
  try {
    const claimableQuests = await Quest.find({
      owner: req.user.id,
      percentage: 100,
      rewardClaimed: false,
    });

    const claimedQuests = [];

    for (const quest of claimableQuests) {
      const claimed = await Quest.findOneAndUpdate(
        { _id: quest._id, owner: req.user.id, percentage: 100, rewardClaimed: false },
        { $set: { rewardClaimed: true, completedAt: quest.completedAt || new Date() } },
        { new: true }
      );

      if (claimed) claimedQuests.push(claimed);
    }

    const xpGain = claimedQuests.reduce((sum, quest) => sum + getQuestXp(quest.rarity), 0);

    if (xpGain === 0) {
      const user = await User.findById(req.user.id).select("xp");
      return res.json({ xpGain: 0, xp: user?.xp || 0, claimedQuestIds: [] });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { xp: xpGain } },
      { new: true }
    ).select("xp");

    res.json({
      xpGain,
      xp: user.xp,
      claimedQuestIds: claimedQuests.map((quest) => quest._id),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
