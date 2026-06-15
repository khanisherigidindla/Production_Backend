const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, age, location, gmail, password } = req.body;

    if (!gmail || !password) {
      return res.status(400).json({ message: "Email and Password required" });
    }

    const existingUser = await User.findOne({ gmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      age,
      location,
      gmail,
      password: hashedPassword
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      age: user.age,
      location: user.location,
      gmail: user.gmail,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({ message: "User registered successfully", user: userResponse });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { gmail, password } = req.body;

    const user = await User.findOne({ gmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, age, location, gmail, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (gmail && gmail !== user.gmail) {
      const existing = await User.findOne({ gmail });
      if (existing) return res.status(400).json({ message: "Email already exists" });
      user.gmail = gmail;
    }

    if (typeof name !== 'undefined') user.name = name;
    if (typeof age !== 'undefined') user.age = age;
    if (typeof location !== 'undefined') user.location = location;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updated = await user.save();
    const out = updated.toObject();
    delete out.password;
    res.status(200).json({ message: "User updated", user: out });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch a single user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ gmail: req.params.gmail }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user data in MongoDB
exports.updateUser = async (req, res) => {
  try {
    const { name, age, location } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (age) user.age = age;
    if (location) user.location = location;

    const updatedUser = await user.save();
    
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      age: updatedUser.age,
      location: updatedUser.location,
      gmail: updatedUser.gmail,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.status(200).json({ message: "User updated successfully", user: userResponse });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user from MongoDB
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
