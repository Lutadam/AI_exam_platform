"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Users, BookOpen } from "lucide-react"

export default function AdminDashboard() {
  const [username, setUsername] = useState("")
  const router = useRouter()

  useEffect(() => {
    const cookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("data="))

    if (!cookie) {
      router.push("/")
      return
    }

    try {
      const userData = JSON.parse(decodeURIComponent(cookie.split("=")[1]))
      if (userData.role !== "Admin") {
        router.push("/")
        return
      }
      setUsername(userData.username)
    } catch (error) {
      console.error("Failed to parse cookie:", error)
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    // Clear cookie and redirect to login
    document.cookie = "data=; path=/; max-age=0"
    router.push("/")
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
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">System Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users Management Card */}
          <div className="bg-white shadow rounded p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Users</h3>
              <p className="text-gray-600 mb-4">Manage system users (admins, lecturers, students).</p>
              <Button onClick={() => router.push("/admin/users")}>Go to Users</Button>
            </div>
          </div>

          {/* Modules Management Card */}
          <div className="bg-white shadow rounded p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Modules</h3>
              <p className="text-gray-600 mb-4">Manage academic modules available in the system.</p>
              <Button onClick={() => router.push("/admin/modules")}>Go to Modules</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
