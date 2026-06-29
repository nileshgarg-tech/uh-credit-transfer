import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, GraduationCap, User, BookOpen } from 'lucide-react';
import { StructuredData } from '@/lib/documentService';

interface StructuredResultsCardProps {
  title: string;
  structuredData: StructuredData;
  onReset: () => void;
  icon: ReactNode;
  isProcessing?: boolean;
}

export function StructuredResultsCard({ 
  title, 
  structuredData, 
  onReset, 
  icon, 
  isProcessing = false 
}: StructuredResultsCardProps) {
  const isAP = structuredData.type === 'AP';

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
              {title} - Processed
            </div>
            <GraduationCap className="h-5 w-5 text-green-600" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isProcessing ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-muted-foreground">Processing document...</span>
            </div>
          ) : (
            <>
              {/* Student Information */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">Student Information</h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Name:</strong> {structuredData.studentName}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Document Type:</strong> {isAP ? 'AP Score Report' : 'Community College Transcript'}
                </p>
              </div>

              {/* Courses */}
              <div>
                <div className="flex items-center mb-3">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <h3 className="font-medium">
                    {isAP ? 'AP Exam Results' : 'Community College Courses'} ({structuredData.courses.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {structuredData.courses.map((course, index) => (
                    <div 
                      key={index}
                      className="bg-muted/30 rounded-lg p-4 border border-muted"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {isAP ? 'AP Exam' : 'Course Code'}
                          </p>
                          <p className="font-semibold">{course.exam}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {isAP ? 'Score' : 'Grade'}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isAP 
                              ? (parseInt(course.grade) >= 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                              : (['A', 'B'].includes(course.grade) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                          }`}>
                            {course.grade}
                          </span>
                        </div>
                      </div>
                      
                      {course.title && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground">Title</p>
                          <p className="text-sm">{course.title}</p>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground">Credit Hours</p>
                        <p className="text-sm font-semibold">{course.creditHours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Processing Complete</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Successfully extracted and structured course information. Total credit hours: {' '}
                  <strong>{structuredData.courses.reduce((total, course) => total + course.creditHours, 0)}</strong>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  <strong>Next:</strong> These courses will be matched to UH equivalents for transfer credit evaluation.
                </p>
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