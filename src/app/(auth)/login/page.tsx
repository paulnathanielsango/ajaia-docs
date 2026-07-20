import { EmailSignInForm } from "@/components/auth/email-sign-in-form";
import { LandingFontProvider, LandingShell } from "@/components/landing";

export default function LoginPage() {
  return (
    <LandingFontProvider>
      <LandingShell>
        <div className="mx-auto flex min-h-screen max-w-[26rem] items-center px-6 py-16">
          <EmailSignInForm />
        </div>
      </LandingShell>
    </LandingFontProvider>
  );
}
