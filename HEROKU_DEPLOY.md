# 🚀 HEROKU DEPLOYMENT GUIDE - UH Credit Transfer

## ✅ **Prerequisites**
All necessary files have been created for Heroku deployment:
- ✅ `Procfile` - Tells Heroku how to start the app
- ✅ `app.json` - One-click deploy configuration
- ✅ `package.json` - Updated with heroku-postbuild script
- ✅ Server configured for production

---

## 🎯 **DEPLOYMENT METHODS**

### **Method 1: One-Click Deploy (EASIEST)**

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "UH Credit Transfer - Ready for Heroku"
   git remote add origin https://github.com/YOUR-USERNAME/uh-credit-transfer
   git push -u origin main
   ```

2. **Update the `app.json` repository URL**:
   - Edit `app.json` line 4
   - Replace `https://github.com/yourusername/uh-credit-transfer` with your actual GitHub URL

3. **Create Deploy Button** (Add this to your README):
   ```markdown
   [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/YOUR-USERNAME/uh-credit-transfer)
   ```

4. **Click the Deploy Button** and fill in your environment variables

---

### **Method 2: Heroku CLI (Manual)**

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku App**:
   ```bash
   heroku create uh-credit-transfer-yourname
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set VITE_AZURE_DOCUMENT_ENDPOINT="https://your-endpoint.cognitiveservices.azure.com/"
   heroku config:set VITE_AZURE_DOCUMENT_KEY="your-azure-key"
   heroku config:set VITE_OPENAI_KEY="your-openai-key"
   heroku config:set VITE_OPENAI_ENDPOINT="https://uhopenai.openai.azure.com/"
   heroku config:set VITE_OPENAI_DEPLOYMENT="gpt-4"
   heroku config:set NODE_ENV="production"
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

---

## 🔧 **Environment Variables Required**

When deploying, you'll need these values from your `.env.local`:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AZURE_DOCUMENT_ENDPOINT` | Azure Document Intelligence endpoint | `https://your-name.cognitiveservices.azure.com/` |
| `VITE_AZURE_DOCUMENT_KEY` | Azure Document Intelligence key | `abc123...` |
| `VITE_OPENAI_KEY` | Azure OpenAI API key | `xyz789...` |
| `VITE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | `https://uhopenai.openai.azure.com/` |
| `VITE_OPENAI_DEPLOYMENT` | OpenAI deployment name | `gpt-4` |

---

## 🎉 **After Deployment**

1. **Your app will be available at**: `https://your-app-name.herokuapp.com`

2. **Test the deployment**:
   - Upload an AP score report
   - Upload a community college transcript
   - Verify transfer credit calculations work

3. **Monitor logs**:
   ```bash
   heroku logs --tail
   ```

---

## 🔍 **Troubleshooting**

### **Build Errors**
```bash
heroku logs --tail
```

### **Environment Variable Issues**
```bash
heroku config
heroku config:set VARIABLE_NAME="value"
```

### **App Crashes**
```bash
heroku restart
heroku logs --tail
```

### **Custom Domain** (Optional)
```bash
heroku domains:add yourdomain.com
```

---

## 💰 **Heroku Pricing**

- **Basic Dyno**: $7/month (recommended)
- **Free Tier**: Available but limited hours

---

## 🚀 **Ready to Deploy?**

**Choose your method:**
1. **One-Click**: Update `app.json` and create deploy button
2. **CLI**: Run the commands above

Your UH Credit Transfer app will be live in minutes! 🎓

---

## 📞 **Need Help?**

If you encounter issues:
1. Check Heroku logs: `heroku logs --tail`
2. Verify environment variables: `heroku config`
3. Ensure your GitHub repo is public for one-click deploy

**Your app architecture:**
- ✅ React frontend (built automatically)
- ✅ Express backend 
- ✅ Azure Document Intelligence integration
- ✅ OpenAI processing
- ✅ UH equivalency matching
- ✅ AP grading as "S" (satisfactory) 