export type User = {
  UserId: number;
  Username: string;
  UserRoleId: number;
  UserRole: string;
};

export type Role = {
  UserRoleId: number;
  UserRole: string;
};

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("http://localhost:8000/admin/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchRoles(): Promise<Role[]> {
  const res = await fetch("http://localhost:8000/admin/roles");
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}

export async function updateUser(user: {
  UserId: number;
  Username: string;
  Password?: string;
  UserRoleId: number;
}) {
  const res = await fetch(`http://localhost:8000/admin/users/${user.UserId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to update user");
  }
  return res.json();
}

export async function createUser(user: { Username: string; Password: string; UserRoleId: number }) {
  const res = await fetch("http://localhost:8000/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function deleteUser(userId: number, credentials: { username: string; password: string }) {
  const response = await fetch(`http://localhost:8000/admin/users/${userId}/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to delete user");
  }
}
