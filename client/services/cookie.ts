// services/cookie.ts
export function getUserFromCookie(): {
  UserId: number;
  username: string;
  role: string;
} | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith('data='));

  if (!match) return null;

  try {
    const user = JSON.parse(decodeURIComponent(match.split('=')[1]));
    return {
      UserId: user.userId,
      username: user.username,
      role: user.role,
    };
  } catch (e) {
    return null;
  }
}
