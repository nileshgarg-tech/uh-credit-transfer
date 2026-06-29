import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface APResult {
  subject: string;
  score: number;
  course: string;
  creditHours: number;
}

interface APResultsCardProps {
  results: APResult[];
  onReset: () => void;
  icon: ReactNode;
}

export function APResultsCard({ results, onReset, icon }: APResultsCardProps) {
  const totalHours = results.reduce((sum, result) => sum + result.creditHours, 0);

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
            AP Transcript Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium">AP Subject</th>
                  <th className="text-center py-2 px-2 font-medium">Score</th>
                  <th className="text-center py-2 px-2 font-medium">UH Course</th>
                  <th className="text-right py-2 px-2 font-medium">Credit Hrs</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-2 px-2">{result.subject}</td>
                    <td className="py-2 px-2 text-center">{result.score}</td>
                    <td className="py-2 px-2 text-center">{result.course}</td>
                    <td className="py-2 px-2 text-right">{result.creditHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-primary-foreground dark:bg-secondary p-4 rounded-lg mt-4">
            <p className="font-semibold">
              Total accepted: <span className="text-red-600 dark:text-red-400">{totalHours} hrs</span> • 
              Does <span className="font-bold">not</span> affect UH GPA.
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