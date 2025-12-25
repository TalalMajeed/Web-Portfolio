import { ensureDefaultAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  await ensureDefaultAdmin();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card/80 p-8 shadow-lg backdrop-blur">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your admin credentials to access the panel.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
