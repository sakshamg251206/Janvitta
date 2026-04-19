const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { extractTextFromPDF, extractProfileDetails } = require('../utils/pdfParser');
const { extractDetailsWithAI } = require('../utils/aiMatcher');

router.post('/pdf', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    
    // First try basic heuristic extraction
    let details = extractProfileDetails(text);

    // If AI is configured, try to enrich using Claude
    const aiDetails = await extractDetailsWithAI(text, 'Bank Statement / General Document');
    if (aiDetails) {
      details = { ...details, ...aiDetails };
    }

    res.json({ message: 'Document parsed successfully', extractedData: details });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing document upload' });
  }
});

router.post('/aadhaar', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    
    // Basic heuristic to get details
    let details = extractProfileDetails(text);

    // Try Claude AI for advanced extraction
    const aiDetails = await extractDetailsWithAI(text, 'Masked Aadhaar Card');
    if (aiDetails) {
      details = { ...details, ...aiDetails };
    }

    res.json({ message: 'Aadhaar parsed successfully', extractedData: details });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing Aadhaar upload' });
  }
});

module.exports = router;
