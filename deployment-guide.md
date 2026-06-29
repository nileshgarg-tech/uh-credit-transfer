# 🚀 UH Credit Transfer - Deployment Guide

## Overview
This guide covers deploying the UH Credit Transfer application with its React+Vite frontend and Express backend.

## Architecture
- **Frontend**: React + TypeScript + Vite + shadcn/ui
- **Backend**: Express.js + Azure Document Intelligence + OpenAI
- **Services**: Azure Document Intelligence, Azure OpenAI

---

## 🔵 Option 1: Azure App Service (Recommended)

### Why Azure?
- Already using Azure Document Intelligence & OpenAI
- Integrated ecosystem
- Easy scaling and management

### Steps:

#### 1. Prepare for Deployment
```bash
npm run build
```

#### 2. Create Azure Resources
```bash
# Install Azure CLI if not already installed
# az login

# Create resource group (if not exists)
az group create --name uh-credit-transfer-rg --location "East US"

# Create App Service Plan
az appservice plan create --name uh-credit-transfer-plan --resource-group uh-credit-transfer-rg --sku B1 --is-linux

# Create Web App for Backend
az webapp create --resource-group uh-credit-transfer-rg --plan uh-credit-transfer-plan --name uh-credit-transfer-api --runtime "NODE:18-lts"

# Create Static Web App for Frontend
az staticwebapp create --name uh-credit-transfer-frontend --resource-group uh-credit-transfer-rg --source https://github.com/yourusername/uh-credit-transfer --branch main --app-location "/" --output-location "dist"
```

#### 3. Configure Environment Variables in Azure
```bash
# Set environment variables for the backend
az webapp config appsettings set --resource-group uh-credit-transfer-rg --name uh-credit-transfer-api --settings \
  VITE_AZURE_DOCUMENT_ENDPOINT="your-endpoint" \
  VITE_AZURE_DOCUMENT_KEY="your-key" \
  VITE_OPENAI_KEY="your-openai-key" \
  VITE_OPENAI_ENDPOINT="your-openai-endpoint" \
  VITE_OPENAI_DEPLOYMENT="gpt-4" \
  PORT="8000"
```

---

## 🟢 Option 2: Vercel + Railway (Popular Choice)

### Frontend on Vercel
1. Push code to GitHub
2. Connect GitHub to Vercel
3. Deploy with these settings:
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### Backend on Railway
1. Visit [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy backend with environment variables
4. Update frontend API calls to Railway URL

---

## 🟠 Option 3: Render (Full-Stack)

### Single Repository Deployment
1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: uh-credit-transfer-backend
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: VITE_AZURE_DOCUMENT_ENDPOINT
        sync: false
      - key: VITE_AZURE_DOCUMENT_KEY
        sync: false
      - key: VITE_OPENAI_KEY
        sync: false
      - key: VITE_OPENAI_ENDPOINT
        sync: false
      - key: VITE_OPENAI_DEPLOYMENT
        value: gpt-4
        
  - type: static
    name: uh-credit-transfer-frontend
    buildCommand: npm run build
    staticPublishPath: ./dist
    pullRequestPreviewsEnabled: false
```

---

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables Security
Create `.env.production`:
```env
VITE_AZURE_DOCUMENT_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
VITE_AZURE_DOCUMENT_KEY=your-key-here
VITE_OPENAI_KEY=your-openai-key
VITE_OPENAI_ENDPOINT=https://uhopenai.openai.azure.com/
VITE_OPENAI_DEPLOYMENT=gpt-4
```

### 2. Update API URLs
```typescript
// src/lib/documentService.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com'
  : 'http://localhost:3001';
```

### 3. Build Test
```bash
npm run build
npm run preview  # Test production build locally
```

### 4. CORS Configuration
```javascript
// server.js - Update for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
};
```

---

## 🚀 Quick Deploy Commands

### For Azure:
```bash
npm run deploy:azure
```

### For Vercel:
```bash
npm run deploy:vercel
npx vercel --prod
```

### Manual Build:
```bash
npm run build
npm start  # Test production server
```

---

## 📊 Post-Deployment Testing

1. **Upload Test**: Try uploading an AP score report
2. **Equivalency Test**: Verify correct UH course matching
3. **Grade Display**: Confirm AP courses show "S" grade
4. **Mobile Test**: Check responsive design
5. **Error Handling**: Test with invalid files

---

## 🔐 Security Notes

- Never commit `.env` files
- Use Azure Key Vault for production secrets
- Enable HTTPS only
- Set up Content Security Policy
- Monitor API usage and rate limits

---

## 📈 Monitoring & Analytics

### Recommended Additions:
```typescript
// Add to main App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app content */}
      <Analytics />
    </>
  );
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions (`.github/workflows/deploy.yml`):
```yaml
name: Deploy UH Credit Transfer
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test  # Add if you have tests
```

Choose the option that best fits your needs! Azure is recommended since you're already in their ecosystem. 