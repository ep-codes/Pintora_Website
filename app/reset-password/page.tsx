import PublicShell from "@/components/public-shell";
import { ResetPassword } from "@/components/password-reset";

export const metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return <PublicShell><section className="auth-page"><ResetPassword /></section></PublicShell>;
}
