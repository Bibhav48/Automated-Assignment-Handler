"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface BackgroundGradientProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  customColors?: string;
}

export function BackgroundGradient({
  children,
  className,
  containerClassName,
  customColors,
}: BackgroundGradientProps) {
  return (
    <div className={cn("group relative p-[1px] transition-all hover:scale-[1.01]", containerClassName)}>
      <motion.div
        className={cn(
          "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          customColors || "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_0_0,#7b61ff,transparent)]"
        )}
      />
      <div
        className={cn(
          "relative rounded-lg bg-white/80 dark:bg-black/80 border border-black/10 dark:border-transparent p-4 transition-colors duration-500",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
} 