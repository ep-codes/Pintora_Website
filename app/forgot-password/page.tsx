import PublicShell from "@/components/public-shell";
import { ForgotPassword } from "@/components/password-reset";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return <PublicShell><section className="auth-page"><ForgotPassword /></section></PublicShell>;
}
