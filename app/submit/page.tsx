"use client"

import RecordForm from "@/components/records/record-form"
import { useMe } from "@/lib/auth-store"

export default function SubmitPage() {
  const { user, isLoading } = useMe()

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Visual/Info side */}
      <section className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500 text-white overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl animate-float" />
        <div className="max-w-md p-10 space-y-4">
          <h1 className="text-3xl font-bold font-serif text-balance drop-shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
            Submit a Recording
          </h1>
          <p className="text-white/90">
            Share songs, stories, and voices. Use the recorder or upload a file, add details, language, and rights.
          </p>
          <img
            src="/microphone-and-waveform.png"
            alt="Microphone with waveform"
            className="mx-auto rounded-xl border border-white/30 bg-white/10 shadow-xl transition-transform duration-500 ease-out hover:scale-105"
          />
        </div>
      </section>

      {/* Form side */}
      <section className="flex items-center bg-background">
        <div className="w-full max-w-2xl mx-auto p-8">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-semibold font-serif">Upload Content</h2>
            <p className="text-sm text-muted-foreground">Please log in to submit a recording.</p>
          </div>

          {isLoading && (
            <div className="bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl p-6 shadow-xl">
              <p>Checking authentication...</p>
            </div>
          )}

          {!isLoading && !user && (
            <div className="bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl p-6 shadow-xl">
              <p className="mb-2">You need to be logged in to submit.</p>
              <a className="underline text-foreground hover:opacity-90" href="/login">
                Go to Login
              </a>
            </div>
          )}

          {user && (
            <div className="group bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl p-6 shadow-xl transition-all duration-500 ease-out hover:shadow-2xl hover:border-white/60">
              <RecordForm />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
