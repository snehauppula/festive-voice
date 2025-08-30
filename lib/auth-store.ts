"use client"

import useSWR from "swr"
import { getAccessToken, setAccessToken, swrFetcher } from "./api"

export type User = {
  id: string
  email?: string
  name?: string
  [k: string]: any
}

export function useMe() {
  const token = getAccessToken()
  const { data, error, isLoading, mutate } = useSWR<User | null>(token ? "/api/v1/auth/me" : null, swrFetcher)
  return {
    user: data ?? null,
    isLoading,
    error,
    refresh: mutate,
    isAuthenticated: !!token && !!data,
  }
}

export function logout() {
  setAccessToken(null)
  if (typeof window !== "undefined") window.location.href = "/login"
}
