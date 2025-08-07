"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Edit, Eye, Monitor, PlusCircle, LogOut } from "lucide-react"
import Link from "next/link"
import { fetchLecturerDashboard, deleteExamWithAuth } from "@/services/lecturer/lecturerService"

export default function LecturerDashboard() {
  const [exams, setExams] = useState<any[]>([])
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [username, setUsername] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const cookie = document.cookie.split(";").find(c => c.trim().startsWith("data="))
        if (!cookie) {
          window.location.href = "/"
          return
        }
        const userData = JSON.parse(decodeURIComponent(cookie.split("=")[1]))
        setUsername(userData.username)

        const data = await fetchLecturerDashboard()
        setExams(data.exams || [])
        setTotalStudents(data.totalStudents || 0)
      } catch (error) {
        console.error("Dashboard fetch error:", error)
      }
    }
    loadData()
  }, [])

  const handleDelete = async (examId: number) => {
    const username = prompt("Confirm lecturer username:") || ""
    const password = prompt("Enter password:") || ""
    try {
      await deleteExamWithAuth(examId, username, password)
      setExams(prev => prev.filter(e => e.ExamId !== examId))
      alert("Exam deleted successfully")
    } catch (error) {
      alert("Invalid credentials or failed to delete")
    }
  }

  const handleLogout = () => {
    document.cookie = "data=; path=/; max-age=0"
    window.location.href = "/"
  }
  const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default"
    case "upcoming":
      return "secondary"
    case "draft":
    default:
      return "outline"
  }
}

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
              <h1 className="text-xl font-semibold">Exam Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome,{username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exams</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Exams</h2>
          <Link href="/lecturer/create-exam">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Exam
            </Button>
          </Link>
        </div>

        {/* Exam List */}
        <div className="grid gap-6">
          {exams.map((exam) => (
            <Card key={exam.ExamId}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{exam.Title}</CardTitle>
                    <CardDescription>{exam.Subject}</CardDescription>
                    <Badge variant={getStatusVariant(exam.Status)} className="mt-2 capitalize">
                      {exam.Status || "draft"}
                    </Badge>
                  </div>
                  <Badge variant="outline">Created: {exam.CreatedAt?.split("T")[0]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="font-semibold">{exam.QuestionCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{exam.Duration} min</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `/lecturer/edit-exam/${exam.ExamId}`}> <Edit className="w-4 h-4 mr-1" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `/lecturer/exams/${exam.ExamId}/results`}> <Eye className="w-4 h-4 mr-1" /> View Results</Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `/lecturer/viewquestion?examId=${exam.ExamId}`}> <Monitor className="w-4 h-4 mr-1" /> View Questions </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(exam.ExamId)}> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
