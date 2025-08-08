"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { fetchExamQuestions } from "@/services/lecturer/lecturerService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Question {
  QuestionId: number
  QuestionName: string
  QuestionMark: number
  ModelAnswer: string
  ModuleId?: number
  ExamId?: number
  ModuleName: string
}

function ViewQuestionsPage() {
  const searchParams = useSearchParams()
  const examIdParam = searchParams.get("examId")

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const moduleNames = Array.from(new Set(questions.map(q => q.ModuleName)))

  useEffect(() => {
    if (!examIdParam) {
      setError("No exam ID provided in URL")
      setLoading(false)
      return
    }

    const examId = parseInt(examIdParam)
    if (isNaN(examId)) {
      setError("Invalid exam ID")
      setLoading(false)
      return
    }

    fetchExamQuestions(examId)
      .then((data) => setQuestions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [examIdParam])

  if (loading) return <p>Loading questions...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Questions for {moduleNames}</h1>
      {questions.length === 0 ? (
        <p>No questions found for this exam.</p>
      ) : (
        questions.map((q) => (
          <Card key={q.QuestionId} className="mb-4">
            <CardHeader>
              <CardTitle>Question #{q.QuestionId}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Question:</strong> {q.QuestionName}</p>
              <p><strong>Marks:</strong> {q.QuestionMark}</p>
              <p><strong>Model Answer:</strong></p>
              <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded">{q.ModelAnswer}</pre>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export default function ViewQuestionsPageSuspense() {
  return <Suspense fallback={<div>Loading...</div>}><ViewQuestionsPage /></Suspense>
}
