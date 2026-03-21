import Link from "next/link";

export default function NotFound() {
  return (
    <div data-theme="dark" className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-8xl font-black text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">
          Página no encontrada
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
