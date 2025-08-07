"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useParams } from "next/navigation"
import { BookOpen, ArrowLeft, Save, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import {
  fetchExamById,
  updateExam,
  updateExamQuestions,
  deleteQuestionFromExam
} from "@/services/lecturer/lecturerService"

interface Question {
  id: number
  question: string
  modelAnswer?: string
  points: number
  isNew?: boolean
}

export default function EditExam() {
  const params = useParams()
  const examId = parseInt((params as { id: string }).id)

  const [examData, setExamData] = useState({
    title: "",
    description: "",
    duration: "",
    moduleId: 0,
    status: "draft"
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newModelAnswer, setNewModelAnswer] = useState("")
  const [newPoints, setNewPoints] = useState(1)

  const [loading, setLoading] = useState(false)

  // Load exam + questions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchExamById(examId)
        setExamData({
          title: data.exam.Title,
          description: data.exam.Description,
          duration: data.exam.Duration.toString(),
          moduleId: data.exam.ModuleId,
          status: data.exam.Status || "draft",
        })
        const formatted = data.questions.map((q: any) => ({
          id: q.QuestionId,
          question: q.QuestionName,
          modelAnswer: q.ModelAnswer,
          points: q.QuestionMark
        }))
        setQuestions(formatted)
      } catch (err) {
        console.error("Failed to load exam", err)
      }
    }
    fetchData()
  }, [examId])

  // Save draft to localStorage
  useEffect(() => {
    localStorage.setItem(`edit-draft-${examId}`, JSON.stringify({ examData, questions }))
  }, [examData, questions, examId])

  // Validation
  const validateForm = () => {
    if (!examData.title.trim()) {
      alert("Exam title is required")
      return false
    }
    if (!examData.duration || isNaN(Number(examData.duration)) || Number(examData.duration) <= 0) {
      alert("Duration must be a positive number")
      return false
    }
    for (const [i, q] of questions.entries()) {
      if (!q.question.trim()) {
        alert(`Question ${i + 1} cannot be empty`)
        return false
      }
      if (!q.points || q.points <= 0) {
        alert(`Marks for question ${i + 1} must be greater than 0`)
        return false
      }
    }
    return true
  }

  const handleSaveExam = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      await updateExam(examId, {
        title: examData.title,
        description: examData.description,
        duration: parseInt(examData.duration),
        status: examData.status,
      })

      const questionPayload = questions.map(q => ({
        questionName: q.question,
        questionMark: q.points,
        modelAnswer: q.modelAnswer || "",
        moduleId: examData.moduleId,
      }))

      await updateExamQuestions(examId, questionPayload)

      alert("Exam updated successfully!")
      localStorage.removeItem(`edit-draft-${examId}`)
    } catch (err) {
      console.error(err)
      alert("Failed to update exam")
    }
    setLoading(false)
  }

  const handleDeleteQuestion = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?")
    if (!confirmDelete) return

    try {
      if (!questions.find(q => q.id === id)?.isNew) {
        await deleteQuestionFromExam(id)
      }
      setQuestions(questions.filter(q => q.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to delete question")
    }
  }

  const addNewQuestion = () => {
    if (!newQuestionText.trim()) return
    setQuestions(prev => [
      ...prev,
      {
        id: Date.now(),
        question: newQuestionText,
        modelAnswer: newModelAnswer,
        points: newPoints,
        isNew: true
      }
    ])
    setNewQuestionText("")
    setNewModelAnswer("")
    setNewPoints(1)
  }

  const updateQuestionField = (index: number, field: keyof Question, value: string | number) => {
    const updated = [...questions]
    updated[index][field] = value as never
    setQuestions(updated)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/lecturer/dashboard">
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold">Edit Exam</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveExam} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Exam Details */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
            <CardDescription>Edit exam metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={examData.title}
              onChange={e => setExamData({ ...examData, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={examData.description}
              onChange={e => setExamData({ ...examData, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Duration"
              value={examData.duration}
              onChange={e => setExamData({ ...examData, duration: e.target.value })}
            />
            <select
              value={examData.status}
              onChange={e => setExamData({ ...examData, status: e.target.value })}
              className="border rounded px-2 py-1"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
            </select>
            {/* <Input disabled value={`Module ID: ${examData.moduleId}`} /> */}
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
            <CardDescription>Manage open-ended questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="border p-4 rounded space-y-2">
                <Label>Question {idx + 1}</Label>
                <Textarea
                  value={q.question}
                  onChange={e => updateQuestionField(idx, "question", e.target.value)}
                />
                <Label>Model Answer (optional)</Label>
                <Textarea
                  value={q.modelAnswer || ""}
                  onChange={e => updateQuestionField(idx, "modelAnswer", e.target.value)}
                />
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={q.points}
                  onChange={e => updateQuestionField(idx, "points", Number(e.target.value))}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteQuestion(q.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            ))}

            {/* Add New Question */}
            <div className="pt-6 space-y-2">
              <h3 className="font-semibold">Add New Question</h3>
              <Textarea
                placeholder="Enter question..."
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
              />
              <Textarea
                placeholder="(Optional) Model Answer"
                value={newModelAnswer}
                onChange={e => setNewModelAnswer(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Marks"
                value={newPoints}
                onChange={e => setNewPoints(Number(e.target.value))}
              />
              <Button onClick={addNewQuestion} disabled={!newQuestionText.trim()}>
                <Plus className="w-4 h-4 mr-1" /> Add Question
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
