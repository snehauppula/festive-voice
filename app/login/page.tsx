"use client"

import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen gradient-festival relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/20 rounded-full animate-hover-float"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-pink-400/20 rounded-full animate-hover-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-400/20 rounded-full animate-hover-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-purple-400/20 rounded-full animate-hover-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Navigation Header */}
      <div className="glass sticky top-0 z-40 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-xl transition-all duration-300 group ripple-effect"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white drop-shadow-lg">🎵 Festive Voice Archive</h1>
              <p className="text-sm text-white/80">Preserve and share voices, stories, and songs</p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="glass rounded-2xl p-8 animate-bounce-in hover-glow">
            <div className="text-center mb-8">
              <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-confetti-pop">
                <span className="text-3xl">🎭</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">Welcome Back!</h2>
              <p className="text-white/90 text-lg">Sign in to submit a new recording</p>
            </div>
            
            <LoginForm />
            
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-xs text-center text-white/70">
                By signing in, you agree to our{" "}
                <a className="underline hover:text-yellow-300 transition-colors" href="#">
                  Terms
                </a>{" "}
                and{" "}
                <a className="underline hover:text-yellow-300 transition-colors" href="#">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
