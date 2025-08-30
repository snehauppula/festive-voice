"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

export function ForgotPasswordInitForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    setLoading(true)
    try {
      await apiFetch("/api/v1/auth/forgot-password/init", {
        method: "POST",
        json: { email },
        auth: false,
      })
      setStatus("Password reset link/code sent. Check your email.")
    } catch (e: any) {
      setStatus(e.message || "Failed to initiate password reset")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="femail">Email</Label>
        <Input id="femail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending..." : "Send Reset Instructions"}
      </Button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  )
}

export function ForgotPasswordConfirmForm() {
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    setLoading(true)
    try {
      await apiFetch("/api/v1/auth/forgot-password/confirm", {
        method: "POST",
        json: { token, newPassword },
        auth: false,
      })
      setStatus("Password updated. You can login now.")
    } catch (e: any) {
      setStatus(e.message || "Failed to confirm password reset")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="ctoken">Confirmation Token</Label>
        <Input id="ctoken" required value={token} onChange={(e) => setToken(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cnew">New Password</Label>
        <Input
          id="cnew"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Confirm Reset"}
      </Button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  )
}
