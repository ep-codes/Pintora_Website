import PublicShell from "@/components/public-shell";
import AuthForm from "@/components/auth-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return <PublicShell><section className="auth-page"><AuthForm mode="login" /></section></PublicShell>;
}
