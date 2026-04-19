# LabhSetu — सरकारी योजना खोजें

> AI-powered government scheme eligibility finder for India.
> Find schemes worth lakhs in 2 minutes. Free. No login required.

---

## 📁 Project Structure

```
LabhSetu/
├── frontend/                  ← Static HTML/CSS/JS (works without backend)
│   ├── index.html
│   ├── styles/
│   │   ├── main.css
│   │   ├── cards.css
│   │   └── mobile.css
│   └── scripts/
│       ├── language.js        ← Hindi/English toggle
│       ├── schemes.js         ← 35+ schemes database
│       ├── matcher.js         ← Eligibility engine
│       └── app.js             ← Main controller
│
└── backend/                   ← Node.js + Express API
    ├── server.js              ← Main server
    ├── .env                   ← Config (copy .env, fill values)
    ├── package.json
    ├── models/
    │   ├── User.js
    │   └── Scheme.js
    ├── controllers/
    │   ├── userController.js
    │   └── schemeController.js
    ├── routes/
    │   ├── schemes.js
    │   ├── user.js
    │   └── upload.js
    ├── middleware/
    │   ├── auth.js
    │   └── upload.js
    └── database/
        └── seed.js
```

---

## 🚀 Quick Start

### Option A — Frontend Only (Instant, No Setup)
Just open `frontend/index.html` in your browser. Everything works offline.

### Option B — Full Stack

**1. Install dependencies**
```bash
cd backend
npm install
```

**2. Configure environment**
```bash
cp .env .env.local
# Edit .env.local with your values:
# - MONGODB_URI
# - JWT_SECRET
# - CLAUDE_API_KEY
```

**3. Start MongoDB**
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) — just paste connection string in .env
```

**4. Seed the database**
```bash
npm run seed
```

**5. Start server**
```bash
npm run dev      # Development (auto-reload)
npm start        # Production
```

**6. Open browser**
```
http://localhost:3000
```

---

## 🔌 API Reference

### Schemes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/schemes` | List all schemes |
| GET    | `/api/schemes/:id` | Single scheme details |
| POST   | `/api/schemes/match` | Match profile to schemes |
| GET    | `/api/schemes/stats` | Category breakdown |

### Match API — POST `/api/schemes/match`
```json
{
  "age": 35,
  "gender": "male",
  "annualIncome": 150000,
  "occupation": "farmer",
  "casteCategory": "OBC",
  "state": "RJ",
  "hasBPLCard": false,
  "hasLandHolding": true,
  "isDifferentlyAbled": false,
  "hasBankAccount": true
}
```

Response:
```json
{
  "success": true,
  "eligible": [...],
  "almost": [...],
  "totalBenefit": 806000,
  "eligibleCount": 5,
  "almostCount": 3
}
```

### User Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user/register` | No | Create account |
| POST | `/api/user/login` | No | Login |
| GET  | `/api/user/profile` | JWT | Get profile |
| PUT  | `/api/user/profile` | JWT | Update profile |
| GET  | `/api/user/saved-schemes` | JWT | Saved schemes |
| POST | `/api/user/saved-schemes` | JWT | Save a scheme |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/pdf` | Parse bank statement PDF |
| POST | `/api/upload/analyze` | AI document analysis |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| AI | Claude API (Anthropic) |
| PDF | pdf-parse |
| Upload | Multer |
| Security | Helmet, Rate limiting, CORS |

---

## 🌐 Deploy to Production

### Railway (Recommended — Free tier)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render
1. Push to GitHub
2. Connect repo on render.com
3. Set environment variables
4. Deploy

### Environment Variables for Production
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_very_long_secret
CLAUDE_API_KEY=sk-ant-...
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 📈 Roadmap

- [ ] Round 4: AI document analysis (Aadhaar + bank statement)
- [ ] Round 5: DigiLocker integration
- [ ] Round 6: OTP login via mobile
- [ ] Round 7: Docker + CI/CD deployment
- [ ] Future: 10 Indian languages
- [ ] Future: WhatsApp bot integration

---

## 📄 License
MIT — Free to use, modify, deploy.