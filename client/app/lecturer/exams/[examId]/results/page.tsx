'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

type Result = {
  studentName: string;
  UserId: number;
  Status: string;
  StartedAt: string | null;
  SubmittedAt: string | null;
  timeSpent: number | null;
  totalScore: number;
  percentage: number;
};

export default function ExamResultsPage() {
  const { examId } = useParams();
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/lecturer/exams/${examId}/results`
        );
        if (!res.ok) throw new Error('Failed to fetch exam results');
        const data = await res.json();
        setResults(data.results || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchResults();
    }
  }, [examId]);

  const getGrade = (result: Result) => {
    const { percentage, Status } = result;

    if (Status === 'completed') {
      if (percentage >= 90) return { grade: 'A', color: 'text-green-600' };
      if (percentage >= 80) return { grade: 'B', color: 'text-blue-600' };
      if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600' };
      if (percentage >= 60) return { grade: 'D', color: 'text-orange-600' };
      return { grade: 'F', color: 'text-red-600' };
    }

    return { grade: 'N/A', color: 'text-gray-500' };
  };

  if (loading) return <p className="p-4">Loading exam results...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/lecturer/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Exam Results</h1>
            </div>
            <Button onClick={() => alert('Export coming soon!')}>
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Individual Results</CardTitle>
            <CardDescription>Detailed results for each student</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-500">
                No students have taken this exam yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r, index) => {
                    const gradeInfo = getGrade(r);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {r.studentName}
                        </TableCell>
                        <TableCell>{r.totalScore}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{r.percentage}%</span>
                            <Progress
                              value={r.percentage}
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${gradeInfo.color}`}>
                            {gradeInfo.grade}
                          </span>
                        </TableCell>
                        <TableCell>
                          {r.timeSpent !== null ? `${r.timeSpent} min` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.Status === 'completed' ? 'default' : 'secondary'
                            }
                          >
                            {r.Status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {r.SubmittedAt
                            ? new Date(r.SubmittedAt).toLocaleString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
