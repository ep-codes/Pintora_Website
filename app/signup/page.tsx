import PublicShell from "@/components/public-shell";
import AuthForm from "@/components/auth-form";

export const metadata = { title: "Join free" };

export default function SignupPage() {
  return <PublicShell><section className="auth-page"><AuthForm mode="signup" /></section></PublicShell>;
}
