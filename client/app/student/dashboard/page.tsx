'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Play,
  BarChart2,
} from 'lucide-react';
import Link from 'next/link';
import { fetchStudentExams } from '@/services/student/studentService';
import { logout } from '@/services/authService';
import { getUserFromCookie } from '@/services/cookie';

interface Exam {
  ExamId: number;
  Title: string;
  ModuleName: string;
  Status: string;
  Duration: number;
  Score?: number | null;
  TotalMark: number;
  Percentage: number;
  Attempts: number;
  TotalQuestions: number;
}

export default function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentName, setStudentName] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const user = getUserFromCookie();
    if (!user || !user.username) {
      window.location.href = '/';
      return;
    }

    const loadExams = async () => {
      try {
        const uid = user.UserId;
        const examsData = await fetchStudentExams(uid);
        setExams(examsData);
      } catch (error) {
        console.error('Failed to load exams:', error);
      }
    };

    loadExams();

    setStudentName(user.username);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'upcoming':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'upcoming':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold">Student Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{studentName}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Exams
                  </p>
                  <p className="text-2xl font-bold">{exams.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {exams.filter(e => e.Status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">
                    {exams.filter(e => e.Status !== 'completed').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold">
                    {(() => {
                      const completed = exams.filter(
                        e => e.Status === 'completed' && e.Score !== null
                      );
                      const avg =
                        completed.length > 0
                          ? completed.reduce(
                              (acc, e) => acc + (e.Score || 0),
                              0
                            ) / completed.length
                          : 0;
                      return `${Math.round(avg)}%`;
                    })()}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">A</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Your Exams</h2>
          <p className="text-gray-600">Manage and take your assigned exams</p>
        </div>

        {exams && exams.length > 0 && (
          <div className="grid gap-6 sdgsdgsdgsgsdg">
            {exams.map(exam => (
              <Card key={exam.ExamId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{exam.Title}</CardTitle>
                      <CardDescription>{exam.ModuleName}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(exam.Status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(exam.Status)}
                        {exam.Status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Questions</p>
                      <p className="font-semibold">{exam.TotalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{exam.Duration} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Attempts</p>
                      <p className="font-semibold">{exam.Attempts}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="font-semibold">
                        {exam.Score !== null
                          ? `${exam.Score} / ${exam.TotalMark}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {exam.Status === 'completed' && exam.Score !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Your Score</span>
                        <span>{exam.Percentage}%</span>
                      </div>
                      <Progress value={exam.Percentage} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {exam.Status === 'active' && (
                      <Link
                        className={!(exam.Attempts <= 1) ? 'disabled-link' : ''}
                        href={`/student/exam/${exam.ExamId}?d=${exam.Duration}`}
                      >
                        <Button disabled={!(exam.Attempts <= 1)}>
                          <Play className="w-4 h-4 mr-2" />
                          Start Exam
                        </Button>
                      </Link>
                    )}
                    {exam.Status === 'completed' && (
                      <Link href={`/student/result/${exam.ExamId}`}>
                        <Button variant="outline">
                          <BarChart2 className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                      </Link>
                    )}
                    {exam.Status === 'upcoming' && (
                      <Button variant="outline" disabled>
                        Not Available Yet
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
