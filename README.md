# 🎓 UH Credit Transfer Estimator

AI-powered University of Houston credit transfer evaluation for AP scores and Texas community college transcripts.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## 🚀 **Features**

- **📄 Document Processing**: Upload AP score reports or Texas CC transcripts (PDF)
- **🤖 AI Extraction**: Azure Document Intelligence + GPT-4 for text processing
- **🎯 UH Equivalency Matching**: Official University of Houston course equivalencies
- **📊 Transfer Credit Summary**: Total credits, GPA calculation, course-by-case breakdown
- **📱 Modern UI**: Beautiful, responsive design with shadcn/ui components

## 🏗️ **Architecture**

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Azure Document Intelligence + Azure OpenAI
- **Deployment**: Heroku-ready with one-click deploy

## 🎯 **How It Works**

1. **Upload**: Student uploads AP scores or CC transcript (PDF)
2. **Extract**: Azure Document Intelligence extracts text from document
3. **Process**: GPT-4 structures the text into course data
4. **Match**: System matches courses with official UH equivalencies
5. **Display**: Shows transfer credit summary with UH courses and total credits

## 📋 **What's Supported**

### **AP Exams**
- Biology, Chemistry, Physics
- Calculus AB/BC, Statistics
- English Language & Literature
- US History, European History
- Psychology, Economics
- Computer Science A/AB
- Foreign Languages (Spanish, French, German, etc.)

### **Texas Community Colleges**
- Houston Community College (HCC)
- Lone Star College
- San Jacinto College
- And more via TCCNS course codes

## 🔧 **Environment Variables**

```env
VITE_AZURE_DOCUMENT_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com/
VITE_AZURE_DOCUMENT_KEY=your-azure-key
VITE_OPENAI_KEY=your-openai-key
VITE_OPENAI_ENDPOINT=https://uhopenai.openai.azure.com/
VITE_OPENAI_DEPLOYMENT=gpt-4
```

## 🚀 **Quick Deploy to Heroku**

1. **Click the Deploy button above**
2. **Fill in your Azure & OpenAI credentials**
3. **Deploy!** Your app will be live in minutes

## 💻 **Local Development**

```bash
# Clone repository
git clone https://github.com/yourusername/uh-credit-transfer
cd uh-credit-transfer

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your Azure & OpenAI credentials

# Start development servers
npm run dev
```

Runs frontend on `http://localhost:5173` and backend on `http://localhost:3001`

## 📁 **Project Structure**

```
uh-credit-transfer/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── lib/               # Utilities
│   └── App.tsx            # Main app
├── server.js              # Express backend
├── ap_equivalency.json    # AP exam equivalencies
├── tccns_equivalency.json # Community college equivalencies
├── Procfile              # Heroku configuration
├── app.json              # Heroku one-click deploy
└── package.json          # Dependencies
```

## 🎯 **Key Features**

### **Accurate Equivalencies**
- Based on official UH publications
- AP Credit by Exam table
- TCCNS community college equivalencies

### **Smart Processing**
- Handles various transcript formats
- Extracts course codes, titles, grades, credit hours
- Calculates transfer GPA for community college courses

### **Modern UI**
- Clean, professional design
- Mobile-responsive
- Real-time processing feedback
- Detailed transfer credit breakdown

## 🔍 **Example Results**

### **AP Biology Score 5**
- **UH Course**: BIOL 1161 + BIOL 1162 + BIOL 1361 + BIOL 1362
- **Credits**: 8
- **Grade**: S (Satisfactory)

### **HCC ENGL 1301 (Grade: A)**
- **UH Course**: ENGL 1303
- **Credits**: 3
- **Grade Points**: 4.0

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

- Check [HEROKU_DEPLOY.md](./HEROKU_DEPLOY.md) for deployment help
- Review [deployment-guide.md](./deployment-guide.md) for other platforms
- Open an issue for bugs or feature requests

---

**Built for University of Houston students to estimate transfer credits** 🐾 