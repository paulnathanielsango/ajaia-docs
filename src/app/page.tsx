import { LandingPage } from "@/components/auth/landing-page";
import { LandingFontProvider } from "@/components/landing";

type HomePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  return (
    <LandingFontProvider>
      <LandingPage authError={params.error} />
    </LandingFontProvider>
  );
}
