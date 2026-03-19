"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition, springs } from "@/lib/animations";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageTransition}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={springs.smooth}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
