import { webcrypto } from 'crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import compression from 'compression';
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

// Load environment variables - try multiple locations
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    console.log(`Loading environment from ${envFile}`);
    dotenv.config({ path: envFile });
    break;
  }
}

// Also load default .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads (store in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Middleware
// CORS configuration for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL, 
        process.env.RAILWAY_STATIC_URL,
        /\.railway\.app$/,
        /\.vercel\.app$/,
        /\.herokuapp\.com$/
      ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Azure Document Intelligence client
const azureEndpoint = process.env.VITE_AZURE_DOCUMENT_ENDPOINT || process.env.AZURE_DOCUMENT_ENDPOINT;
const azureKey = process.env.VITE_AZURE_DOCUMENT_KEY || process.env.AZURE_DOCUMENT_KEY;

// Initialize OpenAI client
const openaiKey = process.env.VITE_OPENAI_KEY || process.env.OPENAI_KEY;
const openaiEndpoint = process.env.VITE_OPENAI_ENDPOINT || process.env.OPENAI_ENDPOINT;
const openaiDeployment = process.env.VITE_OPENAI_DEPLOYMENT || process.env.OPENAI_DEPLOYMENT || 'gpt-4';

console.log(`Azure configured: ${!!(azureEndpoint && azureKey)} | OpenAI configured: ${!!openaiKey} | Deployment: ${openaiDeployment}`);

if (!azureEndpoint || !azureKey) {
  console.error('Azure Document Intelligence credentials not found in environment variables');
  console.error('Please create a .env.local file with:');
  console.error('VITE_AZURE_DOCUMENT_ENDPOINT=your_endpoint_here');
  console.error('VITE_AZURE_DOCUMENT_KEY=your_key_here');
  process.exit(1);
}

if (!openaiKey) {
  console.error('OpenAI credentials not found in environment variables');
  console.error('Please add to .env.local:');
  console.error('VITE_OPENAI_KEY=your_openai_key_here');
  process.exit(1);
}

const azureClient = new DocumentAnalysisClient(azureEndpoint, new AzureKeyCredential(azureKey));

// Initialize OpenAI client
let openai;
try {
  if (openaiEndpoint && openaiEndpoint.includes('azure.com')) {
    // Use Azure OpenAI configuration
    console.log('Configuring Azure OpenAI...');
    console.log(`Using deployment: ${openaiDeployment}`);
    openai = new OpenAI({
      apiKey: openaiKey,
      baseURL: `${openaiEndpoint.replace(/\/$/, '')}/openai/deployments/${openaiDeployment}/`,
      defaultQuery: { 'api-version': '2024-08-01-preview' },
      defaultHeaders: {
        'api-key': openaiKey,
      },
    });
    console.log('Azure OpenAI client initialized');
  } else {
    // Use standard OpenAI configuration
    console.log('Configuring standard OpenAI...');
    const config = { apiKey: openaiKey };
    if (openaiEndpoint) {
      config.baseURL = openaiEndpoint;
    }
    openai = new OpenAI(config);
    console.log('Standard OpenAI client initialized');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
  console.error('Error details:', error.message);
  process.exit(1);
}

// Helper function to extract and clean text from Azure response
function extractTextFromDocument(result) {
  try {
    let extractedText = '';
    
    // Extract text from pages
    if (result.pages) {
      for (const page of result.pages) {
        if (page.lines) {
          for (const line of page.lines) {
            extractedText += line.content + '\n';
          }
        }
      }
    }
    
    // Clean up the text - remove excessive whitespace and newlines
    extractedText = extractedText
      .replace(/\n\s*\n/g, '\n')  // Replace multiple newlines with single
      .replace(/^\s+|\s+$/g, '')   // Trim whitespace from start/end
      .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
      .replace(/\n/g, '\n');       // Keep single newlines for structure
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from document:', error);
    return '';
  }
}

// Helper function to process extracted text with GPT
async function processTextWithGPT(extractedText) {
  try {
    const systemPrompt = `Extract course information from this college transcript. Return valid JSON only.

Extract:
1. Student name
2. Document type ("AP" for AP scores, "CC" for community college)  
3. All courses with: course code, title, grade, and credit hours

JSON format:
{
  "studentName": "First Last",
  "type": "CC",
  "courses": [
    {
      "exam": "COURSE CODE",
      "title": "Course Title", 
      "grade": "A",
      "creditHours": 3
    }
  ]
}

Return only valid JSON, no other text.`;

    console.log(`Sending ${extractedText.length} chars to OpenAI...`);
    
    // For Azure OpenAI, use empty model name since it's in the URL; for regular OpenAI, use model name
    const modelName = openaiEndpoint && openaiEndpoint.includes('azure.com') ? "" : "gpt-4";
    
    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: extractedText }
      ],

      temperature: 0.1,
      max_tokens: 4000
    });

    const rawResponse = completion.choices[0].message.content;

    // Check if response is empty or null
    if (!rawResponse || rawResponse.trim().length === 0) {
      throw new Error('GPT returned empty response. The document may be too complex or unreadable.');
    }

    // Strip markdown code fences if GPT wrapped the JSON (e.g. ```json ... ```)
    const responseText = rawResponse
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/,  '')
      .trim();

    // Parse the JSON response
    const raw = JSON.parse(responseText);

    // Log exactly what GPT returned so we can debug field name mismatches
    console.log('GPT raw structure keys:', Object.keys(raw));
    console.log('GPT raw preview:', JSON.stringify(raw).slice(0, 300));

    // Normalize — GPT sometimes uses different field names, handle all variations
    const structuredData = {
      studentName:
        raw.studentName || raw.student_name || raw.name || raw.student || 'Unknown Student',
      type:
        String(raw.type || raw.document_type || raw.documentType || raw.transcriptType || 'CC')
          .toUpperCase().includes('AP') ? 'AP' : 'CC',
      courses: (raw.courses || raw.exams || raw.classes || raw.subjects || raw.records || []).map(c => ({
        exam:        c.exam || c.course_code || c.courseCode || c.code || c.subject || c.name || '',
        title:       c.title || c.course_title || c.courseTitle || c.description || c.name || '',
        grade:       String(c.grade || c.score || c.mark || c.letterGrade || ''),
        creditHours: Number(c.creditHours || c.credit_hours || c.credits || c.units || c.hours || 3),
      })),
    };

    if (!structuredData.courses.length) {
      throw new Error('GPT returned 0 courses — document may be unreadable or unsupported format.');
    }

    console.log(`GPT: processed ${structuredData.courses.length} courses for ${structuredData.studentName} (${structuredData.type})`);
    return structuredData;
  } catch (error) {
    console.error('GPT processing error:', error.message);
    console.error('GPT error details:', JSON.stringify(error?.error ?? error?.response?.data ?? '', null, 2));

    if (error.message.includes('JSON') || error instanceof SyntaxError) {
      throw new Error('Failed to parse course information. The document format may not be supported.');
    }

    // Surface the actual API error message to help debugging
    const detail = error?.error?.message || error?.message || 'unknown';
    throw new Error(`Failed to process document with AI: ${detail}`);
  }
}

// Helper function to calculate grade points for CC courses  
function calculateGradePoints(grade) {
  const gradeMap = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'F': 0.0
  };
  return gradeMap[grade.toUpperCase()] || 0.0;
}

// Function to match courses with UH equivalencies
function matchCoursesWithEquivalencies(structuredData) {
  try {
    let equivalencyData = {};
    
    // Load appropriate equivalency file based on document type
    if (structuredData.type === 'AP') {
      const apPath = path.join(process.cwd(), 'ap_equivalency.json');
      equivalencyData = JSON.parse(readFileSync(apPath, 'utf8'));
    } else if (structuredData.type === 'CC') {
      const ccPath = path.join(process.cwd(), 'tccns_equivalency.json');
      equivalencyData = JSON.parse(readFileSync(ccPath, 'utf8'));
    } else {
      throw new Error(`Unsupported document type: ${structuredData.type}`);
    }
    
    const matchedCourses = [];
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    for (const course of structuredData.courses) {
      let matchKey = '';
      let equivalency = null;
      
      if (structuredData.type === 'AP') {
        // For AP: match using "ExamName|Score" format
        matchKey = `${course.exam}|${course.grade}`;
        equivalency = equivalencyData[matchKey];
        
        if (equivalency) {
          const matched = {
            original: course.exam,
            grade: 'S', // AP courses are recorded as Satisfactory, not numerical score
            uhCourse: equivalency.uhCourse,
            credits: equivalency.credits,
            description: equivalency.description,
            gradePoints: 0 // AP courses don't have grade points
          };
          
          matchedCourses.push(matched);
          totalCredits += equivalency.credits;
        }
        
      } else if (structuredData.type === 'CC') {
        // For CC: match using course code directly
        matchKey = course.exam;
        equivalency = equivalencyData[matchKey];
        
        if (equivalency) {
          const gradePoints = calculateGradePoints(course.grade);
          const courseGradePoints = gradePoints * course.creditHours;
          
          const matched = {
            original: course.exam,
            title: course.title,
            grade: course.grade,
            uhCourse: equivalency.uhCourse,
            credits: equivalency.credits,
            description: equivalency.description,
            gradePoints: gradePoints,
            totalGradePoints: courseGradePoints
          };
          
          matchedCourses.push(matched);
          totalCredits += equivalency.credits;
          totalGradePoints += courseGradePoints;
        }
      }
    }
    
    // Calculate GPA for CC courses
    const gpa = structuredData.type === 'CC' && totalCredits > 0 ? 
      totalGradePoints / totalCredits : null;
    
    const result = {
      studentName: structuredData.studentName,
      type: structuredData.type,
      matchedCourses: matchedCourses,
      totalCredits: totalCredits,
      totalGradePoints: structuredData.type === 'CC' ? totalGradePoints : null,
      gpa: gpa ? parseFloat(gpa.toFixed(2)) : null,
      unmatchedCount: structuredData.courses.length - matchedCourses.length
    };
    
    console.log(`Match result: ${matchedCourses.length}/${structuredData.courses.length} courses → ${result.totalCredits} credits${result.gpa ? ` | GPA: ${result.gpa}` : ''}`);
    return result;
    
  } catch (error) {
    console.error('Error matching courses with equivalencies:', error);
    throw new Error(`Failed to match courses: ${error.message}`);
  }
}

// API endpoint to process PDF uploads
app.post('/api/analyze-document', upload.single('pdf'), async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Processing document upload`);
    
    if (!req.file) {
      console.log('ERROR: No file provided in request');
      return res.status(400).json({ 
        error: 'No PDF file provided' 
      });
    }

    console.log(`File: ${req.file.originalname} (${(req.file.size/1024).toFixed(1)}KB)`);

    // Convert buffer to stream for Azure API
    const fileBuffer = req.file.buffer;
    
    // Use prebuilt-layout model to analyze the document
    const poller = await azureClient.beginAnalyzeDocument("prebuilt-layout", fileBuffer);
    const result = await poller.pollUntilDone();
    
    // Extract text content from the result
    const extractedText = extractTextFromDocument(result);
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.warn('No text extracted from document');
      return res.status(400).json({ 
        error: 'Unable to extract text from the provided document. Please ensure the PDF contains readable text.' 
      });
    }

    console.log(`Azure extracted ${extractedText.length} chars of text`);
    
    // Process the extracted text with GPT to get structured data
    const structuredData = await processTextWithGPT(extractedText);
    
    // Match courses with UH equivalencies
    const transferData = matchCoursesWithEquivalencies(structuredData);
    
    // Return both the raw text and structured data
    res.json({
      extractedText: extractedText.trim(),
      structuredData: structuredData,
      transferData: transferData
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error: ${error.constructor.name} (${error.code}) - ${error.message}`);
    
    // Handle different types of errors
    if (error.code === 'InvalidRequest') {
      console.error('Azure Document Intelligence - Invalid Request');
      return res.status(400).json({ 
        error: 'Invalid document format. Please ensure you uploaded a valid PDF file.' 
      });
    } else if (error.code === 'Unauthorized') {
      console.error('Azure Document Intelligence - Unauthorized');
      return res.status(500).json({ 
        error: 'Azure Document Intelligence authentication failed. Please check your API credentials.' 
      });
    } else if (error.message && error.message.includes('file size')) {
      console.error('File size error');
      return res.status(400).json({ 
        error: 'File size too large. Please upload a PDF smaller than 10MB.' 
      });
    } else if (error.message && error.message.includes('JSON')) {
      console.error('JSON parsing error');
      return res.status(500).json({ 
        error: 'Failed to parse course information from the document. The document format may not be supported.' 
      });
    } else if (error.message && error.message.includes('process document with AI')) {
      console.error('AI processing error');
      return res.status(500).json({ 
        error: error.message 
      });
    }
    
    console.error('Unhandled error - returning generic error message');
    res.status(500).json({ 
      error: `Document processing failed: ${error.message}` 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    azure_configured: !!(azureEndpoint && azureKey),
    openai_configured: !!openaiKey
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File size too large. Please upload a PDF smaller than 10MB.' 
      });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Serve static files from dist directory in production (after all API routes)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

// Add global error handlers to prevent server from crashing
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Server will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Server will continue running...');
});

const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Azure Document Intelligence configured: ${!!(azureEndpoint && azureKey)}`);
  console.log(`OpenAI configured: ${!!openaiKey}`);
});

// Keep the server alive
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Add a keepalive mechanism
setInterval(() => {
  // This will keep the Node.js process alive
}, 60000); 