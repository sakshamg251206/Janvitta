# Government Scheme Eligibility Finder

A web application for citizens to easily find and apply for Indian Government Schemes they are eligible for. 

## Structure
- \`frontend/\` - Vanilla HTML/CSS/JS frontend application.
- \`backend/\` - Node & Express backend.
- \`database/\` - Raw JSON scheme data.

## Requirements
- Node.js
- MongoDB

## Setup

1. Configure `.env` file with your `MONGODB_URI` and `CLAUDE_API_KEY`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Stack
- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express, Mongoose
- Security: JWT, bcryptjs
- Matching: Anthropic Claude AI integration, Custom Rules Engine
