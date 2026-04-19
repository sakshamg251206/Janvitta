const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  try {
    const { email, password, ...profileData } = req.body;
    
    // Basic user creation (add email/password back to model if needed for auth, 
    // assuming email/password wasn't explicitly in schema, we just save profile details)
    let user = new User(profileData);
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_secret_key_here',
      { expiresIn: '30d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error registering user' });
  }
};

const loginUser = async (req, res) => {
  // Mock login for now, we didn't add email/pass to the strict schema above, 
  // but keeping structure ready
  res.status(501).json({ message: 'Login flow to be fully implemented with email schema' });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};
