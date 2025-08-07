// Save user data in cookie indefinitely (session cookie)
export const setUserSession = (data: any) => {
  document.cookie = `data=${encodeURIComponent(JSON.stringify(data))}; path=/; samesite=strict`;
};

// Get user data from cookie
export const getUserSession = (): any | null => {
  const match = document.cookie.match(new RegExp('(^| )data=([^;]+)'));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      return null;
    }
  }
  return null;
};

// Logout user by clearing cookie and redirecting
export const logout = () => {
  document.cookie = "data=; path=/; max-age=0; samesite=strict";
  window.location.href = "/";
};
