import Link from "next/link";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { NavBar } from "@/components/landing/nav-bar";
import { LandingThemeForce } from "@/components/landing/landing-theme-force";

/* ─── Gradient Divider (server-renderable) ─── */
function GradientDivider() {
  return (
    <div
      className="h-px w-full"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)",
      }}
    />
  );
}

/* ─── LANDING PAGE (Server Component) ─── */
export default function LandingPage() {
  return (
    <div data-theme="dark" className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingThemeForce />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">Saltar al contenido</a>

      {/* ── Navbar ── */}
      <NavBar />

      <main id="main-content">
        {/* 1. Hero */}
        <HeroSection />

        <GradientDivider />

        {/* 2. How It Works */}
        <HowItWorksSection />

        <GradientDivider />

        {/* 3. Features */}
        <FeaturesSection />

        <GradientDivider />

        {/* 4. Testimonials */}
        <div id="testimonials">
          <TestimonialsSection />
        </div>

        <GradientDivider />

        {/* 5. Pricing */}
        <div id="pricing">
          <PricingSection />
        </div>

        {/* 6. Final CTA */}
        <CtaSection />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-background w-full py-20 px-6 md:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="flex flex-col gap-6">
            <div className="text-2xl font-bold text-foreground tracking-tighter flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              StudyHub
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-xs text-sm font-light">
              Plataforma educativa de alto rendimiento potenciada por inteligencia artificial.
              Redefiniendo el éxito académico.
            </p>
          </div>

          <div className="flex justify-start md:justify-center gap-12">
            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold text-sm">Empresa</span>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Privacidad
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Términos
              </Link>
              <Link href="mailto:soporte@studyhub.cl" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Soporte
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold text-sm">Recursos</span>
              <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Blog
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                FAQ
              </Link>
              <Link href="mailto:contacto@studyhub.cl" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Contacto
              </Link>
            </div>
          </div>

          <div className="text-left md:text-right flex flex-col items-start md:items-end gap-6">
            <p className="text-foreground font-medium text-sm tracking-wide">
              StudyHub &copy; 2026 — Hecho para estudiantes, por estudiantes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
