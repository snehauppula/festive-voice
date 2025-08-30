"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiFetch, setAccessToken } from "@/lib/api"
import { useRouter } from "next/navigation"

type LoginResponse = { access_token?: string; token?: string; [k: string]: any }

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        json: { email, password },
        auth: false,
      })
      const access = res.access_token || res.token
      if (!access) throw new Error("No access token returned")
      setAccessToken(access)
      router.replace("/submit")
    } catch (err: any) {
      setStatus(err?.data?.detail || err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const normalizedPhone = phoneNumber.trim()
  const isPhoneValid = normalizedPhone.replace(/\D/g, "").length >= 8

  async function sendLoginOtp() {
    setLoading(true)
    setStatus(null)
    try {
      await apiFetch("/api/v1/auth/login/send-otp", {
        method: "POST",
        json: { phone_number: normalizedPhone },
        auth: false,
      })
      setStatus("OTP sent")
    } catch (err: any) {
      setStatus(err?.data?.detail || err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  async function resendLoginOtp() {
    setLoading(true)
    setStatus(null)
    try {
      await apiFetch("/api/v1/auth/login/resend-otp", {
        method: "POST",
        json: { phone_number: normalizedPhone },
        auth: false,
      })
      setStatus("OTP resent")
    } catch (err: any) {
      setStatus(err?.data?.detail || err.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  async function verifyLoginOtp() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await apiFetch<LoginResponse>("/api/v1/auth/login/verify-otp", {
        method: "POST",
        json: { phone_number: normalizedPhone, code: otpCode },
        auth: false,
      })
      const access = res.access_token || res.token
      if (!access) throw new Error("No access token returned")
      setAccessToken(access)
      router.replace("/submit")
    } catch (err: any) {
      setStatus(err?.data?.detail || err.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid grid-cols-2 w-full animate-in slide-in-from-bottom-2 duration-300">
          <TabsTrigger
            value="password"
            className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
          >
            Password
          </TabsTrigger>
          <TabsTrigger
            value="otp"
            className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
          >
            OTP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="animate-in fade-in duration-300">
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(146,168,209,0.25)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(146,168,209,0.25)]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 active:scale-95"
            >
              {loading ? "Please wait..." : "Login"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="otp" className="animate-in fade-in duration-300">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otpPhone">Phone number</Label>
              <Input
                id="otpPhone"
                type="tel"
                inputMode="tel"
                placeholder="e.g. 7981833625 or +91xxxxxxxxxx"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(146,168,209,0.25)]"
              />
              <p className="text-xs text-muted-foreground">Enter your phone number to receive a one-time code.</p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={sendLoginOtp}
                disabled={loading || !isPhoneValid}
                className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm active:scale-95"
              >
                Send OTP
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resendLoginOtp}
                disabled={loading || !isPhoneValid}
                className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 bg-transparent"
              >
                Resend OTP
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otpCode">OTP Code</Label>
              <Input
                id="otpCode"
                placeholder="Enter received code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(146,168,209,0.25)]"
              />
            </div>

            <Button
              type="button"
              onClick={verifyLoginOtp}
              disabled={loading || !isPhoneValid || !otpCode}
              className="w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 active:scale-95"
            >
              Verify & Login
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground">
        <a className="underline" href="/forgot-password">
          Forgot password?
        </a>{" "}
        ·{" "}
        <a className="underline" href="/signup">
          Create account
        </a>
      </div>

      {status && (
        <p className="text-sm text-foreground/80" role="status" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  )
}
