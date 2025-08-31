"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiFetch, setAccessToken } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

type LoginResponse = { access_token?: string; token?: string; [k: string]: any }

export default function LoginForm() {
  const router = useRouter()
  const { addToast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [loading, setLoading] = useState(false)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        json: { email, password },
        auth: false,
      })
      const access = res.access_token || res.token
      if (!access) throw new Error("No access token returned")
      setAccessToken(access)
      addToast({
        type: 'success',
        title: 'Login Successful! 🎉',
        message: 'Welcome back to Festive Voice Archive!',
        animation: 'confetti-pop'
      })
      router.replace("/submit")
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: err?.data?.detail || err.message || "Please check your credentials",
        animation: 'bounce-in'
      })
    } finally {
      setLoading(false)
    }
  }

  const normalizedPhone = phoneNumber.trim()
  const isPhoneValid = normalizedPhone.replace(/\D/g, "").length >= 8

  async function sendLoginOtp() {
    setLoading(true)
    try {
      await apiFetch("/api/v1/auth/login/send-otp", {
        method: "POST",
        json: { phone_number: normalizedPhone },
        auth: false,
      })
      addToast({
        type: 'success',
        title: 'OTP Sent! 📱',
        message: 'Check your phone for the verification code',
        animation: 'slide-up'
      })
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Send OTP',
        message: err?.data?.detail || err.message || "Please try again",
        animation: 'bounce-in'
      })
    } finally {
      setLoading(false)
    }
  }

  async function resendLoginOtp() {
    setLoading(true)
    try {
      await apiFetch("/api/v1/auth/login/resend-otp", {
        method: "POST",
        json: { phone_number: normalizedPhone },
        auth: false,
      })
      addToast({
        type: 'info',
        title: 'OTP Resent! 🔄',
        message: 'A new code has been sent to your phone',
        animation: 'glow-pulse'
      })
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Resend OTP',
        message: err?.data?.detail || err.message || "Please try again",
        animation: 'bounce-in'
      })
    } finally {
      setLoading(false)
    }
  }

  async function verifyLoginOtp() {
    setLoading(true)
    try {
      const res = await apiFetch<LoginResponse>("/api/v1/auth/login/verify-otp", {
        method: "POST",
        json: { phone_number: normalizedPhone, otp_code: otpCode },
        auth: false,
      })
      const access = res.access_token || res.token
      if (!access) throw new Error("No access token returned")
      setAccessToken(access)
      addToast({
        type: 'success',
        title: 'Login Successful! 🎉',
        message: 'Welcome back to Festive Voice Archive!',
        animation: 'confetti-pop'
      })
      router.replace("/submit")
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'OTP Verification Failed',
        message: err?.data?.detail || err.message || "Please check your code",
        animation: 'bounce-in'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid grid-cols-2 w-full rounded-xl p-1 animate-slide-up custom-tabs-list h-12">
          <TabsTrigger
            value="password"
            className="custom-tabs-trigger"
          >
            🔐 Password
          </TabsTrigger>
          <TabsTrigger
            value="otp"
            className="custom-tabs-trigger"
          >
            📱 OTP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="animate-slide-up">
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white font-semibold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">📧 Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-lg glass border-white/20 text-white placeholder-white/60 focus:border-yellow-300 focus:ring-yellow-300/50 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-white font-semibold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">🔒 Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 text-lg glass border-white/20 text-white placeholder-white/60 focus:border-yellow-300 focus:ring-yellow-300/50 transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-xl font-bold gradient-primary text-white rounded-xl transition-all duration-300 hover-glow press-bounce ripple-effect shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <span>Login Now!</span>
                </div>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="otp" className="animate-slide-up">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="otpPhone" className="text-white font-semibold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">📱 Phone Number</Label>
              <Input
                id="otpPhone"
                type="tel"
                inputMode="tel"
                placeholder="e.g. +91xxxxxxxxxx"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-14 text-lg glass border-white/20 text-white placeholder-white/60 focus:border-yellow-300 focus:ring-yellow-300/50 transition-all duration-300"
              />
              <p className="text-sm text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Enter your phone number to receive a one-time code</p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={sendLoginOtp}
                disabled={loading || !isPhoneValid}
                className="flex-1 h-12 gradient-secondary text-white rounded-xl transition-all duration-300 hover-glow press-bounce ripple-effect shadow-lg font-semibold"
              >
                📤 Send OTP
              </Button>
              <Button
                type="button"
                onClick={resendLoginOtp}
                disabled={loading || !isPhoneValid}
                className="flex-1 h-12 glass border-white/20 text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover-glow press-bounce shadow-lg font-semibold"
              >
                🔄 Resend
              </Button>
            </div>

            <div className="space-y-3">
              <Label htmlFor="otpCode" className="text-white font-semibold text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">🔢 OTP Code</Label>
              <Input
                id="otpCode"
                placeholder="Enter received code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="h-14 text-lg glass border-white/20 text-white placeholder-white/60 focus:border-yellow-300 focus:ring-yellow-300/50 transition-all duration-300"
              />
            </div>

            <Button
              type="button"
              onClick={verifyLoginOtp}
              disabled={loading || !isPhoneValid || !otpCode}
              className="w-full h-14 text-xl font-bold gradient-primary text-white rounded-xl transition-all duration-300 hover-glow press-bounce ripple-effect shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <span>Verify & Login!</span>
                </div>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center space-y-4">
        <div className="flex justify-center gap-6 text-sm">
          <a className="text-white/90 hover:text-yellow-300 transition-colors duration-300 underline drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] font-medium" href="/forgot-password">
            🔑 Forgot password?
          </a>
          <span className="text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">•</span>
          <a className="text-white/90 hover:text-yellow-300 transition-colors duration-300 underline drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] font-medium" href="/signup">
            ✨ Create account
          </a>
        </div>
      </div>
    </div>
  )
}
