import { ResetPasswordWithTokenForm } from "@/components/auth/change-password-form"

export default function ResetPasswordPage() {
  return (
    <main className="container mx-auto max-w-md py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Reset Password (Token)</h1>
      <ResetPasswordWithTokenForm />
    </main>
  )
}
