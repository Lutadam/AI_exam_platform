'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { fetchStudentResults } from '@/services/student/studentService';
import { getUserFromCookie } from '@/services/cookie';

/*

{
          ExamId: examId,
          Title: 'Sample Exam',
          ModuleName: 'Mathematics',
          TotalMark: 100,
          Score: 85,
          Percentage: 85,
          Questions: [
            {
              QuestionId: 1,
              QuestionName: 'What is 2 + 2?',
              QuestionMark: 5,
              StudentAnswer: '4',
              ModelAnswer: '4',
              AwardedMark: 5,
            },
            {
              QuestionId: 2,
              QuestionName: 'What is the capital of France?',
              QuestionMark: 5,
              StudentAnswer: 'Paris',
              ModelAnswer: 'Paris',
              AwardedMark: 5,
            },
          ],
        };
*/

interface ResultQuestion {
  QuestionId: number;
  QuestionName: string;
  QuestionMark: number;
  StdAnswer: string;
  ModelAnswer?: string;
  Score: number;
  Feedback?: string;
}

interface ExamResult {
  ExamId: number;
  Title: string;
  ModuleName: string;
  TotalMark: number;
  Score: number;
  Percentage: number;
  Questions: ResultQuestion[];
}

export default function StudentResultPage() {
  const params = useParams();
  const router = useRouter();
  const examIdParam = params?.id;
  const examId =
    typeof examIdParam === 'string' ? parseInt(examIdParam, 10) : NaN;

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserFromCookie();
    if (!user || !user.username) {
      window.location.href = '/';
      return;
    }
    
    if (!examId) return;
    async function loadResult() {
      try {
        const data = await fetchStudentResults(user?.UserId!, examId)
        setResult(data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [examId]);

  if (loading) {
    return <div className="p-4">Loading result...</div>;
  }

  if (!result || Object.keys(result).length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Result Found</h2>
          <p className="text-gray-500 mb-4">
            We couldn't find any result data for this exam.
          </p>
          <Link href="/student/dashboard">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {result.ModuleName} - Results
          </h1>
        </div>
        <Link href="/student/dashboard">
          <Button variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{result.Title}</CardTitle>
            <CardDescription>
              Total Score:{' '}
              <span className="font-bold">
                {result.Score} / {result.TotalMark}
              </span>
            </CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              <span className="font-mono text-lg">
                Percentage: {result.Percentage}%
              </span>
            </div>
            <Progress value={result.Percentage} className="h-2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {result.Questions.map((q, idx) => (
                <Card key={q.QuestionId} className="border">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Q{idx + 1}: {q.QuestionName}
                    </CardTitle>
                    <CardDescription>
                      Marks: {q.Score} / {q.QuestionMark}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="font-semibold">Your Answer:</span>
                      <div className="bg-gray-100 rounded p-2 mt-1 whitespace-pre-line">
                        {q.StdAnswer || (
                          <span className="italic text-gray-400">
                            No answer
                          </span>
                        )}
                      </div>
                    </div>
                    {q.ModelAnswer && (
                      <div>
                        <span className="font-semibold">Model Answer:</span>
                        <div className="bg-green-50 rounded p-2 mt-1 whitespace-pre-line">
                          {q.ModelAnswer}
                        </div>
                      </div>
                    )}
                    {q.Feedback && (
                      <div className="mb-2">
                        <span className="font-semibold">Feedback:</span>
                        <div className="bg-gray-100 rounded p-2 mt-1 whitespace-pre-line">
                          {q.Feedback || (
                            <span className="italic text-gray-400">
                              No answer
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
