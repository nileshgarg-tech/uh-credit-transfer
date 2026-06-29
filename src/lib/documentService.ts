export interface Course {
  exam: string;
  title: string;
  grade: string;
  creditHours: number;
}

export interface StructuredData {
  studentName: string;
  type: 'AP' | 'CC';
  courses: Course[];
}

export interface TransferCourse {
  original: string;
  title?: string;
  grade: string;
  uhCourse: string;
  credits: number;
  description: string;
  gradePoints: number;
  totalGradePoints?: number;
}

export interface TransferData {
  studentName: string;
  type: string;
  matchedCourses: TransferCourse[];
  totalCredits: number;
  totalGradePoints?: number;
  gpa?: number;
  unmatchedCount: number;
}

interface DocumentAnalysisResponse {
  extractedText: string;
  structuredData: StructuredData;
  transferData: TransferData;
}

interface ErrorResponse {
  error: string;
}

export class DocumentUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentUploadError';
  }
}

export async function analyzeDocument(file: File): Promise<{ extractedText: string; structuredData: StructuredData; transferData: TransferData }> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('pdf', file);

    // Make API call to backend
    const response = await fetch('/api/analyze-document', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new DocumentUploadError(errorData.error || 'Failed to analyze document');
    }

    const data: DocumentAnalysisResponse = await response.json();
    
    if (!data.extractedText || data.extractedText.trim().length === 0) {
      throw new DocumentUploadError('No text could be extracted from the document');
    }

    if (!data.structuredData) {
      throw new DocumentUploadError('Failed to process document content');
    }

    return {
      extractedText: data.extractedText,
      structuredData: data.structuredData,
      transferData: data.transferData
    };
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      throw error;
    }
    
    // Handle network and other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DocumentUploadError('Network error: Unable to connect to the server');
    }
    
    console.error('Document analysis error:', error);
    throw new DocumentUploadError('An unexpected error occurred while processing the document');
  }
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
} 