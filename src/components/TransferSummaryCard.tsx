import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, BookOpen, Target } from "lucide-react";

interface TransferCourse {
  original: string;
  title?: string;
  grade: string;
  uhCourse: string;
  credits: number;
  description: string;
  gradePoints: number;
  totalGradePoints?: number;
}

interface TransferSummaryProps {
  transferData: {
    studentName: string;
    type: string;
    matchedCourses: TransferCourse[];
    totalCredits: number;
    totalGradePoints?: number;
    gpa?: number;
    unmatchedCount: number;
  };
}

export function TransferSummaryCard({ transferData }: TransferSummaryProps) {
  const { studentName, type, matchedCourses, totalCredits, gpa, unmatchedCount } = transferData;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">UH Transfer Credit Summary</CardTitle>
        </div>
        <CardDescription>
          Credit evaluation for {studentName} • {type === 'AP' ? 'AP Exam Scores' : 'Community College Transcript'}
          {type === 'AP' && (
            <span className="block text-sm text-muted-foreground mt-1">
              AP credits are awarded as Satisfactory (S) - no letter grade or GPA impact
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Award className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total UH Credits</p>
              <p className="text-2xl font-bold text-blue-600">{totalCredits}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Matched Courses</p>
              <p className="text-2xl font-bold text-green-600">{matchedCourses.length}</p>
            </div>
          </div>
          
          {gpa !== null && (
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transfer GPA</p>
                <p className="text-2xl font-bold text-purple-600">{gpa?.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Matched Courses Table */}
        {matchedCourses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <span>Matched Courses</span>
              <Badge variant="secondary">{matchedCourses.length} courses</Badge>
            </h3>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Original Course</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">UH Course</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Credits</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Grade</th>
                      {type === 'CC' && (
                        <th className="px-4 py-3 text-left text-sm font-medium">Grade Points</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {matchedCourses.map((course, index) => (
                      <tr key={index} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{course.original}</p>
                            {course.title && (
                              <p className="text-sm text-muted-foreground">{course.title}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-blue-700">{course.uhCourse}</p>
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{course.credits}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={
                              course.grade === 'A' ? 'default' :
                              course.grade === 'B' ? 'secondary' :
                              course.grade === 'C' ? 'secondary' :
                              course.grade === 'S' ? 'default' :
                              'outline'
                            }
                          >
                            {course.grade}
                          </Badge>
                        </td>
                        {type === 'CC' && (
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium">
                              {course.gradePoints.toFixed(1)}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Unmatched Courses Warning */}
        {unmatchedCount > 0 && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-yellow-400" />
              <p className="text-sm font-medium text-yellow-800">
                {unmatchedCount} course{unmatchedCount > 1 ? 's' : ''} could not be matched with UH equivalencies
              </p>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              These courses may still be eligible for transfer credit through manual evaluation by UH admissions.
            </p>
          </div>
        )}

        {/* Academic Advice */}
        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Submit official transcripts to UH Admissions for final evaluation</li>
            <li>• Meet with an academic advisor to plan your degree completion</li>
            <li>• Consider how these credits fit into your intended major requirements</li>
            {type === 'CC' && gpa && gpa < 2.0 && (
              <li className="text-red-700">• Note: Some courses may not transfer due to low grades (below C)</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 