# Product Hunt

<p align="center">
	<a href="https://www.producthunt.com/">
		<img src="https://img.shields.io/badge/Product%20Hunt-%2311-orange?logo=producthunt&logoColor=white" alt="Product Hunt #11" />
	</a>
</p>

<p align="center">
	<strong>🚀 Labellens — Featured #11 on Product Hunt!</strong>
</p>

---

# LabelLens

See Beyond the Label.

LabelLens reads packaged food labels with a vision model, scores the product from 1-10, and returns a plain-English nutrition breakdown.

## Problem it solves 

Consumers struggle to make informed decisions about packaged food due to complex nutrition labels, misleading marketing, and information overload. LabelLens solves this by instantly capturing the nutrition label with your phone camera and providing an easy-to-understand health score (1-10) accompanied by plain-English ingredient analysis and nutritional insights.

## Architecture

**Frontend (React + Vite)**
- `App.jsx` - Main application component
- `pages/` - Landing page and Scan page (camera upload interface)
- `components/` - Reusable UI components (AnalysisResult, ScoreRing, FeatureGrid, etc.)
- `hooks/useAnalyze.js` - Custom hook for API communication
- `utils/` - Helper functions (scoreColor, shareCard)

**Backend (Express + Node.js)**
- `routes/analyze.js` - API endpoint for image analysis
- `controllers/analyzeController.js` - Business logic for processing uploaded images
- `middleware/upload.js` - File upload handling with multer
- **Groq LLM** - Vision model for nutrition label analysis and health scoring

**Workflow**
1. User uploads image of food label → Frontend sends to backend
2. Backend processes image with Groq vision model
3. LLM extracts nutrition data and generates health score
4. Results returned to frontend with visualization
5. User can share results via card component

## Setup

```bash
# 1. Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# 2. Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > server/.env

# 3. Run dev
cd .. && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

## Production Deployment

- Netlify frontend env var: `VITE_API_URL=https://labellens-api.onrender.com`
- Render backend env var: `CLIENT_ORIGIN=https://labellens.app,https://www.labellens.app`
- Keep `GROQ_API_KEY` configured in Render.

## Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router  
**Backend:** Express, multer, Groq SDK  
**LLM:** Groq (vision model for nutrition analysis)  
**Deployment:** Frontend on Netlify, Backend on Render
