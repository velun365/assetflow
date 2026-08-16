export async function getCsrfToken() {
  const response = await fetch("/api/auth/csrf");
  const data = await response.json();

  return data.token;
}
