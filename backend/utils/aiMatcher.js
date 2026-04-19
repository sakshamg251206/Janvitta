const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize the Anthropic client only if the key is present
let anthropic = null;
if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_key_here') {
  anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });
}

const extractDetailsWithAI = async (text, documentType) => {
  if (!anthropic) {
    console.log('Anthropic API key not configured. Skipping AI extraction.');
    return null;
  }

  const prompt = `
    You are an expert data extractor. I have a document of type: ${documentType}.
    Please extract any personal identifying information, financial status, or other markers that might be relevant for Indian Government Schemes (like name, age, income, category, bank account presence, etc).
    
    Return the output STRICTLY as a JSON object, without any markdown formatting wrappers (no \`\`\`json).
    Use keys such as: name, age, gender, occupation, annualIncome, hasBankAccount, state, district.
    
    Document Text:
    ${text.substring(0, 4000)} // Limiting text length for safety
  `;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    const content = response.content[0].text;
    return JSON.parse(content);
  } catch (error) {
    console.error('Claude API Error:', error);
    return null;
  }
};

module.exports = { extractDetailsWithAI };
