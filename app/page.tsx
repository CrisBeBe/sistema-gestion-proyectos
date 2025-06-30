"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Dashboard } from "@/components/dashboard/dashboard";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
