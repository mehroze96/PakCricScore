import type * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/70 dark:bg-white/[0.05]",
        "after:absolute after:inset-0 after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/[0.06] after:to-transparent after:[background-size:200%_100%]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
