/* ─── Types ─── */

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  subjectName: string;
  createdAt: Date;
  updatedAt: Date;
  starred: boolean;
}

/* ─── Demo Data ─── */

export const DEMO_NOTES: Note[] = [
  {
    id: "1",
    title: "Resumen Teoría de Redes",
    content:
      "El estudio de las redes de computadoras se centra en la interconexión de nodos para el intercambio de recursos y datos.\n\n## Conceptos Clave de la Capa de Enlace\n\n- **Direccionamiento MAC:** Identificador único de 48 bits asignado a tarjetas de red (NIC).\n- **Protocolo ARP:** Resolución de direcciones IP a direcciones físicas dentro de una red local.\n- **Encapsulamiento:** Proceso de añadir encabezados (headers) a los datos a medida que descienden por el stack.\n\n## Modelo OSI\n\nEl modelo de interconexión de sistemas abiertos (OSI) es un modelo conceptual que caracteriza y estandariza las funciones de comunicación.\n\n```\ninterface GigabitEthernet0/0\n  ip address 192.168.1.1 255.255.255.0\n  no shutdown\n  description LAN_G0/0\n```\n\nRecordar que para el examen parcial se enfatizará en la diferencia entre *Switching* y *Routing*.",
    subjectId: "redes",
    subjectName: "Redes de Computadoras",
    createdAt: new Date(2023, 9, 14),
    updatedAt: new Date(),
    starred: true,
  },
  {
    id: "2",
    title: "Modelo OSI y TCP/IP",
    content:
      "Comparación entre el modelo OSI de 7 capas y el modelo TCP/IP de 4 capas.\n\n## Capas del Modelo OSI\n\n1. Física\n2. Enlace de datos\n3. Red\n4. Transporte\n5. Sesión\n6. Presentación\n7. Aplicación\n\n## Modelo TCP/IP\n\n1. Acceso a la red\n2. Internet\n3. Transporte\n4. Aplicación",
    subjectId: "redes",
    subjectName: "Redes de Computadoras",
    createdAt: new Date(2023, 9, 13),
    updatedAt: new Date(2023, 9, 13),
    starred: false,
  },
  {
    id: "3",
    title: "Subnetting Avanzado",
    content:
      "Técnicas avanzadas de subnetting y VLSM.\n\n## VLSM\n\nVariable Length Subnet Masking permite usar diferentes máscaras de subred dentro de la misma red.\n\n## Ejemplo práctico\n\nRed: 192.168.1.0/24\n- Subred A: /26 (62 hosts)\n- Subred B: /27 (30 hosts)\n- Subred C: /28 (14 hosts)",
    subjectId: "redes",
    subjectName: "Redes de Computadoras",
    createdAt: new Date(2023, 9, 12),
    updatedAt: new Date(2023, 9, 12),
    starred: false,
  },
  {
    id: "4",
    title: "Resumen Certamen 1",
    content:
      "## Integrales Impropias\n\nLas integrales impropias son una extensión del concepto de la integral definida.\n\n### Conceptos Clave\n\n- **Convergencia:** Si el límite existe y es un número real finito.\n- **Divergencia:** Si el límite no existe o tiende al infinito.\n- **Teorema de Comparación:** Utilizado para determinar convergencia sin calcular la integral exacta.\n\n## Sucesiones y Series\n\nPara las series infinitas, el objetivo principal es determinar si la suma de infinitos términos resulta en un valor finito.\n\n### Serie Geométrica\nConverge si |r| < 1. La suma es a/(1-r).\n\n### Serie p-test\nConverge si p > 1, diverge si p ≤ 1.",
    subjectId: "calculo",
    subjectName: "Cálculo II",
    createdAt: new Date(2023, 9, 24),
    updatedAt: new Date(2023, 9, 24),
    starred: true,
  },
  {
    id: "5",
    title: "Apuntes Clase 05",
    content:
      "## Integrales dobles\n\nLas integrales dobles permiten calcular el volumen bajo una superficie z = f(x, y).\n\n### Método de iteración\n\nSe resuelve la integral interna primero, tratando una variable como constante.",
    subjectId: "calculo",
    subjectName: "Cálculo II",
    createdAt: new Date(2023, 9, 20),
    updatedAt: new Date(2023, 9, 20),
    starred: false,
  },
  {
    id: "6",
    title: "Ética en la Ingeniería",
    content:
      "## Principios fundamentales\n\n- Responsabilidad profesional\n- Integridad y honestidad\n- Competencia técnica\n- Respeto por el medio ambiente\n\n## Casos de estudio\n\nAnálisis de dilemas éticos en la práctica profesional de la ingeniería.",
    subjectId: "etica",
    subjectName: "Ética Profesional",
    createdAt: new Date(2023, 9, 18),
    updatedAt: new Date(2023, 9, 18),
    starred: false,
  },
];

/* ─── Helpers ─── */

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

export function getPreview(content: string, maxLength = 120): string {
  return content
    .replace(/#+\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/* ─── View Type ─── */

export type ViewMode = "list" | "editor" | "generator";
