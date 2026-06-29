import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, FileText } from 'lucide-react';

interface ExtractedTextCardProps {
  title: string;
  extractedText: string;
  onReset: () => void;
  icon: ReactNode;
  isProcessing?: boolean;
}

export function ExtractedTextCard({ 
  title, 
  extractedText, 
  onReset, 
  icon, 
  isProcessing = false 
}: ExtractedTextCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full h-full rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl font-semibold">
            <div className="flex items-center">
              <span className="mr-2 text-2xl">{icon}</span>
              {title} - Text Extracted
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-muted-foreground">Processing document...</span>
            </div>
          ) : (
            <>
              <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                  Extracted Text ({extractedText.length} characters):
                </h3>
                <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                  {extractedText}
                </pre>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Next step:</strong> This extracted text will be processed by AI to identify course information and match it to UH equivalents.
                </p>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Document processed successfully!</strong></p>
                <p>Text extraction completed using Azure Document Intelligence.</p>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="pt-4">
          <Button 
            onClick={onReset}
            variant="outline" 
            className="w-full"
            disabled={isProcessing}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Upload Different Document
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 