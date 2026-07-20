import { Manrope, Sora } from "next/font/google";

const landingDisplay = Sora({
  variable: "--font-landing-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const landingBody = Manrope({
  variable: "--font-landing-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function LandingFontProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${landingDisplay.variable} ${landingBody.variable} font-[family-name:var(--font-landing-body)]`}
    >
      {children}
    </div>
  );
}
