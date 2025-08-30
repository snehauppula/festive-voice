const API_BASE = "https://api.corpus.swecha.org"

type Json = Record<string, unknown>

async function jsonFetch<T>(path: string, init?: RequestInit & { token?: string }) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  }
  if (init?.token) headers["Authorization"] = `Bearer ${init.token}`
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })
  const data = (await res.json().catch(() => ({}))) as T
  if (!res.ok) {
    throw { status: res.status, data }
  }
  return data
}

export async function passwordLogin(email: string, password: string) {
  // adjust if your password endpoint differs
  return jsonFetch<{ access_token: string; refresh_token?: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function sendOtp(phone_number: string) {
  return jsonFetch<Json>("/api/v1/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ phone_number }),
  })
}

export async function resendOtp(phone_number: string) {
  return jsonFetch<Json>("/api/v1/auth/otp/resend", {
    method: "POST",
    body: JSON.stringify({ phone_number }),
  })
}

export async function verifyOtp(phone_number: string, otp_code: string) {
  // adjust body keys if your backend expects different names
  return jsonFetch<{ access_token: string; refresh_token?: string }>("/api/v1/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone_number, otp_code }),
  })
}
