import Link from "next/link";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";

/* ─── Gradient Divider (server-renderable) ─── */
function GradientDivider() {
  return (
    <div
      className="h-px w-full"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent)",
      }}
    />
  );
}

/* ─── LANDING PAGE (Server Component) ─── */
export default function LandingPage() {
  return (
    <div data-theme="dark" className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/30 px-6 md:px-12 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-foreground tracking-tighter flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          StudyHub
        </Link>

        <div className="hidden md:flex gap-10 items-center">
          <Link
            href="#features"
            className="text-foreground text-sm font-medium border-b border-primary pb-1 hover:opacity-80 transition-all duration-300"
          >
            Funcionalidades
          </Link>
          <Link
            href="#pricing"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Precios
          </Link>
          <Link
            href="#testimonials"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Testimonios
          </Link>
        </div>

        <div className="flex gap-6 items-center">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_oklch(0.65_0.25_295_/_0.4)] transition-all active:scale-95"
          >
            Empezar ahora
          </Link>
        </div>
      </nav>

      <main>
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
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Privacidad
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Términos
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Soporte
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold text-sm">Recursos</span>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                Blog
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
                FAQ
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">
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
