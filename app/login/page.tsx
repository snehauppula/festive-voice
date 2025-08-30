import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Visual side */}
      <section className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-[#FF6F61] to-[#92A8D1] text-white animate-in slide-in-from-left-4 duration-500 ease-out">
        <div className="max-w-md p-10 text-center space-y-4">
          <h1 className="text-3xl font-bold font-serif text-balance">Festive Voice Archive</h1>
          <p className="text-white/90">Preserve and share voices, stories, and songs across languages.</p>
          <img
            src="/abstract-sound-waves.png"
            alt="Abstract sound waves illustration"
            className="mx-auto rounded-lg border border-white/30 bg-white/10 shadow-lg transition-transform duration-300 ease-out hover:scale-105"
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
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-lg p-6 shadow-xl transition-shadow duration-300 ease-out hover:shadow-2xl">
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
