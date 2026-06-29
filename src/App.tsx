import { useState } from 'react';
import { UploadCard } from '@/components/UploadCard';
import { APResultsCard } from '@/components/APResultsCard';
import { CommunityCollegeResultsCard } from '@/components/CommunityCollegeResultsCard';
import { ExtractedTextCard } from '@/components/ExtractedTextCard';
import { StructuredResultsCard } from '@/components/StructuredResultsCard';
import { ThemeProvider } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apResults, ccResults } from '@/lib/data';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { analyzeDocument, DocumentUploadError, StructuredData, TransferData } from '@/lib/documentService';
import { TransferSummaryCard } from '@/components/TransferSummaryCard';
import { toast } from 'sonner';

function App() {
  const [apFile, setApFile] = useState<File | null>(null);
  const [ccFile, setCcFile] = useState<File | null>(null);
  const [apExtractedText, setApExtractedText] = useState<string>('');
  const [ccExtractedText, setCcExtractedText] = useState<string>('');
  const [apStructuredData, setApStructuredData] = useState<StructuredData | null>(null);
  const [ccStructuredData, setCcStructuredData] = useState<StructuredData | null>(null);
  const [apTransferData, setApTransferData] = useState<TransferData | null>(null);
  const [ccTransferData, setCcTransferData] = useState<TransferData | null>(null);
  const [isProcessingAp, setIsProcessingAp] = useState(false);
  const [isProcessingCc, setIsProcessingCc] = useState(false);

  const handleApFileSelect = async (file: File) => {
    setIsProcessingAp(true);
    setApFile(file);
    
    try {
      toast.info('Processing AP document...', { duration: 2000 });
      const result = await analyzeDocument(file);
      setApExtractedText(result.extractedText);
      setApStructuredData(result.structuredData);
      setApTransferData(result.transferData);
      toast.success('AP document processed successfully!');
    } catch (error) {
      if (error instanceof DocumentUploadError) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to process AP document');
      }
      // Reset file on error
      setApFile(null);
    } finally {
      setIsProcessingAp(false);
    }
  };

  const handleCcFileSelect = async (file: File) => {
    setIsProcessingCc(true);
    setCcFile(file);
    
    try {
      toast.info('Processing Community College document...', { duration: 2000 });
      const result = await analyzeDocument(file);
      setCcExtractedText(result.extractedText);
      setCcStructuredData(result.structuredData);
      setCcTransferData(result.transferData);
      toast.success('Community College document processed successfully!');
    } catch (error) {
      if (error instanceof DocumentUploadError) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to process Community College document');
      }
      // Reset file on error
      setCcFile(null);
    } finally {
      setIsProcessingCc(false);
    }
  };

  const resetAp = () => {
    setApFile(null);
    setApExtractedText('');
    setApStructuredData(null);
    setApTransferData(null);
  };

  const resetCc = () => {
    setCcFile(null);
    setCcExtractedText('');
    setCcStructuredData(null);
    setCcTransferData(null);
  };

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="w-full p-4 flex items-center justify-between border-b border-border">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-500">UH Transfer Credit Estimator</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
          <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            Upload your transcript files to see how your credits might transfer to the University of Houston.
            This tool provides an estimate of transferable credits from AP exams and Texas community colleges.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="wait">
              {!apFile ? (
                <UploadCard 
                  title="AP Transcript" 
                  icon="📄" 
                  onFileSelect={handleApFileSelect} 
                />
              ) : apStructuredData ? (
                <StructuredResultsCard 
                  title="AP Transcript"
                  structuredData={apStructuredData}
                  onReset={resetAp}
                  icon="📄"
                  isProcessing={isProcessingAp}
                />
              ) : (
                <ExtractedTextCard 
                  title="AP Transcript"
                  extractedText={apExtractedText}
                  onReset={resetAp}
                  icon="📄"
                  isProcessing={isProcessingAp}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!ccFile ? (
                <UploadCard 
                  title="Texas Community College Transcript" 
                  icon="🏫" 
                  onFileSelect={handleCcFileSelect} 
                />
              ) : ccStructuredData ? (
                <StructuredResultsCard 
                  title="Community College Transcript"
                  structuredData={ccStructuredData}
                  onReset={resetCc}
                  icon="🏫"
                  isProcessing={isProcessingCc}
                />
              ) : (
                <ExtractedTextCard 
                  title="Community College Transcript"
                  extractedText={ccExtractedText}
                  onReset={resetCc}
                  icon="🏫"
                  isProcessing={isProcessingCc}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Transfer Credit Summary Section */}
          <AnimatePresence>
            {(apTransferData || ccTransferData) && (
              <div className="mt-12 space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Transfer Credit Summary</h2>
                  <p className="text-muted-foreground">
                    Your estimated transfer credits based on University of Houston equivalencies
                  </p>
                </div>
                
                <div className="space-y-8">
                  {apTransferData && (
                    <TransferSummaryCard transferData={apTransferData} />
                  )}
                  {ccTransferData && (
                    <TransferSummaryCard transferData={ccTransferData} />
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
        <footer className="w-full p-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} University of Houston Transfer Credit Estimator | For estimation purposes only</p>
        </footer>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;