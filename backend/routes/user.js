const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/userController');

// Register new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile (Protected)
router.get('/profile', auth, getProfile);

// Update user profile (Protected)
router.put('/update', auth, updateProfile);

module.exports = router;
