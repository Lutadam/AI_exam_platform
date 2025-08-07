export async function getAllModules() {
  const res = await fetch("http://localhost:8000/admin/modules")
  if (!res.ok) throw new Error("Failed to fetch modules")
  return res.json()
}

export async function createModule(name: string) {
  const res = await fetch("http://localhost:8000/admin/modules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ModuleName: name }),
  })
  if (!res.ok) throw new Error("Failed to create module")
}

export async function updateModule(id: number, name: string) {
  const res = await fetch(`http://localhost:8000/admin/modules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ModuleName: name }),
  })
  if (!res.ok) throw new Error("Failed to update module")
}

export async function deleteModule(id: number) {
  const res = await fetch(`http://localhost:8000/admin/modules/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete module")
}
