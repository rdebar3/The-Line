import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}