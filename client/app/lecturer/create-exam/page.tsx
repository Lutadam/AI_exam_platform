"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createExam, addQuestionsToExam, fetchModules } from "@/services/lecturer/lecturerService"

interface Module {
  ModuleId: number
  ModuleName: string
}

interface Question {
  id: number
  question: string
  modelAnswer?: string
  points: number
}

export default function CreateExam() {
  const [examTitle, setExamTitle] = useState("")
  const [examDescription, setExamDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [moduleId, setModuleId] = useState<string>("")
  const [status, setStatus] = useState<string>("active")
  const [modules, setModules] = useState<Module[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionText, setQuestionText] = useState("")
  const [modelAnswer, setModelAnswer] = useState("")
  const [points, setPoints] = useState(1)

  useEffect(() => {
    fetchModules().then(setModules)
    const draft = localStorage.getItem("exam-draft")
    if (draft) {
      const parsed = JSON.parse(draft)
      setExamTitle(parsed.examTitle || "")
      setExamDescription(parsed.examDescription || "")
      setDuration(parsed.duration || "")
      setModuleId(parsed.moduleId || "")
      setStatus(parsed.status || "active")
      setQuestions(parsed.questions || [])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "exam-draft",
      JSON.stringify({ examTitle, examDescription, duration, moduleId, status, questions })
    )
  }, [examTitle, examDescription, duration, moduleId, status, questions])

  const addQuestion = () => {
    if (!questionText || !points) return
    const newQuestion: Question = {
      id: Date.now(),
      question: questionText,
      modelAnswer,
      points,
    }
    setQuestions([...questions, newQuestion])
    setQuestionText("")
    setModelAnswer("")
    setPoints(1)
  }

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handlePublish = async () => {
    if (!examTitle || !moduleId || questions.length === 0 || !status || !duration) {
      alert("Please fill in all required fields and add at least one question.")
      return
    }

    try {
      const exam = await createExam({
        title: examTitle,
        description: examDescription,
        duration: parseInt(duration),
        moduleId: parseInt(moduleId),
        status: status,
      })

      const questionsPayload = questions.map((q) => ({
        questionName: q.question,
        questionMark: q.points,
        modelAnswer: q.modelAnswer || "",
        moduleId: parseInt(moduleId), // ✅ pass correct module ID
      }))

      await addQuestionsToExam(exam.examId, questionsPayload)

      alert("✅ Exam created successfully!")
      localStorage.removeItem("exam-draft")

      // Reset form
      setExamTitle("")
      setExamDescription("")
      setDuration("")
      setModuleId("")
      setStatus("active")
      setQuestions([])
    } catch (error) {
      console.error(error)
      alert("❌ Failed to create exam")
    }
  }

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
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold">Create New Exam</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Exam Details */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
            <CardDescription>Fill in exam information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={examDescription}
              onChange={(e) => setExamDescription(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Duration in minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((m) => (
                  <SelectItem key={m.ModuleId} value={String(m.ModuleId)}>
                    {m.ModuleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Add Question */}
        <Card>
          <CardHeader>
            <CardTitle>Add Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
            <Textarea
              placeholder="(Optional) Model Answer"
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
            />
            <Input
              type="number"
              label="Marks"
              placeholder="Marks"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
            <Button onClick={addQuestion} disabled={!questionText}>
              Add
            </Button>

            {/* Questions List */}
            <ul className="space-y-2 mt-4">
              {questions.map((q) => (
                <li key={q.id} className="border p-2 rounded flex justify-between items-start">
                  <div>
                    <p className="font-medium">{q.question}</p>
                    <p className="text-sm text-gray-500">Marks: {q.points}</p>
                    {q.modelAnswer && (
                      <p className="text-xs italic text-gray-400">Model Answer: {q.modelAnswer}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => alert("Draft saved locally.")}>
            Save as Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!examTitle || questions.length === 0 || !moduleId || !status}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  )
}
