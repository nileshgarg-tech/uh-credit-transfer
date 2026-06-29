# 🎓 UH Credit Transfer Estimator

> AI-powered transfer credit evaluation for University of Houston applicants — upload your AP score report or Texas community college transcript and instantly see how your credits map to UH courses.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Azure](https://img.shields.io/badge/Azure_AI-Document_Intelligence-0078D4?logo=microsoftazure&logoColor=white)
![GPT-4](https://img.shields.io/badge/Azure_OpenAI-GPT--4-412991?logo=openai&logoColor=white)

---

## ✨ What It Does

1. **Upload** your AP score report or Texas CC transcript (PDF)
2. **Extract** — Azure Document Intelligence reads the document
3. **Interpret** — GPT-4 structures the raw text into course data
4. **Match** — courses are mapped to official UH equivalencies
5. **Display** — you get a clean transfer credit summary with total credits and GPA

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| Backend | Node.js + Express |
| OCR | Azure Document Intelligence (prebuilt-layout) |
| AI | Azure OpenAI GPT-4 |
| Compression | gzip via `compression` middleware |

---

## 📋 Supported Documents

### AP Exams
- Biology, Chemistry, Physics (1, 2, C)
- Calculus AB / BC, Statistics
- English Language & Composition / Literature
- US History, European History, World History
- Psychology, Macro/Microeconomics
- Computer Science A
- Foreign Languages (Spanish, French, German, etc.)

### Texas Community Colleges
- Houston Community College (HCC)
- Lone Star College
- San Jacinto College
- All Texas colleges using TCCNS course codes

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Azure Document Intelligence resource
- Azure OpenAI resource with a GPT-4 deployment

### Setup

```bash
# Clone the repo
git clone https://github.com/nileshgarg-tech/uh-credit-transfer.git
cd uh-credit-transfer

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
VITE_AZURE_DOCUMENT_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
VITE_AZURE_DOCUMENT_KEY=your_azure_document_key
VITE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
VITE_OPENAI_KEY=your_azure_openai_key
VITE_OPENAI_DEPLOYMENT=gpt-4
```

```bash
# Start both frontend and backend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

---

## 📁 Project Structure

```
uh-credit-transfer/
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── UploadCard.tsx    # PDF drag-and-drop upload
│   │   ├── TransferSummaryCard.tsx
│   │   ├── StructuredResultsCard.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── use-theme.tsx     # Dark/light mode
│   └── lib/
│       ├── documentService.ts # Frontend API client
│       └── utils.ts
├── server.js                 # Express backend
├── ap_equivalency.json       # AP exam → UH course mappings
├── tccns_equivalency.json    # TCCNS → UH course mappings
├── Procfile                  # Heroku deployment
└── railway.json              # Railway deployment
```

---

## ☁️ Deployment

This project is pre-configured for one-click deployment on **Heroku** and **Railway**.

### Railway (Recommended — free tier available)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Set your environment variables in the Railway dashboard under **Variables**.

### Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Click the button above or see [HEROKU_DEPLOY.md](./HEROKU_DEPLOY.md) for step-by-step instructions.

---

## 🔍 Example Output

**AP Calculus BC — Score 5**
- UH Equivalent: `MATH 1431 + MATH 1432`
- Credits: 8
- Grade: S (Satisfactory)

**HCC ENGL 1301 — Grade A**
- UH Equivalent: `ENGL 1303`
- Credits: 3
- Grade Points: 4.0

---

## 🗂️ Sample Transcripts

Real sample PDFs are included in the [`samples/`](./samples/) folder so you can test the app right away:

| File | Type | College |
|---|---|---|
| `HCC_Transcript_Sample.pdf` | Community College | Houston Community College |
| `Lone_Star_CC_Sample.pdf` | Community College | Lone Star College |
| `San_Jacinto_CC_Sample.pdf` | Community College | San Jacinto College |

> AP score report samples are not included for privacy reasons — you can use your own.

---

## ⚠️ Disclaimer

This tool provides **estimates only**. Official transfer credit evaluations are determined by the University of Houston Office of Admissions. Always verify your transfer credits with a UH academic advisor.

---

## 📄 License

MIT — built for University of Houston students 🐾