import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import LoginForm from "@/components/admin/login-form";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Garva Admin</h1>
          <p className="text-slate-400">Logga in för att hantera skämt</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
