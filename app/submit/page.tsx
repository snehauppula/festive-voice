"use client"

import RecordForm from "@/components/records/record-form"
import { useMe, logout } from "@/lib/auth-store"

export default function SubmitPage() {
  const { user, isLoading } = useMe()

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
              <h1 className="text-xl font-bold text-white drop-shadow-lg">🎤 Audio Upload</h1>
              <p className="text-sm text-white/80">Share your voice with the community</p>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/90">👋 Welcome, {user.name || user.email || 'User'}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all duration-300 group ripple-effect"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {isLoading && (
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 animate-bounce-in">
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin mr-4"></div>
                <p className="text-xl text-white font-semibold">Checking authentication...</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !user && (
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 text-center animate-bounce-in">
              <div className="mb-8">
                <div className="w-20 h-20 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-confetti-pop">
                  <span className="text-3xl">🔒</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Authentication Required</h1>
                <p className="text-white/90 text-lg">You need to be logged in to submit audio content</p>
              </div>
              <div className="flex gap-4 justify-center">
                <a 
                  href="/login" 
                  className="inline-flex items-center px-8 py-4 gradient-primary text-white font-bold rounded-xl transition-all duration-300 hover-glow press-bounce ripple-effect"
                >
                  <span className="text-xl mr-2">🔐</span>
                  Go to Login
                </a>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-8 py-4 glass border-white/20 text-white font-bold rounded-xl transition-all duration-300 hover-glow press-bounce"
                >
                  <span className="text-xl mr-2">←</span>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="animate-slide-up">
            <RecordForm />
          </div>
        )}
      </div>
    </main>
  )
}
