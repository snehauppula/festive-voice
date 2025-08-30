import SignupOtpForm from "@/components/auth/signup-otp-form"

export default function SignupPage() {
  return (
    <main className="container mx-auto max-w-md py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Create Account</h1>
      <SignupOtpForm />
    </main>
  )
}
