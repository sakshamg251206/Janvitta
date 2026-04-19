const express = require('express');
const router = express.Router();
const { getAllSchemes, getSchemeById, matchSchemesToUser } = require('../controllers/schemeController');

// Get all schemes
router.get('/', getAllSchemes);

// Get single scheme by ID
router.get('/:id', getSchemeById);

// Match user profile to schemes
router.post('/match', matchSchemesToUser);

module.exports = router;
