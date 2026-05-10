"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [isVisible]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[40] h-[600px] w-[600px] rounded-full blur-[120px] bg-[#6F4E37] dark:bg-[var(--color-secondary)] opacity-15 dark:opacity-[0.15]"
      animate={{
        x: mousePosition.x - 300,
        y: mousePosition.y - 300,
        opacity: isVisible ? undefined : 0,
      }}
      transition={{
        x: { type: "spring", stiffness: 40, damping: 20, mass: 0.8 },
        y: { type: "spring", stiffness: 40, damping: 20, mass: 0.8 },
        opacity: { duration: 0.8 },
      }}
    />
  );
}
