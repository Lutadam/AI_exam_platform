'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  fetchExamQuestions,
  submitAnswer,
  fetchModuleNameByExamId,
} from '@/services/student/studentService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronLeft, ChevronRight, Clock, Flag } from 'lucide-react';

interface Question {
  QuestionId: number;
  QuestionName: string;
  QuestionMark: number;
  ModelAnswer?: string;
}

interface AnswerPayload {
  examId: number;
  userId: number;
  questionId: number;
  studentAnswer: string;
  is_finalized: boolean;
}

export default function TakeExam() {
  const params = useParams();
  const router = useRouter();
  const examIdParam = params?.id;
  const examId =
    typeof examIdParam === 'string' ? parseInt(examIdParam, 10) : NaN;

  // User state & loading for cookie read
  const [userId, setUserId] = useState<number | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [moduleName, setModuleName] = useState('');

  const searchParams = useSearchParams();
  const examDuration = parseInt(searchParams.get('d')!) || 90; // Default to 90 minutes
  const [timeRemaining, setTimeRemaining] = useState(examDuration * 60); // 90 minutes in seconds

  // Read user from cookie — only client-side
  useEffect(() => {
    function getUserFromCookie(): { userId: number } | null {
      if (typeof document === 'undefined') return null;

      const match = document.cookie
        .split('; ')
        .find(row => row.startsWith('data='));
      if (!match) return null;

      try {
        const user = JSON.parse(decodeURIComponent(match.split('=')[1]));
        return user;
      } catch {
        return null;
      }
    }
    const user = getUserFromCookie();
    setUserId(user?.userId ?? null);
    setUserLoading(false);
  }, []);

  // Fetch exam questions after userId and examId known
  useEffect(() => {
    if (!userId || !examId) return;

    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await fetchExamQuestions(examId);
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load questions');
        setLoading(false);
      }
    }
    loadQuestions();
  }, [userId, examId]);

  // Fetch module name after examId known
  useEffect(() => {
    if (!examId) return;

    async function loadModuleName() {
      try {
        const res = await fetchModuleNameByExamId(examId);
        setModuleName(res.module_name);
      } catch {
        // ignore errors
      }
    }
    loadModuleName();
  }, [examId]);

  // 1. Countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Auto-submit when time hits 0
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (timeRemaining <= 0 && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      handleSubmitExam();
    }
  }, [timeRemaining]);

  // Early returns for loading/error states
  if (userLoading) {
    return <div className="p-4">Checking user session...</div>;
  }

  if (!userId) {
    return (
      <div className="p-4 text-red-600">
        User not logged in. Please log in to take the exam.
      </div>
    );
  }

  if (loading) {
    return <div className="p-4">Loading questions...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="p-4">No questions found for this exam.</div>;
  }

  // Calculate progress and current question
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  function handleAnswerChange(questionId: number, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  function handleNextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
  }

  function handlePreviousQuestion() {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
  }

  function toggleFlag(questionId: number) {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) newSet.delete(questionId);
      else newSet.add(questionId);
      return newSet;
    });
  }

  async function handleSubmitExam() {
    if (!examId || !userId) return;

    setSubmitting(true);

    try {
      const payloads = questions.map(q => ({
        user_id: userId,
        exam_id: examId,
        question_id: q.QuestionId,
        studentAnswer: answers[q.QuestionId] || '',
        is_finalized: true,
        question_mark: q.QuestionMark,
      }));

      await Promise.all(payloads.map(payload => submitAnswer(payload)));

      router.push('/student/dashboard');
    } catch (e) {
      console.error('Failed to submit exam:', e);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Module: {moduleName}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Clock className="w-4 h-4 text-gray-500" />
          <span
            className={`font-mono ${timeRemaining < 30 ? 'text-red-600' : ''}`}
          >
            Time Remaining: {formatTime(timeRemaining)}
          </span>

          <Button
            onClick={handleSubmitExam}
            variant="outline"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </CardTitle>
            <CardDescription>
              {currentQuestion.QuestionMark} point
              {currentQuestion.QuestionMark !== 1 ? 's' : ''}
            </CardDescription>
            <Progress value={progress} className="h-2 mt-2" />
          </CardHeader>

          <CardContent>
            <div className="mb-4">
              <h2 className="text-lg font-medium">
                {currentQuestion.QuestionName}
              </h2>
            </div>

            <Textarea
              placeholder="Enter your answer here..."
              value={answers[currentQuestion.QuestionId] || ''}
              onChange={e =>
                handleAnswerChange(currentQuestion.QuestionId, e.target.value)
              }
              className="min-h-[120px]"
              disabled={submitting}
            />

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || submitting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                variant={
                  flaggedQuestions.has(currentQuestion.QuestionId)
                    ? 'destructive'
                    : 'secondary'
                }
                onClick={() => toggleFlag(currentQuestion.QuestionId)}
                disabled={submitting}
              >
                <Flag className="w-4 h-4 mr-2" />
                {flaggedQuestions.has(currentQuestion.QuestionId)
                  ? 'Unflag'
                  : 'Flag'}
              </Button>

              {currentQuestionIndex === totalQuestions - 1 ? (
                <Button onClick={handleSubmitExam} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} disabled={submitting}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
