"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await apiFetch("/api/v1/auth/change-password", {
        method: "POST",
        json: { currentPassword, newPassword },
      })
      setStatus("Password changed")
      setCurrentPassword("")
      setNewPassword("")
    } catch (e: any) {
      setStatus(e.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="current">Current Password</Label>
        <Input
          id="current"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new">New Password</Label>
        <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Change Password"}
      </Button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  )
}

export function ResetPasswordWithTokenForm() {
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await apiFetch("/api/v1/auth/reset-password", {
        method: "POST",
        json: { token, newPassword },
        auth: false,
      })
      setStatus("Password reset successful. You can login now.")
    } catch (e: any) {
      setStatus(e.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="rtoken">Reset Token</Label>
        <Input id="rtoken" value={token} onChange={(e) => setToken(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rnew">New Password</Label>
        <Input
          id="rnew"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  )
}
