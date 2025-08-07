"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, X, ArrowLeft} from "lucide-react"
import {
  getAllModules,
  createModule,
  updateModule,
  deleteModule,
} from "@/services/admin/moduleService"
import { toast } from "sonner"

export default function AdminModulesPage() {
  const [modules, setModules] = useState<{ ModuleId: number; ModuleName: string }[]>([])
  const [newModuleName, setNewModuleName] = useState("")
  const [editedNames, setEditedNames] = useState<Record<number, string>>({})

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    const data = await getAllModules()
    setModules(data)
    setEditedNames({})
  }

  const handleCreate = async () => {
    if (!newModuleName.trim()) return
    try {
      await createModule(newModuleName.trim())
      setNewModuleName("")
      toast.success("Module created")
      loadModules()
    } catch {
      toast.error("Failed to create module")
    }
  }

  const handleChange = (id: number, value: string) => {
    setEditedNames((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async (id: number) => {
    const newName = editedNames[id]
    if (!newName || !newName.trim()) return

    try {
      await updateModule(id, newName.trim())
      toast.success("Module updated")
      loadModules()
    } catch {
      toast.error("Failed to update module")
    }
  }

  const handleCancel = (id: number) => {
    setEditedNames((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this module?")) {
      try {
        await deleteModule(id)
        toast.success("Module deleted")
        loadModules()
      } catch {
        toast.error("Failed to delete module")
      }
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
  <div className="flex items-center gap-3 mb-4">
    <Link href="/admin/dashboard">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="w-4 h-4" />
      </Button>
    </Link>
    <h1 className="text-2xl font-bold">Manage Modules</h1>
  </div>
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Module</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="New module name"
          value={newModuleName}
          onChange={(e) => setNewModuleName(e.target.value)}
        />
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      <div className="grid gap-4">
        {modules.map((mod) => {
          const currentEdit = editedNames[mod.ModuleId]
          const hasChanged = currentEdit !== undefined && currentEdit !== mod.ModuleName

          return (
            <Card key={mod.ModuleId}>
              <CardHeader>
                <CardTitle className="text-lg">{mod.ModuleName}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2 items-center">
                <Input
                  value={currentEdit ?? mod.ModuleName}
                  onChange={(e) => handleChange(mod.ModuleId, e.target.value)}
                />
                <Button
                  onClick={() => handleSave(mod.ModuleId)}
                  disabled={!hasChanged}
                >
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
                {hasChanged && (
                  <Button
                    variant="secondary"
                    onClick={() => handleCancel(mod.ModuleId)}
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(mod.ModuleId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
    </div>
  )
}
