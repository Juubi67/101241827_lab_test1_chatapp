const express = require("express");
const GroupMessage = require("../schema/GroupMessage");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const room = req.query.room;
    const messages = await GroupMessage.find({ room }).populate("from_user");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
