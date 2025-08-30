import { ForgotPasswordInitForm, ForgotPasswordConfirmForm } from "@/components/auth/forgot-password-forms"

export default function ForgotPasswordPage() {
  return (
    <main className="container mx-auto max-w-md py-10 space-y-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <ForgotPasswordInitForm />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Confirm Reset</h2>
        <ForgotPasswordConfirmForm />
      </section>
    </main>
  )
}
