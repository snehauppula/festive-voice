"use client"

import { useMe, logout } from "@/lib/auth-store"
import { ChangePasswordForm } from "@/components/auth/change-password-form"
import { Button } from "@/components/ui/button"

export default function AccountPage() {
  const { user, isLoading } = useMe()

  return (
    <main className="container mx-auto max-w-2xl py-10 space-y-6">
      <h1 className="text-2xl font-semibold">My Account</h1>
      {isLoading && <p>Loading...</p>}
      {!isLoading && !user && (
        <p>
          Not logged in. Please{" "}
          <a className="underline" href="/login">
            login
          </a>
          .
        </p>
      )}
      {user && (
        <>
          <div className="space-y-1">
            <p>
              <span className="font-medium">User ID:</span> {user.id}
            </p>
            {user.email && (
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
            )}
          </div>
          <div>
            <Button variant="outline" onClick={logout}>
              Log out
            </Button>
          </div>
          <section className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <ChangePasswordForm />
          </section>
        </>
      )}
    </main>
  )
}
