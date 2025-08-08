const API_URL = `${process.env.REACT_APP_API_URL}/student`;

// Fetch all exams for the student (active, upcoming, draft) with progress info
export async function fetchStudentExams(userId: number) {
  const res = await fetch(`${API_URL}/exams/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch all exams');
  return await res.json();
}

// Fetch questions for a specific exam
export async function fetchExamQuestions(examId: number) {
  const res = await fetch(`${API_URL}/exams/${examId}/questions`);
  if (!res.ok) throw new Error('Failed to fetch exam questions');
  return await res.json();
}

// Submit an answer to a question
export async function submitAnswer(data: {
  user_id: number;
  exam_id: number;
  question_id: number;
  studentAnswer: string;
  is_finalized: boolean;
}) {
  const res = await fetch(`${API_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to submit answer');
  return await res.json();
}

export async function fetchModuleNameByExamId(examId: number) {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/student/exam/${examId}/module`
  );
  if (!res.ok) throw new Error('Failed to fetch module name');
  return res.json(); // { module_name: "Python programming" }
}

export const fetchStudentResults = async (userId: number, examId: number) => {
  const res = await fetch(`${API_URL}/results/${userId}/${examId}`);
  if (!res.ok) throw new Error('Failed to fetch student results');
  return await res.json();
};