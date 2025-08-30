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

let confettiFn: null | ((opts?: any) => void) = null
if (typeof window !== "undefined") {
  import("canvas-confetti")
    .then((m) => {
      confettiFn = m.default || (m as any)
    })
    .catch(() => {})
}

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  type Toast = { id: number; kind: "success" | "error" | "info"; text: string }
  const [toasts, setToasts] = useState<Toast[]>([])
  function showToast(text: string, kind: Toast["kind"] = "info") {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  function ripple(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty("--ripple-x", `${x}px`)
    el.style.setProperty("--ripple-y", `${y}px`)
    el.dataset.rippling = "true"
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.dataset.rippling = "false"
      }, 700)
    })
  }

  function onPhoneChange(v: string) {
    setPhoneNumber(v)
    const d = v.replace(/\D/g, "")
    if (d.length && d.length < 8) setPhoneError("Enter at least 8 digits")
    else setPhoneError(null)
  }

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
      showToast("Welcome back! Redirecting…", "success")
      if (confettiFn) confettiFn({ particleCount: 80, spread: 60, origin: { y: 0.15 } })
      router.replace("/submit")
    } catch (err: any) {
      const msg = err?.data?.detail || err.message || "Login failed"
      setStatus(msg)
      showToast(msg, "error")
    } finally {
      setLoading(false)
    }
  }

  const digitsOnly = phoneNumber.replace(/\D/g, "")
  const isPhoneValid = digitsOnly.length >= 8

  async function sendLoginOtp() {
    setLoading(true)
    setStatus(null)
    try {
      await apiFetch("/api/v1/auth/login/send-otp", {
        method: "POST",
        json: { phone_number: phoneNumber.trim() }, // ensure phone_number, not email
        auth: false,
      })
      showToast("OTP sent to your phone", "success")
    } catch (err: any) {
      const msg = err?.data?.detail || err.message || "Failed to send OTP"
      setStatus(msg)
      showToast(msg, "error")
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
        json: { phone_number: phoneNumber.trim() }, // ensure phone_number
        auth: false,
      })
      showToast("OTP resent", "success")
    } catch (err: any) {
      const msg = err?.data?.detail || err.message || "Failed to resend OTP"
      setStatus(msg)
      showToast(msg, "error")
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
        json: { phone_number: phoneNumber.trim(), otp_code: otpCode }, // ensure otp_code key
        auth: false,
      })
      const access = res.access_token || res.token
      if (!access) throw new Error("No access token returned")
      setAccessToken(access)
      showToast("Logged in! Redirecting…", "success")
      if (confettiFn) confettiFn({ particleCount: 90, spread: 70, origin: { y: 0.15 } })
      router.replace("/submit")
    } catch (err: any) {
      const msg = err?.data?.detail || err.message || "Failed to verify OTP"
      setStatus(msg)
      showToast(msg, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pointer-events-none fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl border animate-bounce-in ${
              t.kind === "success"
                ? "bg-white/70 dark:bg-white/10 border-emerald-300/60 text-emerald-900 dark:text-emerald-200"
                : t.kind === "error"
                  ? "bg-white/70 dark:bg-white/10 border-red-300/60 text-red-900 dark:text-red-200"
                  : "bg-white/70 dark:bg-white/10 border-blue-300/60 text-foreground"
            }`}
          >
            <p className="text-sm">{t.text}</p>
          </div>
        ))}
      </div>

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
              onMouseDown={ripple}
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
                placeholder="e.g.  +91xxxxxxxxxx"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(80,184,129,0.25)]"
              />
              {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
              <p className="text-xs text-muted-foreground">Enter your phone number to receive a one-time code.</p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={sendLoginOtp}
                disabled={loading || !isPhoneValid}
                onMouseDown={ripple}
                className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(80,184,129,0.35)] active:scale-95"
              >
                Send OTP
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resendLoginOtp}
                disabled={loading || !isPhoneValid}
                onMouseDown={ripple}
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
                className="transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(80,184,129,0.25)]"
              />
            </div>

            <Button
              type="button"
              onClick={verifyLoginOtp}
              disabled={loading || !isPhoneValid || !otpCode}
              onMouseDown={ripple}
              className="w-full relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(80,184,129,0.45)] focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 active:scale-95"
            >
              <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 [mask-image:linear-gradient(90deg,transparent,black,transparent)] bg-[linear-gradient(90deg,rgba(255,255,255,.15)_0,rgba(255,255,255,.35)_50%,rgba(255,255,255,.15)_100%)] animate-[shimmer_2s_infinite]"></span>
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

      {/* Status fallback for screen readers (we still keep it) */}
      {status && (
        <p className="text-sm text-foreground/80" role="status" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  )
}
