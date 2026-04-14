# LabelLens

See Beyond the Label.

LabelLens reads packaged food labels with a vision model, scores the product from 1-10, and returns a plain-English nutrition breakdown.

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

## Stack

React 18, Vite, Tailwind CSS, Framer Motion, React Router, Express, multer, and Groq SDK.
