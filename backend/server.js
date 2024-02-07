// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const socket = require("./socket");

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

const io = socket();

app.use(cors({ origin: "*" }));

// Use bodyParser middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "your_mongodb_connection_string";
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define routes
app.use("/user", require("./routes/user"));
app.use("/group-messages", require("./routes/groupMessages"));

// Start the server
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
