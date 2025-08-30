"use client"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

const API_BASE = "https://api.corpus.swecha.org" // same-origin base if empty

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem("access_token", token)
  else localStorage.removeItem("access_token")
}

export async function apiFetch<T = any>(
  path: string,
  opts: {
    method?: HttpMethod
    body?: BodyInit | null
    json?: any
    headers?: Record<string, string>
    auth?: boolean
  } = {},
): Promise<T> {
  const { method = "GET", body, json, headers = {}, auth = true } = opts

  const init: RequestInit = {
    method,
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json ? JSON.stringify(json) : (body ?? null),
  }

  if (auth) {
    const token = getAccessToken()
    if (token) {
      ;(init.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${API_BASE}${path}`, init)
  const ct = res.headers.get("content-type") || ""

  if (!res.ok) {
    // Try to parse JSON error first
    let data: any = null
    try {
      if (ct.includes("application/json")) data = await res.json()
      else data = await res.text()
    } catch {
      // ignore
    }
    const message =
      (data && (data.detail || data.message)) || (typeof data === "string" && data) || `Request failed: ${res.status}`
    const err = new Error(message) as any
    err.status = res.status
    err.data = data
    throw err
  }

  if (ct.includes("application/json")) return (await res.json()) as T
  // @ts-expect-error allow non-json returns
  return (await res.text()) as T
}

export const swrFetcher = async (url: string) => apiFetch(url, { method: "GET" })
