"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Copy, Check, ListTree } from "lucide-react";
import type { Components } from "react-markdown";

/* ─── Mermaid Diagram ─── */

function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = (await import("mermaid")).default;
        m.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#a855f7",
            primaryTextColor: "#f0f0f5",
            primaryBorderColor: "#7c3aed",
            lineColor: "#6d28d9",
            secondaryColor: "#ec4899",
            tertiaryColor: "#1e1b4b",
            background: "#0f0a1f",
            mainBkg: "#1a1535",
            nodeBorder: "#7c3aed",
            clusterBkg: "#1a1535",
            titleColor: "#f0f0f5",
            edgeLabelBackground: "#1a1535",
          },
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: 14,
        });
        const id = `mm-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: r } = await m.render(id, code.trim());
        if (!cancelled) setSvg(r);
      } catch {
        if (!cancelled) setErr(true);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  if (err) {
    return (
      <pre className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground overflow-x-auto">
        <code>{code}</code>
      </pre>
    );
  }
  const cleanSvg = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } });
  if (!cleanSvg) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div
      className="my-6 flex justify-center rounded-xl bg-gradient-to-b from-muted/30 to-muted/10 border border-border/50 p-6 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: cleanSvg }}
    />
  );
}

/* ─── Copy Button ─── */

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
    >
      {ok ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/* ─── Table of Contents ─── */

function TOC({ headings, visible, toggle }: {
  headings: { id: string; text: string; level: number }[];
  visible: boolean;
  toggle: () => void;
}) {
  if (headings.length < 4) return null;
  return (
    <div className="mb-6">
      <button onClick={toggle} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
        <ListTree className="w-4 h-4" />
        {visible ? "Ocultar" : "Mostrar"} tabla de contenidos
      </button>
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden rounded-xl bg-muted/30 border border-border/50 p-4"
          >
            <ul className="space-y-1">
              {headings.map((h) => (
                <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 16}px` }}>
                  <a
                    href={`#${h.id}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-0.5"
                    onClick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" }); }}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Heading id helper ─── */

function toId(text: string) {
  return text.toLowerCase().replace(/[^\w\sáéíóúñü]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function extractHeadings(md: string) {
  const h: { id: string; text: string; level: number }[] = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^(#{2,4})\s+(.+)/);
    if (m) {
      const text = m[2].replace(/[*`~]/g, "").trim();
      h.push({ id: toId(text), text, level: m[1].length });
    }
  }
  return h;
}

/* ─── Custom components ─── */

function mkComponents(): Components {
  return {
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">{children}</h1>
    ),
    h2: ({ children }) => {
      const id = toId(String(children));
      return <h2 id={id} className="text-xl font-bold mt-8 mb-4 pb-2 border-b border-border/50 scroll-mt-20">{children}</h2>;
    },
    h3: ({ children }) => {
      const id = toId(String(children));
      return <h3 id={id} className="text-lg font-semibold mt-6 mb-3 text-foreground/90 scroll-mt-20">{children}</h3>;
    },
    h4: ({ children }) => <h4 className="text-base font-semibold mt-4 mb-2 text-foreground/80">{children}</h4>,
    p: ({ children }) => <p className="text-foreground/80 leading-relaxed mb-4">{children}</p>,
    strong: ({ children }) => <strong className="text-foreground font-semibold bg-primary/10 px-1 rounded">{children}</strong>,
    ul: ({ children }) => <ul className="space-y-2 mb-4 ml-1">{children}</ul>,
    ol: ({ children }) => <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">{children}</ol>,
    li: ({ children }) => (
      <li className="flex items-start gap-2 text-foreground/80">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
        <span className="flex-1">{children}</span>
      </li>
    ),
    blockquote: ({ children }) => (
      <div className="my-4 p-4 rounded-xl bg-primary/5 border-l-4 border-primary/40 text-foreground/80 [&>p]:mb-0">{children}</div>
    ),
    code: ({ className, children }) => {
      const lang = /language-(\w+)/.exec(className || "")?.[1];
      const code = String(children).replace(/\n$/, "");
      if (lang === "mermaid") return <MermaidBlock code={code} />;
      if (!className) return <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-sm font-mono">{children}</code>;
      return (
        <div className="relative my-4">
          <CopyBtn text={code} />
          {lang && <span className="absolute top-2 left-3 text-xs text-muted-foreground font-mono uppercase">{lang}</span>}
          <pre className="p-4 pt-8 rounded-xl bg-muted/50 border border-border/50 overflow-x-auto">
            <code className="text-sm font-mono text-foreground/80">{children}</code>
          </pre>
        </div>
      );
    },
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50 border-b border-border/50">{children}</thead>,
    th: ({ children }) => <th className="px-4 py-3 text-left font-semibold text-foreground">{children}</th>,
    td: ({ children }) => <td className="px-4 py-3 text-foreground/80 border-t border-border/30">{children}</td>,
    tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
    hr: () => (
      <div className="my-8 flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <BookOpen className="w-4 h-4 text-muted-foreground/50" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    ),
    a: ({ children, href }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors">{children}</a>
    ),
  };
}

/* ─── Main ─── */

interface Props {
  content: string;
  streaming?: boolean;
}

export function InteractiveSummary({ content, streaming = false }: Props) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [tocOpen, setTocOpen] = useState(false);
  const components = useMemo(() => mkComponents(), []);

  return (
    <div className="relative">
      {!streaming && <TOC headings={headings} visible={tocOpen} toggle={() => setTocOpen(!tocOpen)} />}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
      {streaming && (
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          Generando resumen...
        </div>
      )}
    </div>
  );
}
