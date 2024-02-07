const express = require("express");
const User = require("../schema/User");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//register as a user
router.post("/register", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      firstname,
      lastname,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWTSECRET, {
      expiresIn: "1h",
    });

    res.json({ token, ...savedUser._doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//login  a user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWTSECRET, {
      expiresIn: "1h",
    });

    res.json({ token, ...user._doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//whoami
router.get("/whoami", verifyToken, async (req, res) => {
  try {
    // Use req.userId to fetch user details from the database
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...sendUserData } = user._doc;
    res.json({ ...sendUserData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
