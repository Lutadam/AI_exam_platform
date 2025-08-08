const url = process.env.REACT_APP_API_URL as string;

// ======================= Interfaces =======================

export interface ExamPayload {
  title: string
  description: string
  duration: number
  moduleId: number
  status: string
}

export interface QuestionPayload {
  questionName: string
  questionMark: number
  modelAnswer?: string
  moduleId: number
}

// ======================= Dashboard =======================

export async function fetchLecturerDashboard() {
  const res = await fetch(`${url}/lecturer/exams`)
  if (!res.ok) throw new Error("Failed to fetch dashboard data")
  return res.json()
}

// ======================= Exam CRUD =======================

export async function createExam(payload: ExamPayload): Promise<{ examId: number }> {
  const res = await fetch(`${url}/lecturer/exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.detail || "Failed to create exam")
  }

  return res.json()
}

export async function fetchExamById(examId: number) {
  const res = await fetch(`${url}/lecturer/exams/${examId}`)
  if (!res.ok) throw new Error("Failed to fetch exam")
  return res.json()
}

export async function updateExam(examId: number, data: {
  title: string
  description: string
  duration: number
  status: string
}) {
  const res = await fetch(`${url}/lecturer/exams/${examId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update exam")
  return res.json()
}

export async function deleteExamWithAuth(examId: number, username: string, password: string) {
  const res = await fetch(`${url}/lecturer/exams/${examId}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.error || "Invalid credentials or failed to delete exam")
  }

  return res.json()
}


// ======================= Question CRUD =======================

export async function addQuestionsToExam(examId: number, questions: QuestionPayload[]) {
  const res = await fetch(`${url}/lecturer/exams/${examId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questions),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.detail || "Failed to add questions")
  }

  return res.json()
}

export async function updateExamQuestions(examId: number, questions: QuestionPayload[]) {
  const res = await fetch(`${url}/lecturer/exams/${examId}/questions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questions),
  })

  if (!res.ok) throw new Error("Failed to update questions")
  return res.json()
}

export async function deleteQuestionFromExam(questionId: number) {
  const res = await fetch(`${url}/lecturer/questions/${questionId}`, {
    method: "DELETE",
  })

  if (!res.ok) throw new Error("Failed to delete question")
  return res.json()
}

export async function fetchExamQuestions(examId: number) {
  const res = await fetch(`${url}/lecturer/exams/${examId}/questions`)
  if (!res.ok) throw new Error("Failed to fetch questions")
  return res.json()
}

// ======================= Modules =======================

export async function fetchModules(): Promise<{ ModuleId: number; ModuleName: string }[]> {
  const res = await fetch(`${url}/modules`)
  if (!res.ok) throw new Error("Failed to fetch modules")

  const data = await res.json()
  return data.modules || data // ✅ returns array directly
}

// ======================= Exam Results =======================

export async function fetchExamResults(examId: number) {
  const res = await fetch(
    `${url}/lecturer/exams/${examId}/results`
  );
  if (!res.ok) throw new Error('Failed to fetch exam results');
  return res.json();
}