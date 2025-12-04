# Backend Deployment Instructions

## Python Backend for BCV Scraping

The backend folder contains a Python Flask API that scrapes exchange rates from bcv.org.ve.

### Local Testing

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the API server:
```bash
python api.py
```

The API will run on `http://localhost:5000`

### Deployment Options

#### Option 1: Render (Recommended - Free Tier Available)

1. Create account at https://render.com
2. Create new "Web Service"
3. Connect your GitHub repository
4. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python api.py`
5. Deploy

#### Option 2: Railway

1. Create account at https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Railway will auto-detect Python and deploy

#### Option 3: PythonAnywhere

1. Create account at https://www.pythonanywhere.com
2. Upload backend files
3. Configure WSGI file to point to `api.py`

### Frontend Configuration

After deploying, update the frontend environment variable:

Create `.env.local` in the project root:
```
VITE_BCV_API_URL=https://your-backend-url.com
```

If not set, it defaults to `http://localhost:5000` for local development.
