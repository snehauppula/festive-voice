import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Visual side */}
      <section className="relative hidden md:flex items-center justify-center text-white overflow-hidden animate-in slide-in-from-left-4 duration-500 ease-out bg-[linear-gradient(135deg,#FF6F61,#6B5B95,#92A8D1,#88B04B)]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl animate-float" />
        <div className="max-w-md p-10 text-center space-y-4 relative">
          <h1 className="text-3xl font-bold font-serif text-balance drop-shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
            Festive Voice Archive
          </h1>
          <p className="text-white/90">Preserve and share voices, stories, and songs across languages.</p>
          <img
            src="/abstract-sound-waves.png"
            alt="Abstract sound waves illustration"
            className="mx-auto rounded-xl border border-white/30 bg-white/10 shadow-xl transition-transform duration-500 ease-out hover:scale-105"
          />
        </div>
      </section>

      {/* Form side */}
      <section className="flex items-center bg-background animate-in slide-in-from-right-4 duration-500 ease-out">
        <div className="w-full max-w-md mx-auto p-8">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-semibold font-serif">Login</h2>
            <p className="text-sm text-muted-foreground">Welcome back. Sign in to submit a new recording.</p>
          </div>
          {/* Glassmorphism card with subtle hover elevation */}
          <div className="group bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl p-6 shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-white/60 animate-slide-up">
            <LoginForm />
          </div>
          <p className="mt-6 text-xs text-center text-muted-foreground">
            By signing in, you agree to our{" "}
            <a className="underline" href="#">
              Terms
            </a>{" "}
            and{" "}
            <a className="underline" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
