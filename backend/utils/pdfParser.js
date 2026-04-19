const pdfParse = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Basic heuristic extraction for fallback logic 
const extractProfileDetails = (text) => {
  const details = {};
  
  // Basic Regex to find standard Indian details (Account No, etc)
  const accRegex = /(?:A\/C|Account No|Account Number)[\s\:\-]*(\d{9,18})/i;
  const accMatch = text.match(accRegex);
  if (accMatch) {
    details.accountNumber = accMatch[1];
    details.hasBankAccount = true;
  }
  
  // Try to find names (very heuristic)
  const nameRegex = /(?:Name)[\s\:\-]*([A-Za-z\s]+)/i;
  const nameMatch = text.match(nameRegex);
  if (nameMatch) {
    details.name = nameMatch[1].trim();
  }

  return details;
};

module.exports = { extractTextFromPDF, extractProfileDetails };
