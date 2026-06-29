import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface CCResult {
  sourceCourse: string;
  grade: string;
  uhEquivalent: string;
  hours: number;
  confidence: number;
}

interface CommunityCollegeResultsCardProps {
  results: CCResult[];
  onReset: () => void;
  icon: ReactNode;
}

export function CommunityCollegeResultsCard({ results, onReset, icon }: CommunityCollegeResultsCardProps) {
  const totalHours = results.reduce((sum, result) => sum + result.hours, 0);
  const matchedCourses = results.length;
  
  // Calculate GPA
  const totalPoints = results.reduce((sum, result) => {
    const gradePoints = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    }[result.grade] || 0;
    
    return sum + (gradePoints * result.hours);
  }, 0);
  
  const gpa = totalPoints / totalHours;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <Card className="w-full h-full rounded-2xl shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl font-semibold">
            <span className="mr-2 text-2xl">{icon}</span>
            Community College Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium">Source Course</th>
                  <th className="text-center py-2 px-2 font-medium">Grade</th>
                  <th className="text-center py-2 px-2 font-medium">UH Equivalent</th>
                  <th className="text-center py-2 px-2 font-medium">Hrs</th>
                  <th className="text-right py-2 px-2 font-medium">Conf %</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-2 px-2">{result.sourceCourse}</td>
                    <td className="py-2 px-2 text-center">{result.grade}</td>
                    <td className="py-2 px-2 text-center">{result.uhEquivalent}</td>
                    <td className="py-2 px-2 text-center">{result.hours}</td>
                    <td className="py-2 px-2 text-right flex items-center justify-end">
                      {result.confidence}
                      {result.confidence >= 90 ? (
                        <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="ml-2 h-4 w-4 text-yellow-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-muted-foreground font-medium">
            Transfer GPA (admission-only): <span className="font-bold">{gpa.toFixed(2)}</span>
          </div>
          <div className="bg-primary-foreground dark:bg-secondary p-4 rounded-lg mt-4">
            <p className="font-semibold">
              Matched {matchedCourses} / {matchedCourses} • 
              Total accepted: <span className="text-red-600 dark:text-red-400">{totalHours} hrs</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end p-4">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}