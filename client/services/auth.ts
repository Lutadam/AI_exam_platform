const url = process.env.REACT_APP_API_URL as string;

// services/auth.ts
export type LoginPayload = {
  username: string
  password: string
}

export type LoginResponse = {
  userId: number
  username: string
  role: "Admin" | "Teacher" | "Student"
}

// Set cookie helper (no expiration for session cookie)
function setUserSession(data: LoginResponse) {
  document.cookie = `data=${encodeURIComponent(JSON.stringify(data))}; path=/; samesite=strict`
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${url}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.detail || "Login failed")
  }

  const data = await response.json()
  setUserSession(data)
  return data
}

// Logout function clears cookie and redirects to login page
export function logout() {
  document.cookie = "data=; path=/; max-age=0; samesite=strict"
  window.location.href = "/"
}
