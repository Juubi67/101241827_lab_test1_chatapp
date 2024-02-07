const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema({
  room: String,
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  date_sent: Date,
});

const Message = mongoose.model("GroupMessage", groupMessageSchema);

module.exports = Message;
