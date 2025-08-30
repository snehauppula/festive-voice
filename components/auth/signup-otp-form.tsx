"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch, setAccessToken } from "@/lib/api"
import { useRouter } from "next/navigation"

type VerifyResponse = { access_token?: string; token?: string; [k: string]: any }

export default function SignupOtpForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function sendOtp() {
    setLoading(true)
    setStatus(null)
    try {
      await apiFetch("/api/v1/auth/signup/send-otp", {
        method: "POST",
        json: { email },
        auth: false,
      })
      setStatus("Signup OTP sent")
    } catch (e: any) {
      setStatus(e.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  async function resendOtp() {
    setLoading(true)
    setStatus(null)
    try {
      await apiFetch("/api/v1/auth/signup/resend-otp", {
        method: "POST",
        json: { email },
        auth: false,
      })
      setStatus("Signup OTP resent")
    } catch (e: any) {
      setStatus(e.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await apiFetch<VerifyResponse>("/api/v1/auth/signup/verify-otp", {
        method: "POST",
        json: { email, code, password },
        auth: false,
      })
      const access = res.access_token || res.token
      if (access) {
        setAccessToken(access)
        router.replace("/submit")
      } else {
        setStatus("Signup verified. Please login.")
        router.replace("/login")
      }
    } catch (e: any) {
      setStatus(e.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={sendOtp} disabled={loading || !email}>
          Send OTP
        </Button>
        <Button type="button" variant="outline" onClick={resendOtp} disabled={loading || !email}>
          Resend
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Set Password</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">OTP Code</Label>
        <Input id="code" placeholder="Enter OTP" value={code} onChange={(e) => setCode(e.target.value)} />
      </div>
      <Button type="button" onClick={verifyOtp} disabled={loading || !email || !code || !password} className="w-full">
        Verify & Create Account
      </Button>
      {status && <p className="text-sm">{status}</p>}
    </div>
  )
}
