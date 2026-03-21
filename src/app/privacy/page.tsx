import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold tracking-tight mb-8">Política de Privacidad</h1>
        <p className="text-muted-foreground text-sm mb-4">Última actualización: 21 de marzo de 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Información que Recopilamos</h2>
            <p>Recopilamos la siguiente información cuando usas StudyHub:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nombre, email y foto de perfil (al registrarte con Google o email)</li>
              <li>Archivos académicos que subes voluntariamente</li>
              <li>Datos de uso: resúmenes generados, quizzes completados, frecuencia de uso</li>
              <li>Información técnica: tipo de dispositivo, navegador, dirección IP</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Cómo Usamos tu Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Proporcionar y mejorar el servicio de StudyHub</li>
              <li>Generar resúmenes, quizzes y planes de estudio con IA</li>
              <li>Controlar límites de uso según tu plan</li>
              <li>Comunicarte actualizaciones importantes del servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Procesamiento con IA</h2>
            <p>Los archivos que subes se procesan mediante modelos de inteligencia artificial (Google Gemini) para generar contenido educativo. Este procesamiento se realiza de forma segura y los archivos no se utilizan para entrenar modelos de IA.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Almacenamiento y Seguridad</h2>
            <p>Tus datos se almacenan en Firebase (Google Cloud) con encriptación en tránsito y en reposo. Implementamos medidas de seguridad técnicas y organizativas para proteger tu información.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Compartición de Datos</h2>
            <p>No vendemos ni compartimos tu información personal con terceros, excepto:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Proveedores de infraestructura (Firebase, Google Cloud) necesarios para operar</li>
              <li>Cuando sea requerido por ley</li>
              <li>Para proteger nuestros derechos legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Acceder a tus datos personales</li>
              <li>Solicitar la corrección de datos incorrectos</li>
              <li>Solicitar la eliminación de tu cuenta y datos</li>
              <li>Exportar tus datos en formato portable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p>Utilizamos cookies esenciales para el funcionamiento del servicio (sesión de autenticación, preferencias de tema). No utilizamos cookies de tracking publicitario.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contacto</h2>
            <p>Para ejercer tus derechos o realizar consultas sobre privacidad, escríbenos a <a href="mailto:privacidad@studyhub.cl" className="text-primary hover:underline">privacidad@studyhub.cl</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
