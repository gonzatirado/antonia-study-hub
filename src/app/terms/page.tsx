import Link from "next/link";

export default function TermsPage() {
  return (
    <div data-theme="dark" className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/30 px-6 md:px-12 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-foreground tracking-tighter flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          StudyHub
        </Link>
        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
          Entrar
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Términos de Servicio</h1>
        <p className="text-muted-foreground text-sm mb-4">Última actualización: 21 de marzo de 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar StudyHub, aceptas estos términos de servicio en su totalidad. Si no estás de acuerdo con algún término, no utilices la plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
            <p>StudyHub es una plataforma educativa que utiliza inteligencia artificial para generar resúmenes, quizzes y planes de estudio a partir del material académico que los usuarios suben. El servicio se ofrece en modalidad gratuita y de pago.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Cuentas de Usuario</h2>
            <p>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Uso Aceptable</h2>
            <p>Te comprometes a usar StudyHub exclusivamente para fines educativos legítimos. Queda prohibido subir contenido ilegal, ofensivo, o que infrinja derechos de propiedad intelectual de terceros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Propiedad Intelectual</h2>
            <p>El contenido que subes a StudyHub sigue siendo de tu propiedad. Nos otorgas una licencia limitada para procesar dicho contenido con el fin de proporcionarte el servicio. Los resúmenes y materiales generados por la IA son para tu uso personal y académico.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Limitación de Responsabilidad</h2>
            <p>StudyHub se proporciona &ldquo;tal cual&rdquo;. No garantizamos la exactitud del contenido generado por IA. Los resúmenes y quizzes son herramientas de apoyo al estudio, no sustituyen el material oficial de las instituciones educativas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Planes y Pagos</h2>
            <p>Los planes de pago se facturan mensualmente. Puedes cancelar en cualquier momento. No se realizan reembolsos por períodos parciales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos. Los cambios se notificarán a través de la plataforma con al menos 15 días de anticipación.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
            <p>Para consultas sobre estos términos, escríbenos a <a href="mailto:legal@studyhub.cl" className="text-primary hover:underline">legal@studyhub.cl</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
