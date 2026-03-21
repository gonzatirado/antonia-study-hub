"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      role="navigation"
      aria-label="Navegación principal"
      className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/30 px-6 md:px-12 py-4 flex justify-between items-center"
    >
      <Link
        href="/"
        className="text-xl font-bold text-foreground tracking-tighter flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
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
          className="hidden md:inline-block text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          Entrar
        </Link>
        <Link
          href="/login"
          className="hidden md:inline-block bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_oklch(0.65_0.25_295_/_0.4)] transition-all active:scale-95"
        >
          Empezar ahora
        </Link>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Abrir menú de navegación"
              />
            }
          >
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-background border-border">
            <SheetHeader>
              <SheetTitle className="text-left text-lg font-bold tracking-tighter text-foreground">
                StudyHub
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4 pt-4">
              <Link
                href="#features"
                onClick={() => setOpen(false)}
                className="text-foreground text-base font-medium hover:text-primary transition-colors py-2"
              >
                Funcionalidades
              </Link>
              <Link
                href="#pricing"
                onClick={() => setOpen(false)}
                className="text-muted-foreground text-base hover:text-foreground transition-colors py-2"
              >
                Precios
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setOpen(false)}
                className="text-muted-foreground text-base hover:text-foreground transition-colors py-2"
              >
                Testimonios
              </Link>
              <div className="border-t border-border/30 my-2" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-muted-foreground text-base hover:text-foreground transition-colors py-2"
              >
                Entrar
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm text-center hover:shadow-[0_0_20px_oklch(0.65_0.25_295_/_0.4)] transition-all active:scale-95"
              >
                Empezar ahora
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
